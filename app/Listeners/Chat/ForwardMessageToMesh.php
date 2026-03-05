<?php

namespace App\Listeners\Chat;

use App\DTOs\AmpMessage;
use App\Events\Chat\MessageSent;
use App\Services\Mesh\MeshBridgeService;

class ForwardMessageToMesh
{
    public function __construct(
        private MeshBridgeService $bridge,
    ) {}

    public function handle(MessageSent $event): void
    {
        if (! $this->bridge->isAvailable()) {
            return;
        }

        $message = $event->message;
        $nodeName = $this->bridge->nodeName();
        $peers = $this->bridge->connectedPeers();

        if (empty($peers)) {
            return;
        }

        $json = json_encode([
            'channel_slug' => $message->channel->slug,
            'user_name' => $message->user?->name ?? 'Unknown',
            'user_id' => $message->user_id,
            'content' => $message->content,
            'type' => $message->type,
            'parent_id' => $message->parent_id,
            'created_at' => $message->created_at->toIso8601String(),
            'origin_node' => $nodeName,
            'origin_id' => $message->id,
        ]);

        foreach ($peers as $peer) {
            try {
                $amp = new AmpMessage(
                    headers: [
                        'amp' => '1',
                        'type' => 'event',
                        'from' => "chat.markweb.{$nodeName}.amp",
                        'to' => "chat.markweb.{$peer}.amp",
                        'command' => 'chat-message',
                        'json' => $json,
                    ],
                );

                $this->bridge->send($amp);
            } catch (\Throwable) {
                // Don't fail the local broadcast if mesh send fails
            }
        }
    }
}
