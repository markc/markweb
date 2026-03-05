<?php

namespace App\Jobs\Chat;

use App\Models\Chat\ChatMessage;
use App\Models\Memory;
use App\Services\Memory\EmbeddingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class ChatBraneIndexJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(EmbeddingService $embeddingService): void
    {
        if (! $embeddingService->isAvailable()) {
            return;
        }

        $lastIndexed = Cache::get('chat:brane:last_indexed_at', now()->subDay());

        $messages = ChatMessage::with(['user', 'channel'])
            ->where('created_at', '>', $lastIndexed)
            ->whereNull('deleted_at')
            ->where('type', 'message')
            ->orderBy('created_at')
            ->get();

        if ($messages->isEmpty()) {
            return;
        }

        // Group into 5-minute buckets per channel
        $buckets = [];
        foreach ($messages as $message) {
            $channelSlug = $message->channel->slug ?? 'unknown';
            $bucket = $message->created_at->format('Y-m-d_H-').(int) floor($message->created_at->minute / 5) * 5;
            $key = "{$channelSlug}:{$bucket}";

            $buckets[$key] ??= [
                'channel_slug' => $channelSlug,
                'channel_name' => $message->channel->name ?? 'unknown',
                'messages' => [],
                'participants' => [],
                'timestamp' => $message->created_at,
            ];

            $userName = $message->user->name ?? 'Unknown';
            $buckets[$key]['messages'][] = "[{$userName}] {$message->content}";
            $buckets[$key]['participants'][$userName] = true;
        }

        foreach ($buckets as $bucket) {
            $content = implode("\n", $bucket['messages']);
            $participants = array_keys($bucket['participants']);

            try {
                $embedding = $embeddingService->embed($content);

                Memory::create([
                    'content' => $content,
                    'embedding' => $embeddingService->toVector($embedding),
                    'memory_type' => 'chat',
                    'source_file' => "text-chat/{$bucket['channel_slug']}",
                    'metadata' => [
                        'domain' => 'chat',
                        'channel' => $bucket['channel_name'],
                        'participants' => $participants,
                        'timestamp' => $bucket['timestamp']->toISOString(),
                    ],
                ]);
            } catch (\Throwable) {
                // Skip failed embeddings, will be retried next run
                continue;
            }
        }

        Cache::put('chat:brane:last_indexed_at', now());
    }
}
