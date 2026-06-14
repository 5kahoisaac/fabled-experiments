# JOURNEY

## Setup recap

- **Model**: `gpt-5.5`
- **Skill**: `fabled`
- **Agent**: Pi
- **Variant**: `gpt-5-5-pi-fabled`
- **Prompt**: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Timeline

1. **Loaded the Fabled build discipline.** Treated the request as a complete single-prompt web game and used the web/game route: one self-contained HTML file, pinned CDN dependency, runnable locally, and explicit verification.
2. **Translated taste words into concrete targets.** "Pretty" became a cohesive sky-and-vine 3D scene with shadows, fog, glass HUD, animated bird, waterline, clouds, and a distinctive Skyweave identity; "playable" became simple inputs, visible states, forgiving collisions, score feedback, restart, and gentle mode.
3. **Built the mechanics and pure checks first.** Added gravity/flap physics, bounded gate generation, collision helpers, scoring, gate recycling, and inline `console.assert` self-checks for the core geometry rules.
4. **Layered the 3D presentation.** Used Three.js 0.164.1 for the bird, vine gates, torus glow caps, clouds, water, lights, camera follow, screen shake, and responsive canvas/HUD.
5. **Verified the shipped artifact.** Scanned for banned placeholder strings and served the exact file with `python3 -m http.server 8765`; `curl -I` returned `HTTP/1.0 200 OK` for `index.html`.

## Observations

- The build prioritized a compact single-file artifact over a multi-file app, which made it easy to copy into the showcase and run without install steps.
- The result is browser-playable and polished, but verification stopped at HTTP/static checks plus inline assertions; no automated browser gameplay script was run.

## Takeaway

`gpt-5.5` + `fabled` on Pi produced a complete, pretty, playable 3D web game in one prompt with low recorded cost and a simple result bundle.
