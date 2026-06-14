# JOURNEY

## Setup recap

- **Model**: `gpt-5.5`
- **Skill**: `—`
- **Agent**: Pi
- **Variant**: `gpt-5-5-pi`
- **Prompt**: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Timeline

1. **Chose a polished 3D browser direction.** Treated “webbed” as web-based and built a Three.js game instead of a flat canvas clone, with a distinct Skythread/glass-gate visual identity.
2. **Created the app shell and visual system.** Added a responsive HUD, glassy start/game-over panel, score and best-score meters, custom typography, gradient sky palette, and accessible control hints.
3. **Built the Three.js scene.** Implemented a prism-like bird, crystal gate obstacles, fog, lights, star field, drifting clouds, spark trail, camera motion, shadows, and tone mapping.
4. **Implemented gameplay.** Added gravity/flap physics, gate spawning and recycling, collision checks, scoring, best-score persistence, restart flow, and pause/resume behavior with keyboard, pointer, and touch-friendly input.
5. **Verified and packaged the result.** Served the folder locally, opened it with agent-browser, clicked Start, sent Space, confirmed the game responded, captured a screenshot, and wrote a README with run instructions.

## Observations

- The result is a multi-file static site, which keeps code readable while still being easy to host from `result/index.html` in the showcase iframe.
- Browser smoke testing confirmed the canvas loads and input/game-over loop works; it did not include an automated long-run scoring script.

## Takeaway

`gpt-5.5` without Fabled on Pi produced a visually polished, playable 3D Flappy Bird control run in one prompt, with browser-level smoke verification and a clean static deliverable.
