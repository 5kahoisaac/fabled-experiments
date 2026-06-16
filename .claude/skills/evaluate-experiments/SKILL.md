---
name: evaluate-experiments
description: Evaluate experiment results by running the mechanical-evaluator and taste-evaluator agents over every contender in experiments/exp-*/. Use when the user asks to score, grade, evaluate, or rank experiment results, or to (re)generate EVALUATION.md files and a leaderboard. Each contender's result/ is scored to /100 and written to EVALUATION.md in its case folder.
---

# Evaluate Experiments

Orchestrates the two project evaluator agents over every contender in each
experiment, writes a per-contender `EVALUATION.md`, and produces a leaderboard.

- **`mechanical-evaluator`** — runs gates (G1 console errors, G2 failure
  fallback, G3 no placeholders) then scored mechanical checks 1–5. Owns the
  mechanical subtotal (**/55**) and captures the screenshots/recording.
- **`taste-evaluator`** — scores visual/feel items 6–9 (**/45**) from those
  screenshots/recording. Subjective, n=1.
- **Combined = /100.**

## Layout this skill assumes

```
experiments/
  exp-01/                         # one experiment
    <case>/                       # one contender (model/agent variant)
      SPEC.md                     # Identity table — has the Role (baseline / contender)
      JOURNEY.md
      result/                     # the built game — what gets evaluated
        index.html | flappy-bird-3d.html | <other>.html
      EVALUATION.md               # ← THIS SKILL WRITES THIS
    index.html                    # experiment write-up (NOT a contender, skip)
```

`exp-*` may be `exp-01`, `exp-02`, … — always glob `experiments/exp-*/`, never
hardcode one.

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
   - `RESULT: PASS|FAIL`, the three gate verdicts with evidence,
   - mechanical score `X/55` itemized,
   - paths to the captured screenshots (idle, mid-play, near-collision,
     end-of-run) and the ~15s recording.
2. If the mechanical result is **FAIL** (a gate failed), the combined score is
   **0/100** — do **not** run taste scoring. Record the failed gate(s).
3. If **PASS**, launch `taste-evaluator` (subagent_type `taste-evaluator`) with
   the screenshot/recording paths from step 1. It returns items 6–9 and the
   taste subtotal `Y/45`.
4. Combined score = `X + Y` out of 100.

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

| Rank | Contender | Role | Mechanical /55 | Taste /45 | Total /100 | Result |
|------|-----------|------|----------------|-----------|------------|--------|

Call out where the **baseline** landed. If a contender beat the baseline, flag
it explicitly — that is the interesting signal. FAIL contenders sort to the
bottom at 0.

If multiple `exp-*` folders were processed, give one leaderboard per experiment.

## Notes

- **Idempotent / re-runnable.** An existing `EVALUATION.md` is overwritten with
  the fresh run. If the user asks to evaluate "only new" or "only failed"
  contenders, skip those that already have a passing `EVALUATION.md`.
- **Evidence or it didn't happen.** Both agents must report real command/tool
  output. "Looks fine" with no output is not an acceptable score line — reflect
  that faithfully rather than inflating.
- **Don't touch `result/`.** Evaluation is read-only against the contender's
  build; only `EVALUATION.md` is created/updated.
