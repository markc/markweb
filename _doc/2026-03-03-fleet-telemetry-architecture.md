# Fleet Telemetry Architecture

> Real-time monitoring of 37–1000+ remote units via WebSocket push,
> replacing per-iframe AJAX polling.

## Problem

The current BION fleet dashboard loads each unit as an iframe. Each iframe
runs a jQuery AJAX poll every 1 second against a Perl endpoint on the unit's
own subdomain (`*.accuion.bio`). With 37 units:

- **37 HTTP requests/second per browser tab**
- Every additional viewer multiplies the load (5 viewers = 185 req/s)
- At 1000 units with 10 viewers: **10,000 HTTP req/s**
- Each iframe opens a separate TCP connection to a different hostname
- The Raspberry Pi units are HTTP servers being hammered by pull requests
- Latency is 0–1000ms (you see whatever the last poll returned)

This does not scale.

## Solution: WebSocket Push via meshd + Reverb

Replace pull-based polling with push-based telemetry. Each unit pushes data
when values change. The central server fans out updates to all browsers over
a single WebSocket channel.

### Data flow

```
  Raspberry Pi (unit)
       │
       │  Reads sensors every 1s
       │  Sends AMP message ONLY when values change
       │
       ▼
  meshd-tiny (on Pi)
       │
       │  Persistent WebSocket over WireGuard
       │  to central meshd
       │
       ▼
  meshd (central node)
       │
       │  Delivers AMP message to Laravel
       │  via unix socket callback
       │
       ▼
  Laravel MeshInboundController
       │
       │  Writes to Redis (HSET per unit, 90s TTL)
       │  Broadcasts UnitTelemetryUpdated event
       │
       ▼
  Laravel Reverb
       │
       │  Fans out to all subscribed browsers
       │  on channel: fleet.{group}
       │
       ▼
  Browser (React)
       │
       │  Single WebSocket connection
       │  Receives all unit updates
       │  Re-renders only the changed card
       │
       ▼
  Dashboard shows 37–1000 unit cards
  updating in real time
```

### What changes at each layer

**Browser:** 37 iframe connections → 1 WebSocket. React renders unit cards
from Zustand state. When a `UnitTelemetryUpdated` event arrives on the
Reverb channel, only the affected card re-renders. Additional viewers cost
almost nothing — Reverb fans out the same channel to all subscribers.

**Central server:** No outbound HTTP requests. meshd receives AMP messages
from units on already-open WebSocket connections and calls back to Laravel
on localhost. Laravel writes to Redis and broadcasts — sub-millisecond.

**Raspberry Pi:** Stops being an HTTP server. Instead runs meshd-tiny (or a
lightweight agent) that reads sensor data and pushes an AMP message to the
central node. Only sends when values change (or every N seconds as a
keepalive). Idle units send nothing.

## AMP Message Format

Unit telemetry travels as a standard AMP message:

```
---
amp: 1
type: event
from: fleet.bright-hospital.amp
to: fleet.central.amp
command: telemetry
args: {"flow":7.02,"cu_current":2.55,"ag_current":0.05,"cmb_dsng":"SEP:2.84"}
---
```

The `from` address identifies the unit. The `args` JSON carries the sensor
readings. The `command: telemetry` tells the inbound controller how to
route it.

### Change detection (optional but recommended)

The Pi agent compares current readings against the last-sent values. If
nothing has changed beyond a configurable threshold, it skips sending. This
is critical at scale — 1000 units where 900 are idle means 900 fewer
messages per second.

A keepalive heartbeat (e.g. every 30s) ensures the central server knows the
unit is still alive even when readings are stable.

## Redis Storage

Each unit gets a Redis hash, mirroring the pattern already used for mesh
nodes:

```
fleet:unit:{unit-name}  →  HSET
    name:              bright-hospital
    group:             alpine-health
    status:            online
    last_telemetry_at: 2026-03-03T07:45:51Z
    data:              {"flow":7.02,"cu_current":2.55,...}
    updated_at:        2026-03-03T07:45:51Z
```

TTL of 90 seconds. If a unit stops sending, its key expires and it
disappears (or shows as offline if the dashboard checks).

## Reverb Channel Design

```
fleet.{group}     →  all units in a group (e.g. fleet.alpine-health)
fleet.all         →  firehose of all unit updates (admin view)
fleet.unit.{name} →  single unit detail view
```

The dashboard page subscribes to `fleet.{group}`. Each incoming event
carries the unit name and new data. The React component updates its local
state map and re-renders the affected card.

For the detail view (clicking into a single unit), subscribe to
`fleet.unit.{name}` for high-frequency updates and historical charting.

## Scale Comparison

| Metric | AJAX polling (current) | WebSocket push (proposed) |
|--------|----------------------|--------------------------|
| Browser connections per viewer | 37 (one per iframe) | 1 |
| HTTP req/s per viewer (37 units) | 37 | 0 |
| HTTP req/s (1000 units, 10 viewers) | 10,000 | 0 |
| Server-to-unit connections | 0 (pull model) | 1 persistent WS per unit |
| Unit-to-central messages/s (active) | 0 (passively polled) | 1 per active unit |
| Unit-to-central messages/s (idle) | 0 (still polled anyway) | 0 (or 1/30s keepalive) |
| Update latency | 0–1000ms (poll interval) | <50ms (push) |
| Network overhead per update | Full HTTP request + response | ~100 byte WebSocket frame |

At 1000 units with change detection, expect 100–200 messages/second to the
central server (not all units change every second). Reverb fans each out to
N viewers. Total load is dominated by the unit count, not the viewer count.

## Implementation: What Already Exists

The markweb mesh infrastructure is a working proof of concept for this
pattern. The Mesh Nodes dashboard widget already demonstrates:

- meshd persistent WebSocket connections between nodes
- AMP message delivery (heartbeat command)
- Redis-backed ephemeral status (MeshNodeCache)
- Reverb broadcast to browser (MeshNodeUpdated event)
- React component rendering from WebSocket events (mesh-status.tsx)
- 15-second heartbeat with sub-second browser updates

The fleet telemetry system is the same architecture at higher scale and
frequency.

### Existing components (reusable as-is)

| Component | Purpose | Reuse |
|-----------|---------|-------|
| meshd | Persistent WebSocket + AMP routing | Direct — units become peers |
| MeshBridgeService | Talk to meshd unix socket | Direct |
| MeshInboundController | Receive AMP from meshd callback | Add `telemetry` command |
| Redis pub/sub | Write + publish state | New keys (`fleet:unit:*`) |
| Laravel Reverb | Fan-out to browsers | New channels (`fleet.*`) |
| MeshNodeCache pattern | Redis HSET with TTL | Clone as FleetUnitCache |

### New components to build

| Component | Purpose |
|-----------|---------|
| `FleetUnitCache` | Redis service for unit telemetry (clone of MeshNodeCache) |
| `UnitTelemetryUpdated` event | Reverb broadcast event (clone of MeshNodeUpdated) |
| `telemetry` command handler | In MeshInboundController — parse + store + broadcast |
| Fleet dashboard page | React page with unit cards, subscribes to Reverb channel |
| Unit card component | Renders sensor data, highlights changes |
| meshd-tiny | Minimal agent for Raspberry Pi (reads sensors, sends AMP) |

### meshd-tiny: the Pi agent

The Raspberry Pi doesn't need full meshd. Options, from simplest to most
capable:

**Option A: Shell script + curl (simplest)**
```bash
#!/bin/bash
# Reads sensors, POSTs AMP to local meshd
while true; do
    data=$(read_sensors)  # whatever the current Perl script does
    curl -s -X POST --unix-socket /run/meshd/meshd.sock \
        http://meshd/send -H 'Content-Type: text/x-amp' \
        -d "---
amp: 1
type: event
from: fleet.$(hostname).amp
to: fleet.central.amp
command: telemetry
args: $data
---
"
    sleep 1
done
```

**Option B: meshd-tiny (Rust, ~500 lines)**

Stripped-down meshd with no server, no bridge socket, no peer management.
Just a single outbound WebSocket to the central node, with reconnect logic
and AMP framing. Reads sensor data from a file, pipe, or serial port.

**Option C: Python agent (~50 lines)**

```python
import asyncio, websockets, json, time
async def main():
    async with websockets.connect("wss://central:9800") as ws:
        await ws.send(f"---\namp: 1\ntype: identify\nname: {UNIT}\n---\n")
        while True:
            data = read_sensors()
            msg = f"---\namp: 1\ntype: event\nfrom: fleet.{UNIT}.amp\n"
            msg += f"to: fleet.central.amp\ncommand: telemetry\n"
            msg += f"args: {json.dumps(data)}\n---\n"
            await ws.send(msg)
            await asyncio.sleep(1)
```

Option A is the migration path with least friction — the Perl sensor reading
stays, just pipe the output to meshd instead of serving it over HTTP.

## Migration Path

### Phase 1: Central infrastructure (no Pi changes)

Build the Laravel + React side using simulated data. A scheduled artisan
command generates fake telemetry for 37 units and broadcasts via Reverb.
Validate that the dashboard renders correctly and WebSocket push works.

### Phase 2: Pi agent (one test unit)

Install meshd or meshd-tiny on a single Raspberry Pi. Wire it to push real
sensor data as AMP messages. Verify end-to-end: Pi → meshd → Laravel →
Redis → Reverb → browser.

### Phase 3: Fleet rollout

Roll out Pi agent to all 37 units. Remove iframes from the dashboard.
Monitor message rates and latency.

### Phase 4: Scale testing

Simulate 1000 units with a load generator. Verify Reverb handles the
fan-out. Tune Redis TTLs, channel granularity, and change detection
thresholds.

## Relationship to Mesh Architecture

The fleet telemetry system extends the mesh in one direction: **many
lightweight edge nodes reporting to a central dashboard**. The mesh
architecture (documented in `2026-03-02-mesh-architecture.md` and
`2026-03-02-nodemesh-daemon-design.md`) handles peer-to-peer communication
between full markweb nodes. Fleet telemetry is hub-and-spoke — the Pi units
are leaf nodes that only push data upstream.

Both use the same transport (meshd WebSocket + AMP), the same ingest path
(MeshInboundController), and the same browser delivery (Reverb). The
difference is topology, not technology.
