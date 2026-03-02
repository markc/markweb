<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\MeshTask;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MeshTaskUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly MeshTask $meshTask,
    ) {}

    public function broadcastAs(): string
    {
        return 'MeshTaskUpdated';
    }

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
            'id' => $this->meshTask->id,
            'origin_node' => $this->meshTask->origin_node,
            'target_node' => $this->meshTask->target_node,
            'status' => $this->meshTask->status,
            'type' => $this->meshTask->type,
            'provider' => $this->meshTask->provider,
            'model' => $this->meshTask->model,
            'parent_id' => $this->meshTask->parent_id,
            'usage' => $this->meshTask->usage,
            'dispatched_at' => $this->meshTask->dispatched_at?->toISOString(),
            'started_at' => $this->meshTask->started_at?->toISOString(),
            'completed_at' => $this->meshTask->completed_at?->toISOString(),
        ];
    }
}
