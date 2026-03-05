<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::post('dashboard/settings', [App\Http\Controllers\DashboardController::class, 'updateSettings'])->name('dashboard.settings');

    // Chat routes (laraclaw-style Agent WebSocket chat via Reverb)
    Route::get('chat', [App\Http\Controllers\Agent\ChatController::class, 'index'])->name('chat.index');
    Route::get('chat/{agentSession}', [App\Http\Controllers\Agent\ChatController::class, 'show'])->name('chat.show');
    Route::post('chat/send', [App\Http\Controllers\Agent\ChatController::class, 'send'])->name('chat.send');
    Route::delete('chat/{agentSession}', [App\Http\Controllers\Agent\ChatController::class, 'destroy'])->name('chat.destroy');
    Route::patch('chat/{agentSession}', [App\Http\Controllers\Agent\ChatController::class, 'update'])->name('chat.update');
    Route::post('chat/documents', [App\Http\Controllers\Agent\ChatController::class, 'uploadDocument'])->name('chat.documents.upload');
    Route::get('chat/documents', [App\Http\Controllers\Agent\ChatController::class, 'documents'])->name('chat.documents.index');
    Route::delete('chat/documents/{filename}', [App\Http\Controllers\Agent\ChatController::class, 'deleteDocument'])->name('chat.documents.destroy');
    Route::post('chat/{agentSession}/share', [App\Http\Controllers\SharedChatController::class, 'share'])->name('chat.share');
    Route::delete('chat/{agentSession}/share', [App\Http\Controllers\SharedChatController::class, 'unshare'])->name('chat.unshare');
    Route::get('chat/{agentSession}/export', [App\Http\Controllers\Agent\ChatController::class, 'export'])->name('chat.export');
    Route::post('chat/{agentSession}/fork', [App\Http\Controllers\Agent\ChatController::class, 'fork'])->name('chat.fork');

    // Legacy SSE chat routes (Prism-based streaming)
    Route::get('sse-chat', [App\Http\Controllers\ChatController::class, 'index'])->name('sse-chat.index');
    Route::get('sse-chat/projects', [App\Http\Controllers\ChatController::class, 'projects'])->name('sse-chat.projects');
    Route::post('sse-chat/stream', [App\Http\Controllers\ChatController::class, 'stream'])->name('sse-chat.stream');
    Route::post('sse-chat/upload', [App\Http\Controllers\ChatController::class, 'upload'])->name('sse-chat.upload');
    Route::get('sse-chat/attachment/{attachment}', [App\Http\Controllers\ChatController::class, 'attachment'])->name('sse-chat.attachment');
    Route::get('sse-chat/{conversation}', [App\Http\Controllers\ChatController::class, 'show'])->name('sse-chat.show');
    Route::get('sse-chat/{conversation}/export', [App\Http\Controllers\ChatController::class, 'export'])->name('sse-chat.export');
    Route::delete('sse-chat/{conversation}', [App\Http\Controllers\ChatController::class, 'destroy'])->name('sse-chat.destroy');

    Route::post('templates', [App\Http\Controllers\SystemPromptTemplateController::class, 'store'])->name('templates.store');
    Route::put('templates/{template}', [App\Http\Controllers\SystemPromptTemplateController::class, 'update'])->name('templates.update');
    Route::delete('templates/{template}', [App\Http\Controllers\SystemPromptTemplateController::class, 'destroy'])->name('templates.destroy');

    Route::resource('workspace/agents', App\Http\Controllers\AgentController::class)->names('agents');

    Route::get('docs', [App\Http\Controllers\DocsController::class, 'index'])->name('docs.index');
    Route::get('docs/{slug}', [App\Http\Controllers\DocsController::class, 'show'])->name('docs.show');

    Route::get('users', [App\Http\Controllers\UserController::class, 'index'])->name('users.index');
    Route::post('users', [App\Http\Controllers\UserController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [App\Http\Controllers\UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy');

    Route::get('mail', [App\Http\Controllers\MailController::class, 'index'])->name('mail.index');

    // AppMesh routes
    Route::get('appmesh', [App\Http\Controllers\AppMeshController::class, 'index'])->name('appmesh.index');
    Route::get('appmesh/explore', [App\Http\Controllers\AppMeshController::class, 'explore'])->name('appmesh.explore');
    Route::get('appmesh/midi', [App\Http\Controllers\AppMeshController::class, 'midi'])->name('appmesh.midi');
    Route::get('appmesh/tts', [App\Http\Controllers\AppMeshController::class, 'tts'])->name('appmesh.tts');

    Route::get('shared-files', [App\Http\Controllers\SharedFileController::class, 'index'])->name('shared-files.index');
    Route::delete('shared-files/{sharedFile}', [App\Http\Controllers\SharedFileController::class, 'destroy'])->name('shared-files.destroy');

    Route::get('calendars', [App\Http\Controllers\CalendarController::class, 'index'])->name('calendars.index');
    Route::get('calendars/{calendar}/events', [App\Http\Controllers\EventController::class, 'index'])->name('events.index');
    Route::post('calendars/{calendar}/events', [App\Http\Controllers\EventController::class, 'store'])->name('events.store');
    Route::put('calendars/{calendar}/events/{event}', [App\Http\Controllers\EventController::class, 'update'])->name('events.update');
    Route::delete('calendars/{calendar}/events/{event}', [App\Http\Controllers\EventController::class, 'destroy'])->name('events.destroy');
    Route::post('calendars/{calendar}/events/bulk-delete', [App\Http\Controllers\EventController::class, 'bulkDestroy'])->name('events.bulk-destroy');

    Route::get('addressbooks', [App\Http\Controllers\AddressBookController::class, 'index'])->name('addressbooks.index');
    Route::get('addressbooks/{addressbook}/contacts', [App\Http\Controllers\ContactController::class, 'index'])->name('contacts.index');
    Route::post('addressbooks/{addressbook}/contacts', [App\Http\Controllers\ContactController::class, 'store'])->name('contacts.store');
    Route::put('addressbooks/{addressbook}/contacts/{contact}', [App\Http\Controllers\ContactController::class, 'update'])->name('contacts.update');
    Route::delete('addressbooks/{addressbook}/contacts/{contact}', [App\Http\Controllers\ContactController::class, 'destroy'])->name('contacts.destroy');
    Route::post('addressbooks/{addressbook}/contacts/bulk-delete', [App\Http\Controllers\ContactController::class, 'bulkDestroy'])->name('contacts.bulk-destroy');

    // Text Chat routes (user-to-user Slack-like chat)
    Route::prefix('text-chat')->name('text-chat.')->group(function () {
        Route::get('/', [App\Http\Controllers\Chat\ChatChannelController::class, 'index'])->name('index');
        Route::post('/channels', [App\Http\Controllers\Chat\ChatChannelController::class, 'store'])->name('channels.store');
        Route::get('/{channel:slug}', [App\Http\Controllers\Chat\ChatChannelController::class, 'show'])->name('show');
        Route::post('/{channel:slug}/join', [App\Http\Controllers\Chat\ChatChannelController::class, 'join'])->name('join');
        Route::post('/{channel:slug}/leave', [App\Http\Controllers\Chat\ChatChannelController::class, 'leave'])->name('leave');

        Route::get('/{channel:slug}/messages', [App\Http\Controllers\Chat\ChatMessageController::class, 'index'])->name('messages.index');
        Route::post('/{channel:slug}/messages', [App\Http\Controllers\Chat\ChatMessageController::class, 'store'])->name('messages.store');
        Route::patch('/messages/{message}', [App\Http\Controllers\Chat\ChatMessageController::class, 'update'])->name('messages.update');
        Route::delete('/messages/{message}', [App\Http\Controllers\Chat\ChatMessageController::class, 'destroy'])->name('messages.destroy');

        // Reactions
        Route::post('/messages/{message}/react', [App\Http\Controllers\Chat\ChatMessageController::class, 'react'])->name('messages.react');
        Route::delete('/messages/{message}/react', [App\Http\Controllers\Chat\ChatMessageController::class, 'unreact'])->name('messages.unreact');

        // Typing indicator
        Route::post('/{channel:slug}/typing', [App\Http\Controllers\Chat\ChatMessageController::class, 'typing'])->name('typing');
    });
});

// Well-known discovery endpoints
Route::get('/.well-known/agent.json', [App\Http\Controllers\AgentCardController::class, 'show']);
Route::redirect('/.well-known/caldav', '/dav/', 301);
Route::redirect('/.well-known/carddav', '/dav/', 301);

// Public share links (no auth)
Route::get('share/{token}', [App\Http\Controllers\ShareController::class, 'show'])->name('share.show');
Route::get('s/{token}', [App\Http\Controllers\SharedChatController::class, 'show'])->name('shared-chat.show');

require __DIR__.'/settings.php';
