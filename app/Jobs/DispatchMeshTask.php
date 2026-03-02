<?php

declare(strict_types=1);

namespace App\Jobs;

use App\DTOs\AmpMessage;
use App\Models\MeshNode;
use App\Models\MeshTask;
use App\Services\Mesh\MeshBridgeService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DispatchMeshTask implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 60;

    public function __construct(
        public string $taskId,
    ) {}

    public function handle(MeshBridgeService $bridge): void
    {
        $task = MeshTask::findOrFail($this->taskId);

        if (! $task->isPending()) {
            return;
        }

        $targetNode = MeshNode::where('name', $task->target_node)->first();

        if (! $targetNode || ! $targetNode->isOnline()) {
            $task->markFailed("Target node '{$task->target_node}' is offline or unknown");

            return;
        }

        // Try meshd bridge first, fall back to direct HTTP
        if ($bridge->isAvailable()) {
            $this->dispatchViaMeshd($task, $bridge);
        } else {
            $this->dispatchViaHttp($task, $targetNode);
        }
    }

    protected function dispatchViaMeshd(MeshTask $task, MeshBridgeService $bridge): void
    {
        $nodeName = config('mesh.node_name', 'unknown');

        $message = new AmpMessage(
            headers: [
                'amp' => '1',
                'type' => 'request',
                'from' => "markweb.{$nodeName}.amp",
                'to' => "markweb.{$task->target_node}.amp",
                'command' => 'dispatch',
                'id' => $task->id,
                'args' => json_encode(array_filter([
                    'id' => $task->id,
                    'origin_node' => $task->origin_node,
                    'target_node' => $task->target_node,
                    'type' => $task->type,
                    'provider' => $task->provider,
                    'model' => $task->model,
                    'system_prompt' => $task->system_prompt,
                    'parent_id' => $task->parent_id,
                    'meta' => $task->meta,
                ])),
            ],
            body: $task->prompt,
        );

        try {
            $bridge->send($message);
            $task->markDispatched();
        } catch (\Throwable $e) {
            Log::warning('DispatchMeshTask: meshd send failed, falling back to HTTP', [
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);

            $targetNode = MeshNode::where('name', $task->target_node)->first();
            if ($targetNode) {
                $this->dispatchViaHttp($task, $targetNode);
            } else {
                throw $e;
            }
        }
    }

    protected function dispatchViaHttp(MeshTask $task, MeshNode $targetNode): void
    {
        $token = config('services.system_event_token');
        $baseUrl = $this->resolveNodeUrl($targetNode);

        $payload = [
            'id' => $task->id,
            'origin_node' => $task->origin_node,
            'target_node' => $task->target_node,
            'type' => $task->type,
            'prompt' => $task->prompt,
            'provider' => $task->provider,
            'model' => $task->model,
            'system_prompt' => $task->system_prompt,
            'callback_url' => $task->callback_url,
            'parent_id' => $task->parent_id,
            'meta' => $task->meta,
        ];

        try {
            $response = Http::withToken($token)
                ->timeout(30)
                ->withoutVerifying()
                ->post("{$baseUrl}/api/mesh/task/dispatch", $payload);

            if ($response->successful()) {
                $task->markDispatched();
            } else {
                $task->markFailed("Dispatch failed: HTTP {$response->status()}");
            }
        } catch (\Throwable $e) {
            Log::error('DispatchMeshTask HTTP fallback failed', [
                'task_id' => $task->id,
                'target' => $task->target_node,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Let queue retry
        }
    }

    protected function resolveNodeUrl(MeshNode $node): string
    {
        return $node->meta['url'] ?? "https://{$node->wg_ip}";
    }
}
