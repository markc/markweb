<?php

use App\Events\MeshNodeUpdated;
use App\Models\MeshNode;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Mesh: mko self-heartbeat (this node is the app server)
Schedule::call(function () {
    $node = MeshNode::updateOrCreate(
        ['name' => 'mko'],
        [
            'wg_ip' => '172.16.1.5',
            'status' => 'online',
            'last_heartbeat_at' => now(),
            'meta' => [
                'load' => trim(file_get_contents('/proc/loadavg') ?: ''),
            ],
        ],
    );

    broadcast(new MeshNodeUpdated($node));
})->everyThirtySeconds()->name('mesh:self-heartbeat');

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
