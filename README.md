# markweb

A unified command-and-control platform for personal infrastructure, AI agents, and communications — built on Laravel 12, Inertia 2, and React 19.

## What is markweb?

markweb consolidates three previously separate projects into a single mesh-aware application:

- **AI Agent Platform** — Multi-model chat with tool use, sandboxed code execution, memory, and routines. Built on `laravel/ai` with Anthropic as the primary provider.
- **JMAP Webmail & PIM** — Full email client backed by Stalwart Mail Server (JMAP), with CalDAV/CardDAV contacts and calendars via SabreDAV.
- **Mesh C&C** — Real-time dashboard for a WireGuard-connected cluster of nodes, with 30-second heartbeats, status broadcasting, and centralised oversight.

The UI uses a **Dual Carousel Sidebar** layout — two independently navigable sliding panels (mail, conversations, docs, settings) flanking a central workspace, styled with OKLCH colour schemes and glassmorphism.

## Why?

Too many tabs. Too many logins. Too many single-purpose tools that don't talk to each other.

markweb exists because managing a personal infrastructure mesh — mail servers, DNS, backups, AI models, WebSocket channels — shouldn't require context-switching between a dozen disconnected interfaces. One app, one login, one place to see everything.

The `web.*` subdomain convention reflects this: `web.motd.com`, `web.kanary.org`, `web.goldcoast.org` — each node's C&C entry point, gated by HTTP basic auth before you even reach the login page.

## Architecture

```
Laravel 12 + Inertia 2 + React 19 + TypeScript
├── Agent/        AI runtime, tool execution, session management
├── Mail/         JMAP client (Stalwart), message threading
├── Memory/       pgvector embeddings, semantic search
├── Security/     Content sanitisation, injection detection
├── Sandbox/      Proxmox CT pool for code execution
├── Routines/     Scheduled agent actions
├── Tools/        Bash, HTTP, DateTime (extensible)
└── Dav/          SabreDAV CalDAV/CardDAV backends
```

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
| LLM | Anthropic Claude (via laravel/ai) |
| Package manager | Bun |

## Mesh deployment

markweb runs as a replicated instance across multiple nodes, each with its own local database, mail server, and Ollama instance. Nodes heartbeat every 30 seconds to the central dashboard (mko) over WireGuard and broadcast state via Reverb.

| Node | URL | Role |
|------|-----|------|
| mko | `web.kanary.org` | Production primary |
| mmc | `web.motd.com` | Production node |
| cachyos | `web.goldcoast.org` | Dev workstation |

Identity is config-driven — each node reads `MESH_NODE_NAME` and `MESH_NODE_WG_IP` from `.env`.

## Getting started

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

```bash
composer dev    # Starts server, Reverb, queue worker, Pail logs, Vite
```

## Origin story

markweb was born on **23 February 2026** in a single intense weekend session. Three existing Laravel projects — **laraclaw** (AI agents), **laramail** (JMAP webmail), and a mesh monitoring prototype — were merged into one unified platform.

The concept, architecture, and every line of code were created by **Mark Constable** ([@markc](https://github.com/markc)), working in close collaboration with **Claude Code** (Anthropic's AI coding agent). What would normally be weeks of integration work — unifying service layers, resolving namespace conflicts, building a coherent UI, deploying across three nodes — was accomplished in days through continuous human-AI pair programming.

This is software built the way it should be: one person's vision, executed at the speed of thought.

## Documentation

[markweb.dev](https://markweb.dev) — project docs and interactive explainers (GitHub Pages).

## Licence

[MIT](https://opensource.org/licenses/MIT)
