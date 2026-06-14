# JOURNEY

## Setup recap

- **Model**: `gemma-4-26B-A4B-it-MLX-8bit` (local on-device, MLX 8-bit via oMLX)
- **Skill**: `fabled`
- **Agent**: Pi
- **Variant**: `gemma-4-26b-a4b-it-mlx-8bit-pi-fabled`
- **Prompt**: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Timeline

1. **Read the Fabled process and the matching example.** Loaded `SKILL.md` and the `web-3d-game` example trace, then produced the full Plan / Assumptions / File-tree output plus the complete single-file game **as chat text** — without writing it to disk. The Fabled template was followed on the surface (numbered requirements, self-interview, logic/render split markers).
2. **"Continue" → no file was ever stored.** The user pointed out the game was emitted only in the chat, never written to a file. The agent wrote `flappy-bird-3d.html` for the first time on this turn (the missing implicit requirement — "the runnable file must exist on disk" — had been skipped).
3. **"The controls are upside down."** The first shipped version used `FLAP_IMPULSE = -11` combined with `velocity += GRAVITY*dt`, so gravity and the flap impulse fought in the same axis and tap made the bird dive. The agent flipped the sign of the impulse and inverted the gravity application.
4. **"Still upside down."** The sign flip alone was not enough — the reworked `FLAP_IMPULSE = 7` / `GRAVITY = 1.2` was too floaty to feel responsive and the bird still misbehaved. Four `edit` attempts failed validation (`path` argument missing), so the agent fell back to a full `write` rewrite.
5. **"Even worse — Space and Click can't control it at all."** Final rewrite settled the physics cleanly: `FLAP_IMPULSE = 8` (positive = up), `velocity -= GRAVITY*dt` (gravity pulls toward negative), `birdY += velocity*dt`, flap sets velocity directly. `node --check` passes; the logic now reads as correct Flappy Bird (tap → rise, release → fall).

## Observations

- The Fabled *process* ran (Plan, contracts, numbered checklist, logic/render split), but it did **not** prevent three consecutive failures on a core mechanic — flight controls. The skill adds discipline of *shape*, not a guarantee of *correctness* on a small open-weights model.
- A trivial vertical-axis sign/units bug survived three rewrites because the agent kept tweaking magnitudes instead of re-deriving the physics from first principles. Each "fix" addressed the symptom the user named rather than the root sign convention.
- The logic/render split (pure `CONFIG` / `flap` / `step` block marked `==LOGIC-START==`) made the final verification cheap — the bug was locatable and `node --check` could run on the extracted logic.
- Like its control sibling, this is a **local-model run**, so it is structurally non-comparable to the cloud-API challengers on cost-per-token (cost is exactly $0). Token usage *is* recoverable from the oMLX server log, not a session JSONL.
- Verification stayed at static-trace depth (Mode A): the file was never opened in a browser and the user did not confirm the last fix — residual risk that an un-exercised runtime path (e.g. the pipe-mesh sync by floating-point `x` equality) still misbehaves.

## Takeaway

On `gemma-4-26B-A4B-it-MLX-8bit`, the Fabled skill produced a well-shaped, contract-first single-file build — but the model still needed **six prompts and three control-bug corrections** to land a playable artifact, one more prompt than the same model's *no-skill* control run. The skill carried the structure; the human carried the correctness.
