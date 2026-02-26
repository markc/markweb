<?php

use App\Events\MeshNodeUpdated;
use App\Models\MeshNode;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Mesh: self-heartbeat (identity from env)
Schedule::call(function () {
    $name = config('mesh.node_name');
    $wgIp = config('mesh.node_wg_ip');

    if (! $name) {
        return;
    }

    $node = MeshNode::updateOrCreate(
        ['name' => $name],
        [
            'wg_ip' => $wgIp,
            'status' => 'online',
            'last_heartbeat_at' => now(),
            'meta' => array_filter([
                'load' => trim(file_get_contents('/proc/loadavg') ?: ''),
                'url' => config('mesh.node_url'),
            ]),
        ],
    );

    broadcast(new MeshNodeUpdated($node));
})->everyThirtySeconds()->name('mesh:self-heartbeat');

// Mesh: sync state from primary (non-primary nodes pull full mesh state)
Schedule::call(function () {
    $primaryUrl = config('mesh.primary_url');

    if (! $primaryUrl) {
        return;
    }

    $token = config('services.system_event_token');

    try {
        $response = \Illuminate\Support\Facades\Http::withToken($token)
            ->timeout(10)
            ->withoutVerifying()
            ->get("{$primaryUrl}/api/mesh/sync");

        if (! $response->successful()) {
            return;
        }

        foreach ($response->json() as $data) {
            $node = MeshNode::updateOrCreate(
                ['name' => $data['name']],
                [
                    'wg_ip' => $data['wg_ip'],
                    'status' => $data['status'],
                    'last_heartbeat_at' => $data['last_heartbeat_at'],
                    'meta' => $data['meta'],
                ],
            );

            broadcast(new MeshNodeUpdated($node));
        }
    } catch (\Throwable) {
        // Primary unreachable — keep local state as-is
    }
})->everyThirtySeconds()->name('mesh:sync-from-primary');

// Mesh: mark nodes offline if no heartbeat in 90s
Schedule::call(function () {
    $stale = MeshNode::where('status', 'online')
        ->where('last_heartbeat_at', '<', now()->subSeconds(90))
        ->get();

    foreach ($stale as $node) {
        $node->update(['status' => 'offline']);
        broadcast(new MeshNodeUpdated($node));
    }
})->everyMinute()->name('mesh:offline-detection');
