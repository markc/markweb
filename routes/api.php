<?php

use App\Http\Controllers\FileLinkController;
use App\Http\Controllers\MeshController;
use App\Http\Controllers\MeshTaskController;
use App\Http\Controllers\OpenClawPushController;
use App\Http\Controllers\SystemEventController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function () {
    Route::post('filelink/upload', [FileLinkController::class, 'upload'])->name('filelink.upload');
    Route::delete('filelink/{sharedFile}', [FileLinkController::class, 'destroy'])->name('filelink.destroy');

    // JMAP mail routes
    Route::post('jmap/connect', [\App\Http\Controllers\JmapAuthController::class, 'connect'])->name('jmap.connect');
    Route::get('jmap/session', [\App\Http\Controllers\JmapAuthController::class, 'session'])->name('jmap.session');
    Route::post('jmap/disconnect', [\App\Http\Controllers\JmapAuthController::class, 'disconnect'])->name('jmap.disconnect');
    Route::get('jmap/blob/{blobId}/{name}', [\App\Http\Controllers\JmapAttachmentController::class, 'download'])->name('jmap.blob.download');
    Route::post('jmap/blob/upload', [\App\Http\Controllers\JmapAttachmentController::class, 'upload'])->name('jmap.blob.upload');

    // System events (notifications) — browser auth
    Route::get('system-events', [SystemEventController::class, 'index']);
    Route::post('system-events', [SystemEventController::class, 'store']);
    Route::post('system-events/read-all', [SystemEventController::class, 'markAllRead']);
    Route::post('system-events/clear-all', [SystemEventController::class, 'destroyAll']);
    Route::post('system-events/{systemEvent}/read', [SystemEventController::class, 'markRead']);
    Route::delete('system-events/{systemEvent}', [SystemEventController::class, 'destroy']);
});

// System events — external bearer token auth (for Clawd/OpenClaw/cron/nsctl)
Route::post('system-events/push', [SystemEventController::class, 'push'])->name('system-events.push');

// OpenClaw async push — external bearer token auth
Route::post('openclaw/push', [OpenClawPushController::class, 'push'])->name('openclaw.push');

// Mesh node routes
Route::middleware(['web', 'auth'])->get('mesh/nodes', [MeshController::class, 'nodes'])->name('mesh.nodes');
Route::get('mesh/sync', [MeshController::class, 'sync'])->name('mesh.sync');
Route::post('mesh/heartbeat', [MeshController::class, 'heartbeat'])->name('mesh.heartbeat');

// Mesh task routes — bearer token auth (inter-node)
Route::post('mesh/task/dispatch', [MeshTaskController::class, 'dispatch'])->name('mesh.task.dispatch');
Route::post('mesh/task/callback', [MeshTaskController::class, 'callback'])->name('mesh.task.callback');
Route::get('mesh/task/{id}/status', [MeshTaskController::class, 'status'])->name('mesh.task.status');

// Mesh task dashboard — browser session auth
Route::middleware(['web', 'auth'])->get('mesh/tasks', [MeshTaskController::class, 'index'])->name('mesh.tasks');
