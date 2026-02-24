# Deploy

markweb runs on FrankenPHP (Caddy) with a git-based deployment workflow.

## Server

- **Host:** mko (192.168.2.210)
- **App path:** `/srv/markweb.kanary.org/web/app/`
- **Web server:** FrankenPHP (Caddy v2.10.2) runs as `markc:markc`
- **URL:** `https://markweb.kanary.org`
- **Domain:** `*.kanary.org` wildcard via OpenWrt dnsmasq

## Deploy Cycle

Every change follows: **commit, push, pull on server, rebuild, clear caches**.

```bash
# Quick deploy
bin/deploy              # Full: push + pull + build + cache clear
bin/deploy --skip-build # PHP-only changes: skip frontend rebuild
```

### Manual Steps

```bash
# 1. Commit and push
git add <files> && git commit -m "message" && git push

# 2. Pull on server
ssh markc@mko 'cd /srv/markweb.kanary.org/web/app && git pull'

# 3. Build ON SERVER
ssh markc@mko 'export PATH="$HOME/.bun/bin:$PATH" && cd /srv/markweb.kanary.org/web/app && bun run build'

# 4. Clear caches
ssh markc@mko 'cd /srv/markweb.kanary.org/web/app && php artisan route:cache && php artisan config:cache'
```

## Critical Gotchas

### Build on Server, Not Locally

`VITE_REVERB_*` environment variables are **baked into JavaScript at build time**. Building locally embeds `localhost` values, breaking WebSocket connections in production.

Always build on the server where the correct `.env` values exist.

### SSH as markc, Not root

Production is a git clone. SSH as `markc@mko` (not root) to avoid file ownership issues. FrankenPHP runs as `markc:markc`.

### Artisan Commands

Run artisan commands as the app user:

```bash
sudo -u markc php artisan migrate
```

### Never rsync public/hot

The `public/hot` file tells Laravel to use Vite dev server. Never sync it to production.

### Bun PATH

`bun` is not in PATH for non-login SSH sessions. Always prefix with:

```bash
export PATH="$HOME/.bun/bin:$PATH"
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DB_CONNECTION=pgsql` | PostgreSQL database |
| `REVERB_APP_ID=markweb` | Shared Reverb instance |
| `JMAP_URL` | Stalwart JMAP endpoint |
| `OLLAMA_URL` | Embedding model endpoint |
| `ANTHROPIC_API_KEY` | Primary LLM provider |

## SSL

Wildcard certificate for `*.kanary.org` at `/etc/ssl/kanary.org/`. The private key must be readable by both `markc` (FrankenPHP) and `stalwart` user — use `chmod 644`.

## Caddyfile

Located at `/etc/caddy/Caddyfile`. Handles:

- `markweb.kanary.org` — main application
- `mail.kanary.org` — Stalwart JMAP proxy
- Wildcard TLS with the shared certificate
