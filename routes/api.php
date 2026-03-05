<?php

use App\Http\Controllers\FileLinkController;
use App\Http\Controllers\MeshController;
use App\Http\Controllers\MeshInboundController;
use App\Http\Controllers\MeshTaskController;
use App\Http\Controllers\OpenClawPushController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SystemEventController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function () {
    Route::post('filelink/upload', [FileLinkController::class, 'upload'])->name('filelink.upload');
    Route::delete('filelink/{sharedFile}', [FileLinkController::class, 'destroy'])->name('filelink.destroy');

    // SearchX web search
    Route::get('searchx', [SearchController::class, 'search'])->name('searchx.search');
    Route::get('searchx/autocomplete', [SearchController::class, 'autocomplete'])->name('searchx.autocomplete');

    // JMAP mail routes
    Route::post('jmap/connect', [\App\Http\Controllers\JmapAuthController::class, 'connect'])->name('jmap.connect');
    Route::get('jmap/session', [\App\Http\Controllers\JmapAuthController::class, 'session'])->name('jmap.session');
    Route::post('jmap/disconnect', [\App\Http\Controllers\JmapAuthController::class, 'disconnect'])->name('jmap.disconnect');
    Route::get('jmap/blob/{blobId}/{name}', [\App\Http\Controllers\JmapAttachmentController::class, 'download'])->name('jmap.blob.download');
    Route::post('jmap/blob/upload', [\App\Http\Controllers\JmapAttachmentController::class, 'upload'])->name('jmap.blob.upload');

    // AppMesh API routes
    Route::get('appmesh/tools', [\App\Http\Controllers\AppMeshController::class, 'tools'])->name('appmesh.tools');
    Route::post('appmesh/execute', [\App\Http\Controllers\AppMeshController::class, 'execute'])->name('appmesh.execute');
    Route::post('appmesh/port', [\App\Http\Controllers\AppMeshController::class, 'portExecute'])->name('appmesh.port');
    Route::get('appmesh/dbus/services', [\App\Http\Controllers\AppMeshController::class, 'dbusServices'])->name('appmesh.dbus.services');
    Route::post('appmesh/dbus/introspect', [\App\Http\Controllers\AppMeshController::class, 'dbusIntrospect'])->name('appmesh.dbus.introspect');
    Route::get('appmesh/midi/ports', [\App\Http\Controllers\AppMeshController::class, 'midiPorts'])->name('appmesh.midi.ports');
    Route::post('appmesh/midi/connect', [\App\Http\Controllers\AppMeshController::class, 'midiConnect'])->name('appmesh.midi.connect');
    Route::get('appmesh/tts/voices', [\App\Http\Controllers\AppMeshController::class, 'ttsVoices'])->name('appmesh.tts.voices');
    Route::post('appmesh/tts/generate', [\App\Http\Controllers\AppMeshController::class, 'ttsGenerate'])->name('appmesh.tts.generate');
    Route::get('appmesh/tts/play', [\App\Http\Controllers\AppMeshController::class, 'ttsPlay'])->name('appmesh.tts.play');
    Route::post('appmesh/tts/tutorial', [\App\Http\Controllers\AppMeshController::class, 'tutorialScript'])->name('appmesh.tts.tutorial');
    Route::post('appmesh/tts/tutorial-full', [\App\Http\Controllers\AppMeshController::class, 'tutorialFull'])->name('appmesh.tts.tutorial-full');
    Route::post('appmesh/tts/record', [\App\Http\Controllers\AppMeshController::class, 'screenRecord'])->name('appmesh.tts.record');
    Route::post('appmesh/tts/combine', [\App\Http\Controllers\AppMeshController::class, 'videoCombine'])->name('appmesh.tts.combine');

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

// Mesh inbound — meshd localhost callback
Route::post('mesh/inbound', [MeshInboundController::class, 'receive'])
    ->middleware('mesh.local')
    ->name('mesh.inbound');

// Mesh node routes (reads from Redis, no database)
Route::middleware(['web', 'auth'])->get('mesh/nodes', [MeshController::class, 'nodes'])->name('mesh.nodes');

// Mesh task routes — bearer token auth (inter-node)
Route::post('mesh/task/dispatch', [MeshTaskController::class, 'dispatch'])->name('mesh.task.dispatch');
Route::post('mesh/task/callback', [MeshTaskController::class, 'callback'])->name('mesh.task.callback');
Route::get('mesh/task/{id}/status', [MeshTaskController::class, 'status'])->name('mesh.task.status');

// Mesh task dashboard — browser session auth
Route::middleware(['web', 'auth'])->get('mesh/tasks', [MeshTaskController::class, 'index'])->name('mesh.tasks');
