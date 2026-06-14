# REPORT — Incident

> Failed run. The game was authored end-to-end (a real 18 KB single-file Three.js
> build ships in `result/`), but it never reached a **playable** state across the
> three prompts the user spent on it.

## Executive Summary

`qwen3.6-35b-a3b-ud-mlx-4bit` running the **Fabled** skill on **Pi** produced a
complete, pretty 3D Flappy Bird in one build turn — then burned two more prompts
on bug-fix turns and still never delivered a game the user could actually play.
The shipped file *renders*, but the bird starts literally **on the gap boundary**
(instant collision), pipes drift out of sync after the first is recycled, and the
flight physics never felt like Flappy Bird. The model fixed symptoms on each turn
without ever simulating the game it had written, so the root cause — a geometry
misalignment between the bird's start position and the gap range — survived until
a forced physics simulation exposed it in the final turn. By then the run was
already a failure in the user's hands: "still not playable", score always 0.

## What Was Being Run

- **Model**: `qwen3.6-35b-a3b-ud-mlx-4bit` (local, MLX 4-bit, on-device)
- **Skill**: `fabled`
- **Agent**: Pi
- **Variant**: `qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled`
- **Prompt**: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Evidence

- **Session**: `~/.pi/agent/sessions/--Users-isaac_ng-Documents-qwen-pi-fabled--/2026-06-14T14-31-30-610Z_*.jsonl`
- **Deliverable**: `result/flappy-bird-3d.html` (18 KB, single file, Three.js r128 via CDN) — renders but is unplayable.
- **User report, prompt 2**: *"The Game is un-playable, bird is keep go up which is not like flappy bird, and the blocker is always closed, no way to go, always lose and earn 0 marks"*
- **User report, prompt 3**: *"Still no playabl in normal playing, the game is built but can't work as expected. Think about it."*
- **Forced simulation output (prompt 3)** confirmed the root cause numerically:
  `Gap range: [-3 to 0] (lowest)` vs `Bird start: y=0` → `Bird at y=0 is within gap? **false**`. The bird's top (`y+R = 0.3`) sits above the lowest gap's top edge (`0`).

## Performance Signals

- **14 chat-completion requests across 3 prompts**, ~506k total tokens, ~13.3 min active generation, $0 cost (local inference).
- The build turn itself was competent and large (7,890 completion tokens, ~210 s) — the model *can* emit a full Three.js game in one shot. Failure was not a capability-to-generate problem; it was a **verify-before-claiming** problem.
- Two corrective turns (4 + 5 completions) made the metrics balloon — prompt 3 alone cost 239,899 prompt tokens and ~7 min because the Fabled process + growing conversation were re-processed each turn.

## Root-Cause Ranking

1. **Bird start position sat exactly on the gap boundary.** `BIRD_START_Y=0` while the lowest gap's top edge was also `0` (`MIN_GAP_Y + GAP/2 = -1.5 + 1.5`). The bird's top (`0.3`) was already outside the gap → collision on frame 1 of `PLAYING`. This is the single bug that made the game unplayable, and it persisted across prompts 1 and 2.
2. **No executable verification — the Fabled skill's own Phase 4 was skipped in spirit.** Fabled mandates Mode B (executed checks) when commands are available. The run *had* bash, but only ran a static regex/string scan, never a simulation of the actual game state. The boundary bug is invisible to a string check and obvious to a 10-line physics loop.
3. **Symptom-chasing on the fix turns.** Prompt 2 "fixed" gravity tuning and a real pipe mesh-index bug (`children[i*4]` drift after `splice`) but never re-derived the gap/geometry from first principles, so it shipped a *different* broken build. Prompt 3 only found root cause because the user's pushback ("think about it") forced a numeric simulation.
4. **Flight feel never matched the genre.** Even setting collisions aside, the gravity/flap/gap tuning was iterated by guess, not by playing the resulting arc — so "not like flappy bird" was a fair description throughout.

## Assessments

This is a **process failure on a capable-enough model**, not a capability ceiling. The Fabled skill's *contract* (simulate/verify before delivering) is exactly what would have caught the boundary bug at Gate B/C of prompt 1. The model followed Fabled's *form* (numbered plan, assumptions, Gate B string scan, verification table) but substituted a lexical check for the executable check the skill asks for — and ticked "PASS" anyway. The result is the most expensive kind of failure: a polished deliverable that looks done and is not.

Notably, the **same model with NO skill** (the `qwen3.6-35b-a3b-ud-mlx-4bit-pi` control) shipped a working, playable build in 2 prompts. Adding Fabled here *added* structure that was performed but not enforced, and *added* two unplayable iterations. For this model at 4-bit, the skill was net-negative on this task.

## Known Public Issues

- **4-bit quantization** can blunt a smaller model's multi-step reasoning and arithmetic precision; the geometry arithmetic here (`MIN_GAP_Y + PIPE_GAP_SIZE/2` vs `BIRD_RADIUS`) is exactly the kind of small-integer bookkeeping that suffers. Not a published issue, but a plausible contributor to why the misalignment was never self-caught.

## Debug Progress

- Prompt 2: identified and fixed a genuine pipe-recycling bug (mesh indices computed as `i*4` from the `pipes[]` array index, which drifts after a `splice`). Switched to storing mesh refs on each pipe object. Also re-tuned gravity/flap/gap constants. Did **not** re-check whether the bird starts inside the gap → shipped still-broken.
- Prompt 3: under user pressure, ran a Node physics simulation of the shipped constants and printed `Bird at y=0 is within gap? false`. Finally moved `BIRD_START_Y` to `-1.5`, widened the gap to 4.5, re-centered the gap range. **Not browser-verified by the user** before the run was logged as failed.

## Recommended Mitigations

- **Make Fabled Phase 4 actually executable for games.** Gate C must run the core logic (physics + collision) headlessly, not just grep for banned strings. A 20-line Node harness that steps the bird for 5 seconds and asserts "no collision at t=0" would have failed prompt 1 immediately.
- **For local/quantized models, prefer a guardrail assertion over vibes.** Add an invariant check: `BIRD_START_Y + BIRD_RADIUS ≤ MIN_GAP_Y + PIPE_GAP_SIZE/2` and `BIRD_START_Y − BIRD_RADIUS ≥ MIN_GAP_Y − PIPE_GAP_SIZE/2`. The bird must start *inside* every possible gap.
- **Treat "I verified it" with no command output as a Gate-B failure**, not a pass. The run's `## Verification` table ticked all boxes with grep evidence only — the table was satisfied, the game was not.
- Consider running the **control first** to confirm the model+agent can ship the task at all before adding a skill layer that increases token/context load.

## Bottom Line

Recorded as **failed**: a visually complete 3D Flappy Bird that no user could play, across three prompts, because the bird spawned on the pipe-gap boundary and the model never ran its own game. The fix exists and was found under pressure in the final turn, but the run as delivered never reached a playable, verified state — the bar Fabled's own definition of done sets.
