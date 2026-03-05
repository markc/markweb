<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DTOs\AmpMessage;
use App\Events\Chat\MessageSent;
use App\Events\MeshNodesUpdated;
use App\Events\MeshTaskUpdated;
use App\Jobs\ProcessMeshTask;
use App\Models\Chat\ChatChannel;
use App\Models\Chat\ChatMessage;
use App\Models\MeshTask;
use App\Services\Mesh\MeshBridgeService;
use App\Services\Mesh\MeshNodeCache;
use App\Services\Mesh\MeshPermissionGuard;
use App\Services\Mesh\MeshTaskService;
use App\Services\Search\DTOs\SearchRequest;
use App\Services\Search\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Receives AMP messages from meshd's localhost callback.
 *
 * meshd POSTs raw AMP bodies here after receiving messages from peers.
 */
class MeshInboundController extends Controller
{
    public function receive(Request $request, MeshPermissionGuard $guard, MeshTaskService $taskService): JsonResponse
    {
        $raw = $request->getContent();
        $message = AmpMessage::parse($raw);

        if (! $message || $message->isEmpty()) {
            return response()->json(['status' => 'ignored', 'reason' => 'empty or unparseable']);
        }

        $command = $message->command();
        $peer = $request->header('X-Mesh-Peer', $message->get('from') ?? 'unknown');

        return match ($command) {
            'hello', 'heartbeat' => $this->handleHello($message, $peer),
            'disconnect' => $this->handleDisconnect($message, $peer),
            'dispatch' => $this->handleDispatch($message, $guard),
            'dispatch.result' => $this->handleDispatchResult($message, $taskService),
            'chat-message' => $this->handleChatMessage($message),
            'search-request' => $this->handleSearchRequest($message),
            default => $this->handleUnknown($command, $peer),
        };
    }

    protected function handleHello(AmpMessage $message, string $peer): JsonResponse
    {
        $args = $message->args() ?? [];
        $nodeName = $args['name'] ?? $this->extractNodeName($peer);

        $cache = app(MeshNodeCache::class);
        $cache->put($nodeName, [
            'wg_ip' => $args['wg_ip'] ?? null,
            'status' => 'online',
            'last_heartbeat_at' => now()->toISOString(),
            'meta' => array_filter([
                'url' => $args['url'] ?? null,
                'load' => $args['load'] ?? null,
            ]),
        ]);

        // No broadcast here — the scheduler batches all nodes into one WS frame per tick

        return response()->json(['status' => 'ok', 'node' => $nodeName]);
    }

    protected function handleDisconnect(AmpMessage $message, string $peer): JsonResponse
    {
        $args = $message->args() ?? [];
        $nodeName = $args['name'] ?? $this->extractNodeName($peer);

        $cache = app(MeshNodeCache::class);
        $cache->markOffline($nodeName);

        // Immediate broadcast for status changes — don't wait for next batch tick
        broadcast(new MeshNodesUpdated([
            ['name' => $nodeName, 'status' => 'offline'],
        ]));

        // Update delta cache so next batch doesn't re-send
        $lastBroadcast = \Illuminate\Support\Facades\Cache::get('mesh:last_broadcast', []);
        $lastBroadcast[$nodeName] = ['status' => 'offline', 'load' => null];
        \Illuminate\Support\Facades\Cache::put('mesh:last_broadcast', $lastBroadcast, 120);

        return response()->json(['status' => 'ok', 'node' => $nodeName]);
    }

    protected function handleDispatch(AmpMessage $message, MeshPermissionGuard $guard): JsonResponse
    {
        $args = $message->args() ?? [];

        $task = MeshTask::updateOrCreate(
            ['id' => $args['id'] ?? $message->get('id')],
            [
                'origin_node' => $args['origin_node'] ?? $this->extractNodeName($message->get('from') ?? ''),
                'target_node' => $args['target_node'] ?? config('mesh.node_name'),
                'type' => $args['type'] ?? 'prompt',
                'prompt' => $message->body !== '' ? $message->body : ($args['prompt'] ?? ''),
                'provider' => $args['provider'] ?? null,
                'model' => $args['model'] ?? null,
                'system_prompt' => $args['system_prompt'] ?? null,
                'parent_id' => $args['parent_id'] ?? null,
                'meta' => $args['meta'] ?? null,
                'status' => 'received',
            ],
        );

        try {
            $guard->authorize($task);
        } catch (\Throwable $e) {
            $task->markFailed($e->getMessage());

            return response()->json(['id' => $task->id, 'status' => 'failed', 'error' => $e->getMessage()], 403);
        }

        ProcessMeshTask::dispatch($task->id);
        broadcast(new MeshTaskUpdated($task));

        return response()->json(['id' => $task->id, 'status' => 'received'], 201);
    }

    protected function handleDispatchResult(AmpMessage $message, MeshTaskService $taskService): JsonResponse
    {
        $args = $message->args() ?? [];
        $taskId = $args['id'] ?? $message->get('id');

        $task = MeshTask::find($taskId);
        if (! $task) {
            return response()->json(['status' => 'not_found'], 404);
        }

        $status = $args['status'] ?? 'completed';

        if ($status === 'completed') {
            $result = $message->body !== '' ? $message->body : ($args['result'] ?? '');
            $task->markCompleted($result, $args['usage'] ?? []);
        } else {
            $task->markFailed($args['error'] ?? 'Unknown error');
        }

        broadcast(new MeshTaskUpdated($task));

        if ($task->isCompleted() && $task->chain_config) {
            $taskService->continueChain($task);
        }

        if ($task->parent_id) {
            $taskService->checkFanOutComplete($task);
        }

        return response()->json(['id' => $task->id, 'status' => $task->status]);
    }

    protected function handleChatMessage(AmpMessage $message): JsonResponse
    {
        $json = $message->get('json');
        if (! $json) {
            return response()->json(['status' => 'ignored', 'reason' => 'no json']);
        }

        $data = json_decode($json, true);
        if (! $data) {
            return response()->json(['status' => 'ignored', 'reason' => 'invalid json']);
        }

        $channel = ChatChannel::where('slug', $data['channel_slug'] ?? '')->first();
        if (! $channel) {
            return response()->json(['status' => 'ignored', 'reason' => 'channel not found']);
        }

        $chatMessage = ChatMessage::create([
            'channel_id' => $channel->id,
            'user_id' => null,
            'content' => $data['content'] ?? '',
            'type' => $data['type'] ?? 'message',
            'metadata' => [
                'origin_node' => $data['origin_node'] ?? 'unknown',
                'origin_id' => $data['origin_id'] ?? null,
                'remote_user_name' => $data['user_name'] ?? 'Unknown',
            ],
        ]);

        $chatMessage->load('user');
        broadcast(new MessageSent($chatMessage))->toOthers();

        return response()->json(['status' => 'ok', 'id' => $chatMessage->id]);
    }

    protected function handleSearchRequest(AmpMessage $message): JsonResponse
    {
        $json = $message->get('json');
        if (! $json) {
            return response()->json(['status' => 'ignored', 'reason' => 'no json']);
        }

        $data = json_decode($json, true);
        if (! $data) {
            return response()->json(['status' => 'ignored', 'reason' => 'invalid json']);
        }

        $searchRequest = SearchRequest::fromArray($data);
        $results = app(SearchService::class)->search($searchRequest);

        $bridge = app(MeshBridgeService::class);
        $nodeName = $bridge->nodeName();

        $responseAmp = new AmpMessage(
            headers: [
                'amp' => '1',
                'type' => 'response',
                'from' => "search.markweb.{$nodeName}.amp",
                'to' => $message->get('from') ?? '',
                'command' => 'search-response',
                'reply-to' => $message->get('id') ?? '',
                'json' => json_encode($results->toArray()),
            ],
        );

        try {
            $bridge->send($responseAmp);
        } catch (\Throwable $e) {
            Log::warning('MeshInbound: failed to send search response', ['error' => $e->getMessage()]);
        }

        return response()->json(['status' => 'ok']);
    }

    protected function handleUnknown(?string $command, string $peer): JsonResponse
    {
        Log::info('MeshInbound: unknown command', ['command' => $command, 'peer' => $peer]);

        return response()->json(['status' => 'ignored', 'reason' => 'unknown command']);
    }

    /**
     * Extract node name from an AMP address like "markweb.mko.amp".
     */
    protected function extractNodeName(string $address): string
    {
        $parts = explode('.', $address);

        // "markweb.mko.amp" → "mko", "mko.amp" → "mko"
        return count($parts) >= 2 ? $parts[count($parts) - 2] : ($parts[0] ?? 'unknown');
    }
}
