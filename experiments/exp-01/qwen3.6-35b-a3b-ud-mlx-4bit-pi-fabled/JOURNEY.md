# JOURNEY — Experiment 01 · qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled

## Setup recap

- **Model**: `qwen3.6-35b-a3b-ud-mlx-4bit` (local, MLX 4-bit, on-device)
- **Skill**: `fabled`
- **Agent**: Pi
- **Variant**: `qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled`
- **Prompt**: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Timeline

1. **Performed the Fabled ceremony and emitted the full game in one turn (~210 s).** Followed the skill's template: reconstructed intent into a numbered checklist, expanded "pretty"/"playable" into objective items, wrote assumptions, a file-tree contract, then authored the complete 3D Flappy Bird in a single `write` call — Three.js r128, composed bird (body/belly/beak/eye/wing), cylinder pipes with caps, gradient sky shader, drifting clouds, soft shadows, score + menu/game-over states, keyboard/click/touch input. Gate B (banned-string scan) ran and passed; a `## Verification` table ticked every requirement with `grep` evidence. **Nothing was ever executed against the real game logic.**
2. **User reported the game un-playable (prompt 2).** "Bird keeps going up… blocker is always closed… always lose, 0 marks." The model diagnosed two problems by reading its own code: a pipe mesh-index bug (`pipeGroup.children[i*4]` drifts after a `splice` recycles a pipe) and weak gravity. It rewrote the file, stored mesh refs on each pipe object, and re-tuned constants (gravity 22→38, flap −9→−13, gap 3.0→3.0, gap range −1.5..1.5). It re-ran the same string scan and shipped again.
3. **User reported it still broken (prompt 3): "Think about it."** Under pressure, the model finally stepped back and **ran a Node physics simulation** of its own shipped constants — printing `Gap range: [-3 to 0] (lowest)` against `Bird start: y=0` → `Bird at y=0 is within gap? **false**`. The bird's top (`0.3`) was above the lowest gap's top edge (`0`): it had been colliding on frame 1 the entire time.
4. **Applied the boundary fix.** Moved `BIRD_START_Y` to `-1.5` (inside the gap), widened `PIPE_GAP_SIZE` to 4.5, re-centered the gap range to −1.0..2.0, slowed pipes, and confirmed via the same simulation that the bird now starts inside the gap and falls through it.
5. **Run logged as failed.** The fix was derived but **never browser-verified by the user** — the three-prompt saga had already exhausted patience, and the deliverable in the user's hands never reached a playable state. The shipped `result/flappy-bird-3d.html` renders but its pre-fix history is unplayable.

## Observations

- **The Fabled form was followed; the Fabled function was not.** Plan, Assumptions, Gate B, and a Verification table were all produced — but Phase 4 "Mode B (executed checks), strictly preferred when available" was substituted with a lexical scan, and the table was self-ticked PASS. The skill's strongest rule (verify against the original request) was the one that would have caught the bug, and it was the one treated as ceremony.
- **Symptom-chasing without simulation.** Each fix turn reasoned about the code by reading it, not by running it. The mesh-index bug (prompt 2) was real and got fixed, but the geometry misalignment survived because nobody stepped the bird forward and asked "does it collide at t=0?".
- **The boundary bug is a one-invariant check.** `BIRD_START_Y + BIRD_RADIUS ≤ MIN_GAP_Y + PIPE_GAP_SIZE/2`. Fabled's "design for verification — keep core logic in pure functions" exists precisely so this can be asserted. It wasn't.
- **Skill was net-negative vs. the no-skill control.** Same model, same agent, same hardware: the control shipped a playable build in 2 prompts; this run took 3 prompts and failed. The skill added token/context load (506k vs 139k total) and structure that was performed but not enforced — for a 35B 4-bit model, that is a real cost with no payoff here.
- **Capability to generate was never the bottleneck.** A full, pretty Three.js game came out of one `write` call. The failure was entirely in the verify-before-claiming discipline the skill is supposed to enforce.

## Takeaway

`qwen3.6-35b-a3b-ud-mlx-4bit` + Fabled on Pi could *write* a pretty 3D Flappy Bird in one turn — but it could not *tell* whether what it wrote was playable, because it never ran its own game. The result is the textbook Fabled anti-pattern: a polished deliverable, a clean Gate B, a self-ticked verification table, and an unplayable game. The skill only helps if its executable-verification rule is actually executed; on this run it was skipped, and three prompts later the user said "still not playable."
