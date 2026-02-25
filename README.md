# markweb

A multi-agent mesh platform where every node runs its own AI agent, mail server, and database — and they all talk to each other in plain-text Markdown over WebSockets. Built on Laravel 12, Inertia 2, and React 19.

## What is markweb?

markweb is the control plane for a **NetServa v4.0** mesh — a network of fully provisioned nodes connected over WireGuard, each running an identical service stack:

| Service | Provides | Software |
|---------|----------|----------|
| Web & App | HTTPS, reverse proxy, PHP runtime | FrankenPHP (Caddy) |
| Mail | IMAP, JMAP, SMTP, spam filtering | Stalwart Mail Server |
| Database | Relational storage, vector embeddings, full-text search | PostgreSQL + pgvector + tsvector |
| DNS | Authoritative DNS, mesh service discovery (SRV, DNS-SD) | PowerDNS |
| Inference | Local embedding generation | Ollama (nomic-embed-text) |
| VPN | Encrypted inter-node transport | WireGuard |
| WebSocket | Real-time streaming, mesh events | Laravel Reverb |
| CalDAV/CardDAV | Calendars, contacts | SabreDAV |

Every node is self-contained — it can serve web, send mail, resolve DNS, and run AI inference independently. The critical design choice is **Markdown as the wire protocol**: all inter-node communication and all agent-to-user conversation flows as plain-text Markdown over WebSocket channels. This means every message in the system is simultaneously human-readable, LLM-native, and machine-parseable — no serialisation layer, no binary framing, no impedance mismatch between what the agent thinks and what the network carries.

### Why multi-agent mesh matters

Each node runs its own AI agent with its own memory, tools, and local context. An agent on `web.motd.com` knows that node's mail, DNS, and system state. An agent on `web.kanary.org` knows its own. Because they share a common Markdown protocol over WireGuard, agents can coordinate across nodes — one agent can ask another to check a DNS record, verify mail delivery, or report system health, and the response is the same Markdown a human operator would read. No API translation, no schema negotiation. The mesh becomes a distributed team of specialist agents, each grounded in its own infrastructure, communicating in a format that's natively understood by every LLM.

This is the difference between "AI that controls one server" and "AI that operates a network."

### Application layers

- **AI Agent Platform** — Multi-model chat with tool use, sandboxed code execution, semantic memory, and scheduled routines. Supports 7 LLM providers (Anthropic, OpenAI, Gemini, Groq, xAI, DeepSeek, OpenRouter) with Anthropic Claude as the default. Built on `laravel/ai` with real-time WebSocket streaming via Reverb.
- **JMAP Webmail & PIM** — Full email client backed by Stalwart over JMAP, with CalDAV/CardDAV contacts and calendars via SabreDAV. Zustand-managed frontend stores handle session, mailbox, email, and compose state.
- **Mesh C&C** — Real-time dashboard for the WireGuard cluster. Each node heartbeats every 30 seconds to the primary, syncs full mesh state, and broadcasts updates live via Reverb.

Every node's entry point follows the **`web.*` subdomain convention**: `web.kanary.org`, `web.motd.com`, `web.goldcoast.org` — one URL per node, resolved via mesh-local PowerDNS and gated by HTTP basic auth before you reach the login page.

The UI uses a **Dual Carousel Sidebar (DCS)** layout — two independently navigable sliding panels flanking a central workspace, styled with glassmorphism:

| Left Sidebar | Right Sidebar |
|---|---|
| L1 — Navigation | R1 — Theme Picker |
| L2 — Conversations | R2 — Token Usage |
| L3 — Documentation | R3 — Notifications |
| L4 — Mailboxes | |

## Architecture

### Backend Services

Each service domain lives under `app/Services/`:

**Agent/** — Core AI runtime. `AgentRuntime` orchestrates message handling across sync (TUI/email) and streaming (WebSocket) flows. `IntentRouter` classifies messages as commands, queries, or tasks and dispatches slash commands (`/help`, `/info`, `/model`, `/new`, `/rename`). `SessionResolver` resolves or creates agent sessions with appropriate trust levels. `ContextAssembler` builds LLM context by injecting system prompts and relevant semantic memories from pgvector. `ModelRegistry` returns available models filtered by which providers have configured API keys.

**Tools/** — Agent tool execution. `ToolResolver` discovers tools available at a session's trust level. `SanitizingToolWrapper` wraps every tool with content sanitisation and injection auditing. Four built-in tools: `BashTool` (shell commands), `SandboxedBashTool` (isolated Proxmox CT execution), `HttpRequestTool` (web requests), `CurrentDateTimeTool`.

**Mail/** — JMAP mail integration with Stalwart. The frontend uses `jmap-jam` as the JMAP client library, with `jmap-client.ts` handling session auth (HTTP Basic) and URL rewriting from Stalwart's internal addresses to the app's reverse proxy.

**Memory/** — Embedding generation via Ollama (`nomic-embed-text`) stored in pgvector. Semantic search retrieves relevant memories during context assembly, giving the agent long-term recall across sessions.

**Security/** — Content sanitiser and injection detection audit. Scans agent inputs and outputs for prompt injection attempts and enforces sanitisation policies.

**Sandbox/** — Proxmox CT pool for isolated code execution. The agent can spin up ephemeral containers to run untrusted code safely.

**Routines/** — Scheduled and recurring agent actions. Cron-driven tasks the agent executes autonomously on a timer.

**Dav/** — SabreDAV backends for CalDAV (calendars), CardDAV (contacts), and principal management. Well-known redirects at `/.well-known/caldav` and `/.well-known/carddav` route to `/dav/`.

**Mcp/** — Model Context Protocol server exposing prompts, resources, and tools to MCP-compatible clients.

### Data Flow: Agent Chat

1. User sends a message → `Agent\ChatController@send` dispatches a `ProcessChatMessage` job
2. The job calls `AgentRuntime::handleStreamingMessage()` which assembles context (system prompt + memories), resolves available tools, and selects the model
3. `laravel/ai` streams the response via an `AnonymousAgent` — tokens broadcast in real-time over Reverb
4. Lifecycle events (`SessionCreated`, `SessionUpdated`, `SessionDeleted`) broadcast on `chat.user.{userId}`
5. Stream tokens and `StreamEnd` broadcast on `chat.session.web.{userId}.{uuid}`

### Data Flow: JMAP Mail

Frontend Zustand stores in `stores/mail/` manage all mail state. On auth, `session-store` establishes a JMAP session. `mailbox-store` fetches folder hierarchy. `email-store` handles message listing and threading. `compose-store` manages draft composition, identity resolution, and send. `ui-store` tracks selection state and panel visibility.

**Gotcha:** `jmap-jam`'s `requestMany` doesn't support JMAP creation ID back-references between method calls. Multi-step operations (e.g., create Email then create EmailSubmission) must be split into separate API calls.

### Frontend

- **Framework:** React 19 + TypeScript, delivered via Inertia 2 (no client-side routing)
- **Components:** Radix UI primitives for accessible, unstyled building blocks
- **Styling:** Tailwind CSS 4 with 5 OKLCH colour schemes — Crimson, Stone, Ocean, Forest, Sunset — each with light and dark modes. CSS custom properties in `markweb.css`, state persisted to `localStorage`
- **Type safety:** Wayfinder generates TypeScript route helpers (`resources/js/routes/`) and server action types (`resources/js/actions/`) — never hand-edited
- **Chat rendering:** `Streamdown` component renders streaming markdown in real-time

### Stack

| Layer | Technology |
|-------|-----------|
| Runtime | PHP 8.4+, FrankenPHP |
| Framework | Laravel 12, Fortify (auth + 2FA) |
| Frontend | React 19, Inertia 2, Tailwind CSS 4, Radix UI |
| Database | PostgreSQL + pgvector + tsvector |
| WebSocket | Laravel Reverb |
| Mail | Stalwart Mail Server (JMAP/IMAP/SMTP) |
| Embeddings | Ollama (nomic-embed-text) |
| LLM | Anthropic Claude (via laravel/ai), 6 additional providers |
| Package manager | Bun |

## Mesh Networking

markweb runs as a replicated instance across multiple nodes. Each node has its own PostgreSQL database, Stalwart mail server, and Ollama instance. Nodes communicate over WireGuard.

| Node | URL | WireGuard IP | Role |
|------|-----|-------------|------|
| mko | `web.kanary.org` | 172.16.1.210 | Production primary |
| mmc | `web.motd.com` | 172.16.1.9 | Production node |
| cachyos | `web.goldcoast.org` | — | Dev workstation |

### How it works

- **Heartbeat:** Each secondary node runs a systemd timer that POSTs to the primary every 30 seconds via `POST /api/mesh/heartbeat` (bearer token auth over WireGuard). The payload includes node name, WireGuard IP, and optional metadata.
- **Self-heartbeat:** `console.php` writes the local node's heartbeat directly to its own database on the same schedule.
- **Sync:** Secondary nodes pull full mesh state from the primary via `GET /api/mesh/sync` every 30 seconds, so every node has a complete picture of the cluster.
- **Offline detection:** Nodes without a heartbeat for 90 seconds are marked offline.
- **Real-time broadcasting:** Every heartbeat triggers a `MeshNodeUpdated` event broadcast via Reverb, so the dashboard updates live without polling.
- **Identity:** Entirely config-driven — `MESH_NODE_NAME` and `MESH_NODE_WG_IP` in each node's `.env`.

Future: PowerDNS on each node for mesh-local service discovery (SRV records, DNS-SD), replacing the current `/etc/hosts`-based WireGuard routing.

## Getting Started

```bash
git clone https://github.com/markc/markweb.git
cd markweb
composer install
bun install
cp .env.example .env
php artisan key:generate
php artisan migrate
bun run build
```

Requires PostgreSQL with pgvector, a Stalwart Mail instance for JMAP, and Ollama with `nomic-embed-text` for embeddings.

## Development

`composer dev` starts 5 concurrent processes: artisan serve, Reverb WebSocket server, queue worker, Pail log tail, and Vite dev server.

```bash
composer dev                              # Start all dev services
php artisan test --compact                # Run all Pest tests
php artisan pint                          # Format PHP (Laravel Pint)
php artisan wayfinder:generate            # Regenerate TypeScript route/action types
php artisan migrate                       # Run migrations
```

### Deploy cycle

Every change follows: **commit → push → pull on server → rebuild → clear caches**.

```bash
bin/deploy              # Full deploy: push + pull + build + cache clear
bin/deploy --skip-build # PHP-only changes: skip frontend rebuild
```

The frontend is always built on the server — `VITE_REVERB_*` environment variables get baked into JavaScript at build time. Building locally would bake in `localhost` values.

## Origin Story

markweb was born on **23 February 2026** in a single intense weekend session. Three existing Laravel projects — **laraclaw** (AI agents), **laramail** (JMAP webmail), and a mesh monitoring prototype — were merged into one unified platform.

The concept, architecture, and every line of code were created by **Mark Constable** ([@markc](https://github.com/markc)), working in close collaboration with **Claude Code** (Anthropic's AI coding agent). What would normally be weeks of integration work — unifying service layers, resolving namespace conflicts, building a coherent UI, deploying across three nodes — was accomplished in days through continuous human-AI pair programming.

This is software built the way it should be: one person's vision, executed at the speed of thought.

## Documentation

[markweb.dev](https://markweb.dev) — project docs and interactive explainers (GitHub Pages).

## Licence

[MIT](https://opensource.org/licenses/MIT)
