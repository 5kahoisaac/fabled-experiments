# JOURNEY — Experiment 01 · glm-5.1 · Pi

> The **thinking process** for this run: how the model approached the single
> prompt, where it hesitated, what it cut, and what it nailed. Narrative is fine —
> this is the qualitative companion to the numbers in `SPEC.md`.

## Setup recap

- Model: `glm-5.1`
- Prompt: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Timeline

1. **Reconstructed the ask into testable success.**  
   It turned the vague prompt into a concrete Definition of Done: open one HTML file, flap through 3D pipes, score increases, collision ends the run, restart works, and the page never fails silently.

2. **Expanded “pretty” and “playable” into requirements.**  
   “Pretty” became a low-poly sunset scene with a named palette, gradient sky, fog, parallax clouds, sun, soft lighting, and polished UI. “Playable” became tap/click/Space input, fixed-timestep physics, forgiving hitboxes, capped difficulty, and title/HUD/game-over states.

3. **Chose a simple stack and drew a hard boundary.**  
   It picked one self-contained HTML file with vanilla JS and pinned Three.js r128. The key design move was separating pure game logic from Three.js rendering so the logic could be tested outside the browser.

4. **Built around deterministic game feel.**  
   It centralized constants, used seeded RNG for pipe gaps, pooled 8 pipe groups, added fixed-step gravity/flap physics, capped fall speed, clamped the ceiling, and tuned collisions smaller than the visuals for fairness.

5. **Layered visual polish after the mechanics.**  
   It built the bird from simple meshes, added teal pipes, rolling hills, parallax clouds, a sunlit sunset sky, fog, wing animation, camera follow, and death shake. The result was still procedural and lightweight.

6. **Added browser-safe finish work.**  
   It added procedural audio for flap/score/hit, lazy audio initialization, resize handling, title/HUD/game-over overlays, restart flow, and fatal overlays for CDN, WebGL, or JS failure.

7. **Verified the shipped logic directly.**  
   It wrote a Node test that extracted the exact logic block from the HTML and ran 72,086 passing assertions, including pipe recycling over 600 simulated seconds and a deterministic ghost-pilot run.

8. **Checked for delivery risks.**  
   It confirmed the CDN was pinned, banned placeholder strings were absent, logic and renderer parsed, no storage APIs were used, and the browser render showed the intended scene and UI states.

## Observations

- It did well at converting vague taste words into concrete visual and gameplay requirements.
- The logic/render split was the strongest engineering choice.
- It cut scope cleanly: no leaderboard, no saved high score, no external art, no post-processing, no build step.
- It leaned unusually hard into verification for a small one-file game.
- The most instructive lesson was that failed tests are not automatically code bugs; the run explicitly called out deciding whether the requirement, code, or test is wrong before changing anything.

## Takeaway

- `glm-5.1` thought like a builder-tester: define the game, build the game, then make the shipped game prove itself.