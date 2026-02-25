<?php

declare(strict_types=1);

namespace App\Services\Mesh\Concerns;

use App\Models\MeshTask;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait SendsCallbacks
{
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
}
