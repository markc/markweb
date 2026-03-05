<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DocumentProcessed implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $userId,
        public string $filename,
        public int $chunkCount,
        public ?string $error = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('documents.user.'.$this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'document.processed';
    }

    public function broadcastWith(): array
    {
        return [
            'filename' => $this->filename,
            'chunk_count' => $this->chunkCount,
            'status' => $this->error ? 'failed' : 'ready',
            'error' => $this->error,
        ];
    }
}
