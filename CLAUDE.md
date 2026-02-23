# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

markweb is a unified Laravel 12 + Inertia 2 + React 19 platform consolidating:
- **AI Agent Platform** (from laraclaw) — AgentRuntime, Memory, Security, Routines, Sandbox, Tools
- **JMAP Webmail + PIM** (from laramail) — Stalwart JMAP, CalDAV/CardDAV via SabreDAV
- **Dual Carousel Sidebars (DCS)** — Multi-panel sliding sidebars with glassmorphism

## Commands

```bash
composer dev                              # Start all dev services (server, Reverb, queue, pail logs, Vite)
bun run build                             # Production frontend build
bun run dev                               # Vite dev server only
php artisan test --compact                 # Run all Pest tests
php artisan test --filter=ExampleTest      # Run a single test by name
php artisan pint                           # Format PHP (Laravel Pint)
php artisan migrate                        # Run migrations
php artisan wayfinder:generate             # Regenerate TypeScript route/action types
```

`composer dev` runs 5 concurrent processes via `concurrently`: artisan serve, Reverb WebSocket, queue worker, Pail log tail, and Vite.

## Tech Stack

- PHP 8.4+, Laravel 12, Inertia 2, Fortify (auth + 2FA)
- React 19, TypeScript, Tailwind CSS 4, Radix UI primitives
- `laravel/ai` for LLM integration (Anthropic primary)
- Laravel Reverb for WebSocket streaming (chat + real-time events)
- Wayfinder for type-safe TypeScript route/action generation
- PostgreSQL + pgvector (embeddings) + tsvector (full-text search)
- Bun as package manager (not npm/yarn)
- `jmap-jam` client library for JMAP mail operations
- SabreDAV for CalDAV/CardDAV

## Architecture

### Backend Service Domains (`app/Services/`)

- **Agent/** — Core AI runtime. `AgentRuntime` orchestrates message handling; `SessionResolver` manages sessions; `ContextAssembler` builds LLM context; `IntentRouter` classifies slash commands; `ModelRegistry` manages model selection. Slash commands in `Commands/` (help, info, model, new, rename).
- **Tools/** — Agent tool execution. `ToolResolver` discovers tools; `SanitizingToolWrapper` wraps them. Built-in tools: Bash, SandboxedBash, HttpRequest, CurrentDateTime.
- **Mail/** — JMAP mail integration with Stalwart server
- **Email/** — Email message processing
- **Memory/** — Embedding generation and semantic search (pgvector)
- **Security/** — Content sanitizer, injection audit
- **Sandbox/** — Proxmox CT pool for sandboxed code execution
- **Routines/** — Scheduled/recurring agent actions

### Data Flow: Agent Chat

1. User sends message → `Agent\ChatController@send` → dispatches `ProcessChatMessage` job
2. Job calls `AgentRuntime::handleStreamingMessage()` → assembles context, resolves tools
3. `laravel/ai` streams response via `AnonymousAgent` → broadcasts token-by-token via Reverb
4. Events: `SessionCreated`, `SessionUpdated`, `SessionDeleted` (session lifecycle), `StreamEnd` (completion)
5. Broadcast channels: `chat.user.{userId}` (lifecycle), `chat.session.web.{userId}.{uuid}` (stream)

### Data Flow: JMAP Mail

Frontend Zustand stores (`stores/mail/`) manage mail state. `lib/jmap-client.ts` creates a `JamClient` instance with Basic auth and URL rewriting (Stalwart internal URLs → app reverse proxy). Key stores: `session-store` (auth), `mailbox-store` (folders), `email-store` (messages), `compose-store` (drafts), `ui-store` (selection state).

**Known gotcha:** `jmap-jam`'s `requestMany` doesn't support JMAP creation ID back-references between method calls. Split multi-step operations (e.g., create Email then create EmailSubmission) into separate API calls.

### DAV Integration (`app/Dav/`)

SabreDAV backends: `AuthBackend`, `CalendarBackend`, `CardDavBackend`, `PrincipalBackend`. Well-known redirects for `/.well-known/caldav` and `/.well-known/carddav` → `/dav/`.

### Frontend Layout: Dual Carousel Sidebars

Each sidebar has panels navigable via `< [dot·dot] >` carousel controls:
- **Left:** L1-Nav, L2-Conversations, L3-Docs, L4-Mailboxes
- **Right:** R1-Theme, R2-Usage, R3-Notifications

Panel components in `components/panels/` (prefixed `l1-`, `l2-`, `r1-`, etc.).

### Theme System

5 OKLCH color schemes (crimson/stone/ocean/forest/sunset) + dark/light mode. CSS custom properties defined in `resources/css/markweb.css`. State persisted to `markweb-state` localStorage key. `ThemeContext` (`contexts/theme-context.tsx`) provides React context.

### Chat Routing

- `/chat` — Agent WebSocket chat via Reverb (`Agent\ChatController`), primary chat experience
- `/sse-chat` — Legacy SSE chat (`ChatController`), Prism-based streaming

### MCP Integration (`app/Mcp/`)

Model Context Protocol server with `Prompts/`, `Resources/`, `Servers/`, `Tools/` directories.

## Key Models

`AgentSession`, `AgentMessage`, `Agent`, `Memory`, `Tool`, `ToolExecution` — agent domain. `User`, `UserSetting` — auth domain. `SystemPromptTemplate`, `SystemEvent`, `SharedFile`, `SandboxContainer`, `ScheduledAction`, `InjectionDetection`, `EmailThread` — supporting domain.

## Conventions

- React components: lowercase directories (`components/`, `pages/`, `layouts/`)
- Wayfinder generates `resources/js/actions/` (server actions) and `resources/js/routes/` (route helpers) — do not hand-edit
- Zustand stores in `stores/mail/` for mail state management
- DTOs in `app/DTOs/`, Enums in `app/Enums/` (`ContentSource`, `IntentType`, `SanitizePolicy`, `TriggerType`)
- Type definitions in `resources/js/types/` — `agent.ts`, `mail.ts`, `chat.ts`, `navigation.ts`, `ui.ts`
- Custom React hooks in `resources/js/hooks/` (e.g., `use-jmap-poll`, `use-openclaw`, `use-system-events`)

## Deploy Cycle (MANDATORY)

Every change follows: **commit → push → pull on server → rebuild → clear caches**.

```bash
bin/deploy              # Full deploy: push + pull + build + cache clear
bin/deploy --skip-build # PHP-only changes: skip frontend rebuild
```

**Critical:** Frontend is always built on the server — `VITE_REVERB_*` env vars get baked into JS at build time. Building locally bakes `localhost` values.

The script enforces clean main branch before deploying. SSH always as `markc@mko` (not root) to avoid ownership issues.

## Environment

- `DB_CONNECTION=pgsql` — PostgreSQL
- `REVERB_APP_ID=markweb` — Shared Reverb instance
- `JMAP_URL` — Stalwart JMAP endpoint
- `OLLAMA_URL` — Embedding model endpoint
- `ANTHROPIC_API_KEY` — Primary LLM provider

## Logbook Pattern

- `_journal/` — project-specific dated logs (`YYYY-MM-DD.md`, append after completing work)
- `~/.gh/_notes.md` — cross-project current state summary
- `~/.gh/_journal/` — cross-project operational logs

All work must be logged. Append a new session section to `_journal/YYYY-MM-DD.md` after completing work. Include: what changed, why, any gotchas discovered, and the commit hash.
