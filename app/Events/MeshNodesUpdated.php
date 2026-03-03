<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Batched mesh node update — one WS frame per tick with only changed fields.
 */
class MeshNodesUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    /**
     * @param  array<int, array<string, mixed>>  $nodes  Delta batch of node updates
     */
    public function __construct(
        public readonly array $nodes,
    ) {}

    public function broadcastAs(): string
    {
        return 'MeshNodesUpdated';
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
        return ['nodes' => $this->nodes];
    }
}
