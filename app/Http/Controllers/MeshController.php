<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Events\MeshNodeUpdated;
use App\Models\MeshNode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeshController extends Controller
{
    /**
     * List all mesh nodes — browser auth.
     */
    public function nodes(): JsonResponse
    {
        return response()->json(MeshNode::orderBy('name')->get());
    }

    /**
     * Sync endpoint — bearer token auth.
     * Called by secondary nodes to pull full mesh state from primary.
     */
    public function sync(Request $request): JsonResponse
    {
        $token = config('services.system_event_token');

        if (! $token || $request->bearerToken() !== $token) {
            abort(401, 'Invalid token');
        }

        return response()->json(MeshNode::orderBy('name')->get());
    }

    /**
     * Heartbeat endpoint — bearer token auth.
     * Called by remote nodes over WireGuard.
     */
    public function heartbeat(Request $request): JsonResponse
    {
        $token = config('services.system_event_token');

        if (! $token || $request->bearerToken() !== $token) {
            abort(401, 'Invalid token');
        }

        $validated = $request->validate([
            'node' => 'required|string|max:100',
            'wg_ip' => 'required|ip',
            'meta' => 'nullable|array',
        ]);

        $node = MeshNode::updateOrCreate(
            ['name' => $validated['node']],
            [
                'wg_ip' => $validated['wg_ip'],
                'status' => 'online',
                'last_heartbeat_at' => now(),
                'meta' => $validated['meta'] ?? null,
            ],
        );

        broadcast(new MeshNodeUpdated($node));

        return response()->json($node, 200);
    }
}
