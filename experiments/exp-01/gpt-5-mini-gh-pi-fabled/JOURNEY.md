# JOURNEY

## Setup recap

- **Model**: `gpt-5-mini`
- **Skill**: `fabled`
- **Agent**: Pi
- **Variant**: `gpt-5-mini-gh-pi-fabled`
- **Prompt**: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`
- **Human turns**: 2 (1 original prompt + 1 corrective "file not found" turn)

## Timeline

1. **Phase 0 — reconstructed intent.** Received the prompt with the Fabled skill attached; extracted a 12-item numbered requirement checklist, expanded the subjective adjectives ("pretty", "playable") into objective checkable items, wrote a one-sentence definition of done, and answered the four self-interview questions (GATE A passed).
2. **Phase 1–2 — scope, stack, contracts.** Chose a single self-contained HTML file with vanilla JS + a pinned three.js 0.152.2 CDN script; defined the data contracts (`state` shape, `bird`, `obstacle`) and the pure-function signatures (`updateBird`, `spawnObstacle`, `updateObstacles`, `checkCollision`, `flap`, `resetGame`) before any code, separating pure logic from rendering so it could be verified.
3. **Phase 3 — built the complete file.** Wrote `index.html` in full: ambient + directional lighting, exponential fog, sphere bird, box pillars, sphere-vs-box (`Box3.intersectsSphere`) collision, `localStorage` best score, WebAudio crash beep, window-resize handling, WebGL feature-detection, pointer + keyboard input, and a GATE B banned-string scan (zero hits).
4. **Turn 1 did not persist the file.** The model emitted the entire `index.html` as chat output but never called a write tool — so nothing landed on disk. The developer reported: "The result is not found in the project folder."
5. **Phase 4–5 — corrected and verified statically.** On the follow-up turn the model wrote `index.html` (16,844 bytes) to the working directory via the write tool, then ran Fabled Phase 4 as a **static trace (Mode A)** — no execution environment was available — confirming imports resolve, the run command matches the entry point, the CDN version is pinned, and all 12 requirements are ticked with quoted evidence (GATE C passed).

## Observations

- The model followed the Fabled process end-to-end: all five phases, GATES A–C, and the numbered checklist re-copied verbatim into `## Verification` with quoted evidence.
- Two mini-model weak spots the skill did not fully paper over: (1) turn 1 produced code as chat text rather than a file — fixed by a one-line nudge; (2) Phase 4 defaulted to a static trace (Mode A) instead of executing the artifact, so the build is delivered but **not runtime-verified**.
- The run was cheap ($0.0339) and fast (~2.1 min active) for a complete single-file 3D game — the cheapest and fastest delivered contender in exp-01 so far.

## Takeaway

`gpt-5-mini` + Fabled shipped a complete, schema-correct single-file 3D Flappy Bird at a fraction of the cost of larger models, but the run surfaces exactly where a "mini" model still needs a human in the loop: persisting the artifact to disk and actually running it. The skill enforced the discipline (contracts, no placeholders, evidence-backed checklist); the model fumbled the delivery mechanics.
