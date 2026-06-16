# Evaluation — {{case}} (exp-{{NN}})

| Field | Value |
|-------|-------|
| Experiment | exp-{{NN}} |
| Contender | {{case}} |
| Role | {{baseline \| contender}} |
| Model id | {{model-id}} |
| Entry file | result/{{entry.html}} |
| Evaluated | {{YYYY-MM-DD}} |

## Result

**RESULT: {{PASS \| FAIL}}**
**Combined score: {{N}}/100**  (Mechanical {{X}}/55 + Taste {{Y}}/45)

## Gates (mechanical-evaluator)

| Gate | Verdict | Evidence |
|------|---------|----------|
| G1 — happy-path console errors | {{PASS/FAIL}} | {{exact output}} |
| G2 — failure fallback (no blank page) | {{PASS/FAIL}} | {{exact output}} |
| G3 — zero placeholders/stubs | {{PASS/FAIL}} | {{exact output}} |

> If any gate FAILED, score is 0/100 and taste was not run. List the failed
> gate(s) above and stop here.

## Mechanical checks — {{X}}/55

| # | Check | Pts | Score | Evidence |
|---|-------|-----|-------|----------|
| 1 | Core mechanics correct | 20 | {{}}/20 | {{}} |
| 2 | Verified by real tests | 12 | {{}}/12 | {{}} |
| 3 | Stable performance (happy path) | 8 | {{}}/8 | {{}} |
| 4 | Input robustness | 8 | {{}}/8 | {{}} |
| 5 | All UI states present | 7 | {{}}/7 | {{}} |

## Taste checks — {{Y}}/45  (taste-evaluator, n=1, subjective)

| # | Check | Weight | Rating /5 | Pts | Reasoning |
|---|-------|--------|-----------|-----|-----------|
| 6 | Visual cohesion | 15 | {{}}/5 | {{}} | {{}} |
| 7 | Feel of motion | 12 | {{}}/5 | {{}} | {{}} |
| 8 | Difficulty curve fairness | 10 | {{}}/5 | {{}} | {{}} |
| 9 | Overall delight | 8 | {{}}/5 | {{}} | {{}} |

Captured artifacts: {{screenshot paths}}, {{recording path}}

> Taste reflects one rater's subjective judgment (n=1); not an objective
> measurement.
