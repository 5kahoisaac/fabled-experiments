# JOURNEY — Experiment 01 · fable-5 · Claude Chat (Web)

> The **thinking process** for this run: how the model approached the single
> prompt, where it hesitated, what it cut, and what it nailed.

## Setup recap

- Model: `claude-fable-5` (baseline, no skill)
- Prompt: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Sequence (order of work; per-phase timing not recorded)

1. **Read the prompt.** Latched onto the two soft words — "pretty" and "playable" — and treated them as the real spec.
   Translated them into checkable targets before any code: named palette, real lighting with shadows, depth cues, all UI
   states, forgiving input. Decided on one self-contained HTML file, Three.js, no build step.

2. **Scaffolding.** Read the frontend-design skill first, committed to one aesthetic ("papercraft dawn") so choices
   wouldn't drift, then made the key structural call: a **pure logic block** (no DOM/THREE, extractable boundaries)
   split from the render block — a decision made because it foresaw the verification step.

3. **Mid-build.** Slowed at the boring-but-fatal parts: pinned Three.js to r128 (not "latest"), kept best-score
   in-memory (sandboxes block storage), guarded audio + CDN + WebGL failures behind a friendly overlay. Hesitation spent
   on environment assumptions, not architecture.

4. **Wrap-up.** Extracted the logic block and ran 36 real assertions against the shipped code. One failed — diagnosis
   showed the **test** was wrong (sampled velocity after the bird had landed), so it fixed the test, not the code. Zero
   placeholders; Gate B clean.

## Observations

- **Did well:** read subjective words as the brief; separated logic from rendering to make it testable; spent caution on
  version-pinning and sandbox quirks.
- **Cut corners:** none in scope, but bounded it honestly — no external assets, no leaderboard, procedural audio only,
  stated up front.
- **Surprising:** when a check failed it interrogated the check before the code, using the requirement list as arbiter.

## Takeaway

- Thinks by front-loading intent and designing backward from verification — builds the thing it can *prove*, where the
  challenger builds the thing that *looks* done.