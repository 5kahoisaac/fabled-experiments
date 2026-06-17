# Evaluation — glm-5-1-fabled-oc (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | glm-5-1-fabled-oc |
| Role | challenger |
| Model id | `glm-5.1` (OpenCode agent, `fabled` skill) |
| Entry file | none — `result/` contains only `REPORT.md` |
| Evaluated | 2026-06-18 |

## Result

**RESULT: FAIL**
**Combined score: 0/100**  (non-build — no runnable deliverable to score)

This is the one case the gates-as-penalties rule does **not** rescue: there is
no game to run. `result/` holds only an incident `REPORT.md`, not an HTML/JS
build. Per the skill, a contender with no entry file scores 0/100 and no gates,
mechanical, or taste scoring is applicable.

## Reason

The build never produced a deliverable. Per the case's own `result/REPORT.md`
("Incident Report: OpenCode Fabled Task Failure With GLM-5.1"), the run failed
because OpenCode's `@ai-sdk/openai-compatible` streaming path to Z.ai's
`glm-5.1` Coding Plan repeatedly died (~60s socket closes / truncated SSE)
during the long Fabled generation. Fabled was the trigger (large single-task
shape), not the root cause. No game files were emitted.

## Scoring

- Gates: N/A (nothing to run)
- Mechanical: N/A (0/55)
- Taste: N/A (no evidence to capture)

> Not a quality judgment of a finished game — a record that this contender did
> not deliver one. Sorts to the bottom of the leaderboard at 0.
