<?php

namespace App\Policies;

use App\Models\Chat\ChatChannel;
use App\Models\User;

class ChatChannelPolicy
{
    public function view(User $user, ChatChannel $channel): bool
    {
        return $channel->type === 'public'
            || $channel->members()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, ChatChannel $channel): bool
    {
        $role = $channel->members()->where('user_id', $user->id)->value('role');

        return in_array($role, ['owner', 'admin']);
    }

    public function delete(User $user, ChatChannel $channel): bool
    {
        return $channel->created_by === $user->id;
    }

    public function join(User $user, ChatChannel $channel): bool
    {
        if ($channel->members()->where('user_id', $user->id)->exists()) {
            return false;
        }

        return $channel->type === 'public';
    }

    public function leave(User $user, ChatChannel $channel): bool
    {
        $pivot = $channel->members()->where('user_id', $user->id)->first();
        if (! $pivot) {
            return false;
        }

        // Cannot leave if sole owner
        if ($pivot->pivot->role === 'owner') {
            $ownerCount = $channel->memberPivots()->where('role', 'owner')->count();

            return $ownerCount > 1;
        }

        return true;
    }
}
