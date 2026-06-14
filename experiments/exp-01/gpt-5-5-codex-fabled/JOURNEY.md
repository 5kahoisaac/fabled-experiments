# JOURNEY

## Setup recap

- **Model**: `gpt-5.5-codex`
- **Skill**: `fabled`
- **Agent**: Codex
- **Variant**: `gpt-5-5-codex-fabled`
- **Prompt**: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Timeline

1. **Reconstructed the ask into checkable behavior.** The build target became a runnable web game with 3D visuals, polished UI states, keyboard/mouse/touch controls, scoring, collision, restart, and browser verification.
2. **Inspected the workspace.** The project was effectively empty except for `AGENTS.md`, and it was not a git repository, so a standalone `index.html` was the smallest complete deliverable.
3. **Built the game in one file.** The implementation used pinned Three.js, pure state-transition helpers, a WebGL render loop, pipe pooling, gravity/flap physics, collision detection, saved best score, and responsive HUD overlays.
4. **Ran static checks.** The deferral-marker scan was clean, the embedded module script parsed, and marker checks confirmed the expected runtime features.
5. **Drove the shipped game surface.** The in-app browser endpoint was unavailable, so system Google Chrome was driven through Playwright. QA confirmed visible 3D rendering, input behavior, clean console/page errors, and a controlled logic run that scored 5 while still playing.

## Observations

- The strongest implementation choice was keeping `createInitialState`, `flap`, `advanceGame`, and collision logic pure enough to verify from the browser without depending on frame timing.
- Browser QA found and fixed one real polish issue: Chrome requested `/favicon.ico`, which caused a console 404 until an inline favicon was added.

## Takeaway

`gpt-5.5-codex` with the `fabled` skill produced a complete playable 3D Flappy Bird in a single HTML file, then verified it through the actual browser surface rather than stopping at static checks.
