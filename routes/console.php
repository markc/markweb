<?php

use App\Events\MeshNodeUpdated;
use App\Models\MeshNode;
use App\Services\Mesh\MeshBridgeService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Mesh: sync node state from meshd (fallback if callbacks are missed)
Schedule::call(function () {
    $bridge = app(MeshBridgeService::class);

    if (! $bridge->isAvailable()) {
        return;
    }

    try {
        $peers = $bridge->status();

        foreach ($peers as $peer) {
            $name = $peer['name'] ?? null;
            if (! $name) {
                continue;
            }

            $node = MeshNode::updateOrCreate(
                ['name' => $name],
                [
                    'wg_ip' => $peer['wg_ip'] ?? null,
                    'status' => ($peer['connected'] ?? false) ? 'online' : 'offline',
                    'last_heartbeat_at' => isset($peer['last_seen']) ? now()->parse($peer['last_seen']) : now(),
                    'meta' => array_filter([
                        'url' => $peer['url'] ?? null,
                        'load' => $peer['load'] ?? null,
                    ]),
                ],
            );

            if ($node->wasRecentlyCreated || $node->wasChanged(['status', 'wg_ip'])) {
                broadcast(new MeshNodeUpdated($node));
            }
        }
    } catch (\Throwable $e) {
        Log::debug('mesh:sync-from-meshd failed', ['error' => $e->getMessage()]);
    }
})->everyMinute()->name('mesh:sync-from-meshd');
