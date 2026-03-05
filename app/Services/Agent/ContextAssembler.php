<?php

namespace App\Services\Agent;

use App\DTOs\IncomingMessage;
use App\Models\AgentSession;
use App\Services\Document\DocumentSearchService;
use App\Services\Memory\MemorySearchService;
use Illuminate\Support\Facades\Log;

class ContextAssembler
{
    public function __construct(
        protected SystemPromptBuilder $promptBuilder,
        protected MemorySearchService $memorySearchService,
        protected DocumentSearchService $documentSearchService,
    ) {}

    /**
     * Build the full context array for the AI provider.
     *
     * @return array{system: string, messages: array}
     */
    public function build(AgentSession $session, IncomingMessage $message): array
    {
        $systemPrompt = $this->promptBuilder->build($session);

        // Append relevant memories to system prompt
        $memoryContext = $this->buildMemoryContext($session, $message);
        if ($memoryContext) {
            $systemPrompt .= "\n\n---\n\n".$memoryContext;
        }

        // Append relevant document context (from #filename mentions or general search)
        $documentContext = $this->buildDocumentContext($session, $message);
        if ($documentContext) {
            $systemPrompt .= "\n\n---\n\n".$documentContext;
        }

        $messages = [];

        // Add compacted summary if exists
        if ($session->compacted_summary) {
            $messages[] = [
                'role' => 'system',
                'content' => "Previous conversation summary:\n".$session->compacted_summary,
            ];
        }

        // Add conversation history
        foreach ($session->messages()->limit(config('agent.max_conversation_messages', 100))->get() as $msg) {
            $messages[] = [
                'role' => $msg->role,
                'content' => $msg->content,
            ];
        }

        // Add current message
        $messages[] = [
            'role' => 'user',
            'content' => $message->content,
        ];

        return [
            'system' => $systemPrompt,
            'messages' => $messages,
        ];
    }

    /**
     * Build minimal context for code models — conversation history only, no agent system prompt.
     *
     * @return array{system: string, messages: array}
     */
    public function buildMinimal(AgentSession $session, IncomingMessage $message): array
    {
        $messages = [];

        // Conversation history only
        foreach ($session->messages()->limit(config('agent.max_conversation_messages', 100))->get() as $msg) {
            $messages[] = [
                'role' => $msg->role,
                'content' => $msg->content,
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => $message->content,
        ];

        return [
            'system' => 'You are a helpful coding assistant. Be concise.',
            'messages' => $messages,
        ];
    }

    /**
     * Search for relevant document chunks and format as context section.
     * Parses #filename mentions for targeted search, falls back to general search.
     */
    protected function buildDocumentContext(AgentSession $session, IncomingMessage $message): ?string
    {
        if (! $session->user_id) {
            return null;
        }

        try {
            // Parse #filename mentions from message
            preg_match_all('/#(\S+\.\w+)/', $message->content, $matches);
            $mentionedFiles = $matches[1] ?? [];

            $allChunks = collect();

            if (! empty($mentionedFiles)) {
                // Search within each mentioned file
                foreach ($mentionedFiles as $filename) {
                    $chunks = $this->documentSearchService->search(
                        query: $message->content,
                        userId: $session->user_id,
                        limit: 3,
                        filename: $filename,
                    );
                    $allChunks = $allChunks->merge($chunks);
                }
            } else {
                // General document search
                $allChunks = $this->documentSearchService->search(
                    query: $message->content,
                    userId: $session->user_id,
                    limit: 5,
                );
            }

            if ($allChunks->isEmpty()) {
                return null;
            }

            $formatted = $allChunks->map(function ($chunk) {
                return "### {$chunk->filename} (chunk {$chunk->chunk_index})\n{$chunk->chunk_content}";
            })->implode("\n\n");

            return "## Relevant Documents\n\n{$formatted}";
        } catch (\Throwable $e) {
            Log::warning('ContextAssembler: document search failed', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Search for relevant memories and format as context section.
     */
    protected function buildMemoryContext(AgentSession $session, IncomingMessage $message): ?string
    {
        if (! config('memory.search.enabled', true)) {
            return null;
        }

        try {
            $memories = $this->memorySearchService->search(
                query: $message->content,
                agentId: $session->agent_id,
                limit: config('memory.search.default_limit', 10),
            );

            if ($memories->isEmpty()) {
                return null;
            }

            $formatted = $memories->map(function ($memory) {
                $type = $memory->memory_type;
                $date = $memory->created_at->format('Y-m-d');

                return "- [{$type}, {$date}] {$memory->content}";
            })->implode("\n");

            return "## Relevant Memories\n\n{$formatted}";
        } catch (\Throwable $e) {
            Log::warning('ContextAssembler: memory search failed', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
