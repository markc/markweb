<?php

declare(strict_types=1);

namespace App\Jobs;

use App\DTOs\IncomingMessage;
use App\Models\MeshTask;
use App\Models\User;
use App\Services\Agent\AgentRuntime;
use App\Services\Mesh\Concerns\SendsCallbacks;
use App\Services\Mesh\MeshPermissionGuard;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProcessMeshTask implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SendsCallbacks, SerializesModels;

    public int $tries = 1;

    public int $timeout = 600;

    public function __construct(
        public string $taskId,
    ) {}

    public function handle(AgentRuntime $runtime, MeshPermissionGuard $guard): void
    {
        $task = MeshTask::findOrFail($this->taskId);

        $task->markProcessing();

        $user = $this->resolveSystemUser($task->origin_node);
        $trustLevel = $guard->getEffectiveTrustLevel($task->origin_node);

        $message = new IncomingMessage(
            channel: 'mesh',
            sessionKey: 'mesh:'.$task->id,
            content: $task->prompt,
            sender: 'mesh:'.$task->origin_node,
            userId: $user->id,
            provider: $task->provider,
            model: $task->model,
            systemPrompt: $task->system_prompt,
            metadata: ['trust_level' => $trustLevel],
        );

        try {
            $result = $runtime->handleMessage($message);

            $task->markCompleted($result);
        } catch (\Throwable $e) {
            Log::error('ProcessMeshTask failed', [
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);

            $task->markFailed($e->getMessage());
        }

        // POST result back to origin's callback URL
        if ($task->callback_url) {
            $this->sendCallback($task);
        }
    }

    /**
     * Get or create a system user for mesh task processing.
     */
    protected function resolveSystemUser(string $originNode): User
    {
        return User::firstOrCreate(
            ['email' => "mesh@{$originNode}"],
            [
                'name' => "Mesh ({$originNode})",
                'password' => Str::random(64),
            ],
        );
    }

    public function failed(\Throwable $e): void
    {
        Log::error('ProcessMeshTask job failed', [
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
