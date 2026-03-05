<?php

namespace App\Services\Agent;

use App\DTOs\IncomingMessage;
use App\Events\SessionCreated;
use App\Events\SessionUpdated;
use App\Listeners\LogToolExecution;
use App\Models\AgentMessage;
use App\Models\AgentSession;
use App\Services\Ollama\OllamaChatService;
use App\Services\Tools\ToolResolver;
use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\AnonymousAgent;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Responses\StreamableAgentResponse;

class AgentRuntime
{
    public function __construct(
        protected SessionResolver $sessionResolver,
        protected ContextAssembler $contextAssembler,
        protected ToolResolver $toolResolver,
        protected IntentRouter $intentRouter,
        protected OllamaChatService $ollamaChatService,
    ) {}

    /**
     * Handle an incoming message synchronously (for TUI/email channels).
     */
    public function handleMessage(IncomingMessage $message): string
    {
        $session = $this->sessionResolver->resolve($message);

        // Check intent router for slash commands
        $intent = $this->intentRouter->classify($message, $session);
        if ($intent->isShortCircuit()) {
            $this->saveMessage($session, 'user', $message->content, [
                'channel' => $message->channel,
                'sender' => $message->sender,
            ]);
            $this->saveMessage($session, 'assistant', $intent->response, [
                'intent' => $intent->type->value,
                'command' => $intent->commandName,
            ]);
            $session->update(['last_activity_at' => now()]);

            return $intent->response;
        }

        // Save user message
        $this->saveMessage($session, 'user', $message->content, [
            'channel' => $message->channel,
            'sender' => $message->sender,
        ]);

        $model = $session->getEffectiveModel();
        $isCodeModel = OllamaChatService::isCodeModel($model);

        // Code models get minimal context — no agent system prompt, just conversation history
        $context = $isCodeModel
            ? $this->contextAssembler->buildMinimal($session, $message)
            : $this->contextAssembler->build($session, $message);

        try {
            if ($session->getEffectiveProvider() === 'ollama') {
                $ollamaMessages = $this->buildOllamaMessages($context['messages']);
                $responseText = $this->ollamaChatService->chat(
                    $model,
                    $ollamaMessages,
                    $context['system'],
                );
                $usage = [];
            } else {
                $agent = $this->buildAgent($context, $session);
                $response = $agent->prompt(
                    prompt: $message->content,
                    provider: $session->getEffectiveProvider(),
                    model: $session->getEffectiveModel(),
                );

                $responseText = $response->text;
                $usage = [
                    'input_tokens' => $response->usage?->inputTokens ?? 0,
                    'output_tokens' => $response->usage?->outputTokens ?? 0,
                ];
            }
        } catch (\Throwable $e) {
            Log::error('AgentRuntime: AI invocation failed', [
                'session' => $session->session_key,
                'error' => $e->getMessage(),
            ]);
            $responseText = "I'm sorry, I encountered an error processing your request.";
            $usage = [];
        }

        $this->saveMessage($session, 'assistant', $responseText, [
            'provider' => $session->getEffectiveProvider(),
            'model' => $session->getEffectiveModel(),
        ], $usage);

        $session->update(['last_activity_at' => now()]);
        $this->maybeGenerateTitle($session);

        return $responseText;
    }

    /**
     * Stream a response for the web chat channel.
     */
    public function streamMessage(IncomingMessage $message): StreamableAgentResponse
    {
        $session = $this->sessionResolver->resolve($message);

        // Save user message
        $this->saveMessage($session, 'user', $message->content, [
            'channel' => $message->channel,
            'sender' => $message->sender,
        ]);

        $context = $this->contextAssembler->build($session, $message);
        $agent = $this->buildAgent($context, $session);

        $stream = $agent->stream(
            prompt: $message->content,
            provider: $session->getEffectiveProvider(),
            model: $session->getEffectiveModel(),
        );

        // Save response after streaming completes
        $stream->then(function ($response) use ($session) {
            $this->saveMessage($session, 'assistant', $response->text ?? '', [
                'provider' => $session->getEffectiveProvider(),
                'model' => $session->getEffectiveModel(),
            ], [
                'input_tokens' => $response->usage?->inputTokens ?? 0,
                'output_tokens' => $response->usage?->outputTokens ?? 0,
            ]);

            $session->update(['last_activity_at' => now()]);
            $this->maybeGenerateTitle($session);
        });

        return $stream;
    }

    /**
     * Stream a response and broadcast each event via Reverb.
     * Used by the queued ProcessChatMessage job.
     */
    public function streamAndBroadcast(IncomingMessage $message): void
    {
        $session = $this->sessionResolver->resolve($message);
        $isNew = $session->wasRecentlyCreated;

        // Check intent router for slash commands
        $intent = $this->intentRouter->classify($message, $session);
        if ($intent->isShortCircuit()) {
            $this->saveMessage($session, 'user', $message->content, [
                'channel' => $message->channel,
                'sender' => $message->sender,
            ]);
            $this->saveMessage($session, 'assistant', $intent->response, [
                'intent' => $intent->type->value,
                'command' => $intent->commandName,
            ]);

            // Broadcast synthetic stream cycle (start → delta → end)
            $channelKey = str_replace(':', '.', $message->sessionKey);
            $channel = new Channel('private-chat.session.'.$channelKey);

            \App\Events\StreamEnd::synthetic($channel, $intent->response);

            $session->update(['last_activity_at' => now()]);

            if ($isNew) {
                event(new SessionCreated($session->fresh()));
            } else {
                event(new SessionUpdated($session->fresh()));
            }

            return;
        }

        // Save user message
        $this->saveMessage($session, 'user', $message->content, [
            'channel' => $message->channel,
            'sender' => $message->sender,
        ]);

        $model = $session->getEffectiveModel();
        $isCodeModel = OllamaChatService::isCodeModel($model);

        $context = $isCodeModel
            ? $this->contextAssembler->buildMinimal($session, $message)
            : $this->contextAssembler->build($session, $message);

        // Pusher channel names cannot contain colons — replace with dots
        $channelKey = str_replace(':', '.', $message->sessionKey);
        $channel = new Channel('private-chat.session.'.$channelKey);

        if ($session->getEffectiveProvider() === 'ollama') {
            $ollamaMessages = $this->buildOllamaMessages($context['messages']);

            broadcast(new \App\Events\StreamEnd($channel, 'stream_start'))->toOthers();

            $result = $this->ollamaChatService->streamChat(
                $session->getEffectiveModel(),
                $ollamaMessages,
                function (string $token) use ($channel) {
                    broadcast(new \App\Events\StreamEnd($channel, 'text_delta', ['delta' => $token]))->toOthers();
                },
                $context['system'],
            );

            broadcast(new \App\Events\StreamEnd($channel, 'stream_end'))->toOthers();

            $this->saveMessage($session, 'assistant', $result['text'], [
                'provider' => 'ollama',
                'model' => $session->getEffectiveModel(),
                'tokens_per_sec' => $result['tokens_per_sec'],
            ]);
        } else {
            $agent = $this->buildAgent($context, $session);

            // Use plain Channel with 'private-' prefix already included to avoid
            // double-prefix bug: SDK's StreamEvent::broadcast() calls Broadcast::private()
            // which wraps in PrivateChannel again, producing 'private-private-...'
            $stream = $agent->broadcastNow(
                prompt: $message->content,
                channels: [$channel],
                provider: $session->getEffectiveProvider(),
                model: $session->getEffectiveModel(),
            );

            // After .each() in broadcastNow completes, text + usage are populated
            $this->saveMessage($session, 'assistant', $stream->text ?? '', [
                'provider' => $session->getEffectiveProvider(),
                'model' => $session->getEffectiveModel(),
            ], [
                'input_tokens' => $stream->usage?->inputTokens ?? 0,
                'output_tokens' => $stream->usage?->outputTokens ?? 0,
            ]);
        }

        $session->update(['last_activity_at' => now()]);
        $this->maybeGenerateTitle($session);

        // Broadcast session lifecycle event
        if ($isNew) {
            event(new SessionCreated($session->fresh()));
        } else {
            event(new SessionUpdated($session->fresh()));
        }
    }

    /**
     * Build an AnonymousAgent from context.
     */
    protected function buildAgent(array $context, AgentSession $session): AnonymousAgent
    {
        LogToolExecution::setSession($session);

        // Convert history to SDK Message objects
        $messages = collect($context['messages'])
            ->filter(fn ($m) => $m['role'] !== 'user' || $m !== end($context['messages']))
            ->map(fn ($m) => new Message($m['role'], $m['content']))
            ->all();

        // Remove the last user message from messages (it goes via prompt())
        if (! empty($messages)) {
            $last = end($messages);
            if ($last->role === 'user') {
                array_pop($messages);
            }
        }

        return new AnonymousAgent(
            instructions: $context['system'],
            messages: $messages,
            tools: $this->toolResolver->resolve($session),
        );
    }

    protected function saveMessage(
        AgentSession $session,
        string $role,
        string $content,
        array $meta = [],
        array $usage = [],
    ): AgentMessage {
        return $session->messages()->create([
            'role' => $role,
            'content' => $content,
            'meta' => $meta,
            'usage' => $usage,
        ]);
    }

    /**
     * Stream an Ollama response directly (for TUI token-by-token output).
     */
    public function streamOllama(IncomingMessage $message, callable $onToken): array
    {
        $session = $this->sessionResolver->resolve($message);

        // Check intent router for slash commands
        $intent = $this->intentRouter->classify($message, $session);
        if ($intent->isShortCircuit()) {
            $this->saveMessage($session, 'user', $message->content, [
                'channel' => $message->channel,
                'sender' => $message->sender,
            ]);
            $this->saveMessage($session, 'assistant', $intent->response, [
                'intent' => $intent->type->value,
                'command' => $intent->commandName,
            ]);
            $session->update(['last_activity_at' => now()]);

            // Emit intent response as a single token
            $onToken($intent->response);

            return ['text' => $intent->response, 'eval_count' => 0, 'tokens_per_sec' => 0.0];
        }

        $this->saveMessage($session, 'user', $message->content, [
            'channel' => $message->channel,
            'sender' => $message->sender,
        ]);

        $model = $session->getEffectiveModel();
        $isCodeModel = OllamaChatService::isCodeModel($model);

        $context = $isCodeModel
            ? $this->contextAssembler->buildMinimal($session, $message)
            : $this->contextAssembler->build($session, $message);

        $ollamaMessages = $this->buildOllamaMessages($context['messages']);

        $result = $this->ollamaChatService->streamChat(
            $model,
            $ollamaMessages,
            $onToken,
            $context['system'],
        );

        $this->saveMessage($session, 'assistant', $result['text'], [
            'provider' => 'ollama',
            'model' => $session->getEffectiveModel(),
            'tokens_per_sec' => $result['tokens_per_sec'],
        ]);

        $session->update(['last_activity_at' => now()]);
        $this->maybeGenerateTitle($session);

        return $result;
    }

    /**
     * Convert context messages to Ollama format (role + content arrays).
     */
    protected function buildOllamaMessages(array $messages): array
    {
        return array_map(fn ($m) => [
            'role' => $m['role'],
            'content' => $m['content'],
        ], $messages);
    }

    protected function maybeGenerateTitle(AgentSession $session): void
    {
        if ($session->title !== 'New Chat') {
            return;
        }

        $firstMessage = $session->messages()->where('role', 'user')->first();
        if (! $firstMessage) {
            return;
        }

        $title = mb_substr($firstMessage->content, 0, 60);
        if (mb_strlen($firstMessage->content) > 60) {
            $title .= '...';
        }

        $session->update(['title' => $title]);
    }
}
