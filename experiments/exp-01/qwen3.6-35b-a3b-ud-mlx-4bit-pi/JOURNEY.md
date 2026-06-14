# JOURNEY — Experiment 01 · qwen3.6-35b-a3b-ud-mlx-4bit-pi

## Setup recap

- **Model**: `qwen3.6-35b-a3b-ud-mlx-4bit` (local, MLX 4-bit, on-device)
- **Skill**: — (none invoked)
- **Agent**: Pi
- **Variant**: `qwen3.6-35b-a3b-ud-mlx-4bit-pi`
- **Prompt**: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Timeline

1. **Committed to a single self-contained HTML file with Three.js from CDN.** Chose the simplest
   possible delivery — one `index.html` with embedded CSS/JS and Three.js r128 from cdnjs — and laid
   out a feature list up front: a 3D bird (not a cube), textured pipes, a gradient sky with clouds,
   particle effects, smooth lighting, score tracking, and start/game-over screens.
2. **Built the whole game in one write turn (~120 s active).** Authored the complete file in a single
   `write` call: a composed 3D bird (body + belly + head + eye + beak + flapping wing + tail),
   cylinder pipes with rims and stripe/highlight detailing, a striped grass ground with a dirt layer,
   drifting cloud clusters, a glowing sun sphere, hemisphere + directional lighting with soft shadows,
   fog, ACES tone mapping, flap-on-input physics with velocity-based tilt, pipe spawning/collision/
   scoring, a death flash, particle bursts on flap/score/death, and a start/over overlay with
   localStorage best-score.
3. **Opened it in the browser and hit two real runtime errors.** Loading via `file://` surfaced:
   (a) `Uncaught TypeError: Cannot set properties of undefined (setting 'wing')` at `bird.wing = wing`,
   because `bird` was referenced before it was assigned (the group was still being assembled as
   `birdGroup`, with `bird = birdGroup` only at the end); and (b) a `file://`-origin WebGL/security
   warning blocking the page.
4. **Fixed both in one corrective turn (~38 s active).** (a) Changed `bird.wing = wing` →
   `birdGroup.wing = wing` so the wing is attached to the group that actually exists at that point;
   the later `bird.wing` reads in the loop are fine because `bird = birdGroup` has run by then. (b)
   Started a local `python3 -m http.server 8080` and re-opened at `http://localhost:8080` to clear the
   `file://` origin restriction.
5. **No further errors reported.** After the fix the game ran; the user did not report additional
   problems and moved on to packaging the run.

## Observations

- **Single-shot delivery worked.** A complete, pretty, playable 3D game came out of one `write` call —
  the only follow-up needed was a genuine bug the model introduced (use-before-assignment) plus a
  deployment-environment issue (`file://` vs. HTTP).
- **The bug was a classic hoisting/ordering slip, not a design flaw.** Building `birdGroup` and only
  aliasing it to `bird` at the end meant any reference to `bird` mid-construction was undefined. It was
  a one-token-class fix (`birdGroup.wing`), and the rest of the code's later `bird.*` reads were
  correct by construction.
- **"Pretty" was taken seriously for a local 35B model.** Soft shadows, ACES filmic tone mapping,
  exponential fog, a sun sphere, parallax clouds, particle effects, and a velocity-driven bird tilt —
  more visual polish than a bare "make it 3D" reading would require.
- **Cost is the headline differentiator.** At $0 (on-device MLX, no API) it is the cheapest run in
  exp-01 by definition. Token usage *is* recoverable from the oMLX server log (~130.8k prompt +
  ~8.6k completion across 7 build turns), even though pi's session JSONL reported zeros — so the
  comparison with cloud-API runs is free-local-compute vs. metered-cloud-compute on cost, but
  like-for-like on token counts.
- **Verification stayed lightweight.** Unlike some controls, this run was not exercised via headless
  automation; evidence is the corrective fix plus the absence of follow-up errors.

## Takeaway

`qwen3.6-35b-a3b-ud-mlx-4bit` on Pi, with no skill and no API budget, shipped a complete pretty 3D
Flappy Bird in one build turn and recovered from its own bug in one more — fast (~2.6 min active),
free, and functional, at the cost of uninstrumented metrics and only informal browser verification.
