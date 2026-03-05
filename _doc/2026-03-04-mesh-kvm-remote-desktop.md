# Mesh KVM — Remote Desktop over WireGuard

**Date:** 2026-03-04
**Status:** Proposed

Self-hosted remote desktop (keyboard + video + mouse) across the WireGuard mesh, using WebRTC for screen video and KWin EIS for input injection. No VNC, no RDP, no third-party services. Wayland-native, compositor-integrated, end-to-end encrypted over WireGuard.

---

## Why This Is Different

Traditional remote desktop (VNC, RDP, TeamViewer, Zoom remote control) either:
- Captures the framebuffer directly (VNC) — bypasses the compositor, fights with GPU acceleration
- Runs a proprietary protocol (RDP, TeamViewer) — opaque, cloud-dependent
- Uses screen share + a side channel (Zoom) — but still routed through Zoom's servers

Mesh KVM uses:
- **WebRTC** for screen capture → video delivery (browser-native, hardware-accelerated, sub-100ms latency)
- **KWin EIS** for input injection (the official KDE Wayland input emulation protocol — same mechanism Krfb uses)
- **WireGuard** for transport (encrypted, peer-to-peer, no middleman)
- **meshd** for signaling and coordination (already running)

The compositor itself captures the screen and injects input. No framebuffer hacks, no X11 compatibility layer, no root/sudo required.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ VIEWER (browser on cachyos)                                         │
│                                                                     │
│  ┌─────────────────────┐   ┌──────────────────────────────────┐    │
│  │ <video> element      │◀──│ WebRTC MediaStream               │    │
│  │ (remote screen)      │   │ (screen share from host)         │    │
│  ├─────────────────────┤   ├──────────────────────────────────┤    │
│  │ Event capture canvas │──▶│ WebRTC DataChannel               │    │
│  │ mousemove, click,    │   │ "input" channel                  │    │
│  │ keydown, keyup,      │   │ {type, x, y, key, button, ...}  │    │
│  │ wheel, contextmenu   │   │                                  │    │
│  └─────────────────────┘   └──────────────────────────────────┘    │
│                                        │                            │
│                                        │ UDP/DTLS over WireGuard    │
│                                        │                            │
├────────────────────────────────────────│────────────────────────────┤
│ HOST (mko)                             ▼                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ meshd SFU                                                 │      │
│  │                                                           │      │
│  │  WebRTC session                                           │      │
│  │  ├── Video track ◀── getDisplayMedia() (screen capture)   │      │
│  │  ├── Audio track ◀── getDisplayMedia() (system audio)     │      │
│  │  └── DataChannel "input" ──▶ appmesh input handler        │      │
│  └───────────────────────────────────────┬──────────────────┘      │
│                                          │                          │
│  ┌───────────────────────────────────────▼──────────────────┐      │
│  │ appmesh (KWin EIS)                                        │      │
│  │                                                           │      │
│  │  D-Bus → KWin EIS socket                                  │      │
│  │  ├── ei_keyboard  → key press/release                     │      │
│  │  ├── ei_pointer   → relative motion, buttons, scroll      │      │
│  │  └── ei_pointer_absolute → absolute positioning           │      │
│  │                                                           │      │
│  │  KWin compositor receives events                          │      │
│  │  └── injected into desktop as if from local hardware      │      │
│  └───────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Viewer — Browser UI

**File:** `resources/js/components/remote/RemoteDesktopViewer.tsx`

A fullscreen-capable React component that:
- Displays the host's screen share as a `<video>` element
- Overlays a transparent event-capture layer
- Captures all mouse and keyboard events
- Sends them over the WebRTC DataChannel as JSON

```tsx
interface InputEvent {
    type: 'mousemove' | 'mousedown' | 'mouseup' | 'wheel' | 'keydown' | 'keyup';
    // Mouse events: normalised coordinates (0.0–1.0)
    x?: number;
    y?: number;
    button?: number;           // 0=left, 1=middle, 2=right
    deltaX?: number;           // scroll
    deltaY?: number;
    // Keyboard events
    key?: string;              // e.g. "a", "Enter", "F5"
    code?: string;             // e.g. "KeyA", "ArrowUp"
    modifiers?: string[];      // ["ctrl", "shift", ...]
}
```

**Coordinate normalisation:** Mouse x/y is sent as a fraction of the video dimensions (0.0–1.0), not pixels. The host converts to absolute screen coordinates using its display resolution. This handles resolution mismatches between viewer and host.

**Event throttling:** `mousemove` events are throttled to 60/s (one per animation frame). Key events and clicks are sent immediately (no throttling — they're low frequency and must not be dropped).

**Keyboard capture:** When the viewer is focused, `e.preventDefault()` on all key events to prevent browser shortcuts from firing. `Escape` is the release key — pressing Escape exits keyboard capture mode.

**Pointer lock:** On click, the viewer requests `element.requestPointerLock()` for relative mouse mode (games, drag operations). Falls back to absolute mode if pointer lock is denied.

### 2. Host — Screen Share Provider

The host is a browser tab on the remote machine (or a headless Chromium instance). It calls `getDisplayMedia()` to capture the screen and connects to the SFU as a publisher.

For unattended access (no browser), a future option is **PipeWire screen capture** directly in meshd (Rust) using `libpipewire` — but browser-based is simpler for v1.

**Host page:** `resources/js/pages/remote/host.tsx`

```tsx
// Capture screen + system audio
const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { cursor: 'always', displaySurface: 'monitor' },
    audio: true,
});

// Connect to SFU as publisher in room "kvm-{hostname}"
const pc = new RTCPeerConnection();
stream.getTracks().forEach(t => pc.addTrack(t, stream));

// Create DataChannel for receiving input events
const inputChannel = pc.createDataChannel('input');
inputChannel.onmessage = (e) => {
    // Forward to appmesh via HTTP or WebSocket
    fetch('/api/appmesh/input', {
        method: 'POST',
        body: e.data,
        headers: { 'Content-Type': 'application/json' },
    });
};
```

### 3. SFU — DataChannel Support

The meshd SFU (str0m) already handles media tracks. DataChannels need to be added.

**str0m DataChannel support:** str0m supports SCTP data channels natively. The SFU needs to:
- Accept DataChannel creation in SDP negotiation
- Forward DataChannel messages between publisher and subscribers (same as media fan-out but for data)
- For KVM: forward input events from viewer → publisher only (not fan-out to all subscribers)

**File:** `crates/sfu/src/session.rs` — add `SessionEvent::DataMessage` variant

```rust
pub enum SessionEvent {
    MediaData(MediaData),
    KeyframeRequest(KeyframeRequest),
    DataMessage(DataMessage),  // new
}

pub struct DataMessage {
    pub channel_label: String,
    pub data: Vec<u8>,
}
```

The SFU routes DataChannel messages by label:
- `"input"` channel → forward to the publisher's session (viewer → host direction only)
- Other channels → fan-out to all subscribers (future: chat overlay, annotations)

### 4. appmesh — Mouse Input Extension

Currently `eis.rs` only captures the `ei_keyboard` device. Extend to also capture `ei_pointer` and/or `ei_pointer_absolute`.

#### New EIS capabilities

```rust
// eis.rs — extend device discovery in handshake
enum EisDevice {
    Keyboard(ei::Keyboard),
    Pointer(ei::Pointer),           // relative motion
    PointerAbsolute(ei::Pointer),   // absolute positioning
}
```

#### New methods on EisConnection

```rust
impl EisConnection {
    // Existing
    pub fn type_text(&self, text: &str, delay_us: u64) -> Result<()>;
    pub fn send_key_combo(&self, combo: &str, delay_us: u64) -> Result<()>;

    // New — mouse
    pub fn pointer_move(&self, dx: f64, dy: f64) -> Result<()>;
    pub fn pointer_move_absolute(&self, x: f64, y: f64) -> Result<()>;
    pub fn pointer_button(&self, button: u32, pressed: bool) -> Result<()>;
    pub fn pointer_scroll(&self, dx: f64, dy: f64) -> Result<()>;
}
```

EIS pointer methods (via `reis`):
```rust
// Relative motion
pointer.motion(dx, dy);
pointer.frame(serial, timestamp);

// Absolute motion (needs screen dimensions)
pointer_absolute.motion(x, y);
pointer_absolute.frame(serial, timestamp);

// Button (BTN_LEFT=0x110, BTN_RIGHT=0x111, BTN_MIDDLE=0x112)
pointer.button(BTN_LEFT, ButtonState::Press);
pointer.frame(serial, timestamp);
pointer.button(BTN_LEFT, ButtonState::Release);
pointer.frame(serial, timestamp);

// Scroll (discrete or continuous)
pointer.scroll_discrete(0, 1);  // one notch down
pointer.frame(serial, timestamp);
```

#### New InputPort commands

```
input
    type_text <text> [delay_us]              — existing
    send_key <combo> [delay_us]              — existing
    mouse_move <dx> <dy>                     — new: relative motion
    mouse_move_abs <x> <y>                   — new: absolute (0.0-1.0 normalised)
    mouse_click <button> [count]             — new: click (left/right/middle)
    mouse_down <button>                      — new: press and hold
    mouse_up <button>                        — new: release
    mouse_scroll <dx> <dy>                   — new: scroll wheel
```

#### Extended keymap

Add evdev keycodes for commonly needed keys:

```rust
// keymap.rs additions
KEY_UP, KEY_DOWN, KEY_LEFT, KEY_RIGHT,
KEY_HOME, KEY_END, KEY_PAGEUP, KEY_PAGEDOWN,
KEY_INSERT, KEY_DELETE, KEY_BACKSPACE,
KEY_F1..KEY_F12,
KEY_CAPSLOCK, KEY_NUMLOCK, KEY_SCROLLLOCK,
KEY_PRINT (Print Screen),
```

### 5. appmesh Input API Endpoint

A new HTTP endpoint that receives input events from the host's browser tab and injects them via EIS:

**Route:** `POST /api/appmesh/input`

```php
// app/Http/Controllers/AppMeshController.php
public function input(Request $request): JsonResponse
{
    $event = $request->validate([
        'type' => 'required|in:mousemove,mousedown,mouseup,wheel,keydown,keyup',
        'x' => 'sometimes|numeric|min:0|max:1',
        'y' => 'sometimes|numeric|min:0|max:1',
        'button' => 'sometimes|integer|in:0,1,2',
        'deltaX' => 'sometimes|numeric',
        'deltaY' => 'sometimes|numeric',
        'key' => 'sometimes|string',
        'code' => 'sometimes|string',
        'modifiers' => 'sometimes|array',
    ]);

    $this->appMesh->injectInput($event);

    return response()->json(['ok' => true]);
}
```

For v1, this HTTP endpoint is fine — the host browser tab is on localhost, so latency is sub-1ms. For v2, the host could connect a WebSocket directly to appmesh's EIS handle, eliminating the HTTP per-event overhead.

### 6. Permission and Security

Remote control is dangerous. Multiple layers of protection:

#### Consent flow

```
Viewer requests control
    ↓
AMP request: command=kvm-request, from=viewer_node
    ↓
Host node receives → desktop notification via appmesh notify port
    "markc@cachyos wants to control your desktop. Allow?"
    ↓
User clicks Allow → AMP response: command=kvm-accept
    ↓
SFU room created, DataChannel input forwarding enabled
    ↓
User clicks Deny or ignores → AMP response: command=kvm-deny
```

#### Auth requirements

- Both nodes must be in the same WireGuard mesh (network-level auth)
- Both users must be authenticated in markweb (session auth)
- Host user must explicitly grant permission (consent notification)
- Control can be revoked at any time (host clicks "Stop sharing" or presses a panic hotkey)

#### Panic hotkey

A hardware-level escape: `Ctrl+Alt+Shift+Escape` on the host keyboard always revokes remote control, even if KWin is receiving injected events. This is enforced in the appmesh input handler — when this combo is detected from the DataChannel, the EIS session is torn down immediately.

#### Session timeout

Remote control sessions auto-expire after 30 minutes of inactivity (no input events). Can be extended by the host.

---

## Session Lifecycle

### Initiation

```
1. Viewer clicks "Remote Control" in markweb UI (text-chat channel context or dedicated page)

2. Viewer's browser → POST /api/mesh/kvm/request
   → AMP event to host node:
   ---
   amp: 1
   type: request
   from: kvm.markweb.cachyos.amp
   to: kvm.markweb.mko.amp
   command: kvm-request
   id: <uuid>
   json: {"user": "markc", "purpose": "debug deployment"}
   ---

3. Host node receives → desktop notification
   "markc@cachyos requests remote control: debug deployment"
   [Allow] [Deny]

4. Host user clicks Allow → AMP response:
   ---
   amp: 1
   type: response
   reply-to: <uuid>
   from: kvm.markweb.mko.amp
   to: kvm.markweb.cachyos.amp
   command: kvm-accept
   json: {"room": "kvm-mko-<session_id>", "resolution": "2560x1440"}
   ---

5. Host's browser auto-opens (or existing tab activates):
   → getDisplayMedia() captures screen
   → Publishes to SFU room "kvm-mko-<session_id>"
   → Creates DataChannel "input"

6. Viewer connects to SFU room as subscriber:
   → Receives video stream → renders in <video>
   → Sends input events over DataChannel "input"

7. Session is live — viewer controls host desktop
```

### Termination

Any of these ends the session:
- Host clicks "Stop sharing" → SFU room destroyed
- Host presses panic hotkey (`Ctrl+Alt+Shift+Escape`)
- Viewer disconnects (closes tab, navigates away)
- 30-minute inactivity timeout
- meshd detects peer disconnect (WireGuard down)

On termination, the EIS session is torn down, the SFU room is destroyed, and both sides receive a `kvm-ended` AMP event.

---

## Integration with Text Chat

A text chat channel can upgrade to KVM. The channel context provides:
- Who is requesting (authenticated user in the channel)
- Purpose documentation (the chat history explains why)
- Shared clipboard (viewer copies text → pastes on host via EIS)
- Chat continues alongside screen share (discuss what you see)

The SFU room name ties back to the channel: `kvm-{node}-{channel_slug}-{session_id}`.

In the DCS layout:
- Left sidebar: text chat channel (L6)
- Center: remote desktop viewer (full main area)
- Right sidebar: session controls, latency stats, clipboard (R5 — new panel)

---

## Latency Budget

Target: **< 100ms end-to-end** (keypress on viewer → visible effect on host screen → video frame reaches viewer)

| Segment | Expected | Notes |
|---------|----------|-------|
| Viewer key event → DataChannel send | < 1ms | Browser JS |
| DataChannel → SFU → host browser | 5–20ms | WebRTC over WireGuard, depends on network |
| Host browser → appmesh HTTP | < 1ms | Localhost |
| appmesh EIS → KWin injection | < 1ms | Unix socket, kernel |
| KWin renders frame | 6–16ms | 60–165Hz display refresh |
| Screen capture → WebRTC encode | 5–15ms | Hardware encoder (VAAPI/NVENC) |
| Video → SFU → viewer decode + render | 10–30ms | WebRTC jitter buffer |
| **Total** | **~30–80ms** | Comfortable for desktop use |

WireGuard between Gold Coast nodes adds minimal latency. Cross-region (AU ↔ US) would add ~150ms RTT on top — still usable for admin tasks, less comfortable for interactive work.

---

## Implementation Phases

### Phase A: appmesh mouse support (prerequisite)

Extend `eis.rs` with pointer device capture and mouse methods. Extend `InputPort` with mouse commands. Extend `keymap.rs` with arrow/F-keys. Test via CLI.

**Effort:** 1 day
**Deliverable:** `appmesh port input mouse_move_abs x=0.5 y=0.5` moves cursor to center of screen

### Phase B: SFU DataChannel support

Add SCTP DataChannel handling to the str0m SFU. Forward `"input"` channel messages from subscriber → publisher. Add `SessionEvent::DataMessage`.

**Effort:** 1 day
**Deliverable:** DataChannel messages flow through the SFU between peers

### Phase C: Host page + input bridge

Build the host page that captures screen via `getDisplayMedia()`, publishes to SFU, and creates a DataChannel that forwards input events to `POST /api/appmesh/input`.

**Effort:** 1 day
**Deliverable:** Screen share visible in SFU test harness; input events logged on host

### Phase D: Viewer component

Build `RemoteDesktopViewer.tsx` — subscribes to SFU room video, captures mouse/keyboard, sends over DataChannel. Fullscreen toggle, pointer lock, keyboard capture.

**Effort:** 1–2 days
**Deliverable:** Full remote control loop working between two browsers

### Phase E: Consent + session management

AMP `kvm-request`/`kvm-accept`/`kvm-deny` flow. Desktop notification on host. Session timeout. Panic hotkey. Permission revocation.

**Effort:** 1 day
**Deliverable:** Secure consent-based remote control initiation

### Phase F: DCS integration

Remote desktop as a main-area view in markweb. Integrates with text chat channels. Session controls in right sidebar. Latency overlay.

**Effort:** 1 day
**Deliverable:** Remote control from within the markweb DCS interface

### Phase G: Headless host (future)

Replace the browser-based host with PipeWire screen capture directly in meshd (Rust). Eliminates the need for a browser tab on the host. Uses `libpipewire` for capture and feeds directly into the WebRTC session.

**Effort:** 3–5 days (significant)
**Deliverable:** Unattended remote access without a browser on the host

---

## Comparison

| Feature | VNC | RDP | TeamViewer | Zoom Remote | Mesh KVM |
|---------|-----|-----|------------|-------------|----------|
| Self-hosted | Yes | Yes | No | No | **Yes** |
| Wayland-native | No | No | Partial | No | **Yes (EIS)** |
| E2E encrypted | Optional | Yes | Yes | Yes | **Yes (WireGuard)** |
| No cloud dependency | Yes | Yes | No | No | **Yes** |
| Hardware video encode | No | Yes | Yes | Yes | **Yes (WebRTC)** |
| Browser-based viewer | noVNC | No | No | No | **Yes** |
| Integrated with chat | No | No | No | Partial | **Yes** |
| Consent flow | No | Session | Yes | Yes | **Yes** |
| < 100ms latency (LAN) | ~50ms | ~30ms | ~80ms | ~100ms | **~50ms** |

---

## Related Documents

- [nodemesh-daemon-design](2026-03-02-nodemesh-daemon-design.md) — meshd architecture, AMP protocol
- [mesh-architecture](2026-03-02-mesh-architecture.md) — WireGuard topology, node communication
- [text-chat-design](2026-03-03-text-chat-design.md) — text chat over mesh (Phase 6 of searchx integration plan)
- [phase5-webrtc-sfu-design](~/.gh/nodemesh/_doc/2026-03-03-phase5-webrtc-sfu-design.md) — SFU architecture in meshd
- [searchx-integration-plan](2026-03-04-searchx-integration-plan.md) — SearchX + mesh chat + this KVM plan
