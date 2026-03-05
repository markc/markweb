<?php

namespace App\Jobs\Chat;

use App\Models\Chat\ChatChannel;
use App\Models\Chat\ChatMessage;
use App\Models\Memory;
use App\Services\Memory\EmbeddingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class ChatDecisionExtractJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(EmbeddingService $embeddingService): void
    {
        if (! $embeddingService->isAvailable()) {
            return;
        }

        $ollamaHost = rtrim(config('memory.ollama_host', 'http://127.0.0.1:11434'), '/');

        $yesterday = now()->subDay()->startOfDay();
        $endOfYesterday = now()->subDay()->endOfDay();

        $channels = ChatChannel::all();

        foreach ($channels as $channel) {
            $messages = ChatMessage::with('user')
                ->where('channel_id', $channel->id)
                ->whereBetween('created_at', [$yesterday, $endOfYesterday])
                ->whereNull('deleted_at')
                ->where('type', 'message')
                ->orderBy('created_at')
                ->get();

            if ($messages->count() < 3) {
                continue;
            }

            $transcript = $messages->map(function ($m) {
                $name = $m->user->name ?? 'Unknown';

                return "[{$m->created_at->format('H:i')}] {$name}: {$m->content}";
            })->implode("\n");

            try {
                $response = Http::timeout(120)->post($ollamaHost . '/api/chat', [
                    'model' => 'qwen3.5:9b',
                    'stream' => false,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Extract decisions, action items, and key conclusions from this chat conversation. Be concise. Format as bullet points.',
                        ],
                        ['role' => 'user', 'content' => $transcript],
                    ],
                ]);

                $summary = $response->json('message.content', '');

                if (empty(trim($summary))) {
                    continue;
                }

                $embedding = $embeddingService->embed($summary);

                Memory::create([
                    'content' => $summary,
                    'embedding' => $embeddingService->toVector($embedding),
                    'memory_type' => 'decision',
                    'source_file' => "text-chat/{$channel->slug}/decisions",
                    'metadata' => [
                        'domain' => 'decisions',
                        'channel' => $channel->name,
                        'date' => $yesterday->format('Y-m-d'),
                        'message_count' => $messages->count(),
                    ],
                ]);
            } catch (\Throwable) {
                continue;
            }
        }
    }
}
