<?php

namespace App\Services\Chat;

use App\Events\Chat\UserTyping;
use App\Models\Chat\ChatChannel;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class ChatPresenceService
{
    public function markRead(ChatChannel $channel, User $user): void
    {
        $channel->members()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);
    }

    public function broadcastTyping(ChatChannel $channel, User $user): void
    {
        $cacheKey = "chat.typing.{$channel->id}.{$user->id}";

        if (Cache::has($cacheKey)) {
            return;
        }

        Cache::put($cacheKey, true, 3);

        broadcast(new UserTyping($channel->id, $user->id, $user->name));
    }
}
