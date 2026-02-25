<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\MeshTask;
use App\Services\Memory\MemorySearchService;
use App\Services\Mesh\Concerns\SendsCallbacks;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMemorySearchTask implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SendsCallbacks, SerializesModels;

    public int $tries = 1;

    public int $timeout = 120;

    public function __construct(
        public string $taskId,
    ) {}

    public function handle(MemorySearchService $searchService): void
    {
        $task = MeshTask::findOrFail($this->taskId);

        $task->markProcessing();

        $agentId = $task->meta['agent_id'] ?? 1;
        $limit = $task->meta['limit'] ?? 10;

        try {
            $results = $searchService->search($task->prompt, $agentId, $limit);

            $serialized = $results->map(fn ($memory) => [
                'id' => $memory->id,
                'content' => $memory->content,
                'memory_type' => $memory->memory_type,
                'source_file' => $memory->source_file,
                'metadata' => $memory->metadata,
                'created_at' => $memory->created_at?->toISOString(),
            ])->values()->all();

            $task->markCompleted(json_encode($serialized, JSON_UNESCAPED_UNICODE));
        } catch (\Throwable $e) {
            Log::error('ProcessMemorySearchTask failed', [
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);

            $task->markFailed($e->getMessage());
        }

        if ($task->callback_url) {
            $this->sendCallback($task->fresh());
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('ProcessMemorySearchTask job failed', [
            'task_id' => $this->taskId,
            'error' => $e->getMessage(),
        ]);

        $task = MeshTask::find($this->taskId);
        if ($task && ! $task->isTerminal()) {
            $task->markFailed($e->getMessage());

            if ($task->callback_url) {
                $this->sendCallback($task->fresh());
            }
        }
    }
}
