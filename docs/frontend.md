# Frontend & DCS Layout

markweb's frontend uses React 19 with TypeScript, Inertia 2 for SPA navigation, Tailwind CSS 4 for styling, and Radix UI for accessible primitives.

## Dual Carousel Sidebars (DCS)

The signature UI pattern: two glassmorphic sidebars with carousel-style panel switching.

### Left Sidebar Panels

| Panel | Purpose |
|-------|---------|
| L1-Nav | Primary navigation |
| L2-Conversations | AI chat session list |
| L3-Docs | Documentation links |
| L4-Mailboxes | JMAP mail folders |

### Right Sidebar Panels

| Panel | Purpose |
|-------|---------|
| R1-Theme | Color scheme + dark/light toggle |
| R2-Usage | API usage stats |
| R3-Notifications | System events |

### Carousel Navigation

Each sidebar has `< [dot dot] >` carousel controls. Dots indicate panel count — active dot stretches to 24px wide, inactive dots are 9px circles. Panels slide horizontally via CSS `translateX` on a track element.

### Glassmorphism

Sidebars use `backdrop-filter: blur(20px)` with semi-transparent OKLCH backgrounds (`--glass` variable). Borders use `--glass-border` for subtle definition.

## Theme System

5 OKLCH color schemes + dark/light mode:

| Scheme | Hue | Character |
|--------|-----|-----------|
| Crimson | H=30 | Vibrant red (default) |
| Stone | H=60 | Warm neutral |
| Ocean | H=220 | Cyan-blue |
| Forest | H=150 | Green |
| Sunset | H=45 | Orange-amber |

CSS custom properties defined in `resources/css/markweb.css`. State persisted to `markweb-state` localStorage key. `ThemeContext` (`contexts/theme-context.tsx`) provides React context.

## Panel Components

Panel components live in `components/panels/`, prefixed by position:

- `l1-nav.tsx`, `l2-conversations.tsx`, `l3-docs.tsx`, `l4-mailboxes.tsx`
- `r1-theme.tsx`, `r2-usage.tsx`, `r3-notifications.tsx`

## Wayfinder

Wayfinder generates type-safe TypeScript helpers:

- `resources/js/actions/` — server action functions
- `resources/js/routes/` — route helper functions

Regenerate after route changes:

```bash
php artisan wayfinder:generate
```

Never hand-edit generated files.

## Zustand Stores

Mail state is managed by Zustand stores in `stores/mail/`:

- `session-store` — JMAP auth session
- `mailbox-store` — mailbox list and selection
- `email-store` — email list, fetching, caching
- `compose-store` — draft composition state
- `ui-store` — UI selection and view state

## Type Definitions

TypeScript types in `resources/js/types/`:

- `agent.ts` — `AgentSession`, `AvailableModels`, stream events
- `mail.ts` — JMAP mail types
- `chat.ts` — chat message types
- `navigation.ts` — sidebar/navigation types
- `ui.ts` — UI state types

## Custom Hooks

Reusable hooks in `resources/js/hooks/`:

- `use-jmap-poll` — JMAP polling for mail updates
- `use-openclaw` — AI agent interaction
- `use-system-events` — real-time system event listener
