# Auralprint Changelog

## v0.1.10 → v0.1.11

### New Features

- **Per-orb spectral band targeting.** Each orb now accepts a `bandIds` array, allowing it to lock onto specific frequency bands (e.g., Kraken, Air Shelf) rather than responding to full-band energy. When `bandIds` is populated, the orb's energy input becomes the average of the selected bands. The engine-side wiring is complete; UI controls are deferred to a future build.

- **BandBankController module.** A new coordination layer between the audio context and the BandBank. When the AudioContext is first created, BandBankController reads the actual sample rate, computes the Nyquist frequency, clamps the configured frequency ceiling accordingly, and triggers a band rebuild. This ensures the 256 frequency bands are correctly distributed even when the host sample rate differs from the configured ceiling.

- **Dynamic band metadata display.** The static label "256 bands -- 0 is <=10Hz, 255 is >=26kHz" is replaced by a live readout showing sample rate, Nyquist frequency, configured ceiling, and effective ceiling, updated whenever the audio context or band configuration changes. Implemented via new `refreshBandMetaText()` and `formatBandMetaHz()` functions.

- **Orb normalization utilities.** Three new functions -- `normalizeOrbChannelId()`, `sanitizeOrbBandIds()`, and `normalizeOrbDef()` -- validate and canonicalize orb definitions. They accept both legacy (`bandId`, `bandNames`) and current (`chanId`, `bandIds`) field names, providing seamless backward compatibility for URL presets encoded under earlier schemas.

- **Band name lookup constants.** `BAND_NAMES` (flat array) and `BAND_NAME_TO_INDEX` (Map) are now derived once at startup from `CONFIG.bandNames`, enabling O(1) name-to-index resolution for future per-orb band selection UI.

### Changes

- **Project identity.** The internal project name in the source header changed from "AudioAnalyzer" to "Auralprint". The HTML `<title>` now includes the version string ("Auralprint - Waveform Analysis Tool - v 0.1.11").

- **Orb schema: `bandId` renamed to `chanId`.** The orb configuration field that selects the analyser channel (L/R/C) is now `chanId` instead of `bandId`, freeing `bandId` semantics for the new per-orb spectral targeting system. Default orb definitions now carry `chanId: "R"` / `chanId: "L"` and an empty `bandIds: []`.

- **Preset schema version 5 → 6.** Reflects the `chanId` + `bandIds` migration. URL presets encoded under schema v5 are still accepted and silently migrated.

- **Frame time cap raised from 5 ms to 33 ms.** `maxDeltaTimeSec` changed from `1/200` to `1/30`. The previous cap was aggressive enough to discard nearly all real frame deltas; the new value absorbs tab-switch and GC spikes without causing large simulation jumps, while leaving normal 60/120 Hz frames untouched.

- **Band names extracted to top-level config.** The 256 band name strings moved from `CONFIG.bands.names` (nested inside the bands section) to `CONFIG.bandNames` (top-level). This simplifies access and avoids coupling band naming with band frequency definitions.

- **Orb `resetPhase()` respects designed starting angle.** Previously hardcoded to reset to angle 0, orbs now store their `startAngleRad` as an instance property and reset to it. This preserves the designed pi-offset between ORB0 and ORB1 after a phase reset.

- **Conditional band rebuilds in `applyPrefs()`.** Band frequency definitions are now only rebuilt when the band definition key (count, floor, ceiling, spacing) actually changes, controlled by a new `rebuildBandsOnDefinitionChange` option. Eliminates redundant rebuilds on unrelated preference changes.

- **Centralized orb reset via `resetOrbsToDesignedPhases()`.** Keyboard shortcut (R), URL preset application, and preference reset all route through a single function that resets orb phases and synchronizes the ring overlay phase, replacing scattered inline reset logic.

- **URL preset encoding strips deprecated fields.** `writeHashFromPrefs()` now removes `bands.names` and per-orb `bandNames` before Base64 encoding, reducing URL length and preventing stale data from persisting in shared links.

- **Band HUD update throttling.** The per-frame band energy HUD refresh is now rate-limited to 100 ms intervals and skipped entirely when the bands panel is hidden, reducing unnecessary DOM writes.

- **Dominant band name lookup simplified.** BandBank now reads from the `BAND_NAMES` constant directly instead of traversing `runtime.settings.bands.names`, consistent with the top-level extraction.

- **Orb stepping accepts explicit energy override.** `Orb.step()` now takes an optional `energyOverride01` parameter. When provided (by `getBandForOrb()`), it overrides the full-band energy value, enabling per-orb band targeting without modifying the existing audio sampling pipeline.

### Fixes

- **Single-bin frequency bands no longer discarded.** The BandBank energy computation changed its empty-range guard from `b <= a` to `b < a`. Under the previous condition, a band mapped to exactly one FFT bin (where `b == a`) was treated as empty and received zero energy. This could cause the highest band(s) to appear dead at certain sample rates.

- **Orb phase reset no longer collapses stereo separation.** Because `resetPhase()` previously hardcoded angle 0 for all orbs, pressing R collapsed both orbs to the same position. The fix (resetting to each orb's `startAngleRad`) preserves the designed pi-radian offset between the left and right channel orbs.

---

## v0.1.11 → v0.1.12

*"The Jukebox Release"*

### New Features

- **Queue system.** A new `Queue` module provides ordered multi-file playback management. Supports add, remove, clear, go-to (click-to-jump), next, prev, and shuffle operations. The cursor tracks the currently playing file and adjusts intelligently on removal (items before the cursor shift it down; removing the current track advances to the next). A read-only `snapshot()` method supplies the UI with a plain-object representation for rendering.

- **Scrubber with waveform overview.** A new `Scrubber` module renders a visual waveform preview in a dedicated 36 px canvas above the transport controls. Audio is decoded asynchronously via a throw-away `OfflineAudioContext` (completely independent of the playback media element), downsampled to 512 peak buckets, and drawn as a waveform bar graph. Supports click and drag-to-seek on both mouse and touch. Displays explicit visual states for empty, decoding, ready, and unavailable (decode failure). A time readout (`MM:SS / MM:SS`) updates each frame.

- **Three-state repeat mode.** The boolean `loop` flag is replaced by `repeatMode` with three values: `"none"` (stop at end of queue), `"one"` (restart current track), and `"all"` (advance to next track, wrapping from end to start). A dedicated Repeat button cycles through all three states with distinct labels.

- **Shuffle.** A Shuffle button performs a Fisher-Yates shuffle on the queue while preserving the currently playing track's cursor position. Requires at least 3 items to activate.

- **Multi-file loading.** The file input element now carries the `multiple` attribute. Selecting several files adds them all to the queue; the first file begins playback immediately. Drag-and-drop also accepts multiple files with the same queue-then-play behavior.

- **Queue panel UI.** A new floating panel (`#queuePanel`, z-index 25) displays the track list with per-item remove buttons, click-to-jump navigation, and a Clear button to empty the queue. Toggled via a dedicated queue button in the transport row.

- **Transport controls: Previous / Next.** Two new buttons (`btnPrev`, `btnNext`) navigate the queue. Behavior respects the current repeat mode: in "all" mode, Next wraps from the last track to the first, and Prev wraps from the first to the last.

- **Track seek via keyboard.** Arrow keys seek the current track: Left/Right moves +/-5 seconds, Shift+Left/Shift+Right moves +/-30 seconds. Seek is disabled when an interactive control (input, select, textarea) has focus.

- **Track navigation via keyboard.** `N` advances to the next track; `P` returns to the previous track, following the same repeat-mode wrapping rules as the button controls.

- **Load hint overlay.** A new `#loadHint` element displays "Auralprint / Press Load to begin" as a splash prompt, visible until the first track is loaded.

- **Favicon and PWA metadata.** Six new `<link>` and `<meta>` tags provide: legacy `.ico` fallback, modern 96x96 PNG, scalable SVG icon, Apple touch icon (180x180), iOS home-screen app title, and a web app manifest for Android installability.

- **Focus ring system.** New CSS custom properties (`--ui-focus-ring-color`, `--ui-focus-ring-glow`, `--ui-focus-ring-width`, `--ui-focus-ring-offset`) provide consistent, visible keyboard-navigation indicators across all interactive controls on the dark translucent UI.

- **Overlay-specific radius controls.** The band overlay ring now has its own `minRadiusFrac`, `maxRadiusFrac`, and `waveformRadialDisplaceFrac` settings, independent of the orb motion radius. This allows the overlay ring size to be tuned without affecting orb behavior.

### Changes

- **Audio panel redesigned as two-row grid.** The bottom panel grows from a single 64 px row to a two-row layout (106 px total): a scrubber row (36 px) spanning the full width on top, and the transport control row (40 px) below. The CSS variable `--ui-audio-h` is updated accordingly, and a new `--ui-queue-clearance` variable anchors the queue panel above the audio panel.

- **Preset schema version 6 → 7.** Reflects the addition of overlay-specific min/max radius controls. Legacy schemas v5 and v6 are now accepted for migration (v5 was added as a transitional build safety net).

- **Default FFT size increased from 2048 to 8192.** Provides 4x finer frequency resolution at the cost of slightly higher latency, improving spectral band accuracy especially in the lower frequency ranges where logarithmic spacing concentrates more bands.

- **Default RMS gain reduced from 6.0 to 2.0.** Compensates for the increased spectral resolution of the larger FFT, which yields higher per-bin energy values. Prevents the orb radius from over-responding to audio input.

- **Trace lines enabled by default.** `trace.lines` flipped from `false` to `true`, `numLines` doubled from 5 to 10, and `lineColorMode` changed from `"fixed"` to `"dominantBand"`. The out-of-box visual now shows colored polyline trails that follow the dominant frequency band.

- **Default particle size increased.** `sizeMaxPx` raised from 6 to 8, producing slightly larger particles at emission for better visibility alongside the newly enabled trace lines.

- **Band overlay disabled by default.** `overlay.enabled` flipped from `true` to `false`. With trace lines now on by default, the overlay ring is hidden to reduce initial visual clutter; users can re-enable it from the bands panel.

- **Band overlay phase mode changed to free-running.** `overlay.phaseMode` changed from `"orb"` (locked to ORB0's angle) to `"free"` (independent rotation at `ringSpeedRadPerSec`). Produces a more dynamic default appearance when the overlay is enabled.

- **Frequency floor raised from 10 Hz to 20 Hz.** Aligns the lowest band with the conventional lower bound of human hearing, removing sub-audible frequency allocation that contributed no perceptible visual response.

- **Frequency ceiling lowered from 26,000 Hz to 20,000 Hz.** Prevents the highest band (index 255) from mapping to a range above the Nyquist frequency at standard 44.1/48 kHz sample rates, which would make it permanently dead. Includes detailed source comments explaining the ceiling-vs-Nyquist interaction.

- **Boolean `loop` replaced with `repeatMode` throughout.** The `audio.loop` field is removed from CONFIG defaults, preferences, and URL encoding. All playback looping logic now routes through the three-state `repeatMode` field. Legacy URL presets containing `loop: true` are migrated to `repeatMode: "one"`.

- **Limits recalibrated.** Multiple configuration limits were adjusted for tighter, more intentional ranges:
  - `trace.numLines`: min 1 → 10, step 1 → 10
  - `particles.emitPerSecond`: min 4 → 10, max 420 → 1000, step 1 → 10
  - `particles.sizeToMinSec`: min 1 → 0.1, max 240 → 120, step 1 → 0.1
  - `particles.ttlSec`: min 1 → 0.1, max 480 → 600, step 1 → 0.1
  - `particles.overlapRadiusPx`: max 40 → 10, step 0.5 → 0.1
  - `motion.angularSpeedRadPerSec`: max TAU → 3
  - `motion.waveformRadialDisplaceFrac`: min 0.001 → 0.01, step 0.001 → 0.01
  - `audio.rmsGain`: step 0.05 → 0.01
  - `audio.minRadiusFrac`: max 0.3 → 0.4
  - `audio.maxRadiusFrac`: min 0.05 → 0.3
  - `audio.smoothingTimeConstant`: min 0.00 → 0.01
  - FFT size options narrowed from `[64..32768]` to `[256..16384]` (removed 64, 128, 32768)
  - New overlay-specific limits: `overlayMinRadiusFrac`, `overlayMaxRadiusFrac`, `overlayWaveformRadialDisplaceFrac`

- **AudioEngine resource management overhauled.** Media element event listeners are now attached via an `AbortController`, enabling clean single-call teardown. Object URLs created for file playback are explicitly revoked via a dedicated `revokeObjectUrl()` helper. A `releaseMediaElement()` function centralizes full media element cleanup (pause, remove source, load, revoke URL, abort listeners).

- **User-friendly playback error messages.** A new `describePlaybackError()` function translates `MediaError` codes into human-readable descriptions (network error, decode failure, unsupported format). Error state is surfaced via `state.audio.transportError`.

- **AudioEngine exposes `getMediaEl()` accessor.** The Scrubber and keyboard seek features require direct access to the `<audio>` element's `currentTime` and `duration` properties. A new public method provides this without exposing other engine internals.

- **Canvas targeted by ID selector.** CSS changed from a generic `canvas {}` rule to `#c {}`, scoping styles to the main visualization canvas and avoiding conflicts with the new scrubber canvas element.

- **File renamed from `index.html` to `auralprint_0.1.12.html`.** Reflects the project's identity and versioning in the filename itself.

- **Version header rewritten.** The detailed TODO backlog (orb upgrades, 3D space, camera controls) is replaced with a concise "Jukebox Release" note and forward-looking roadmap pointers (WEBM/MP4 recording for next milestone, per-orb hue offset and center positioning planned for Build 115).

- **Orb definition documentation expanded.** CONFIG comments now categorize orb fields as "ENGINE-COMPLETE" (working in sim, UI deferred: `chanId`, `bandIds`, `chirality`, `startAngleRad`) or "FUTURE" (not yet in engine: `hueOffsetDeg`, `centerX/Y`), providing a clear implementation status map for future contributors.

- **`hasFocusedInteractiveTarget()` keyboard guard.** Global keyboard shortcuts (H, Space, R, N, P, arrows) now check whether an interactive element (input, select, textarea) has focus before firing, preventing shortcut conflicts when users are adjusting slider values or other controls.

- **Drag-and-drop file loading.** The canvas and document body accept dragged audio files, adding them to the queue with visual feedback (drag-over class toggle). Multiple files are accepted in a single drop.

### Fixes

- **Track-ended handling prevents silent stall.** In v0.1.11, reaching the end of a track with `loop: true` relied on the `<audio>` element's native loop attribute. In v0.1.12, the `ended` event is explicitly handled with repeat-mode-aware logic: `"none"` stops playback, `"one"` restarts the current track, and `"all"` advances to the next queued track. This eliminates edge cases where the native loop could fail silently after a source change.

- **Media element leak on consecutive file loads.** Prior versions did not revoke object URLs or cleanly detach event listeners when loading a new file, potentially leaking memory and leaving orphaned event handlers. The new `AbortController`-based teardown and explicit `URL.revokeObjectURL()` calls ensure complete cleanup on every file transition.

- **Boot no longer flashes a spurious "Updated: boot" status toast.** The initial `applyPrefs()` call during startup now passes `null` instead of `"boot"` as the reason string, so the status text remains at its default description rather than briefly displaying a confusing update notification.

---

## v0.1.12 → v0.1.13

*"The Capture Release"*

### New Features

- **Recording / Capture export.** A new recorder pipeline captures the canonical render canvas and can optionally mix in playback audio, producing downloadable video exports while playback continues.

- **Dedicated recording UI.** A floating recording panel and bottom-right camera launcher expose Start / Stop / Download controls, elapsed timer, support status, and latest export metadata.

- **Runtime recording controls + format negotiation.** Users can choose preferred format, target FPS (`24` / `30` / `60`), and whether playback audio is included. `WebM` is preferred by default, with `MP4` available when supported. These settings apply only to new recordings and are not stored in presets.

- **Band distribution modes.** The bands panel now exposes `linear`, `log`, `mel`, `bark`, and `erb` spacing, replacing the old single `logSpacing` toggle.

### Changes

- **Preset schema version 7 → 8.** `bands.logSpacing` is replaced by `bands.distributionMode`. Schema v7 presets are still accepted and migrated on decode.

- **Band defaults retuned.** Default ceiling increases to `22,500 Hz`, default distribution becomes `erb`, and overlay free-run speed defaults to `0.0`.

- **Visual response defaults rebalanced.** Particle emission increases to `240`, overlap radius tightens to `1.0`, angular speed drops to `0.50π`, waveform radial displacement drops to `0.10`, analyser smoothing drops to `0.10`, RMS gain drops to `1.0`, and the `particles.sizeMaxPx` limit rises to `12`.

- **Preset sanitation now starts from canonical defaults.** `sanitizeAndApply()` clones `CONFIG.defaults` and validates visual hex colors before applying incoming payloads.

### Fixes

- **Recording persists across transport mutations.** Track changes, failed track changes, queue advance, and unloaded-audio states now notify the recorder through a single transport path so capture can continue without transport ownership drift.

- **Preset encoding is safer for larger payloads.** Base64 URL encoding no longer relies on spreading the entire byte array into `String.fromCharCode()`.

- **Recording state messaging is explicit.** Unsupported browsers, no-audio-loaded states, finalization, and completed exports now surface deterministic UI status text instead of silent or ambiguous disabled states.
