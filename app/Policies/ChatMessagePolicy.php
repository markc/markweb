<?php

namespace App\Policies;

use App\Models\Chat\ChatMessage;
use App\Models\User;

class ChatMessagePolicy
{
    public function update(User $user, ChatMessage $message): bool
    {
        return $message->user_id === $user->id;
    }

    public function delete(User $user, ChatMessage $message): bool
    {
        if ($message->user_id === $user->id) {
            return true;
        }

        // Channel admin/owner can delete any message
        $role = $message->channel->members()
            ->where('user_id', $user->id)
            ->value('role');

        return in_array($role, ['owner', 'admin']);
    }
}
