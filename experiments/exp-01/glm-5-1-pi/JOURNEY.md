# JOURNEY — Experiment 01 · glm-5.1 · Pi (control, no Fabled skill)

> The **thinking process** for this run: how the model approached the single
> prompt with no Fabled skill in the loop. This is the qualitative companion to the
> numbers in `SPEC.md`, and the no-skill control against the `glm-5-1-fabled`
> challenger.

## Setup recap

- Model: `glm-5.1`
- Skill: — (none invoked — this is the control run)
- Agent: Pi
- Variant: `glm-5-1-pi`
- Prompt: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Timeline

1. **Checked the working directory, then committed to one file.** It confirmed the dir was empty and immediately chose a single self-contained HTML file using Three.js from a CDN — no build step, no project scaffold, no logic/render split up front.
2. **Wrote the whole game in one shot.** One large write produced the complete `index.html` (26 KB): a stylized low-poly bird with flapping wings and blush cheeks, rounded 3D pipes in three random color themes, gradient dawn sky, parallax clouds, rolling hills, scrolling grass, soft shadows, particle bursts on flap/death, camera shake, Web-Audio synth SFX, mute toggle, and persistent best-score in `localStorage`.
3. **Started a local server and self-checked HTTP.** It booted `python3 -m http.server`, confirmed HTTP 200 and the served byte count before declaring it playable — verifying the file was actually being served, not just written.
4. **Verified rendering in a real browser via automation.** Rather than (or in addition to) shipping unit tests, it drove the page headlessly: confirmed the WebGL canvas was live (1280×577), `gl` context present, and the start screen visible — catching import/runtime errors that a file-only check would miss.
5. **Exercised the full game lifecycle.** It dispatched Space-bar flaps to start the game, play ~1.2 s, trigger a collision, land on the game-over screen, then retry — reading the DOM after each phase to confirm state transitions (READY→PLAY→DEAD→PLAY again) and that the console logged **zero errors** through the entire sequence.

## Observations

- It shipped **directly to a runnable, browser-verified deliverable** with no test harness and no process scaffolding — the no-skill path optimizes for "does the actual game work in a browser" rather than "does the extracted logic pass assertions."
- Scope was bigger on the visual/polish axis and lighter on the engineering-discipline axis than the `Fabled` challenger: particle systems, audio synth, difficulty ramp, and localStorage best-score made it in; the logic/render split, deterministic seeding, and 72k-assertion test suite did not.
- Verification was **behavioral, at the highest level**: it loaded the shipped artifact in a real browser and drove it like a player, rather than unit-testing a logic module in Node. Different proof of correctness, equally valid for a single-file game.
- The whole build (prompt to verified deliverable) took ~7.6 min and ~316k tokens — faster and cheaper than the `Fabled` challenger's ~8.3 min / ~449k, partly because there was no Fabled skill file in context and no test suite to generate.
- It leaned on the `agent-browser` skill (a tool-calling capability of Pi) to close the verification loop — so "no Fabled skill" here means *no Fabled build-discipline skill in the prompt*; the agent's own browser tooling was still in play.

## Takeaway

Without `Fabled`, `glm-5.1` on Pi thought like a **builder-shipper**: write the whole game, run it, then prove it works by playing it. The skill's value shows up as the delta between this (one polished file, browser-verified) and the challenger (same file plus a tested logic core, 72k assertions, explicit Definition of Done). Same prompt, same model, same agent — the skill trades a little time/tokens for a lot more verifiable rigor.
