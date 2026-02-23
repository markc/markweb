# markweb — Unified Web Platform

## Logbook Pattern
- `~/.gh/_notes.md` — current state summary (read at session start, update in place)
- `~/.gh/_journal/` — dated operational logs (`YYYY-MM-DD.md`, append after completing work)

## Project Overview

markweb is a unified Laravel 12 + Inertia 2 + React 19 platform consolidating:
- **AI Agent Platform** (from laraclaw) — AgentRuntime, Memory, Security, Routines, Sandbox, Tools
- **JMAP Webmail + PIM** (from laramail) — Stalwart JMAP, CalDAV/CardDAV via SabreDAV
- **Dual Carousel Sidebars (DCS)** — Multi-panel sliding sidebars with glassmorphism

## Tech Stack

- PHP 8.4+, Laravel 12, Inertia 2
- React 19, TypeScript, Tailwind CSS 4
- `laravel/ai` for LLM integration
- Laravel Reverb for WebSocket streaming (chat + real-time events)
- Fortify for auth + 2FA
- Wayfinder for TypeScript route generation
- PostgreSQL + pgvector (embeddings) + tsvector (full-text search)
- Bun as package manager

## Commands

```bash
composer dev              # Start Reverb + queue + logs + Vite
bun run build             # Rebuild frontend assets
bun run dev               # Vite dev server
php artisan migrate       # Run migrations
php artisan test --compact # Run Pest tests
```

## Architecture

### Backend Domains
- **Agent/** — AgentRuntime, sessions, messages, tool execution, memory search
- **Mail/** — JMAP webmail (Stalwart), compose, attachments
- **Dav/** — CalDAV/CardDAV via SabreDAV
- **Security/** — Content sanitizer, injection audit
- **Sandbox/** — Proxmox CT pool for code execution

### DCS Layout
Each sidebar has multiple panels navigable via `< [dot·dot] >` carousel controls:
- **Left:** L1-Nav, L2-Conversations, L3-Agent, L4-Mailboxes, L5-Docs
- **Right:** R1-Theme, R2-Usage, R3-Notifications, R4-Settings

### Theme System
5 OKLCH color schemes (crimson/stone/ocean/forest/sunset) + dark/light mode.
Persisted to `markweb-state` localStorage key.

### Chat Streaming
Uses Reverb WebSocket via Laravel Echo — real-time bi-directional streaming.
NOT SSE — uses broadcastNow() for token-by-token streaming.

## Environment

- `DB_CONNECTION=pgsql` — PostgreSQL on 192.168.2.210
- `REVERB_APP_ID=markweb` — Shared Reverb instance
- `JMAP_URL` — Stalwart JMAP endpoint
- `OLLAMA_URL` — Embedding model endpoint
- `ANTHROPIC_API_KEY` — Primary LLM provider

## Conventions

- React components: lowercase directories (`components/`, `pages/`, `layouts/`)
- Radix UI primitives in `components/ui/`
- Panel components in `components/panels/`
- Zustand stores in `stores/mail/`
- Wayfinder actions in `actions/`, routes in `routes/`
- CSS custom properties in `resources/css/markweb.css`
