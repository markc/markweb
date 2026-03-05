# SearchX Integration into markweb

**Date:** 2026-03-04
**Status:** Proposed

## Overview

Integrate SearchX (the Laravel metasearch engine at `~/.gh/searchx`) into markweb as a first-class capability — both as a UI panel and as a tool available to the AI agent. Extend search across the mesh via meshd so any node can search through any other node's SearchX instance.

## Why This Matters

markweb already has:
- **Memory search** — pgvector semantic + tsvector keyword (local knowledge)
- **Document search** — uploaded RAG chunks (local files)
- **No web search** — the AI agent has `WebSearchTool` stubbed but no backend

SearchX fills the gap: live web results from real search engines, aggregated and scored. Combined with the AI agent, this creates a Perplexity-like experience inside markweb — ask a question, get web results + AI synthesis, all within the DCS interface.

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ markweb (Laravel)                                               │
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │ AI Agent     │───▶│ SearchX      │───▶│ Http::pool()      │  │
│  │ (tool call)  │    │ Service      │    │ Brave/DDG/Google  │  │
│  └─────────────┘    └──────────────┘    └───────────────────┘  │
│         │                   │                                   │
│         │            ┌──────┴───────┐                           │
│         │            │ Result       │                           │
│         │            │ Aggregator   │                           │
│         ▼            └──────────────┘                           │
│  ┌─────────────┐           │                                    │
│  │ Agent        │◀──────────                                    │
│  │ Response     │                                               │
│  │ (citations)  │                                               │
│  └─────────────┘                                                │
│                                                                 │
│  ┌─────────────┐                                                │
│  │ L7 Panel    │  ← New DCS left sidebar panel                  │
│  │ (Search UI) │                                                │
│  └─────────────┘                                                │
├─────────────────────────────────────────────────────────────────┤
│ meshd                                                           │
│  AMP: search.markweb.{node}.amp                                 │
│  Commands: search-request / search-response                     │
└─────────────────────────────────────────────────────────────────┘
```

## Phase 1: Embed SearchX as a Composer Package

### Approach

Don't keep SearchX as a separate Laravel app. Extract the core classes into a Composer path package at `~/.gh/packages/searchx/` (following markweb's existing packages pattern), then require it in markweb.

### Package structure

```
~/.gh/packages/searchx/
├── composer.json
├── config/searchx.php
└── src/
    ├── Contracts/SearchEngine.php
    ├── DTOs/
    │   ├── SearchRequest.php
    │   ├── SearchResult.php
    │   └── AggregatedResults.php
    ├── Engines/
    │   ├── Concerns/ParsesHtml.php
    │   ├── BraveApiEngine.php
    │   ├── DuckDuckGoEngine.php
    │   ├── GoogleEngine.php
    │   ├── BingEngine.php
    │   ├── YouTubeEngine.php
    │   └── GoogleImagesEngine.php
    ├── Services/
    │   ├── EngineRegistry.php
    │   ├── SearchService.php
    │   ├── ResultAggregator.php
    │   └── AutocompleteService.php
    └── SearchXServiceProvider.php
```

### markweb composer.json

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../packages/searchx"
        }
    ],
    "require": {
        "markc/searchx": "*"
    }
}
```

This lets both the standalone `~/.gh/searchx` app and markweb share the same engine code. The standalone app keeps its Inertia frontend for independent use; markweb gets just the service layer.

## Phase 2: AI Agent Web Search Tool

### The key win

Replace the stubbed `WebSearchTool` in markweb's agent with a real implementation backed by SearchX. When the agent decides it needs current information, it calls the web search tool, gets aggregated results, and cites them in its response.

### Implementation

**File:** `app/Services/Tools/BuiltIn/WebSearchTool.php`

```php
class WebSearchTool implements AgentTool
{
    public function name(): string { return 'web_search'; }

    public function description(): string
    {
        return 'Search the web using multiple search engines. Returns aggregated results from Brave, DuckDuckGo, Google, and Bing.';
    }

    public function parameters(): array
    {
        return [
            'query' => ['type' => 'string', 'description' => 'The search query', 'required' => true],
            'category' => ['type' => 'string', 'enum' => ['general', 'images', 'videos'], 'default' => 'general'],
        ];
    }

    public function execute(array $params): string
    {
        $service = app(SearchService::class);
        $request = new SearchRequest(query: $params['query'], category: $params['category'] ?? 'general');
        $results = $service->search($request);

        // Format top results as context for the LLM
        return collect($results->results)
            ->take(8)
            ->map(fn($r, $i) => sprintf("[%d] %s\n    %s\n    %s", $i + 1, $r->title, $r->url, $r->content))
            ->implode("\n\n");
    }
}
```

The agent's `ToolResolver` already auto-discovers tools in `app/Services/Tools/BuiltIn/`. Once the class exists, the agent can use it. The `SystemPromptBuilder` can include a hint:

> "You have access to web_search for current information. Use it when the user's question requires up-to-date facts, recent events, or information beyond your training data."

### Context assembly integration

The `ContextAssembler` currently injects memory search results and document chunks. Add a third source:

```
System prompt
  + Relevant memories (pgvector)
  + Relevant document chunks (pgvector)
  + Web search results (SearchX)    ← new, on-demand via tool call
```

The web search is **on-demand** (tool call), not automatic on every message — unlike memory/documents which are always injected. This prevents unnecessary API calls to search engines.

## Phase 3: DCS Search Panel (L7)

### New left sidebar panel

Add an **L7: Search** panel to the DCS left sidebar. This gives users a dedicated search interface without leaving the chat workspace.

**Component:** `resources/js/components/panels/l7-search-panel.tsx`

```
┌──────────────────────┐
│ 🔍 [search input   ] │
│                      │
│ All | Images | Videos│
│                      │
│ ┌──────────────────┐ │
│ │ Result 1         │ │
│ │ example.com      │ │
│ │ snippet text...  │ │
│ ├──────────────────┤ │
│ │ Result 2         │ │
│ │ other.com        │ │
│ │ snippet text...  │ │
│ └──────────────────┘ │
│                      │
│ [Ask AI about this]  │
└──────────────────────┘
```

**Behaviour:**
- Searching fires `GET /api/searchx?q=...&category=...` (new API route)
- Results render in the sidebar panel
- "Ask AI about this" button injects search results into the chat as context and starts a new message: "Based on these search results for '{query}', ..."
- Clicking a result opens it in a new tab

### API route

```php
// routes/api.php
Route::get('/searchx', [SearchXController::class, 'search'])->middleware('auth:sanctum');
Route::get('/searchx/autocomplete', [SearchXController::class, 'autocomplete'])->middleware('auth:sanctum');
```

### SearchXController

```php
class SearchXController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $searchRequest = SearchRequest::fromArray($request->validated());
        $results = app(SearchService::class)->search($searchRequest);
        return response()->json($results->toArray());
    }
}
```

## Phase 4: Mesh-Distributed Search

### The vision

Any markweb node can search through any other node's SearchX instance over meshd. Use cases:

1. **Distributed API key usage** — Node A has a Brave API key, Node B doesn't. B routes search requests through A.
2. **Engine diversity** — Different nodes can be configured with different engines. Aggregate results from multiple nodes.
3. **Privacy routing** — Route searches through a specific node for IP diversity (search engines see different source IPs from different WireGuard endpoints).
4. **Geo-distributed results** — Nodes in different regions get different localised results. Merge them for broader coverage.

### AMP addressing

```
search.markweb.cachyos.amp   ← SearchX endpoint on cachyos
search.markweb.mko.amp       ← SearchX endpoint on mko
```

### AMP commands

**search-request:**
```
---
amp: 1
type: request
from: search.markweb.cachyos.amp
to: search.markweb.mko.amp
command: search-request
id: <uuid>
json: {"query": "laravel 12 new features", "category": "general", "page": 1}
---
```

**search-response:**
```
---
amp: 1
type: response
from: search.markweb.mko.amp
to: search.markweb.cachyos.amp
command: search-response
reply-to: <uuid>
json: {"results": [...], "engines": {...}, "total_time": 0.8}
---
```

### Implementation in markweb

**MeshSearchService:**

```php
class MeshSearchService
{
    public function __construct(
        private SearchService $localSearch,
        private MeshBridgeService $bridge,
    ) {}

    /**
     * Search locally + optionally fan out to peer nodes.
     */
    public function search(SearchRequest $request, array $peerNodes = []): AggregatedResults
    {
        $aggregator = new ResultAggregator($this->getWeights());

        // Local search
        $local = $this->localSearch->search($request);
        foreach ($local->results as $result) {
            $aggregator->addResults([$result], 'local', $local->totalTime);
        }

        // Fan out to peers via meshd
        $pending = [];
        foreach ($peerNodes as $node) {
            $id = Str::uuid7();
            $this->bridge->send(AmpMessage::request(
                from: "search.markweb.{$this->bridge->nodeName()}.amp",
                to: "search.markweb.{$node}.amp",
                command: 'search-request',
                id: $id,
                json: $request->toArray(),
            ));
            $pending[$id] = $node;
        }

        // Collect responses (with timeout)
        // ... await via callback or Redis pub/sub ...

        return $aggregator->aggregate();
    }
}
```

**Inbound handler** (in the existing mesh inbound route):

```php
// When meshd delivers a search-request from a peer:
if ($ampMessage->command === 'search-request') {
    $request = SearchRequest::fromArray($ampMessage->json);
    $results = app(SearchService::class)->search($request);

    $bridge->send(AmpMessage::response(
        from: "search.markweb.{$nodeName}.amp",
        to: $ampMessage->from,
        replyTo: $ampMessage->id,
        command: 'search-response',
        json: $results->toArray(),
    ));
}
```

### Mesh search topology

```
User on cachyos
    │
    ▼
markweb.cachyos ──── meshd ──── WireGuard ──── meshd ──── markweb.mko
    │                                                        │
    ├─ Brave (local)                                         ├─ DuckDuckGo
    ├─ DuckDuckGo                                            ├─ Google
    │                                                        │
    └─ Aggregated results ◀────── AMP search-response ◀─────┘
```

Each node runs its own set of enabled engines. The requesting node merges all results using the same `ResultAggregator` scoring formula. Results from peer nodes are scored as additional engines in the multi-engine multiplier — so a URL found on both cachyos and mko scores higher than one found on only one node.

## Phase 5: AI Agent Mesh Search

Combine Phases 2 and 4: the AI agent's `web_search` tool can fan out across the mesh.

```php
class WebSearchTool implements AgentTool
{
    public function execute(array $params): string
    {
        $meshSearch = app(MeshSearchService::class);
        $peers = config('searchx.mesh_peers', []); // e.g. ['mko', 'mmc']

        $results = $meshSearch->search(
            new SearchRequest(query: $params['query']),
            peerNodes: $peers,
        );

        return $this->formatForAgent($results);
    }
}
```

The agent doesn't know or care about the mesh — it just calls `web_search` and gets the best aggregated results from all nodes.

## Implementation Order

| Step | Phase | Effort | Depends on |
|------|-------|--------|------------|
| 1 | Extract SearchX into `~/.gh/packages/searchx/` | Small | — |
| 2 | Require package in markweb, publish config | Small | Step 1 |
| 3 | Implement `WebSearchTool` for AI agent | Small | Step 2 |
| 4 | Add `GET /api/searchx` route + controller | Small | Step 2 |
| 5 | Build L7 Search panel in DCS sidebar | Medium | Step 4 |
| 6 | Wire "Ask AI about this" button to chat | Small | Steps 3, 5 |
| 7 | Add AMP `search-request`/`search-response` handlers | Medium | Step 2, meshd working |
| 8 | Build `MeshSearchService` for fan-out | Medium | Step 7 |
| 9 | Upgrade `WebSearchTool` to use mesh fan-out | Small | Steps 3, 8 |

Steps 1–6 can be done without meshd. Steps 7–9 require meshd connections between nodes.

## Config Additions

**markweb `.env`:**
```env
# SearchX engines (inherited from searchx package)
BRAVE_API_KEY=your_key
SEARCHX_ENGINE_BRAVE=true
SEARCHX_ENGINE_DUCKDUCKGO=true
SEARCHX_ENGINE_GOOGLE=false
SEARCHX_ENGINE_BING=false
SEARCHX_ENGINE_YOUTUBE=true
SEARCHX_ENGINE_GOOGLE_IMAGES=true

# Mesh search fan-out
SEARCHX_MESH_PEERS=mko,mmc
SEARCHX_MESH_TIMEOUT=3
```

## Phase 6: Cross-Node Text Chat via meshd

Text chat (Section 7 of `_doc/2026-03-03-text-chat-design.md`) is currently local-only — messages go to the database, then broadcast via Reverb to users on the same node. The mesh WebSocket between nodes carries heartbeats and task dispatch but not chat messages. This phase wires text chat through meshd.

### The gap

```
Currently:
  User A (cachyos) → POST message → DB → Reverb → User B (cachyos only)
  User C (mko) sees nothing.

After:
  User A (cachyos) → POST message → DB → Reverb (local)
                                       → meshd → WireGuard → meshd (mko) → Reverb (mko)
                                                                          → User C sees message
```

### AMP addressing

```
chat.markweb.cachyos.amp    ← text chat endpoint on cachyos
chat.markweb.mko.amp        ← text chat endpoint on mko
```

### AMP commands

**chat-message** (fire-and-forget event, not request/response):
```
---
amp: 1
type: event
from: chat.markweb.cachyos.amp
to: chat.markweb.mko.amp
command: chat-message
json: {"channel_slug": "general", "user_name": "markc", "user_id": 1, "content": "Deployment done.", "type": "message", "parent_id": null, "created_at": "2026-03-04T20:45:00Z"}
---
```

**chat-typing** (ephemeral, no persistence):
```
---
amp: 1
type: event
from: chat.markweb.cachyos.amp
to: chat.markweb.mko.amp
command: chat-typing
json: {"channel_slug": "general", "user_name": "markc"}
---
```

**chat-presence** (periodic, not per-keystroke):
```
---
amp: 1
type: event
from: chat.markweb.cachyos.amp
to: chat.markweb.mko.amp
command: chat-presence
json: {"channel_slug": "general", "online_users": ["markc", "admin"]}
---
```

### Implementation

#### Step 1: MessageSent event listener

Add a listener on the existing `MessageSent` event that forwards to mesh peers:

```php
// app/Listeners/Chat/ForwardMessageToMesh.php
class ForwardMessageToMesh
{
    public function __construct(private MeshBridgeService $bridge) {}

    public function handle(MessageSent $event): void
    {
        $message = $event->message;
        $nodeName = config('mesh.node_name');

        // Get all connected peer nodes
        $peers = $this->bridge->connectedPeers();

        foreach ($peers as $peer) {
            $this->bridge->send([
                'amp' => '1',
                'type' => 'event',
                'from' => "chat.markweb.{$nodeName}.amp",
                'to' => "chat.markweb.{$peer}.amp",
                'command' => 'chat-message',
                'json' => json_encode([
                    'channel_slug' => $message->channel->slug,
                    'user_name' => $message->user->name,
                    'user_id' => $message->user_id,
                    'content' => $message->content,
                    'type' => $message->type,
                    'parent_id' => $message->parent_id,
                    'created_at' => $message->created_at->toIso8601String(),
                    'origin_node' => $nodeName,
                    'origin_id' => $message->id,
                ]),
            ]);
        }
    }
}
```

Register in `EventServiceProvider`:
```php
MessageSent::class => [ForwardMessageToMesh::class],
```

#### Step 2: Inbound handler

In the mesh inbound route handler, process `chat-message` commands:

```php
// In the /api/mesh/inbound handler:
if ($ampMessage->command === 'chat-message') {
    $data = $ampMessage->json;

    // Find or skip the channel (don't create channels from remote nodes)
    $channel = ChatChannel::where('slug', $data['channel_slug'])->first();
    if (!$channel) {
        return; // Channel doesn't exist on this node
    }

    // Create a local copy of the message (marked as remote)
    $message = ChatMessage::create([
        'channel_id' => $channel->id,
        'user_id' => null, // Remote user — not in local users table
        'content' => $data['content'],
        'type' => $data['type'],
        'metadata' => [
            'origin_node' => $data['origin_node'],
            'origin_id' => $data['origin_id'],
            'remote_user_name' => $data['user_name'],
        ],
        'parent_id' => null, // Thread linking across nodes is deferred
    ]);

    // Broadcast to local Reverb subscribers
    broadcast(new MessageSent($message))->toOthers();
}
```

#### Step 3: Frontend — display remote messages

`MessageBubble` already renders user name from the message. For remote messages where `user_id` is null, fall back to `metadata.remote_user_name` and show the origin node:

```tsx
const userName = message.user?.name
    ?? `${message.metadata?.remote_user_name} (${message.metadata?.origin_node})`;
```

#### Step 4: Typing indicators over mesh

Forward typing events via AMP — these are ephemeral (no persistence, no DB write on the remote side):

```php
// app/Listeners/Chat/ForwardTypingToMesh.php
class ForwardTypingToMesh
{
    public function handle(UserTyping $event): void
    {
        // Same pattern as ForwardMessageToMesh but with command: chat-typing
        // Remote node receives it and broadcasts UserTyping locally on Reverb
    }
}
```

### What this does NOT do (deferred)

- **Channel sync** — channels must exist independently on each node. No auto-creation.
- **Thread linking** — `parent_id` references are local. Cross-node thread replies land as top-level messages.
- **User identity** — remote users are identified by name string, not linked to local user accounts. A proper federated identity system is future work.
- **Message editing/deletion sync** — edits and deletes don't propagate cross-node yet.
- **Read receipts** — unread tracking is local only.

These limitations match the design doc's "read-only forwarding" model — the source of truth for a channel lives on one node, remote nodes get copies.

### Relationship to WebRTC SFU

Text chat over meshd and A/V over WebRTC SFU are complementary:

```
┌─────────────────────────────────────────────────────┐
│                    meshd WebSocket                    │
│                                                       │
│  Text chat ──── AMP chat-message events ────→ peers  │
│  Search    ──── AMP search-request/response ─→ peers │
│  Tasks     ──── AMP dispatch/callback ───────→ peers │
│  SFU signal ─── AMP sdp-offer/answer ───────→ local  │
│                                                       │
├─────────────────────────────────────────────────────┤
│                    WebRTC SFU (UDP)                   │
│                                                       │
│  Audio    ──── RTP/SRTP ────→ subscribers            │
│  Video    ──── RTP/SRTP ────→ subscribers            │
│  Screen   ──── RTP/SRTP ────→ subscribers            │
└─────────────────────────────────────────────────────┘
```

meshd carries the control plane (text, signaling, metadata). WebRTC SFU carries the media plane (audio, video, screen share). Together they give a complete communication stack — text chat + voice + video + screen sharing, all self-hosted over WireGuard, no third-party services.

A text chat channel can upgrade to a voice/video call by initiating SFU signaling in the same channel context. The channel slug becomes the SFU room name:

```
chat-message → channel "engineering" → meshd WebSocket
sdp-offer    → room "engineering"    → meshd → SFU → WebRTC
```

## Updated Implementation Order

| Step | Phase | Effort | Depends on |
|------|-------|--------|------------|
| 1 | Extract SearchX into `~/.gh/packages/searchx/` | Small | — |
| 2 | Require package in markweb, publish config | Small | Step 1 |
| 3 | Implement `WebSearchTool` for AI agent | Small | Step 2 |
| 4 | Add `GET /api/searchx` route + controller | Small | Step 2 |
| 5 | Build L7 Search panel in DCS sidebar | Medium | Step 4 |
| 6 | Wire "Ask AI about this" button to chat | Small | Steps 3, 5 |
| 7 | Add AMP `search-request`/`search-response` handlers | Medium | Step 2, meshd working |
| 8 | Build `MeshSearchService` for fan-out | Medium | Step 7 |
| 9 | Upgrade `WebSearchTool` to use mesh fan-out | Small | Steps 3, 8 |
| 10 | `ForwardMessageToMesh` listener + inbound handler | Medium | meshd working |
| 11 | Remote message display in MessageBubble | Small | Step 10 |
| 12 | Typing/presence forwarding over mesh | Small | Step 10 |
| 13 | SFU room ↔ chat channel mapping (call upgrade) | Medium | Steps 10, SFU browser integration |

Steps 1–6 need no meshd. Steps 7–9 need meshd for search. Steps 10–13 need meshd for chat + SFU.

## What This Enables

1. **Chat with web knowledge** — "What happened in tech today?" → agent calls web_search → cites real sources
2. **Sidebar quick search** — Search the web without leaving markweb, drag results into chat context
3. **Distributed search** — fan out queries across mesh nodes for broader engine coverage and API key sharing
4. **Privacy** — self-hosted, no search history sent to third parties, results from multiple nodes obscure traffic patterns
5. **Perplexity-like experience** — aggregated web results + AI synthesis, all within the DCS interface
6. **Cross-node text chat** — users on different mesh nodes see each other's messages in real-time via meshd
7. **Unified comms** — text chat + voice/video/screen in the same channel, all over WireGuard, no third-party dependencies
8. **Full-stack self-hosted** — search + chat + A/V + AI, all running on your own metal across the mesh
