<?php

use App\Models\Chat\ChatChannelMember;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Chat user channel — session lifecycle events (created, updated, deleted)
Broadcast::channel('chat.user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Chat session channel — stream events (start, delta, end, error)
// Session key format: web.{userId}.{uuid} (dots replace colons)
Broadcast::channel('chat.session.web.{userId}.{uuid}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Document processing events — per user
Broadcast::channel('documents.user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Mesh node status — any authenticated user
Broadcast::channel('mesh', function ($user) {
    return $user !== null;
});

// AppMesh tool execution events — per user
Broadcast::channel('appmesh.user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// AppMesh live desktop events — any authenticated user on this node
Broadcast::channel('appmesh.events', function ($user) {
    return $user !== null;
});

// Text Chat — private channel for message events
Broadcast::channel('chat.channel.{channelId}', function ($user, $channelId) {
    return ChatChannelMember::where('channel_id', $channelId)
        ->where('user_id', $user->id)
        ->exists();
});

// Text Chat — presence channel for online/typing indicators
Broadcast::channel('presence-chat.channel.{channelId}', function ($user, $channelId) {
    $member = ChatChannelMember::where('channel_id', $channelId)
        ->where('user_id', $user->id)
        ->exists();

    return $member ? ['id' => $user->id, 'name' => $user->name] : null;
});
