<?php

namespace App\Console\Commands;

use App\DTOs\IncomingMessage;
use App\Models\AgentSession;
use App\Models\User;
use App\Services\Agent\AgentRuntime;
use App\Services\Agent\IntentRouter;
use App\Services\Ollama\OllamaChatService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

use function Laravel\Prompts\note;
use function Laravel\Prompts\select;
use function Laravel\Prompts\spin;
use function Laravel\Prompts\textarea;

class AgentChat extends Command
{
    protected $signature = 'agent:chat
        {--session= : Resume an existing session by key}
        {--model= : Override the default model}
        {--provider= : Provider (anthropic, ollama, etc.)}
        {--list : List recent TUI sessions}';

    protected $description = 'Interactive AI chat in the terminal via LaRaClaw agent';

    protected string $provider;

    protected string $model;

    protected ?string $ollamaHost = null;

    public function handle(AgentRuntime $runtime, IntentRouter $intentRouter, OllamaChatService $ollamaChatService): int
    {
        if ($this->option('list')) {
            return $this->listSessions();
        }

        $user = User::first();
        $sessionKey = $this->option('session') ?? 'tui.'.$user->id.'.'.Str::uuid7()->toString();

        $existing = AgentSession::where('session_key', $sessionKey)->first();
        if ($existing) {
            note("Resuming session: {$existing->title}");
            $messageCount = $existing->messages()->count();
            note("{$messageCount} messages in history");
        } else {
            note('Starting new TUI session');
        }

        // Provider selection
        $this->provider = $this->option('provider') ?? $this->selectProvider($ollamaChatService);

        // Host + model selection
        if ($this->provider === 'ollama' && ! $this->option('model')) {
            $this->selectOllamaHost($ollamaChatService);
        }
        $this->model = $this->option('model') ?? $this->selectModel($ollamaChatService);

        note("Provider: {$this->provider} | Model: {$this->model}");
        note('Type /quit to exit, /model to switch, /sessions to list, /new to start fresh');
        note('');

        while (true) {
            $input = textarea(label: 'You', placeholder: 'Type your message...', required: true);

            // TUI-only commands (not handled by IntentRouter)
            $trimmed = strtolower(trim($input));
            if (in_array($trimmed, ['/quit', '/exit', '/q'])) {
                return self::SUCCESS;
            }
            if ($trimmed === '/sessions') {
                $this->showSessions($user);

                continue;
            }
            if (str_starts_with($trimmed, '/resume ')) {
                $this->resumeSession($trimmed, $sessionKey);

                continue;
            }
            if ($trimmed === '/model') {
                $this->provider = $this->selectProvider($ollamaChatService);
                if ($this->provider === 'ollama') {
                    $this->selectOllamaHost($ollamaChatService);
                }
                $this->model = $this->selectModel($ollamaChatService);
                note("Switched to: {$this->provider} | {$this->model}");
                note('');

                continue;
            }

            // Delegate slash commands to IntentRouter
            if (str_starts_with(trim($input), '/')) {
                $session = AgentSession::where('session_key', $sessionKey)->first();
                $message = new IncomingMessage(
                    channel: 'tui',
                    sessionKey: $sessionKey,
                    content: $input,
                    sender: 'operator',
                    userId: $user->id,
                    model: $this->model,
                    provider: $this->provider,
                );

                $intent = $intentRouter->classify($message, $session);

                if ($intent->isShortCircuit()) {
                    // Handle /new specially in TUI
                    if ($intent->commandName === 'new') {
                        $sessionKey = 'tui.'.$user->id.'.'.Str::uuid7()->toString();
                        note('Started new session');
                        note('');
                    } else {
                        note($intent->response.PHP_EOL);
                    }

                    continue;
                }
            }

            $message = new IncomingMessage(
                channel: 'tui',
                sessionKey: $sessionKey,
                content: $input,
                sender: 'operator',
                userId: $user->id,
                model: $this->model,
                provider: $this->provider,
            );

            if ($this->provider === 'ollama') {
                try {
                    $this->output->write("\n");
                    $result = $runtime->streamOllama($message, function (string $token) {
                        $this->output->write($token);
                    });
                    $this->output->writeln('');
                    note("  [{$result['eval_count']} tokens, {$result['tokens_per_sec']} t/s]".PHP_EOL);
                } catch (\Throwable $e) {
                    $this->output->writeln('');
                    note("Error: {$e->getMessage()}".PHP_EOL);
                }
            } else {
                $response = spin(
                    callback: fn () => $runtime->handleMessage($message),
                    message: 'Thinking...',
                );
                note($response.PHP_EOL);
            }
        }
    }

    protected function showSessions(User $user): void
    {
        $sessions = AgentSession::where('channel', 'tui')
            ->where('user_id', $user->id)
            ->orderByDesc('last_activity_at')
            ->take(10)
            ->get(['session_key', 'title', 'last_activity_at']);

        if ($sessions->isEmpty()) {
            note('No TUI sessions found.');

            return;
        }

        note('Recent TUI sessions:');
        foreach ($sessions as $i => $session) {
            $ago = $session->last_activity_at?->diffForHumans() ?? 'never';
            note("  [{$i}] {$session->title} ({$ago})");
            note("      /resume {$session->session_key}");
        }
        note('');
    }

    protected function resumeSession(string $command, string &$sessionKey): void
    {
        $key = trim(Str::after($command, '/resume '));
        $session = AgentSession::where('session_key', $key)->first();

        if (! $session) {
            note("Session not found: {$key}");

            return;
        }

        $sessionKey = $key;
        $messageCount = $session->messages()->count();
        note("Resumed: {$session->title} ({$messageCount} messages)");
        note('');
    }

    protected function listSessions(): int
    {
        $sessions = AgentSession::where('channel', 'tui')
            ->orderByDesc('last_activity_at')
            ->take(20)
            ->get(['session_key', 'title', 'last_activity_at', 'trust_level']);

        if ($sessions->isEmpty()) {
            $this->info('No TUI sessions found.');

            return self::SUCCESS;
        }

        $this->table(
            ['Session Key', 'Title', 'Last Activity', 'Trust'],
            $sessions->map(fn ($s) => [
                $s->session_key,
                Str::limit($s->title, 40),
                $s->last_activity_at?->diffForHumans() ?? 'never',
                $s->trust_level,
            ])->toArray()
        );

        return self::SUCCESS;
    }

    protected function selectProvider(OllamaChatService $ollamaChatService): string
    {
        $options = ['api' => 'API (Claude, GPT, etc.)'];

        // Check if any Ollama host is reachable
        $hosts = $ollamaChatService->getHosts();
        $anyAvailable = collect($hosts)->contains('available', true);

        if ($anyAvailable) {
            $options['ollama'] = 'Ollama';
        }

        if (count($options) === 1) {
            return config('agent.default_provider', 'anthropic');
        }

        $choice = select(
            label: 'Select provider',
            options: $options,
        );

        return $choice === 'api' ? config('agent.default_provider', 'anthropic') : 'ollama';
    }

    protected function selectOllamaHost(OllamaChatService $ollamaChatService): void
    {
        $hosts = $ollamaChatService->getHosts();
        $available = collect($hosts)->filter(fn ($h) => $h['available']);

        if ($available->count() <= 1) {
            // Only one host available — use it automatically
            if ($available->isNotEmpty()) {
                $host = $available->first();
                $this->ollamaHost = $host['url'];
                $ollamaChatService->useHost($host['url']);
            }

            return;
        }

        $options = $available->mapWithKeys(fn ($h, $key) => [$key => $h['label']])->all();

        $choice = select(
            label: 'Select Ollama instance',
            options: $options,
        );

        $this->ollamaHost = $hosts[$choice]['url'];
        $ollamaChatService->useHost($this->ollamaHost);
    }

    protected function selectModel(OllamaChatService $ollamaChatService): string
    {
        if ($this->provider === 'ollama') {
            $models = $ollamaChatService->getAvailableModels($this->ollamaHost);

            if (empty($models)) {
                note('No Ollama chat models available. Falling back to API.');
                $this->provider = config('agent.default_provider', 'anthropic');

                return config('agent.default_model');
            }

            return select(
                label: 'Select model',
                options: $models,
            );
        }

        return config('agent.default_model');
    }
}
