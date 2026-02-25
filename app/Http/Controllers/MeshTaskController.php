<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Events\MeshTaskUpdated;
use App\Jobs\ProcessMeshTask;
use App\Models\MeshTask;
use App\Services\Mesh\MeshTaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeshTaskController extends Controller
{
    /**
     * Receive a task dispatched from a remote node — bearer token auth.
     */
    public function dispatch(Request $request): JsonResponse
    {
        $this->authenticateBearer($request);

        $validated = $request->validate([
            'id' => 'required|uuid',
            'origin_node' => 'required|string|max:100',
            'target_node' => 'required|string|max:100',
            'type' => 'required|string|in:prompt,embed,tool',
            'prompt' => 'required|string',
            'provider' => 'nullable|string',
            'model' => 'nullable|string',
            'system_prompt' => 'nullable|string',
            'callback_url' => 'nullable|url',
            'parent_id' => 'nullable|uuid',
            'meta' => 'nullable|array',
        ]);

        // Create local copy of the task with same UUID
        $task = MeshTask::updateOrCreate(
            ['id' => $validated['id']],
            array_merge($validated, ['status' => 'received']),
        );

        // Queue for processing
        ProcessMeshTask::dispatch($task->id);

        broadcast(new MeshTaskUpdated($task));

        return response()->json(['id' => $task->id, 'status' => 'received'], 201);
    }

    /**
     * Receive a result callback from a remote node — bearer token auth.
     */
    public function callback(Request $request, MeshTaskService $service): JsonResponse
    {
        $this->authenticateBearer($request);

        $validated = $request->validate([
            'id' => 'required|uuid',
            'status' => 'required|string|in:completed,failed',
            'result' => 'nullable|string',
            'error' => 'nullable|string',
            'usage' => 'nullable|array',
            'started_at' => 'nullable|string',
            'completed_at' => 'nullable|string',
        ]);

        $task = MeshTask::findOrFail($validated['id']);

        if ($validated['status'] === 'completed') {
            $task->markCompleted($validated['result'] ?? '', $validated['usage'] ?? []);
        } else {
            $task->markFailed($validated['error'] ?? 'Unknown error');
        }

        broadcast(new MeshTaskUpdated($task));

        // Handle chain continuation
        if ($task->isCompleted() && $task->chain_config) {
            $service->continueChain($task);
        }

        // Handle fan-out aggregation
        if ($task->parent_id) {
            $service->checkFanOutComplete($task);
        }

        return response()->json(['id' => $task->id, 'status' => $task->status]);
    }

    /**
     * Check task status — bearer token auth.
     */
    public function status(Request $request, string $id): JsonResponse
    {
        $this->authenticateBearer($request);

        $task = MeshTask::with('children')->findOrFail($id);

        return response()->json($task);
    }

    /**
     * List tasks — browser session auth.
     */
    public function index(): JsonResponse
    {
        $tasks = MeshTask::query()
            ->whereNull('parent_id')
            ->with('children')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return response()->json($tasks);
    }

    protected function authenticateBearer(Request $request): void
    {
        $token = config('services.system_event_token');

        if (! $token || $request->bearerToken() !== $token) {
            abort(401, 'Invalid token');
        }
    }
}
