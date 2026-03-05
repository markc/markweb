# Text Chat — Design Document

Slack-like text chat for markweb. Foundation layer for real-time human-to-human communication, built on the existing Reverb WebSocket infrastructure. Works immediately without audio/video — those come later via meshd's Phase 5 WebRTC SFU.

This is distinct from the AI Agent chat (`/chat`) which handles user-to-LLM conversations. Text chat is user-to-user: channels, threads, reactions, presence.

---

## 1. Data Model

Four tables, all prefixed `chat_` to avoid collision with the existing agent chat models (`AgentSession`, `AgentMessage`).

### chat_channels

```sql
id              bigint primary key
name            varchar(100)
slug            varchar(100) unique
type            varchar(20)       -- 'public', 'private', 'dm'
description     text nullable
created_by      bigint references users(id)
created_at      timestamp
updated_at      timestamp
```

Every markweb instance seeds a `#general` channel on migration. DM channels use a deterministic slug derived from sorted user IDs (`dm-{lower_id}-{higher_id}`) to prevent duplicates.

### chat_channel_members

```sql
channel_id      bigint references chat_channels(id) on delete cascade
user_id         bigint references users(id) on delete cascade
role            varchar(20) default 'member'  -- 'owner', 'admin', 'member'
joined_at       timestamp
last_read_at    timestamp nullable
primary key (channel_id, user_id)
```

`last_read_at` tracks the user's read cursor for unread count calculations. Updated when the user views the channel or explicitly marks as read.

### chat_messages

```sql
id              bigint primary key
channel_id      bigint references chat_channels(id) on delete cascade
user_id         bigint references users(id) on delete set null
content         text
type            varchar(20) default 'message'  -- 'message', 'system', 'file'
metadata        jsonb nullable
parent_id       bigint nullable references chat_messages(id) on delete cascade
created_at      timestamp
updated_at      timestamp
deleted_at      timestamp nullable             -- soft delete
```

Indexes: `(channel_id, created_at)` for paginated message loading, `(parent_id)` for thread lookups, `(channel_id, user_id)` for per-user message queries.

`metadata` stores type-specific data: file attachments (filename, mime_type, size, storage_path), system message details (join/leave/rename events), or edit history.

### chat_reactions

```sql
id              bigint primary key
message_id      bigint references chat_messages(id) on delete cascade
user_id         bigint references users(id) on delete cascade
emoji           varchar(50)
created_at      timestamp
unique (message_id, user_id, emoji)
```

The unique constraint prevents duplicate reactions — one emoji per user per message.

---

## 2. Laravel Backend

### Models (`app/Models/Chat/`)

| Model | Key relationships |
|-------|-------------------|
| `ChatChannel` | `hasMany(ChatMessage)`, `belongsToMany(User)` via `ChatChannelMember`, `belongsTo(User, 'created_by')` |
| `ChatChannelMember` | `belongsTo(ChatChannel)`, `belongsTo(User)` — pivot model with `role`, `last_read_at` |
| `ChatMessage` | `belongsTo(ChatChannel)`, `belongsTo(User)`, `hasMany(ChatReaction)`, self-referential `belongsTo(parent)` / `hasMany(replies)` |
| `ChatReaction` | `belongsTo(ChatMessage)`, `belongsTo(User)` |

`ChatMessage` uses `SoftDeletes`. Deleted messages show as "This message was deleted" in the UI rather than disappearing (preserves thread context).

### Controllers (`app/Http/Controllers/Chat/`)

**ChatChannelController** — channel CRUD and membership.

| Action | Method | Route | Description |
|--------|--------|-------|-------------|
| `index` | GET | `/text-chat` | Channel list, redirect to `#general` |
| `show` | GET | `/text-chat/{channel:slug}` | Channel view with initial messages |
| `store` | POST | `/text-chat/channels` | Create channel |
| `join` | POST | `/text-chat/{channel:slug}/join` | Join public channel |
| `leave` | POST | `/text-chat/{channel:slug}/leave` | Leave channel |

**ChatMessageController** — message CRUD.

| Action | Method | Route | Description |
|--------|--------|-------|-------------|
| `index` | GET | `/text-chat/{channel:slug}/messages` | Paginated history (cursor pagination, 50 per page) |
| `store` | POST | `/text-chat/{channel:slug}/messages` | Send message |
| `update` | PATCH | `/text-chat/messages/{message}` | Edit message (owner only) |
| `destroy` | DELETE | `/text-chat/messages/{message}` | Soft-delete message (owner or admin) |

### Events (`app/Events/Chat/`)

All events implement `ShouldBroadcast` and broadcast on the channel's private Reverb channel.

| Event | Payload | Channel |
|-------|---------|---------|
| `MessageSent` | Full message with user, reply count | `private-chat.channel.{channelId}` |
| `MessageUpdated` | Updated message content, `edited_at` | `private-chat.channel.{channelId}` |
| `MessageDeleted` | Message ID | `private-chat.channel.{channelId}` |
| `UserTyping` | User ID, user name, channel ID | `presence-chat.channel.{channelId}` |

`MessageSent` is the workhorse event. It carries the full message object (including the sender's name and avatar) so the frontend can render immediately without a follow-up fetch.

### Services (`app/Services/Chat/`)

**ChatPresenceService** — presence and typing state.

- `getOnlineUsers(ChatChannel $channel): Collection` — returns users currently in the presence channel
- `broadcastTyping(ChatChannel $channel, User $user): void` — fires `UserTyping` event, debounced to max once per 3 seconds per user
- `markRead(ChatChannel $channel, User $user): void` — updates `last_read_at` on the member pivot

### Policies

**ChatChannelPolicy:**
- `view` — user is a member (or channel is public)
- `update` — user is owner or admin
- `delete` — user is owner
- `join` — channel is public, or user has been invited
- `leave` — user is a member (cannot leave if sole owner)

**ChatMessagePolicy:**
- `update` — user is the message author
- `delete` — user is the message author, or a channel admin/owner

---

## 3. Reverb Channel Structure

Two channel types per chat channel, leveraging Laravel's broadcasting auth.

### Presence channel

```
presence-chat.channel.{channelId}
```

Presence channels track who is currently viewing the channel. Used for:
- Online indicator dots next to usernames
- Typing indicators ("Alice is typing...")
- Member count in channel header

Auth callback returns the user's identity for presence state:

```php
Broadcast::channel('presence-chat.channel.{channelId}', function ($user, $channelId) {
    $member = ChatChannelMember::where('channel_id', $channelId)
        ->where('user_id', $user->id)
        ->exists();

    return $member ? ['id' => $user->id, 'name' => $user->name] : null;
});
```

### Private channel

```
private-chat.channel.{channelId}
```

Carries message events (sent, updated, deleted). Separated from presence so message events are not tied to whether the user is actively viewing the channel — messages arrive even if the user is on a different channel (for unread count updates).

Auth callback:

```php
Broadcast::channel('private-chat.channel.{channelId}', function ($user, $channelId) {
    return ChatChannelMember::where('channel_id', $channelId)
        ->where('user_id', $user->id)
        ->exists();
});
```

### Why two channels per chat channel

Presence channels broadcast join/leave events to all members on every tab open/close. If message events were on the same channel, every message payload would carry the presence overhead. Separating them keeps message delivery lightweight and presence tracking independent.

---

## 4. React Frontend (Inertia v2)

### Pages (`resources/js/pages/Chat/`)

**Index.tsx** — main chat layout, two-column:
- Left: `ChannelSidebar` (channel list, DM list, unread badges)
- Right: active channel content or empty state

This page handles the Inertia route and passes the active channel to child components. On first visit without a channel, redirects to `#general`.

**Channel.tsx** — channel view, rendered inside `Index.tsx`:
- Channel header (name, member count, topic)
- `MessageList` (scrollable, loads older messages on scroll-up)
- `MessageComposer` (text input, send button)
- `ThreadPanel` (slide-out, rendered conditionally)

### Components (`resources/js/components/chat/`)

| Component | Responsibility |
|-----------|---------------|
| `ChannelSidebar.tsx` | Channel list grouped by type (public, private, DMs). Unread count badges. Create channel button. |
| `MessageList.tsx` | Reverse-chronological message list. Cursor-based infinite scroll upward to load history. Scroll-to-bottom on new messages. Date separators between days. |
| `MessageComposer.tsx` | Text input with `Shift+Enter` for newlines, `Enter` to send. Typing indicator broadcast on keystroke (debounced). Markdown preview toggle. File upload placeholder (disabled until Phase E). |
| `MessageBubble.tsx` | Single message: avatar, name, timestamp, content (rendered as markdown). Edit/delete actions on hover (own messages). Reply button to open thread. Reaction picker. Displays "edited" indicator if `updated_at > created_at`. |
| `ThreadPanel.tsx` | Slide-out panel from the right edge. Shows parent message + replies in a sub-list. Own composer for thread replies. Closes with Escape or X button. |
| `PresenceIndicator.tsx` | Green/grey dot for online/offline status. Typing animation ("..." bounce) below the message list when someone is typing. |

### Zustand Store (`resources/js/stores/chatStore.ts`)

Centralised chat state, following the pattern established by `stores/mail/`.

```typescript
interface ChatStore {
    // Channel state
    channels: ChatChannel[];
    activeChannelSlug: string | null;
    setActiveChannel: (slug: string) => void;

    // Message state (keyed by channel ID)
    messages: Record<number, ChatMessage[]>;
    loadMessages: (channelId: number, cursor?: string) => Promise<void>;
    addMessage: (channelId: number, message: ChatMessage) => void;
    updateMessage: (messageId: number, content: string) => void;
    removeMessage: (messageId: number) => void;

    // Presence state (keyed by channel ID)
    onlineUsers: Record<number, PresenceUser[]>;
    typingUsers: Record<number, TypingUser[]>;

    // Unread tracking
    unreadCounts: Record<number, number>;
    markRead: (channelId: number) => void;

    // Thread state
    activeThreadId: number | null;
    openThread: (messageId: number) => void;
    closeThread: () => void;
}
```

The store subscribes to Reverb channels for all channels the user is a member of. When a `MessageSent` event arrives for a non-active channel, the unread count increments. When the user switches to that channel, `markRead` fires a POST and resets the count.

### Type Definitions (`resources/js/types/text-chat.ts`)

```typescript
export type ChatChannel = {
    id: number;
    name: string;
    slug: string;
    type: 'public' | 'private' | 'dm';
    description: string | null;
    created_by: number;
    member_count: number;
    unread_count: number;
};

export type ChatMessage = {
    id: number;
    channel_id: number;
    user_id: number;
    user: { id: number; name: string; avatar_url: string | null };
    content: string;
    type: 'message' | 'system' | 'file';
    metadata: Record<string, unknown> | null;
    parent_id: number | null;
    reply_count: number;
    reactions: ChatReaction[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type ChatReaction = {
    emoji: string;
    count: number;
    users: { id: number; name: string }[];
    reacted: boolean;  // whether current user reacted
};

export type PresenceUser = {
    id: number;
    name: string;
};

export type TypingUser = {
    id: number;
    name: string;
    started_at: number;  // timestamp, auto-clear after 5s
};
```

---

## 5. Routes

All text chat routes live under `/text-chat` to avoid collision with the existing `/chat` agent routes.

```
GET    /text-chat                              — channel index (redirect to #general)
GET    /text-chat/{channel:slug}               — channel view (Inertia page)
POST   /text-chat/channels                     — create channel
POST   /text-chat/{channel:slug}/messages      — send message
PATCH  /text-chat/messages/{message}           — edit message
DELETE /text-chat/messages/{message}           — delete message
POST   /text-chat/{channel:slug}/join          — join channel
POST   /text-chat/{channel:slug}/leave         — leave channel
GET    /text-chat/{channel:slug}/messages      — paginated message history (JSON API)
```

Route registration in `routes/web.php`:

```php
Route::middleware(['auth', 'verified'])->prefix('text-chat')->name('text-chat.')->group(function () {
    Route::get('/', [ChatChannelController::class, 'index'])->name('index');
    Route::post('/channels', [ChatChannelController::class, 'store'])->name('channels.store');
    Route::get('/{channel:slug}', [ChatChannelController::class, 'show'])->name('show');
    Route::post('/{channel:slug}/join', [ChatChannelController::class, 'join'])->name('join');
    Route::post('/{channel:slug}/leave', [ChatChannelController::class, 'leave'])->name('leave');

    Route::get('/{channel:slug}/messages', [ChatMessageController::class, 'index'])->name('messages.index');
    Route::post('/{channel:slug}/messages', [ChatMessageController::class, 'store'])->name('messages.store');
    Route::patch('/messages/{message}', [ChatMessageController::class, 'update'])->name('messages.update');
    Route::delete('/messages/{message}', [ChatMessageController::class, 'destroy'])->name('messages.destroy');
});
```

---

## 6. Brane Integration

Chat messages are knowledge — decisions, discussions, context. Brane indexes them for semantic recall.

### Auto-indexing (periodic batch)

A scheduled job (`ChatBraneIndexJob`) runs every 15 minutes via Laravel's scheduler. It:

1. Queries `chat_messages` created since the last index run
2. Groups messages by channel and time window (5-minute buckets) to form coherent chunks
3. Calls `brane_index` to embed each chunk with metadata:
   - `domain: chat`
   - `source: text-chat/{channel-slug}`
   - `tags: [channel-name, participants...]`
4. Stores the last indexed timestamp in `brane_sources` to avoid reprocessing

This follows the existing Brane batch indexing pattern from `brane-core.php` — chunked content, nomic-embed-text embeddings via Ollama, stored in the `memories` table with pgvector.

### Decision extraction

A separate scheduled job (`ChatDecisionExtractJob`) runs daily. It:

1. Pulls the day's messages for each active channel
2. Sends them to the LLM with a structured prompt: "Extract decisions, action items, and key conclusions from this conversation"
3. Stores the extracted summary via `brane_store` with `domain: decisions`, `tags: [channel-name, date]`

This gives Brane not just raw chat history but distilled knowledge — searchable summaries of what was decided and why.

### Semantic search

`brane_search` queries work against chat history transparently. A search for "deployment process" returns relevant chat discussions alongside journal entries and documentation. No special chat-specific search needed — Brane's hybrid RRF (vector + keyword + recency) handles it.

From the frontend, the agent chat at `/chat` can use Brane tools to recall text-chat discussions:

> "What did we decide about the migration strategy in #engineering last week?"

The agent calls `brane_search`, which returns chat chunks with channel and participant context.

---

## 7. Mesh Integration

Text chat is a local feature first. Mesh integration adds cross-node awareness.

### AMP addressing

Chat exposes a port on each mesh node:

```
chat.markweb.{node}.amp
```

Commands:
- `command: send` — forward a message to a channel on a remote node
- `command: subscribe` — request message events from a remote channel
- `command: history` — fetch message history from a remote channel

### Message forwarding

When a message is sent to a channel that has mesh subscribers, the `MessageSent` event listener checks for remote subscriptions and forwards the message as an AMP message:

```
---
to: chat.markweb.mko.amp
from: chat.markweb.cachyos.amp
command: send
channel: general
user: markc
---
The deployment went smoothly. All three nodes are running v2.4.
```

This is read-only forwarding — the source of truth for a channel lives on one node. Remote nodes receive copies for display and Brane indexing.

### Channel sync (future)

Full channel synchronisation between nodes (where messages can originate from any node and merge) is deferred. It requires conflict resolution and ordering guarantees that add significant complexity. The simple forwarding model above covers the immediate use case: seeing what's happening on other nodes.

When channel sync becomes necessary, it will use CRDTs (conflict-free replicated data types) for message ordering, with the channel's home node as the authoritative tiebreaker.

---

## 8. Migration Files

Four migrations, numbered to follow the existing Brane migrations (`000001`-`000003`):

```
database/migrations/
├── 2026_03_03_000004_create_chat_channels_table.php
├── 2026_03_03_000005_create_chat_channel_members_table.php
├── 2026_03_03_000006_create_chat_messages_table.php
└── 2026_03_03_000007_create_chat_reactions_table.php
```

### 000004 — chat_channels

```php
Schema::create('chat_channels', function (Blueprint $table) {
    $table->id();
    $table->string('name', 100);
    $table->string('slug', 100)->unique();
    $table->string('type', 20)->default('public');  // public, private, dm
    $table->text('description')->nullable();
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();
});
```

Seeder creates `#general` (public, description: "General discussion").

### 000005 — chat_channel_members

```php
Schema::create('chat_channel_members', function (Blueprint $table) {
    $table->foreignId('channel_id')->constrained('chat_channels')->cascadeOnDelete();
    $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
    $table->string('role', 20)->default('member');
    $table->timestamp('joined_at')->useCurrent();
    $table->timestamp('last_read_at')->nullable();
    $table->primary(['channel_id', 'user_id']);
});
```

### 000006 — chat_messages

```php
Schema::create('chat_messages', function (Blueprint $table) {
    $table->id();
    $table->foreignId('channel_id')->constrained('chat_channels')->cascadeOnDelete();
    $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
    $table->text('content');
    $table->string('type', 20)->default('message');
    $table->jsonb('metadata')->nullable();
    $table->foreignId('parent_id')->nullable()->constrained('chat_messages')->cascadeOnDelete();
    $table->timestamps();
    $table->softDeletes();

    $table->index(['channel_id', 'created_at']);
    $table->index('parent_id');
});
```

### 000007 — chat_reactions

```php
Schema::create('chat_reactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('message_id')->constrained('chat_messages')->cascadeOnDelete();
    $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
    $table->string('emoji', 50);
    $table->timestamp('created_at')->useCurrent();

    $table->unique(['message_id', 'user_id', 'emoji']);
});
```

---

## 9. File Structure

```
app/
├── Models/Chat/
│   ├── ChatChannel.php
│   ├── ChatChannelMember.php
│   ├── ChatMessage.php
│   └── ChatReaction.php
├── Http/Controllers/Chat/
│   ├── ChatChannelController.php
│   └── ChatMessageController.php
├── Events/Chat/
│   ├── MessageSent.php
│   ├── MessageUpdated.php
│   ├── MessageDeleted.php
│   └── UserTyping.php
├── Policies/
│   ├── ChatChannelPolicy.php
│   └── ChatMessagePolicy.php
├── Jobs/Chat/
│   ├── ChatBraneIndexJob.php
│   └── ChatDecisionExtractJob.php
└── Services/Chat/
    └── ChatPresenceService.php

resources/js/
├── pages/Chat/
│   ├── Index.tsx
│   └── Channel.tsx
├── components/chat/
│   ├── ChannelSidebar.tsx
│   ├── MessageList.tsx
│   ├── MessageComposer.tsx
│   ├── MessageBubble.tsx
│   ├── ThreadPanel.tsx
│   └── PresenceIndicator.tsx
├── stores/
│   └── chatStore.ts
└── types/
    └── text-chat.ts

database/migrations/
├── 2026_03_03_000004_create_chat_channels_table.php
├── 2026_03_03_000005_create_chat_channel_members_table.php
├── 2026_03_03_000006_create_chat_messages_table.php
└── 2026_03_03_000007_create_chat_reactions_table.php
```

### DCS sidebar integration

Text chat gets a new left sidebar panel:

```
components/panels/l5-channels.tsx    — chat channel list for DCS left sidebar
```

This follows the existing panel naming convention (`l1-nav`, `l2-conversations`, etc.) and adds a fifth left panel for channel navigation.

---

## 10. Implementation Phases

### Phase A — Data model + migrations + models

Create the four migration files and four Eloquent models with relationships. Run migrations. Seed `#general` channel. Auto-add existing users as members.

**Deliverable:** `php artisan migrate` succeeds, models have working relationships.

### Phase B — Backend controllers + events + broadcasting

Build `ChatChannelController` and `ChatMessageController`. Create broadcast events. Register channel auth callbacks in `channels.php`. Add policies. Register routes in `web.php`.

**Deliverable:** cURL/Postman can create channels, send messages, and receive broadcast events via Reverb.

### Phase C — React UI (channel list, message view, composer)

Build the Inertia pages (`Index.tsx`, `Channel.tsx`) and core components (`ChannelSidebar`, `MessageList`, `MessageComposer`, `MessageBubble`). Create the Zustand store. Wire up Reverb subscriptions for real-time message delivery. Add `l5-channels.tsx` to the DCS left sidebar.

**Deliverable:** Users can browse channels, send and receive messages in real-time, see message history with infinite scroll.

### Phase D — Presence + typing indicators

Add presence channel subscriptions. Build `PresenceIndicator` component. Implement typing broadcast (debounced keystroke events). Show online dots and "X is typing..." in the UI.

**Deliverable:** Users see who's online in each channel and see typing indicators.

### Phase E — Threads + reactions

Add thread panel (`ThreadPanel`) with slide-out UI. Implement reaction picker and toggle. Wire up `parent_id` for threaded replies. Show reply counts on parent messages.

**Deliverable:** Users can reply in threads and react to messages with emoji.

### Phase F — Brane integration (auto-indexing chat history)

Build `ChatBraneIndexJob` (15-minute batch) and `ChatDecisionExtractJob` (daily). Register with Laravel scheduler. Verify chat messages appear in `brane_search` results.

**Deliverable:** Chat history is semantically searchable via Brane. AI agent can recall chat discussions.

---

## Design Decisions

### Why `/text-chat` and not `/chat`?

`/chat` is already taken by the AI agent WebSocket chat (`Agent\ChatController`). Reusing the path would require restructuring existing routes and breaking bookmarks. `/text-chat` is unambiguous: it is text chat between humans.

### Why cursor pagination for messages?

Offset pagination breaks when new messages arrive — page boundaries shift, causing duplicates or gaps. Cursor pagination (using `created_at` + `id` as the cursor) is stable regardless of insertions. This is the standard approach for chat message history.

### Why soft deletes for messages?

Hard-deleting a message that has thread replies creates orphaned conversations. Soft delete preserves the thread structure while showing "This message was deleted" in the UI. Admins can still see deleted content for moderation.

### Why Zustand and not Inertia shared data?

Chat state is highly dynamic — messages arrive via WebSocket, typing indicators flash, unread counts change. Inertia's shared data reloads on page navigation, which would cause flicker and lose ephemeral state. A Zustand store persists across Inertia navigations and integrates cleanly with Reverb event listeners, matching the pattern already established by the mail stores.

### Why separate presence and private channels?

Explained in section 3 — presence channels broadcast join/leave metadata on every subscription change. Combining with message events means every message payload carries presence overhead. Separation keeps both lightweight.

---

## Related Documents

- [architecture](2026-02-24-architecture.md) — markweb service domains, models, data flows
- [frontend-dcs-layout](2026-02-24-frontend-dcs-layout.md) — DCS sidebar panels, theme system, Zustand stores
- [mesh-architecture](2026-03-02-mesh-architecture.md) — AMP protocol, node topology, evolution phases
- [brane-open-brain-insights](2026-03-03-brane-open-brain-insights.md) — Brane memory architecture, auto-indexing patterns
- [ai-agent](2026-02-24-ai-agent.md) — agent chat (separate from text chat), WebSocket streaming
