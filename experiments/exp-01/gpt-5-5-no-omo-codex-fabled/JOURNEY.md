# JOURNEY

## Setup recap

- **Model**: `gpt-5.5`
- **Skill**: `fabled`
- **Agent**: `Codex`
- **Variant**: `gpt-5-5-no-omo-codex-fabled`
- **Prompt**: `$fabled Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Timeline

1. Activated the empty workspace, read the Fabled skill, and selected the web/game route: a self-contained browser game plus a small logic test runner.
2. Built `index.html` with a marked pure game-logic block, Three.js rendering, procedural bird/gates/clouds/ground, HUD panels, keyboard/pointer/touch input, audio, resize handling, and runtime failure overlays.
3. Added `scripts/test-logic.mjs` to extract the exact shipped logic block from `index.html` and assert deterministic RNG, flap/start behavior, collision, scoring, pipe pool bounds, crash state, and ready-state stability.
4. Fixed two incorrect test assumptions: an unattended simulated run was not a valid scoring invariant, and VM-context objects should be compared by fields rather than deep object identity.
5. Verified with `npm test`, the Fabled banned-string scanner, a local static server, Playwright desktop/mobile checks, screenshot pixel-distribution checks, and visual inspection of the saved screenshots.

## Observations

- The build was playable and visually complete, but the browser verification path had environmental friction: port 4173 was already occupied, and the initial Playwright package had no matching Chromium binary.
- The final verification used a clean port, an explicitly launched cached Chromium executable, and screenshot-based pixel checks because direct WebGL back-buffer reads returned zeros after rendering.

## Takeaway

The run produced a complete, browser-verified 3D Flappy Bird game from one prompt. The strongest part was the separation between exact shipped gameplay logic and rendering, which made the core mechanics testable even while the visual layer used Three.js.

