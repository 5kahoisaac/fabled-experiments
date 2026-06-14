# JOURNEY

## Setup recap

- **Model**: `gpt-5.5`
- **Skill**: `—`
- **Agent**: Codex
- **Variant**: `gpt-5-5-codex`
- **Prompt**: Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.

## Timeline

1. Inspected the empty project and confirmed it only contained `AGENTS.md`, with no package or build system.
2. Built a static Three.js implementation with `index.html`, `styles.css`, `main.js`, and `world.js`.
3. Split scene construction from gameplay logic to keep the JavaScript files below the local 250-line guideline.
4. Ran the game through a local static server and verified controls, game-over, nonblank WebGL rendering, desktop layout, and mobile layout in Chrome.
5. Tuned the physics and first gate so a simple browser-automation cadence could score reliably, reaching score 3 in the final run.

## Observations

- The project was best served by a dependency-light static implementation instead of adding a build tool.
- Browser verification mattered: the first playable pass rendered well, but physics needed tuning before the opening gate felt fair.

## Takeaway

Codex shipped a compact, playable 3D control run without the Fabled skill. The result is visually polished and browser-verified. The Codex rollout log records 3,019,341 total tokens and 1,243.055 s wall time from prompt to final build response; calculated GPT-5.5 cost is $5.27709.
