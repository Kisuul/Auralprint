# Auralprint

**Auralprint** is a browser-based audio analysis app presented as generative art.

It is an **analyzer cosplaying as a visualizer**: the visuals are not decorative first and analytical second. The render output exists to expose real signal behavior in a form that is readable, expressive, and enjoyable to inspect.

Build 113 targets:
- real-time audio analysis
- playlist / queue playback with scrubber controls
- deterministic track switching behavior
- session recording via `MediaRecorder` with clean downloadable output

---

## Product Description

Auralprint turns audio playback into a live analytical scene.

The system ingests local audio, analyzes it in real time, maps signal features into a visual simulation, and renders that simulation as generative motion graphics. The result should feel like art, but remain grounded in actual audio structure.

This project is built for two equal deployment modes:

1. **Hosted mode**  
   Run from any static web host.

2. **Offline portable mode**  
   Run directly from `file://` as a distributable package, with no network dependency.

Auralprint must remain usable without build tooling, external services, or remote assets.

---

## Non-Goals

Auralprint is **not** trying to be:

- a DAW
- a waveform editor
- a music streaming service
- a cloud application
- a social platform
- a generic particle toy with fake audio-looking motion
- a framework-heavy SPA that requires network fetches to boot
- an “AI visuals” product detached from signal truth

This project prefers **correct analysis + controlled expressiveness** over spectacle for spectacle’s sake.

---

## Core User Flows

### 1. Analyze a single local track
The user opens Auralprint, loads an audio file, starts playback, and watches the visual analysis respond in real time.

Expected behavior:
- no network required
- clear no-audio idle state before load
- playback controls become active only when valid
- visuals reflect audio-driven state, not stale prior state

### 2. Analyze multiple tracks as a queue
The user loads multiple tracks into a playlist / queue, selects a track, scrubs within it, and moves previous / next through the queue.

Expected behavior:
- track switch resets analysis state that should not leak across songs
- scrubber always reflects current track time
- queue navigation is disabled unless it is valid
- no duplicated event handling or accidental double-advance

### 3. Capture a visual session
The user starts recording while audio is playing, lets the session run, stops recording, and downloads the result.

Expected behavior:
- recording status is visible
- WebM is the canonical recording format
- MP4 may be offered only when browser support is present
- recorded output downloads cleanly
- recording does not cause major frame collapse at sane defaults

### 4. Use Auralprint offline as a portable package
The user extracts a packaged build, opens `index.html` directly from disk, loads local audio, and uses the app with no server.

Expected behavior:
- no CDN usage
- no required network calls
- no boot failure because the app expects hosted routing or fetch-based asset resolution

---

## Architecture Principles

### Constitution
This repository follows a strict design constitution:

- **Everything is a module.**
- **Modules are mutable. Interfaces are canon.**
- **No hidden state.**
- **No hidden variables.**
- **No magic numbers. Every constant must be named and documented.**
- **If something controls behavior, it must be either:**
  - user-accessible in the UX, or
  - explicitly documented as code-only, including why it is not exposed
- **Prefer simple, readable, correct over clever.**
- **Zero runtime network dependencies. All assets must be local.**
- **The app must run both hosted and offline from `file://`.**
- **The repo must support extension in future builds without rewrite pressure.**

### Practical interpretation
These rules mean:

- analysis, playback, rendering, recording, UI, config, and state each belong to distinct modules
- modules may evolve internally, but their public contracts should remain stable and predictable
- state transitions must be explicit and inspectable
- UI controls are part of the product contract, not an afterthought
- behavior must not depend on invisible defaults buried deep in code
- build artifacts must preserve portability, not merely produce a hosted bundle

---

## Runtime Modes

## Hosted Mode

Use hosted mode when serving the app from any static host.

Examples:
- GitHub Pages
- Netlify static hosting
- Cloudflare Pages
- local static server during development

### Expected hosted behavior
- app loads as a plain static site
- all assets resolve locally from the repository / build output
- no server-side logic is required

---

## Offline Portable Mode (`file://`)

Use offline mode when opening the app directly from disk.

### Expected offline behavior
- user can open the packaged `index.html` via browser file open or double-click
- UI loads without remote dependencies
- local audio loading works through user file selection
- recording download works without server support

### Important constraint
Offline mode is a first-class requirement, not a best-effort convenience.

That means:
- no CDN scripts
- no remote fonts
- no fetch-required boot sequence for core runtime
- no assumptions about URL routing, origin, or server headers for basic operation

Some browser features may vary by engine or security model. Where browser support differs, Auralprint should degrade clearly rather than fail mysteriously.

---

## How to Run

## Hosted
Serve the contents of the deployable build directory from any static host.

For development, any simple static file server is acceptable.

Example pattern:
- open the hosted URL
- load one or more local audio files
- play, scrub, switch tracks, and record sessions

## Offline
Open the packaged `index.html` directly from disk.

Example pattern:
- extract the portable package
- open `index.html`
- load one or more local audio files
- use playback, queue, scrubber, and recording features normally

No installation, backend, or internet connection should be required for core functionality.

---

## Build 113 Scope Summary

Build 113 includes all required behavior from Build 112 plus session recording.

### Build 112 required scope
- scrubber exists and stays in sync with current playback
- playlist / queue exists
- switching tracks resets trails and scrubber
- no accumulating `ended` handlers
- no accidental double-advance
- clean no-audio state
- previous / next disabled unless queue length is at least 2

### Build 113 required scope
- visual session recording via `MediaRecorder`
- Start / Stop recording controls in the UI
- visible recording status
- downloadable output after stop
- WebM as canonical output
- MP4 only when the browser explicitly supports it
- no major FPS collapse at sane defaults

---

## Repository Design Intent

The repository is organized so that future builds can extend the system by adding or refining modules rather than rewriting the app.

The intended separation is:

- app bootstrap
- configuration and constants
- shared contracts / interfaces
- playback and queue control
- analysis engine
- simulation state
- rendering
- recording / export
- UI panels and bindings
- portable build output

This keeps internal change cheap while preserving public behavior.

---

## Status

Current target:
- **Build 113 / v0.1.13**

Current emphasis:
- stabilize playback and queue behavior
- preserve offline portability
- add reliable session recording without architectural drift

Auralprint should remain an analyzer first, a spectacle second, and a spaghetti creature never.
