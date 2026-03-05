<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\Chat\ChatChannel;
use App\Services\Chat\ChatPresenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ChatChannelController extends Controller
{
    public function __construct(
        protected ChatPresenceService $presence,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $channels = $this->getUserChannels($user);

        // Redirect to #general if it exists
        $general = $channels->firstWhere('slug', 'general');
        if ($general) {
            return redirect()->route('text-chat.show', 'general');
        }

        return Inertia::render('text-chat/index', [
            'channels' => $channels,
            'activeChannel' => null,
            'initialMessages' => [],
        ]);
    }

    public function show(Request $request, ChatChannel $channel)
    {
        $this->authorize('view', $channel);

        $user = $request->user();

        // Auto-join public channels so broadcasting auth works
        if ($channel->type === 'public' && ! $channel->members()->where('user_id', $user->id)->exists()) {
            $channel->members()->attach($user->id, [
                'role' => 'member',
                'joined_at' => now(),
            ]);
        }

        // Mark channel as read
        $this->presence->markRead($channel, $user);

        $channels = $this->getUserChannels($user);

        $messages = $channel->messages()
            ->with('user')
            ->withCount('replies')
            ->whereNull('parent_id')
            ->latest('created_at')
            ->limit(50)
            ->get()
            ->reverse()
            ->values()
            ->map(fn ($m) => $this->formatMessage($m, $user));

        return Inertia::render('text-chat/[channel]', [
            'channels' => $channels,
            'activeChannel' => [
                'id' => $channel->id,
                'name' => $channel->name,
                'slug' => $channel->slug,
                'type' => $channel->type,
                'description' => $channel->description,
                'created_by' => $channel->created_by,
                'member_count' => $channel->members()->count(),
            ],
            'initialMessages' => $messages,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'in:public,private',
            'description' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $slug = Str::slug($request->input('name'));

        // Ensure unique slug
        $baseSlug = $slug;
        $counter = 1;
        while (ChatChannel::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter++;
        }

        $channel = ChatChannel::create([
            'name' => $request->input('name'),
            'slug' => $slug,
            'type' => $request->input('type', 'public'),
            'description' => $request->input('description'),
            'created_by' => $user->id,
        ]);

        $channel->members()->attach($user->id, [
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        return redirect()->route('text-chat.show', $channel->slug);
    }

    public function join(Request $request, ChatChannel $channel)
    {
        $this->authorize('join', $channel);

        $channel->members()->attach($request->user()->id, [
            'role' => 'member',
            'joined_at' => now(),
        ]);

        return redirect()->route('text-chat.show', $channel->slug);
    }

    public function leave(Request $request, ChatChannel $channel)
    {
        $this->authorize('leave', $channel);

        $channel->members()->detach($request->user()->id);

        return redirect()->route('text-chat.index');
    }

    protected function getUserChannels($user)
    {
        $memberChannelIds = $user->id
            ? \DB::table('chat_channel_members')
                ->where('user_id', $user->id)
                ->pluck('channel_id')
            : collect();

        return ChatChannel::query()
            ->where(function ($q) use ($memberChannelIds) {
                $q->where('type', 'public')
                    ->orWhereIn('id', $memberChannelIds);
            })
            ->withCount('messages')
            ->get()
            ->map(function ($channel) use ($user, $memberChannelIds) {
                $isMember = $memberChannelIds->contains($channel->id);
                $unreadCount = 0;

                if ($isMember) {
                    $lastRead = \DB::table('chat_channel_members')
                        ->where('channel_id', $channel->id)
                        ->where('user_id', $user->id)
                        ->value('last_read_at');

                    if ($lastRead) {
                        $unreadCount = $channel->messages()
                            ->where('created_at', '>', $lastRead)
                            ->whereNull('parent_id')
                            ->count();
                    } else {
                        $unreadCount = $channel->messages_count;
                    }
                }

                return [
                    'id' => $channel->id,
                    'name' => $channel->name,
                    'slug' => $channel->slug,
                    'type' => $channel->type,
                    'description' => $channel->description,
                    'created_by' => $channel->created_by,
                    'member_count' => $channel->members()->count(),
                    'unread_count' => $unreadCount,
                ];
            });
    }

    protected function formatMessage($message, $user)
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
