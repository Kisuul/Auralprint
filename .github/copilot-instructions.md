# Repository instructions for Auralprint

Use these instructions for all work in this repository.

## Project stance
- Auralprint is an **analyzer cosplaying as a visualizer**.
- Preserve technically honest signal analysis.
- Keep runtime offline-capable: no CDN assets, no remote runtime dependencies.

## Engineering rules
- Interfaces are canon; modules are mutable.
- No hidden state.
- No magic numbers without names and justification.
- Prefer simple, modular, reviewable changes.
- Do not refactor unrelated areas.

## Configuration rules
- Canonical config must stay explicit.
- If a behavior-changing knob exists, expose it in UX or document it as code-only.
- Do not store runtime-only state in presets unless the task explicitly requires it.

## Safety rules
- Do not use destructive git commands.
- Do not overwrite unrelated user changes.
- Stop and report if the requested change conflicts with roadmap.md or established interface docs.

## Output style
For non-trivial tasks, report:
- files read
- plan
- files changed
- verification steps and results
