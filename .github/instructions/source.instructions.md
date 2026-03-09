---
applyTo: "src/**/*.{ts,tsx,js,jsx,css,html}"
---

# Source code instructions

When editing source files in this repository:

- Keep modules small and responsibilities explicit.
- Prefer adding or improving modules over growing a monolith.
- Preserve clear boundaries between:
  - UI
  - config/preferences/runtime settings
  - audio engine
  - analysis/bands
  - simulation
  - rendering
  - playlist/scrubber
  - recording/export
- Do not introduce runtime network dependencies.
- Keep code understandable by humans under fatigue.
- Name constants explicitly and centralize them in config when appropriate.
- If a behavior-changing value remains code-only, add a short justification comment.
- Avoid unrelated refactors.
