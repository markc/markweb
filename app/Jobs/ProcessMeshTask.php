<?php

declare(strict_types=1);

namespace App\Jobs;

use App\DTOs\IncomingMessage;
use App\Models\MeshTask;
use App\Models\User;
use App\Services\Agent\AgentRuntime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProcessMeshTask implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 600;

    public function __construct(
        public string $taskId,
    ) {}

    public function handle(AgentRuntime $runtime): void
    {
        $task = MeshTask::findOrFail($this->taskId);

        $task->markProcessing();

        $user = $this->resolveSystemUser($task->origin_node);

        $message = new IncomingMessage(
            channel: 'mesh',
            sessionKey: 'mesh:'.$task->id,
            content: $task->prompt,
            sender: 'mesh:'.$task->origin_node,
            userId: $user->id,
            provider: $task->provider,
            model: $task->model,
            systemPrompt: $task->system_prompt,
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

    protected function sendCallback(MeshTask $task): void
    {
        $token = config('services.system_event_token');

        $payload = [
            'id' => $task->id,
            'status' => $task->status,
            'result' => $task->result,
            'error' => $task->error,
            'usage' => $task->usage,
            'started_at' => $task->started_at?->toISOString(),
            'completed_at' => $task->completed_at?->toISOString(),
        ];

        try {
            Http::withToken($token)
                ->timeout(15)
                ->withoutVerifying()
                ->post($task->callback_url, $payload);
        } catch (\Throwable $e) {
            Log::warning('MeshTask callback failed', [
                'task_id' => $task->id,
                'callback_url' => $task->callback_url,
                'error' => $e->getMessage(),
            ]);
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
