# NodeMesh Daemon Design — `meshd`

> Single Rust binary handling WebSocket mesh (AMP control plane) and future WebRTC (binary data plane).

## Overview

`meshd` is a long-running daemon on each mesh node. It maintains persistent WebSocket connections to peer nodes over WireGuard, frames all messages in AMP format, and exposes a local unix socket API for Laravel to send/receive mesh traffic.

```
                        WireGuard tunnel
    ┌──────────┐  ◄──── WebSocket (AMP) ────►  ┌──────────┐
    │  meshd   │                                │  meshd   │
    │ (cachyos)│  ◄──── WebRTC (binary) ────►   │  (mko)   │
    └────┬─────┘                                └────┬─────┘
         │ unix socket                               │ unix socket
    ┌────┴─────┐                                ┌────┴─────┐
    │  Laravel │                                │  Laravel │
    └──────────┘                                └──────────┘
```

## Architecture

### Three Layers in One Binary

1. **Peer mesh** — WebSocket server (accept inbound) + client (connect outbound) per peer. Connections are persistent, auto-reconnecting, and multiplexed (heartbeat + commands + events on the same connection). All traffic is AMP-framed.

2. **Local bridge** — Unix socket HTTP server (`/run/meshd.sock`). Laravel sends AMP messages via POST, receives inbound messages via long-poll or callback. This is the only interface between PHP and the mesh.

3. **WebRTC engine** (Phase 5) — Data channels for binary streams, signalled over the AMP WebSocket connections. Same binary, same process, same peer registry.

### Peer Connection Lifecycle

```
meshd starts
  → reads config (peers from TOML or DNS SRV)
  → for each peer:
      → spawn connect task (tokio)
      → WebSocket handshake to ws://{wg_ip}:{port}/mesh
      → send: ---\namp: 1\ntype: event\nfrom: {self}\ncommand: hello\n---\n
      → receive peer's hello (registers capabilities)
      → enter message loop:
          → every 15s: send empty AMP (---\n---\n) as keepalive
          → forward inbound AMP to bridge
          → accept outbound AMP from bridge, send to peer
      → on disconnect: backoff retry (1s, 2s, 4s, 8s, max 30s)
```

Both sides attempt to connect. Duplicate connection resolution: lower WG IP wins (keeps its outbound connection, the other side drops theirs). Simple, deterministic, no coordination needed.

### AMP Framing on WebSocket

Each WebSocket **text frame** contains exactly one AMP message. The `---\n...\n---\n` delimiters are present in every frame (not stripped). This means:

- A raw `websocat` connection shows human-readable AMP
- No length-prefix or binary framing needed — WebSocket already handles message boundaries
- Empty AMP (`---\n---\n`) fits in a single small frame

Binary WebSocket frames are reserved for future WebRTC signaling or raw data passthrough.

## Project Structure

```
~/.gh/nodemesh/
├── Cargo.toml              # workspace root
├── CLAUDE.md               # project instructions
├── README.md
├── _doc/                   # design docs
├── config/
│   └── meshd.example.toml  # example config
├── crates/
│   ├── meshd/              # the daemon binary
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── main.rs           # entry point, config loading, tokio runtime
│   │       ├── config.rs         # TOML config parsing
│   │       ├── peer/
│   │       │   ├── mod.rs        # peer module
│   │       │   ├── manager.rs    # peer registry, connection lifecycle
│   │       │   ├── connection.rs # single WebSocket connection (read/write loops)
│   │       │   └── resolver.rs   # resolve peers from config or DNS SRV
│   │       ├── bridge/
│   │       │   ├── mod.rs        # bridge module
│   │       │   ├── server.rs     # unix socket HTTP server (axum)
│   │       │   └── callback.rs   # POST inbound messages to Laravel
│   │       ├── server.rs         # WebSocket accept server (inbound peers)
│   │       └── metrics.rs        # basic stats (connections, messages, uptime)
│   └── amp/                # AMP parser library (shared with future tools)
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs            # public API
│           ├── message.rs        # AmpMessage struct, parse, serialize
│           ├── address.rs        # port.app.node.amp parsing
│           └── validate.rs       # header validation
└── systemd/
    └── meshd.service       # systemd unit file
```

### Why a Workspace

- `amp` crate is reusable — future CLI tools, appmesh integration, test harnesses can depend on it
- `meshd` is the only binary for now, but the workspace allows adding `meshctl` (CLI) or `meshd-webrtc` later without restructuring

## Crate Dependencies

### `amp` (library)

```toml
[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v7"] }
```

Zero async dependencies — pure parsing, usable anywhere.

### `meshd` (binary)

```toml
[dependencies]
amp = { path = "../amp" }
tokio = { version = "1", features = ["full"] }
tokio-tungstenite = "0.24"
axum = { version = "0.8", features = ["ws"] }
hyper = { version = "1", features = ["client"] }
hyper-util = "0.1"
tower = "0.5"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
toml = "0.8"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
uuid = { version = "1", features = ["v7"] }

# Phase 5 (commented out until needed)
# str0m = "0.7"
```

## Configuration

```toml
# /etc/meshd/meshd.toml (or ~/.config/meshd/meshd.toml for dev)

[node]
name = "cachyos"
wg_ip = "172.16.2.5"
listen = "0.0.0.0:9800"           # WebSocket server for inbound peers

[bridge]
socket = "/run/meshd.sock"         # unix socket for Laravel
callback_url = "http://127.0.0.1:8000/api/mesh/inbound"  # POST inbound messages here

[peers]
# Static peer list — DNS SRV discovery layered on top later (Phase 4)
[peers.mko]
wg_ip = "172.16.2.210"
port = 9800

[peers.mmc]
wg_ip = "172.16.2.9"
port = 9800

[log]
level = "info"                     # RUST_LOG override: meshd=debug
```

Port 9800 is arbitrary — above ephemeral range, not conflicting with FrankenPHP (443), Reverb (8080), Stalwart (8443), or PostgreSQL (5432).

## Laravel Bridge Interface

### Outbound: Laravel → meshd (via unix socket)

Laravel POSTs raw AMP messages to meshd's unix socket. The HTTP layer is just transport — the body is the AMP message verbatim.

```
POST /send HTTP/1.1
Content-Type: text/x-amp

---
amp: 1
type: request
id: 0192b3a4-5e6f-7890-abcd-ef1234567890
from: agent.markweb.cachyos.amp
to: agent.markweb.mko.amp
command: dispatch
args: {"type": "prompt", "model": "claude-sonnet-4-6"}
ttl: 60
---
Summarise the last 24 hours of system events.
```

Response:

```
HTTP/1.1 202 Accepted
X-Mesh-Id: 0192b3a4-5e6f-7890-abcd-ef1234567890
```

The 202 means meshd accepted the message for delivery. It does NOT mean the peer received it. Delivery confirmation comes as a separate AMP response routed back through the bridge.

### Inbound: meshd → Laravel (via HTTP callback)

When meshd receives an AMP message from a peer that's addressed to a local port (e.g., `*.markweb.cachyos.amp`), it POSTs the raw AMP to Laravel's callback endpoint:

```
POST /api/mesh/inbound HTTP/1.1
Content-Type: text/x-amp
X-Mesh-From: agent.markweb.mko.amp
X-Mesh-Peer: mko

---
amp: 1
type: response
id: 0192b3a4-9f8e-7654-3210-fedcba987654
from: agent.markweb.mko.amp
reply-to: 0192b3a4-5e6f-7890-abcd-ef1234567890
command: dispatch
---
System events summary: 3 deployments, 1 certificate renewal...
```

Laravel processes this with a new `MeshInboundController` — parses AMP, routes to the appropriate handler (task callback, heartbeat update, event broadcast to browsers via Reverb).

### Status: meshd → Laravel (on request)

```
GET /status HTTP/1.1
```

Returns JSON (not AMP — this is operational, not mesh traffic):

```json
{
  "node": "cachyos",
  "uptime_secs": 86400,
  "peers": {
    "mko": { "state": "connected", "latency_ms": 12, "last_message": "2026-03-02T10:30:00Z" },
    "mmc": { "state": "reconnecting", "attempts": 3, "last_seen": "2026-03-02T10:29:45Z" }
  },
  "messages": { "sent": 1234, "received": 5678, "dropped": 0 }
}
```

### Bridge Summary

| Direction | Transport | Format | Endpoint |
|-----------|----------|--------|----------|
| Laravel → meshd | HTTP POST to unix socket | Raw AMP body | `POST /send` |
| meshd → Laravel | HTTP POST to localhost | Raw AMP body | `POST /api/mesh/inbound` |
| Status query | HTTP GET to unix socket | JSON | `GET /status` |
| Peer-to-peer | WebSocket over WireGuard | AMP text frames | `ws://{wg_ip}:9800/mesh` |

## Laravel Changes (in markweb)

### New: `MeshBridgeService`

Replaces the current HTTP-based `MeshTaskService` for sending messages. Talks to meshd's unix socket.

```php
// app/Services/Mesh/MeshBridgeService.php
class MeshBridgeService
{
    public function send(AmpMessage $message): string  // returns message ID
    {
        $response = Http::baseUrl('http://meshd')
            ->withOptions(['curl' => [CURLOPT_UNIX_SOCKET_PATH => '/run/meshd.sock']])
            ->withBody($message->toWire(), 'text/x-amp')
            ->post('/send');

        return $response->header('X-Mesh-Id');
    }

    public function status(): array
    {
        return Http::baseUrl('http://meshd')
            ->withOptions(['curl' => [CURLOPT_UNIX_SOCKET_PATH => '/run/meshd.sock']])
            ->get('/status')
            ->json();
    }
}
```

### New: `AmpMessage` DTO

```php
// app/DTOs/AmpMessage.php
class AmpMessage
{
    public function __construct(
        public array $headers,
        public string $body = '',
    ) {}

    public static function parse(string $raw): self { /* existing amp_parse() logic */ }
    public function toWire(): string { /* serialize to ---\n...\n---\n format */ }
}
```

### New: `POST /api/mesh/inbound`

```php
// routes/api.php
Route::post('/mesh/inbound', [MeshInboundController::class, 'receive'])
    ->middleware('mesh.local');  // only accept from 127.0.0.1
```

The controller parses the AMP message and routes by `command`:
- `heartbeat` → update MeshNode, broadcast MeshNodeUpdated via Reverb
- `dispatch` → create MeshTask, queue ProcessMeshTask
- `dispatch.result` → complete MeshTask, trigger chain/fan-out
- Other → log and forward to appropriate service

### Remove: HTTP heartbeat scheduler

The `mesh:self-heartbeat`, `mesh:sync-from-primary`, and `mesh:offline-detection` scheduled commands become unnecessary. Connection state in meshd IS the heartbeat. meshd sends periodic status updates to Laravel via the callback, or Laravel polls `/status`.

### Keep: Reverb for browsers

Reverb continues broadcasting `MeshNodeUpdated` and `MeshTaskUpdated` to browser clients. The data flow changes from:

```
Before: Scheduler → DB write → Event → Reverb → Browser
After:  meshd callback → MeshInboundController → Event → Reverb → Browser
```

Same browser experience, but driven by real-time mesh events instead of polling.

## Systemd Unit

```ini
# /etc/systemd/system/meshd.service
[Unit]
Description=NodeMesh Daemon
After=network.target wg-quick@wg0.service
Wants=wg-quick@wg0.service

[Service]
Type=notify
ExecStart=/usr/local/bin/meshd --config /etc/meshd/meshd.toml
Restart=always
RestartSec=5
RuntimeDirectory=meshd
# Socket created at /run/meshd/meshd.sock (RuntimeDirectory ensures dir exists)

# Security hardening
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes

[Install]
WantedBy=multi-user.target
```

## Phase Mapping

| Phase | What meshd does | What Laravel does |
|-------|----------------|-------------------|
| 2 | WebSocket connections + empty AMP keepalive | Reads `/status` for peer liveness, removes scheduler heartbeats |
| 3 | Full AMP framing, route by `to:` address | Sends/receives AMP via bridge, replaces HTTP task dispatch |
| 4 | Reads DNS SRV for peer discovery (replaces static config) | Registers ports via `pdnsutil` on startup |
| 5 | WebRTC data channels via `str0m`, signalled over AMP | Requests binary transfers via AMP commands |
| 6 | AI agents connect as WebSocket clients to meshd | Agent sessions are AMP addresses |
