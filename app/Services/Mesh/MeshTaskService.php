<?php

declare(strict_types=1);

namespace App\Services\Mesh;

use App\Events\MeshTaskUpdated;
use App\Jobs\DispatchMeshTask;
use App\Jobs\ProcessMemorySearchTask;
use App\Jobs\ProcessMeshTask;
use App\Models\MeshTask;
use Illuminate\Support\Str;

class MeshTaskService
{
    /**
     * Dispatch a single task to a target node.
     */
    public function dispatch(
        string $prompt,
        ?string $targetNode = null,
        ?string $provider = null,
        ?string $model = null,
        ?string $systemPrompt = null,
        ?string $parentId = null,
        ?array $chainConfig = null,
        ?array $meta = null,
    ): MeshTask {
        $originNode = config('mesh.node_name');
        $targetNode ??= $originNode;

        $task = MeshTask::create([
            'id' => Str::uuid()->toString(),
            'origin_node' => $originNode,
            'target_node' => $targetNode,
            'status' => 'pending',
            'type' => 'prompt',
            'prompt' => $prompt,
            'provider' => $provider,
            'model' => $model,
            'system_prompt' => $systemPrompt,
            'callback_url' => $this->buildCallbackUrl(),
            'parent_id' => $parentId,
            'chain_config' => $chainConfig,
            'meta' => $meta,
        ]);

        // Self-dispatch optimization: skip HTTP, queue locally
        if ($targetNode === $originNode) {
            $task->markDispatched();
            $task->markReceived();
            ProcessMeshTask::dispatch($task->id);
        } else {
            DispatchMeshTask::dispatch($task->id);
        }

        return $task;
    }

    /**
     * Dispatch a memory search task to a target node.
     */
    public function dispatchMemorySearch(
        string $query,
        ?string $targetNode = null,
        ?int $agentId = null,
        int $limit = 10,
    ): MeshTask {
        $originNode = config('mesh.node_name');
        $targetNode ??= $originNode;

        $task = MeshTask::create([
            'id' => Str::uuid()->toString(),
            'origin_node' => $originNode,
            'target_node' => $targetNode,
            'status' => 'pending',
            'type' => 'memory_search',
            'prompt' => $query,
            'callback_url' => $this->buildCallbackUrl(),
            'meta' => [
                'agent_id' => $agentId,
                'limit' => $limit,
            ],
        ]);

        // Self-dispatch optimisation: skip HTTP, queue locally
        if ($targetNode === $originNode) {
            $task->markDispatched();
            $task->markReceived();
            ProcessMemorySearchTask::dispatch($task->id);
        } else {
            DispatchMeshTask::dispatch($task->id);
        }

        return $task;
    }

    /**
     * Fan out the same prompt to multiple nodes/models in parallel.
     * Returns the parent task.
     */
    public function fanOut(
        string $prompt,
        array $targets,
        ?string $systemPrompt = null,
        ?array $meta = null,
    ): MeshTask {
        $originNode = config('mesh.node_name');

        // Create parent task
        $parent = MeshTask::create([
            'id' => Str::uuid()->toString(),
            'origin_node' => $originNode,
            'target_node' => $originNode,
            'status' => 'processing',
            'type' => 'prompt',
            'prompt' => $prompt,
            'system_prompt' => $systemPrompt,
            'meta' => array_merge($meta ?? [], [
                'fan_out' => true,
                'target_count' => count($targets),
            ]),
        ]);

        // Dispatch child tasks
        foreach ($targets as $target) {
            $targetNode = is_array($target) ? ($target['node'] ?? $originNode) : $target;
            $targetProvider = is_array($target) ? ($target['provider'] ?? null) : null;
            $targetModel = is_array($target) ? ($target['model'] ?? null) : null;

            $this->dispatch(
                prompt: $prompt,
                targetNode: $targetNode,
                provider: $targetProvider,
                model: $targetModel,
                systemPrompt: $systemPrompt,
                parentId: $parent->id,
                meta: $meta,
            );
        }

        return $parent;
    }

    /**
     * Execute a chain of tasks sequentially.
     * Each step's prompt can contain {{previous_result}} placeholder.
     */
    public function chain(array $steps, ?array $meta = null): MeshTask
    {
        $originNode = config('mesh.node_name');

        // Create parent task for the chain
        $parent = MeshTask::create([
            'id' => Str::uuid()->toString(),
            'origin_node' => $originNode,
            'target_node' => $originNode,
            'status' => 'processing',
            'type' => 'prompt',
            'prompt' => $steps[0]['prompt'] ?? '',
            'meta' => array_merge($meta ?? [], [
                'chain' => true,
                'step_count' => count($steps),
            ]),
        ]);

        // Dispatch first step with chain_config containing remaining steps
        $remainingSteps = array_slice($steps, 1);

        $this->dispatch(
            prompt: $steps[0]['prompt'],
            targetNode: $steps[0]['node'] ?? null,
            provider: $steps[0]['provider'] ?? null,
            model: $steps[0]['model'] ?? null,
            systemPrompt: $steps[0]['system_prompt'] ?? null,
            parentId: $parent->id,
            chainConfig: ! empty($remainingSteps) ? ['steps' => $remainingSteps] : null,
            meta: $meta,
        );

        return $parent;
    }

    /**
     * Handle chain continuation when a task completes.
     */
    public function continueChain(MeshTask $completedTask): void
    {
        if (! $completedTask->chain_config || empty($completedTask->chain_config['steps'])) {
            return;
        }

        $steps = $completedTask->chain_config['steps'];
        $nextStep = array_shift($steps);

        // Replace {{previous_result}} placeholder
        $prompt = str_replace('{{previous_result}}', $completedTask->result ?? '', $nextStep['prompt']);

        $this->dispatch(
            prompt: $prompt,
            targetNode: $nextStep['node'] ?? null,
            provider: $nextStep['provider'] ?? null,
            model: $nextStep['model'] ?? null,
            systemPrompt: $nextStep['system_prompt'] ?? null,
            parentId: $completedTask->parent_id,
            chainConfig: ! empty($steps) ? ['steps' => $steps] : null,
            meta: $completedTask->meta,
        );
    }

    /**
     * Handle fan-out completion: aggregate results into parent.
     */
    public function checkFanOutComplete(MeshTask $childTask): void
    {
        if (! $childTask->parent_id) {
            return;
        }

        $parent = $childTask->parent;

        if (! $parent || ! ($parent->meta['fan_out'] ?? false)) {
            return;
        }

        if (! $childTask->allSiblingsComplete()) {
            return;
        }

        // All children done — aggregate results
        $children = MeshTask::where('parent_id', $parent->id)->get();

        $results = $children->map(fn (MeshTask $t) => [
            'node' => $t->target_node,
            'provider' => $t->provider,
            'model' => $t->model,
            'status' => $t->status,
            'result' => $t->result,
            'error' => $t->error,
            'usage' => $t->usage,
        ])->all();

        $aggregated = collect($children)
            ->filter(fn (MeshTask $t) => $t->isCompleted())
            ->pluck('result')
            ->implode("\n\n---\n\n");

        $allSucceeded = $children->every(fn (MeshTask $t) => $t->isCompleted());

        if ($allSucceeded) {
            $parent->markCompleted($aggregated, [
                'children' => $results,
            ]);
        } else {
            $parent->update([
                'status' => 'completed',
                'result' => $aggregated ?: null,
                'meta' => array_merge($parent->meta ?? [], ['children' => $results]),
                'completed_at' => now(),
            ]);
        }

        broadcast(new MeshTaskUpdated($parent));
    }

    protected function buildCallbackUrl(): ?string
    {
        $nodeUrl = config('mesh.node_url');

        if (! $nodeUrl) {
            // Fall back to constructing from node WG IP
            $wgIp = config('mesh.node_wg_ip');

            return $wgIp ? "https://{$wgIp}/api/mesh/task/callback" : null;
        }

        return "{$nodeUrl}/api/mesh/task/callback";
    }
}
