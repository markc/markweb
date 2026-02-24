<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\MeshNode;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MeshNodeUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly MeshNode $meshNode,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('mesh'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->meshNode->id,
            'name' => $this->meshNode->name,
            'wg_ip' => $this->meshNode->wg_ip,
            'status' => $this->meshNode->status,
            'last_heartbeat_at' => $this->meshNode->last_heartbeat_at?->toISOString(),
            'meta' => $this->meshNode->meta,
        ];
    }
}
