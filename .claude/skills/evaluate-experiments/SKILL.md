---
name: evaluate-experiments
description: Evaluate experiment results by running the mechanical-evaluator and taste-evaluator agents over every contender in experiments/exp-*/. Use when the user asks to score, grade, evaluate, or rank experiment results, or to (re)generate EVALUATION.md files and a leaderboard. Each contender's result/ is scored to /100 and written to EVALUATION.md in its case folder.
---

# Evaluate Experiments

Orchestrates the two project evaluator agents over every contender in each
experiment, writes a per-contender `EVALUATION.md`, and produces a leaderboard.

- **`mechanical-evaluator`** — checks gates (G1 console errors, G2 failure
  fallback, G3 no placeholders) then scored mechanical checks 1–5. Owns the
  mechanical subtotal (**/55**) and captures the screenshots/recording.
- **`taste-evaluator`** — scores visual/feel items 6–9 (**/45**) from those
  screenshots/recording. Subjective, n=1.
- **Combined = max(0, Mechanical/55 + Taste/45 − gate penalties), out of 100.**

**Gates are penalties, not kill-switches.** A failed gate means the build is a
bit imperfect, not unplayable — so it deducts a modest fixed penalty and the
project is **still fully scored, taste included**. Whether the game actually
works is already captured by mechanical check 1 (core functionality), so a
genuinely broken build scores low on its own without a gate having to zero it.

| Failed gate | Penalty | Why this weight |
|-------------|---------|-----------------|
| G1 — runtime errors on the happy path | −8 | worst: errors during normal play |
| G3 — placeholders / stubs | −7 | incomplete delivery |
| G2 — no failure fallback (blank dead-end) | −5 | least: only bites when a dependency fails |

`RESULT` is `PASS` (all gates pass), `PASS-WITH-DEFECTS` (≥1 gate failed but the
project was scored), or `FAIL` (reserved for a non-build — no entry HTML — which
scores 0).

## Layout this skill assumes

```
experiments/
  exp-01/                         # one experiment
    <case>/                       # one contender (model/agent variant)
      SPEC.md                     # Identity table — has the Role (baseline / contender)
      JOURNEY.md
      result/                     # the built game — what gets evaluated (READ-ONLY)
        index.html | flappy-bird-3d.html | <other>.html
      .eval/                      # ← evidence the agents capture (screenshots, recording)
        01-idle-ready.png … 05-restarted.png | recording.<ext>
      EVALUATION.md               # ← THIS SKILL WRITES THIS
    index.html                    # experiment write-up (NOT a contender, skip)
```

`exp-*` may be `exp-01`, `exp-02`, … — always glob `experiments/exp-*/`, never
hardcode one.

## Testing methodology (the part that makes scores trustworthy)

This is the recipe that produced the reference fable-5 evaluation. It is
**tool-agnostic** — the `mechanical-evaluator` agent owns the details, but the
orchestrator must know the shape so it can hand off correctly and so any coding
agent (not just one with a browser MCP) can reproduce it. Three layers of
evidence, strongest first:

1. **Drive the logic headlessly.** If the build separates logic from rendering
   (e.g. `logic.js` / a pure state machine), load it in `node`/`python` and
   step it through a scripted input sequence. Deterministic, no timing flake —
   this is the spine of "core functionality" and "all states" evidence.
2. **Run the project's own tests.** Execute whatever it ships (`run-tests.js`,
   `npm test`, `pytest`, …) and capture exit code + pass count verbatim.
3. **Exercise the real runtime for gates + visuals.** A browser-automation MCP
   if available, else headless Chrome via Bash (`puppeteer`, `playwright-core`,
   `chrome --headless`). Collect console/stderr, capture an **ordered**
   screenshot sequence, and **inject a dependency failure** (block the CDN/lib,
   stub WebGL, remove a required file) to prove the G2 fallback.

**Capture motion, not just stills.** Item 7 (feel) needs pacing evidence. Get a
short recording or a dense ordered frame burst across one run. If the automated
player dies too fast for a mid-play frame, drive inputs from the headless logic
to reach a steady state — never alter the score. Stills-only runs cap item 7's
confidence (the taste agent enforces this).

**Evidence lives in `<case>/.eval/`, never in `result/`.** The build under test
stays byte-for-byte untouched; only `.eval/` and `EVALUATION.md` are written.

## Procedure

### 1. Discover the work

- Glob `experiments/exp-*/` for experiments.
- Within each, a **contender** is any immediate subdirectory that contains a
  `result/` folder. Skip loose files like the experiment's own `index.html`.
- Resolve each contender's **entry file** inside `result/`:
  1. `result/index.html` if it exists, else
  2. the first `result/*.html`, else
  3. **no entry** → the contender is a non-build. Skip the agents; record
     `RESULT: FAIL`, `Score: 0/100`, reason "no result HTML produced", and
     still write its `EVALUATION.md`.
- Read each contender's `SPEC.md` Identity table and capture the **Role**
  (`baseline` vs `contender`) and **Model id**. The baseline is the reference
  bar — note it; it usually tops the leaderboard.

Build a TODO list (TaskCreate) with one item per contender so progress is
visible.

### 2. Score each contender

For every contender **with** an entry file, run both agents. Contenders are
independent — evaluate several in parallel where the environment allows, but do
**not** parallelize the live browser-based gates within a single contender.

1. Launch `mechanical-evaluator` (subagent_type `mechanical-evaluator`). Pass
   the **absolute path to the entry file**, e.g.
   `experiments/exp-01/fable-5/result/flappy-bird-3d.html`. It returns:
   - the three gate verdicts with evidence (PASS/FAIL each — **a failed gate is
     a penalty, never a stop**),
   - mechanical score `X/55` itemized,
   - paths to the captured screenshots (idle, mid-play, near-collision,
     end-of-run) and the ~15s recording.
2. **Always** launch `taste-evaluator` (subagent_type `taste-evaluator`) with
   the screenshot/recording paths from step 1 — gate failures do **not** skip
   taste. It returns items 6–9 and the taste subtotal `Y/45`. (The only case
   with no taste is a non-build with no entry file, handled in step 1.)
3. Compute the **gate penalty** P = sum of the penalties for any failed gates
   (G1 −8, G3 −7, G2 −5; 0 if all pass).
4. **Combined = max(0, X + Y − P)** out of 100. Set `RESULT` to `PASS` if no
   gate failed, else `PASS-WITH-DEFECTS`. Record each failed gate, its penalty,
   and the evidence.

Never have the mechanical agent guess taste items, and never have the taste
agent re-derive mechanical numbers — keep the split clean.

### 3. Write EVALUATION.md per contender

Write to `experiments/<exp>/<case>/EVALUATION.md` using the template in
[references/evaluation.template.md](references/evaluation.template.md). Record
the verbatim evidence and subtotals from both agents — do not summarize away the
command output.

### 4. Aggregate into a leaderboard

After all contenders in an experiment are scored, present a ranked table sorted
by combined score, descending:

| Rank | Contender | Role | Mechanical /55 | Taste /45 | Gate penalty | Total /100 | Result |
|------|-----------|------|----------------|-----------|--------------|------------|--------|

Show the gate penalty (e.g. `−5 (G2)`, or `0`) so the deduction is visible.
Call out where the **baseline** landed. If a contender beat the baseline, flag
it explicitly — that is the interesting signal. Non-build contenders (no entry
HTML, `RESULT: FAIL`) sort to the bottom at 0.

If multiple `exp-*` folders were processed, give one leaderboard per experiment.

## Notes

- **Idempotent / re-runnable.** An existing `EVALUATION.md` is overwritten with
  the fresh run. If the user asks to evaluate "only new" or "only failed"
  contenders, skip those that already have a passing `EVALUATION.md`.
- **Evidence or it didn't happen.** Both agents must report real command/tool
  output. "Looks fine" with no output is not an acceptable score line — reflect
  that faithfully rather than inflating.
- **Don't touch `result/`.** Evaluation is read-only against the contender's
  build; only `EVALUATION.md` and the sibling `.eval/` evidence folder are
  created/updated. Never write screenshots or scratch files into `result/`.
