# markweb

A unified Laravel 12 + Inertia 2 + React 19 platform consolidating three projects into a single cohesive application.

## What's Inside

**AI Agent Platform** (from laraclaw) — Full-featured AI agent runtime with tool execution, memory, security, sandboxed code execution, and WebSocket streaming via Laravel Reverb.

**JMAP Webmail + PIM** (from laramail) — Stalwart JMAP mail integration with CalDAV/CardDAV via SabreDAV. Zustand-based frontend stores for mail state management.

**Dual Carousel Sidebars (DCS)** — Multi-panel sliding sidebars with glassmorphism effects, carousel dot navigation, and 5 OKLCH color schemes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 8.4+, Laravel 12, Fortify (auth + 2FA) |
| Frontend | React 19, TypeScript, Tailwind CSS 4, Radix UI |
| Real-time | Laravel Reverb (WebSocket streaming) |
| AI | `laravel/ai` with Anthropic as primary LLM |
| Database | PostgreSQL + pgvector (embeddings) + tsvector (full-text) |
| Mail | Stalwart JMAP, `jmap-jam` client library |
| Calendar | SabreDAV (CalDAV/CardDAV) |
| Routing | Wayfinder (type-safe TypeScript routes/actions) |
| Build | Vite, Bun (package manager) |
| Server | FrankenPHP (Caddy) |

## Key Conventions

- React components use lowercase directories (`components/`, `pages/`, `layouts/`)
- Wayfinder generates `resources/js/actions/` and `resources/js/routes/` — never hand-edit
- Zustand stores in `stores/mail/` for mail state
- DTOs in `app/DTOs/`, Enums in `app/Enums/`
- Type definitions in `resources/js/types/`
- Custom hooks in `resources/js/hooks/`

## Development

```bash
composer dev          # All dev services (server, Reverb, queue, logs, Vite)
bun run build         # Production frontend build
php artisan test      # Run all Pest tests
php artisan pint      # Format PHP
```

`composer dev` runs 5 concurrent processes: artisan serve, Reverb WebSocket, queue worker, Pail log tail, and Vite dev server.
