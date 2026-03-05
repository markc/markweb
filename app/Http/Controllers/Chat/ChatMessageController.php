<?php

namespace App\Http\Controllers\Chat;

use App\Events\Chat\MessageDeleted;
use App\Events\Chat\MessageSent;
use App\Events\Chat\MessageUpdated;
use App\Http\Controllers\Controller;
use App\Models\Chat\ChatChannel;
use App\Models\Chat\ChatMessage;
use App\Services\Chat\ChatPresenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatMessageController extends Controller
{
    public function __construct(
        protected ChatPresenceService $presence,
    ) {}

    public function index(Request $request, ChatChannel $channel): JsonResponse
    {
        $this->authorize('view', $channel);

        $user = $request->user();
        $cursor = $request->input('cursor');

        $parentId = $request->input('parent_id');

        $query = $channel->messages()
            ->with('user')
            ->withCount('replies');

        if ($parentId) {
            $query->where('parent_id', $parentId);
        } else {
            $query->whereNull('parent_id');
        }

        $query->latest('created_at');

        if ($cursor) {
            $query->where('id', '<', $cursor);
        }

        $fetched = $query->limit(51)->get();
        $hasMore = $fetched->count() > 50;
        $messages = $fetched->take(50)
            ->reverse()
            ->values()
            ->map(fn ($m) => $this->formatMessage($m, $user));

        return response()->json([
            'messages' => $messages,
            'has_more' => $hasMore,
            'next_cursor' => $messages->first()['id'] ?? null,
        ]);
    }

    public function store(Request $request, ChatChannel $channel): JsonResponse
    {
        $this->authorize('view', $channel);

        $request->validate([
            'content' => 'required|string|max:10000',
            'parent_id' => 'nullable|integer|exists:chat_messages,id',
            'type' => 'in:message,system,file',
        ]);

        $user = $request->user();

        // Ensure user is a member
        if (! $channel->members()->where('user_id', $user->id)->exists()) {
            // Auto-join public channels
            if ($channel->type === 'public') {
                $channel->members()->attach($user->id, [
                    'role' => 'member',
                    'joined_at' => now(),
                ]);
            } else {
                return response()->json(['error' => 'Not a member'], 403);
            }
        }

        $message = ChatMessage::create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'content' => $request->input('content'),
            'type' => $request->input('type', 'message'),
            'parent_id' => $request->input('parent_id'),
        ]);

        $message->load('user');

        broadcast(new MessageSent($message))->toOthers();

        $this->presence->markRead($channel, $user);

        return response()->json($this->formatMessage($message, $user), 201);
    }

    public function update(Request $request, ChatMessage $message): JsonResponse
    {
        $this->authorize('update', $message);

        $request->validate([
            'content' => 'required|string|max:10000',
        ]);

        $message->update([
            'content' => $request->input('content'),
        ]);

        broadcast(new MessageUpdated($message->fresh()))->toOthers();

        return response()->json(['ok' => true]);
    }

    public function destroy(Request $request, ChatMessage $message): JsonResponse
    {
        $this->authorize('delete', $message);

        $message->delete(); // soft delete

        broadcast(new MessageDeleted($message))->toOthers();

        return response()->json(['ok' => true]);
    }

    public function react(Request $request, ChatMessage $message): JsonResponse
    {
        $request->validate([
            'emoji' => 'required|string|max:50',
        ]);

        $message->reactions()->firstOrCreate([
            'user_id' => $request->user()->id,
            'emoji' => $request->input('emoji'),
        ]);

        broadcast(new MessageUpdated($message->fresh()))->toOthers();

        return response()->json(['ok' => true]);
    }

    public function unreact(Request $request, ChatMessage $message): JsonResponse
    {
        $request->validate([
            'emoji' => 'required|string|max:50',
        ]);

        $message->reactions()
            ->where('user_id', $request->user()->id)
            ->where('emoji', $request->input('emoji'))
            ->delete();

        broadcast(new MessageUpdated($message->fresh()))->toOthers();

        return response()->json(['ok' => true]);
    }

    public function typing(Request $request, ChatChannel $channel): JsonResponse
    {
        $this->authorize('view', $channel);

        $this->presence->broadcastTyping($channel, $request->user());

        return response()->json(['ok' => true]);
    }

    protected function formatMessage($message, $user): array
    {
        $reactions = $message->reactions()
            ->select('emoji')
            ->selectRaw('count(*) as count')
            ->groupBy('emoji')
            ->get()
            ->map(function ($r) use ($message, $user) {
                $users = $message->reactions()
                    ->where('emoji', $r->emoji)
                    ->with('user:id,name')
                    ->get()
                    ->pluck('user')
                    ->map(fn ($u) => ['id' => $u->id, 'name' => $u->name]);

                return [
                    'emoji' => $r->emoji,
                    'count' => $r->count,
                    'users' => $users,
                    'reacted' => $users->contains('id', $user->id),
                ];
            });

        return [
            'id' => $message->id,
            'channel_id' => $message->channel_id,
            'user_id' => $message->user_id,
            'user' => $message->user ? [
                'id' => $message->user->id,
                'name' => $message->user->name,
            ] : null,
            'content' => $message->trashed() ? '' : $message->content,
            'type' => $message->type,
            'metadata' => $message->metadata,
            'parent_id' => $message->parent_id,
            'reply_count' => $message->replies_count ?? 0,
            'reactions' => $reactions,
            'created_at' => $message->created_at->toISOString(),
            'updated_at' => $message->updated_at->toISOString(),
            'deleted_at' => $message->deleted_at?->toISOString(),
        ];
    }
}
