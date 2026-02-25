<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\MeshNode;
use App\Models\MeshTask;
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

    public function handle(): void
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
            Log::error('DispatchMeshTask failed', [
                'task_id' => $task->id,
                'target' => $task->target_node,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Let queue retry
        }
    }

    protected function resolveNodeUrl(MeshNode $node): string
    {
        // Use node meta url if available, fall back to WireGuard IP
        return $node->meta['url'] ?? "https://{$node->wg_ip}";
    }
}
