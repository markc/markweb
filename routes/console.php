<?php

use App\DTOs\AmpMessage;
use App\Events\MeshNodeUpdated;
use App\Services\Mesh\MeshBridgeService;
use App\Services\Mesh\MeshNodeCache;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Mesh: self-heartbeat — report this node's identity and load locally + to peers
Schedule::call(function () {
    $name = config('mesh.node_name');
    $wgIp = config('mesh.node_wg_ip');

    if (! $name) {
        return;
    }

    $raw = trim(@file_get_contents('/proc/loadavg') ?: '');
    $load = implode(' ', array_slice(explode(' ', $raw), 0, 3));
    $url = config('mesh.node_url');

    // Write to Redis (no database) + broadcast to local Reverb
    $cache = app(MeshNodeCache::class);
    $cache->put($name, [
        'wg_ip' => $wgIp,
        'status' => 'online',
        'last_heartbeat_at' => now()->toISOString(),
        'meta' => array_filter(['load' => $load, 'url' => $url]),
    ]);

    broadcast(new MeshNodeUpdated($cache->get($name)));

    // Send heartbeat to each peer via meshd
    $bridge = app(MeshBridgeService::class);
    if ($bridge->isAvailable()) {
        $args = json_encode(array_filter([
            'name' => $name,
            'wg_ip' => $wgIp,
            'load' => $load,
            'url' => $url,
        ]));

        try {
            $status = $bridge->status();
            foreach ($status['peers'] ?? [] as $peer) {
                $peerName = $peer['name'] ?? null;
                if (! $peerName || ! ($peer['connected'] ?? false)) {
                    continue;
                }

                $bridge->send(new AmpMessage([
                    'amp' => '1',
                    'type' => 'event',
                    'from' => "markweb.{$name}.amp",
                    'to' => "markweb.{$peerName}.amp",
                    'command' => 'heartbeat',
                    'args' => $args,
                ]));
            }
        } catch (\Throwable) {
            // meshd not running or send failed — silent
        }
    }
})->everySecond()->name('mesh:self-heartbeat');

// Mesh: sync node state from meshd (fallback if callbacks are missed)
Schedule::call(function () {
    $bridge = app(MeshBridgeService::class);

    if (! $bridge->isAvailable()) {
        return;
    }

    try {
        $status = $bridge->status();
        $peers = $status['peers'] ?? [];
        $cache = app(MeshNodeCache::class);

        foreach ($peers as $peer) {
            $name = $peer['name'] ?? null;
            if (! $name) {
                continue;
            }

            $connected = $peer['connected'] ?? false;
            $lastSeenSecs = $peer['last_seen_secs'] ?? null;
            $lastHeartbeat = $lastSeenSecs !== null
                ? now()->subSeconds((int) $lastSeenSecs)->toISOString()
                : now()->toISOString();

            $cache->put($name, [
                'wg_ip' => $peer['wg_ip'] ?? null,
                'status' => $connected ? 'online' : 'offline',
                'last_heartbeat_at' => $lastHeartbeat,
            ]);
        }
    } catch (\Throwable) {
        // meshd not running or unreachable — silent
    }
})->everyMinute()->name('mesh:sync-from-meshd');
