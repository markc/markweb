<?php

namespace App\Events\Chat;

use App\Models\Chat\ChatMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ChatMessage $message,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.channel.'.$this->message->channel_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        $this->message->loadMissing(['user', 'reactions']);

        return [
            'id' => $this->message->id,
            'channel_id' => $this->message->channel_id,
            'user_id' => $this->message->user_id,
            'user' => $this->message->user ? [
                'id' => $this->message->user->id,
                'name' => $this->message->user->name,
            ] : null,
            'content' => $this->message->content,
            'type' => $this->message->type,
            'metadata' => $this->message->metadata,
            'parent_id' => $this->message->parent_id,
            'reply_count' => $this->message->replies()->count(),
            'reactions' => [],
            'created_at' => $this->message->created_at->toISOString(),
            'updated_at' => $this->message->updated_at->toISOString(),
            'deleted_at' => null,
        ];
    }
}
