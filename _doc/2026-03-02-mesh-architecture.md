# NodeMesh — Architecture & Design Guide

> A programmable, self-healing mesh of nodes where humans, machines, and AI agents are all first-class participants.

**NodeMesh** is the umbrella project unifying two components:

- **appmesh** — desktop node automation (Rust, QML, D-Bus, KDE integration)
- **markweb** ("markdown web") — headless server nodes (Laravel, WebSocket, WireGuard)

Each can operate independently. Together they form a mesh where desktop apps, server services, browser tabs, and AI agents are all scriptable nodes speaking the same protocol.

This document captures the design philosophy, architectural decisions, and lessons learned. It complements the [AMP Protocol Specification](https://github.com/markc/appmesh/blob/main/_doc/2026-02-28-amp-protocol-specification.md) which defines the wire format and port addressing. This guide covers the *why* — the AMP spec covers the *what*.

---

## 1. What We're Building

A personal mesh of cooperating programs, inspired by the Amiga's ARexx. On the Amiga, every serious application exposed a named port. A three-line script could orchestrate a paint program, a word processor, and a file manager. No APIs, no SDKs — just send commands to named ports in a common language.

NodeMesh recreates this for modern Linux desktops, extended across machines over WireGuard and into browsers over WebSocket. The end goal:

- Any application on any node, scriptable from PHP
- Any browser can address any port on any node
- AI agents participate as first-class mesh nodes, not wrapped tool consumers
- The desktop becomes programmable the way the Amiga was, but networked

### What "mesh" means here

Not a service mesh (Istio/Linkerd). Not a mesh network (ad-hoc wireless routing). This is a **command mesh** — a network of named ports that accept commands and return results, addressable by DNS-style names, routed over WireGuard between servers and over WebSocket to browsers. The closest analogy is ARexx ports, but spanning multiple machines and accessible to AI agents.

---

## 2. The Three-Reader Principle

*This is the single most important design decision in the system.*

Every message, every event, every response in the mesh must be simultaneously useful to three readers:

1. **Machines** — deterministic header parsing for routing, dispatch, and filtering. A router reads `to:`, `from:`, `command:` and forwards. No understanding required.
2. **Humans** — readable with `cat`, searchable with `grep`, renderable in any markdown viewer. A developer debugging at 2am reads the message and knows what happened.
3. **AI agents** — natural language comprehension without schema definitions. An agent reads the full message — headers and body — and reasons about it as text.

This is not a nice-to-have. It is the core constraint that drives every format decision.

### Why this matters in practice

Traditional protocols serve one reader well and force the others through translation layers:

| Protocol | Machine | Human | AI Agent |
|----------|---------|-------|----------|
| protobuf/gRPC | Native | Opaque binary | Needs SDK wrapper + schema docs |
| JSON-RPC (MCP) | Native | Readable but verbose | Needs tool definitions + JSON schemas |
| MQTT | Native | Topics readable, payloads often binary | Needs topic documentation |
| AMP | Headers route deterministically | `cat message.amp.md` | Reads natively — it's markdown |

An AI agent consuming an AMP event stream pays ~60% fewer tokens than the equivalent JSON-RPC representation, while gaining more context, not less. The markdown body is the format LLMs were trained on billions of tokens of.

### The boundary rule

**Headers route. Bodies reason.** A dumb router must never need to parse the body. An agent should never need to understand headers to reason about content. The same message works for a stateless forwarder (parse three headers, dispatch) AND a reasoning agent (read everything, think about it). Requiring LLM inference in the routing path would make the system slow, expensive, and non-deterministic.

### AI agents as mesh nodes

An AI agent connected to the mesh via WebSocket is a first-class participant:

- **No tool definition maintenance** — when a new port appears, the agent discovers it through port listings (which are AMP messages). No JSON schema to update, no MCP tool registration.
- **Self-describing commands** — `command: search`, `args: {"query": "invoices"}`, `from: inbox.stalwart.mko.amp` tells the agent what this does without documentation.
- **Multi-agent coordination becomes conversation** — two agents on different nodes exchanging AMP messages are passing structured text to each other. The headers handle routing; the bodies handle reasoning.
- **MCP becomes optional** — MCP remains valuable for Claude Code integration (it's Anthropic's standard), but agents running inside markweb can speak AMP natively, bypassing the JSON-RPC translation layer entirely.

---

## 3. Node Architecture

### Two tiers of participants

| Tier | Connection | Trust | Lifecycle |
|------|-----------|-------|-----------|
| **Server nodes** | Always-on, WireGuard-connected | Trusted (shared WG + bearer token) | Permanent |
| **Browser nodes** | WebSocket through a server node | Untrusted (authenticated per-session) | Ephemeral |

**Server nodes** run the full stack: FrankenPHP, PostgreSQL + pgvector, Ollama, Laravel Reverb, PowerDNS, systemd scheduler. They route traffic for browser nodes and maintain the authoritative port registry. Current server nodes:

| Node | URL | WireGuard IP | Role |
|------|-----|-------------|------|
| cachyos | web.goldcoast.org | 172.16.2.5 | Dev workstation |
| mko | web.kanary.org | 172.16.2.210 | Production primary |
| mmc | web.motd.com | 172.16.2.9 | Production node |

**Browser nodes** are any browser tab with mesh access. They connect to their nearest server node via Reverb WebSocket and never touch WireGuard. A browser says "route this to `clipboard.appmesh.mko.amp`" — the server node resolves the address and forwards. This mirrors DNS: stub resolvers ask recursive resolvers, they don't query root servers directly.

Browser nodes can:
- Subscribe to mesh events
- Execute commands on ports they're authorised for
- Potentially expose their own ports (clipboard, notifications, camera/mic via WebRTC)

Per-port ACLs — enforced via Laravel auth + Reverb channel authorisation — control what each browser session can read or write.

### Why three nodes, not two

Two nodes is a pipe — you can only test point-to-point communication. Three is the minimum topology where mesh properties emerge:
- Routing: node C discovers node A is down via node B
- Split-brain: two nodes disagree about the third's status
- Discovery: a new port registered on A must propagate to B and C
- Failure modes: what happens when the node you're connected through goes down

The three-node triangle is a test harness for discovering protocol bugs cheaply, before the architecture scales to 30+ nodes (where bugs become expensive).

### Scaling model

With browsers as mesh participants, the node count can grow from 3 to hundreds. This is why DNS-style discovery matters from the start — not because 3 nodes need it, but because the abstraction must be in place before browsers join.

- **Primary** (mko) — authoritative registry of all server nodes, their ports, and capabilities
- **Secondaries** (mmc, gc) — replicate the registry, answer discovery queries locally
- **Browser nodes** — query their connected server node, which either answers from cache or forwards to primary

This is how DNS works. It works because it's been battle-tested for 40 years.

---

## 4. The Three Planes

The mesh architecture separates three concerns:

### Control plane — AMP over WebSocket

Commands, events, heartbeats, discovery, text data. This is where AMP messages flow. The control plane handles:

- Port commands (`command: get`, `command: send`, `command: search`)
- Event notifications (`type: event`, `from: tts.appmesh.cachyos.amp`)
- Mesh heartbeats (the empty message `---\n---\n` as keepalive)
- Port discovery (port listings, capability announcements)
- WebRTC signalling (SDP offers/answers, ICE candidates)

Two WebSocket flavours serve different tiers:

| Path | Protocol | Use case |
|------|----------|----------|
| Server ↔ server | Raw WebSocket over WireGuard | Mesh control, no Pusher overhead |
| Server ↔ browser | Reverb (Pusher protocol) | End-user access, channel auth, presence |

Server-to-server communication uses raw WebSocket because Laravel Reverb implements the Pusher protocol, which adds channel semantics, presence tracking, and auth handshakes designed for browser clients. Between trusted servers on WireGuard, this overhead adds latency and complexity without benefit.

### Data plane — WebRTC

Binary streams: audio, video, screen share, file transfer. WebRTC provides:

- **UDP transport** — low latency over reliability. A dropped audio frame is better than a 500ms buffered one.
- **Selectable reliability** — reliable data channels for files, unreliable for audio meters, on the same connection.
- **Built-in codecs** — browser-side Opus, VP8/VP9/AV1 natively. TTS audio streams directly without transcoding.
- **NAT traversal** — ICE/STUN for browser nodes that aren't on WireGuard.

WebRTC connections bootstrap over the AMP control plane:

1. Initiator sends AMP request with SDP offer in body
2. Responder sends AMP response with SDP answer + ICE candidates
3. WebRTC data channel opens — binary streams flow directly
4. AMP control plane continues alongside on WebSocket

This keeps AMP clean (text-only, human-readable, debuggable) while WebRTC handles the binary heavy-lifting.

**Server-to-server WebRTC exists** — SFU media servers (Janus, mediasoup, Pion, `webrtc-rs`) all run server-side. WebRTC is a protocol stack (ICE + DTLS + SRTP/SCTP), not a browser API. The Rust core (`libappmesh_core.so`) can use `webrtc-rs` for server-to-server binary channels.

### Identity plane — DNS-like discovery

Port registration, node registry, ACLs. Addresses use the AMP DNS scheme:

```
[port].[app].[node].amp

clipboard.appmesh.cachyos.amp   → clipboard port, appmesh app, cachyos node
compose.laramail.mmc.amp        → compose action on laramail on mmc
inbox.stalwart.mko.amp          → inbox on Stalwart mail on mko
```

The evolution path:

1. **Today:** flat port names, local only (`appmesh port clipboard get`)
2. **Next:** JSON endpoint on each server returning known ports and capabilities
3. **Target:** PowerDNS SRV records registered when ports come online, full DNS resolution

Local calls never touch DNS. Remote calls resolve lazily on first use, cache the route. Browser nodes never resolve directly — they ask their server node.

---

## 5. Why Not Just X?

### Why not HTTP POST for everything?

This was the original approach — nodes POST heartbeats every 30 seconds over WireGuard. It worked until it didn't.

**The incident:** Three nodes sending heartbeat POSTs every 30s, each broadcast via Laravel's database queue. The queue worker fell behind, accumulating 8,489 stale jobs. The worker spent all its CPU draining the backlog instead of processing live events, creating a cascading feedback loop of MeshNodeUpdated broadcasts at ~2/second.

**Root causes:**
1. HTTP POST heartbeats are fire-and-forget — no backpressure mechanism
2. Database queue adds latency and a failure mode (queue backlog) between sender and consumer
3. No way to detect that a node is down until 90 seconds of missed heartbeats (the offline-detection timer)
4. Broadcasting on every heartbeat POST (not just state changes) amplified the problem O(N) per tick

**What persistent WebSocket connections fix:**
- Instant connection-loss detection — a dropped socket is a dropped socket, no 90-second timer
- No database queue involvement — messages flow directly on the connection
- Natural backpressure — if the consumer can't keep up, the TCP window fills
- Connection state IS health state — no separate heartbeat mechanism needed (though AMP empty messages serve as keepalives)

### Why not WebRTC for everything?

WebRTC data channels can carry text — SCTP supports reliable, ordered delivery, functionally identical to WebSocket. But:

| Concern | WebSocket | WebRTC-only |
|---------|-----------|-------------|
| Connection setup | ~50ms (TCP + HTTP upgrade) | ~500ms-2s (ICE + DTLS + SCTP) |
| Signalling | Not needed | Needs a signalling server... which is a WebSocket |
| Laravel integration | Reverb is first-party | Nothing exists |
| PHP libraries | Ratchet, Reverb, Swoole | No PHP WebRTC library exists |
| Debugging | `websocat`, browser devtools | `chrome://webrtc-internals`, opaque DTLS |
| Firewalls | Works through any HTTP proxy | Many block UDP |
| Reconnection | Reconnect to URL | Full ICE renegotiation |

**The bootstrap problem is the killer.** WebRTC connections require out-of-band signalling (SDP exchange, ICE candidates). That signalling channel is almost universally a WebSocket. "WebRTC only" means "WebRTC + a WebSocket you pretend doesn't count."

WebSocket and WebRTC were designed to work together — WebSocket for signalling, WebRTC for media. Fighting that design creates work, not eliminates it.

### Why not Reverb for server-to-server?

Reverb implements the Pusher protocol, designed for browser → server connections. It adds:
- Channel subscription handshakes
- Presence tracking
- Per-channel auth callbacks
- Pusher-specific framing

Between trusted servers on WireGuard, this overhead adds latency without benefit. Raw WebSocket with AMP framing is lighter and gives full control over the connection lifecycle (reconnection, backpressure, keepalive intervals).

Reverb remains the right choice for browser-facing connections because it provides channel auth and presence for free — exactly what browser nodes need.

### Why not protobuf/msgpack/CBOR?

Binary formats optimise for throughput and payload size. AMP optimises for the Three-Reader Principle. At the message rates a personal mesh generates (hundreds per second at peak, not millions), the ~2x size overhead of text vs binary is irrelevant. The debuggability advantage — `tcpdump | strings` and read the messages at 2am — is not.

For binary payloads (audio, video, files), WebRTC data channels handle it natively. AMP doesn't need to carry binary because the data plane exists specifically for that purpose.

---

## 6. Self-Healing Architecture

The mesh must detect and recover from failures without human intervention.

### Failure detection

| Failure | Detection mechanism | Time to detect |
|---------|-------------------|----------------|
| Node crash | WebSocket connection drops (TCP RST/FIN) | Immediate (~1s) |
| Network partition | WebSocket keepalive timeout | ~30s (configurable) |
| Process hang | AMP empty message timeout (no keepalive response) | Configurable (e.g. 60s) |
| Port failure | Command response timeout or error response | Per-command TTL |

Persistent WebSocket connections make failure detection a property of the transport, not a polling mechanism. A dropped socket is unambiguous — no "is it down or just slow?" uncertainty.

### Recovery strategy

1. **Exponential backoff + jitter** — reconnect attempts at 1s, 2s, 4s, 8s... with random jitter to prevent thundering herd when a node restarts and all peers reconnect simultaneously.
2. **State reconciliation on reconnect** — when a connection re-establishes, exchange full port listings and node state. Don't assume the other side remembers anything.
3. **Graceful degradation** — if a remote port is unreachable, return an error to the caller. Don't block waiting for recovery. The caller (human, machine, or agent) decides whether to retry, use a different node, or give up.
4. **No single point of failure** — the primary (mko) holds authoritative state, but secondaries cache it. If primary is down, secondaries serve stale-but-usable discovery data. When primary returns, it re-syncs.

### What NOT to build

- **Consensus protocols** (Raft, Paxos) — overkill for a 3-node personal mesh. Primary-secondary replication is sufficient.
- **Automatic failover** — if mko goes down, mmc doesn't become primary. The system degrades gracefully (cached data, direct connections still work) until mko returns.
- **Distributed transactions** — ports are stateless command handlers, not databases. If a command fails, retry it. No two-phase commit needed.

---

## 7. The AMP Wire Format

AMP messages use markdown frontmatter as the wire format — `---` delimited headers with an optional freeform body. The full specification lives in the [AMP Protocol Specification](https://github.com/markc/appmesh/blob/main/_doc/2026-02-28-amp-protocol-specification.md). Key properties:

- **One parser, three message shapes** — full (headers + markdown body), command (headers only), data (minimal `json:` header). Parsed identically.
- **8 bytes minimum** — the empty message (`---\n---\n`) serves as heartbeat, ACK, NOP.
- **Trivial parsers** — ~10 lines in PHP, ~8 lines in Rust. No dependencies.
- **Stream-friendly framing** — `---\n` as delimiter handles message boundaries on a byte stream naturally.
- **No YAML** — looks like YAML frontmatter but is intentionally restricted to flat `key: value` lines. No indentation, no nesting, no type coercion surprises.

### Known constraints

- **Text-only** — no binary payload support. Binary goes over WebRTC data channels.
- **Single-line JSON values** — `args:` and `json:` headers carry inline JSON that must not contain literal newlines (would break line-oriented parsing). Enforced by serialisation, not validated by the parser.
- **TTL is advisory** — `ttl: 30` is defined but requires infrastructure (routers, queues) to enforce. On direct WebSocket, messages arrive instantly or not at all.

---

## 8. Technology Stack

### Per-node stack

Every server node runs the same software:

| Component | Purpose |
|-----------|---------|
| FrankenPHP (Caddy) | Web server + HTTPS + reverse proxy |
| Laravel 12 + Inertia 2 + React 19 | Application framework |
| PostgreSQL + pgvector | Database + embeddings |
| Ollama (nomic-embed-text) | Local embedding generation |
| Laravel Reverb | WebSocket server (browser-facing) |
| PowerDNS | DNS for `.amp` zone (port discovery) |
| Stalwart Mail | JMAP + CalDAV + CardDAV |
| WireGuard | Encrypted node-to-node tunnel |

### AppMesh components

| Component | Language | Purpose |
|-----------|----------|---------|
| `libappmesh_core.so` | Rust | Port implementations (clipboard, input, notify, screenshot, windows) |
| MCP server | PHP | 10 plugins, 56 tools for Claude Code integration |
| QML plugin + plasmoids | C++ / QML | KDE Plasma desktop integration |
| CLI (`appmesh`) | Rust | Command-line port access |
| PHP FFI bridge | PHP | Direct calls into Rust library (~0.05ms) |

### Key dependencies and choices

| Decision | Choice | Why |
|----------|--------|-----|
| Language | PHP 8.4+ | Already the web language for the entire ecosystem. FFI gives native access. Zero learning curve. |
| Message format | Markdown frontmatter | Three-reader format: machines route, humans debug, AI agents reason natively |
| Control transport | WebSocket (raw for servers, Reverb for browsers) | Persistent connections, instant failure detection, Laravel ecosystem |
| Data transport | WebRTC | UDP for audio/video, NAT traversal for browsers, signalling over AMP |
| Desktop integration | QML plasmoids | Native Plasma 6 widgets, no Electron/Tauri overhead |
| Containers | Incus / Proxmox | Never Docker. ZFS dataset bind-mounts, no daemon SPOF |
| DNS | PowerDNS | Already manages zones on all nodes, API for dynamic SRV records |

---

## 9. Evolution Path

### Phase 1 — HTTP heartbeats (done, being replaced)

Nodes POST heartbeats every 30s. Simple, fragile, no real-time awareness. Database queue creates backlog risk. 90-second offline detection delay. This is the current state — it works but has known failure modes (see section 5).

### Phase 2 — WebSocket control plane (next)

Replace HTTP POST heartbeats with persistent WebSocket connections between nodes. Raw WebSocket over WireGuard for server-to-server, Reverb for browsers. Simple JSON messages initially, migrating to AMP framing once connections are stable.

**What this unlocks:**
- Instant connection-loss detection
- No database queue for heartbeats
- Real-time mesh status without polling
- Foundation for port commands across nodes

### Phase 3 — AMP framing on WebSocket

Switch from JSON blobs to `---` delimited AMP messages on the established WebSocket connections. Add port addressing. This validates the AMP protocol on real traffic before building DNS resolution.

**What this unlocks:**
- Three-reader message format in production
- Structured routing (to/from addresses)
- AI agents can connect and participate natively
- Message logging as browsable markdown files

### Phase 4 — DNS port discovery

Ports register SRV records in PowerDNS on startup. Addresses like `clipboard.appmesh.mko.amp` resolve to WireGuard IPs. Browser nodes query their server node, which resolves from its local PowerDNS or forwards to primary.

**What this unlocks:**
- Automatic port discovery across the mesh
- No hardcoded node addresses in scripts
- Browser nodes can address any port on any node
- New nodes join the mesh by registering their ports

### Phase 5 — WebRTC data plane

Add binary streaming via WebRTC data channels, signalled over the AMP WebSocket. `webrtc-rs` in the Rust core for server-side. Browser-native WebRTC API for clients.

**What this unlocks:**
- TTS audio streaming directly to browsers
- Screen share and video between nodes
- File transfer without base64 overhead
- Low-latency audio for voice features

### Phase 6 — AI agent mesh participation

Agents connect to the mesh as first-class nodes, reading and writing AMP messages directly. MCP remains for Claude Code; native AMP for markweb's AgentRuntime.

**What this unlocks:**
- Agents discover and use ports without tool definitions
- Multi-agent coordination across nodes
- Agents monitor event streams at ~60% fewer tokens than JSON-RPC
- The mesh becomes an AI-native communication fabric

---

## 10. Design Principles Summary

| Principle | Implication |
|-----------|-------------|
| **Three readers** | Every message serves machines, humans, and AI agents simultaneously |
| **Headers route, bodies reason** | Routing is deterministic and fast; understanding is optional and rich |
| **Text for control, binary for data** | AMP handles commands/events; WebRTC handles streams |
| **DNS for discovery** | Addresses are hierarchical, cacheable, and work offline |
| **Persistent connections** | Failure detection is a transport property, not a polling mechanism |
| **Graceful degradation** | Unreachable ports return errors; callers decide what to do |
| **No over-engineering** | Primary-secondary, not consensus. Retry, not distributed transactions |
| **Test at three** | Three nodes is the minimum viable mesh topology for real testing |
| **Browsers are nodes** | Any browser can be a mesh participant, routed through its nearest server |
| **PHP is the scripting language** | One language for apps, scripts, and mesh glue. FFI for native speed |

---

## Related Documents

- [AMP Protocol Specification](https://github.com/markc/appmesh/blob/main/_doc/2026-02-28-amp-protocol-specification.md) — wire format, port addressing, header fields, parser implementations
- [architecture](2026-02-24-architecture.md) — markweb application internals (services, models, data flows)
- [deploy](2026-02-24-deploy.md) — deployment workflow and node configuration
- [CLAUDE.md](../CLAUDE.md) — project conventions, commands, and environment
