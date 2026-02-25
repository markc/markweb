<?php

declare(strict_types=1);

namespace App\Services\Mesh;

use App\Exceptions\MeshPermissionDeniedException;
use App\Models\MeshTask;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MeshPermissionGuard
{
    /**
     * Authorize a mesh task against the permission matrix.
     *
     * @throws MeshPermissionDeniedException
     */
    public function authorize(MeshTask $task): void
    {
        $originNode = $task->origin_node;
        $localNode = config('mesh.node_name');

        // Local tasks bypass destructive pattern check
        $isLocal = $originNode === $localNode;

        $permissions = $this->getNodePermissions($originNode);

        // 1. Check type allowed
        $allowedTypes = $permissions['allowed_types'] ?? [];
        $deniedTypes = $permissions['denied_types'] ?? [];

        if (in_array($task->type, $deniedTypes)) {
            $this->deny($task, "Task type '{$task->type}' denied for node '{$originNode}'");
        }

        if (! empty($allowedTypes) && ! in_array($task->type, $allowedTypes)) {
            $this->deny($task, "Task type '{$task->type}' not allowed for node '{$originNode}'");
        }

        // 2. Check concurrency limit
        $maxConcurrent = $permissions['max_concurrent_tasks'] ?? 5;
        $activeTasks = MeshTask::where('origin_node', $originNode)
            ->whereIn('status', ['pending', 'dispatched', 'received', 'processing'])
            ->count();

        if ($activeTasks >= $maxConcurrent) {
            $this->deny($task, "Concurrency limit ({$maxConcurrent}) exceeded for node '{$originNode}'");
        }

        // 3. Destructive pattern scan (remote tasks only)
        if (! $isLocal) {
            $this->scanDestructivePatterns($task);
        }

        // 4. Rate limit
        $this->checkRateLimit($task);
    }

    /**
     * Get the effective trust level for a node.
     */
    public function getEffectiveTrustLevel(string $originNode): string
    {
        $permissions = $this->getNodePermissions($originNode);

        return $permissions['trust_level'] ?? 'standard';
    }

    protected function getNodePermissions(string $nodeName): array
    {
        $allPermissions = config('mesh_permissions.node_permissions', []);

        return $allPermissions[$nodeName] ?? $allPermissions['default'] ?? [
            'allowed_types' => ['prompt', 'memory_search'],
            'denied_types' => ['tool'],
            'trust_level' => 'standard',
            'max_concurrent_tasks' => 5,
        ];
    }

    protected function scanDestructivePatterns(MeshTask $task): void
    {
        $patterns = config('mesh_permissions.destructive_patterns', []);

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $task->prompt)) {
                Log::warning('Destructive pattern detected in mesh task', [
                    'task_id' => $task->id,
                    'origin_node' => $task->origin_node,
                    'pattern' => $pattern,
                ]);

                $this->deny($task, "Destructive pattern detected in prompt from node '{$task->origin_node}'");
            }
        }
    }

    protected function checkRateLimit(MeshTask $task): void
    {
        $maxPerMinute = config('mesh_permissions.rate_limits.tasks_per_minute', 30);
        $cacheKey = "mesh_rate:{$task->origin_node}";

        $count = Cache::get($cacheKey, 0);

        if ($count >= $maxPerMinute) {
            $this->deny($task, "Rate limit ({$maxPerMinute}/min) exceeded for node '{$task->origin_node}'");
        }

        Cache::put($cacheKey, $count + 1, now()->addMinute());
    }

    /**
     * @throws MeshPermissionDeniedException
     */
    protected function deny(MeshTask $task, string $reason): never
    {
        Log::warning('Mesh task permission denied', [
            'task_id' => $task->id,
            'origin_node' => $task->origin_node,
            'type' => $task->type,
            'reason' => $reason,
        ]);

        throw new MeshPermissionDeniedException($reason);
    }
}
