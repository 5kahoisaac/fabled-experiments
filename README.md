# Fable → Fabled · Experiment Showcase

A static site that logs head-to-head **single-prompt build** experiments:
**Fable 5** (baseline) vs. a **cheaper model running the `Fabled` skill** (challenger).

Companion to the *From Fable to Fabled* series.

> Status: **placeholder data**. Experiment 01 is scaffolded with stub metrics and
> placeholder result pages. Swap in real numbers and real result HTML when ready.

## Run it

No build step, but the **Markdown viewer uses `fetch()`** — so serve the folder
rather than opening from `file://`:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

The landing page itself works from `file://` (its data is a plain script); only
`viewer.html` (SPEC.md / JOURNEY.md rendering) needs the local server.

## Structure

Each experiment is its own folder under `experiments/`, and **each model run is a
`MODEL_NAME/` sub-folder** holding the result HTML plus two Markdown docs.

```
exp/
├── index.html                       # Landing: hero + experiment gallery + method
├── viewer.html                      # In-browser Markdown viewer (?doc=path.md)
├── assets/
│   ├── css/styles.css               # Editorial lab-report theme (design tokens)
│   ├── js/main.js                   # Renders cards from window.EXPERIMENTS
│   ├── js/viewer.js                 # Self-contained Markdown → HTML renderer
│   └── data/experiments.js          # ← edit this to add/update experiments
└── experiments/
    └── exp-01/
        ├── index.html               # experiment overview (web-viewable)
        ├── fable-5/                  # MODEL_NAME sub-folder (baseline)
        │   ├── index.html           #   root HTML recording the result
        │   ├── SPEC.md              #   params of the run (for comparing)
        │   └── JOURNEY.md           #   the thinking process
        └── glm-5-1-fabled/         # MODEL_NAME sub-folder (challenger)
            ├── index.html
            ├── SPEC.md
            └── JOURNEY.md
```

`SPEC.md` keeps the **same field names across every model** so runs compare
cleanly side by side. Both `.md` files open in the viewer:
`viewer.html?doc=experiments/exp-01/fable-5/SPEC.md`.

## Add a new experiment

1. Create `experiments/exp-02/` with an overview `index.html`, and one
   `MODEL_NAME/` sub-folder per contender (copy `exp-01/fable-5/` as a template:
   `index.html` + `SPEC.md` + `JOURNEY.md`).
2. Append an object to the array in `assets/data/experiments.js`:

```js
{
  id: "exp-02",
  title: "Your experiment name",
  episode: "Ep.2",
  date: "2026-06-20",          // ISO YYYY-MM-DD
  status: "ready",             // "ready" | "running" | "planned"
  prompt: "The exact single prompt both contenders received.",
  folder: "experiments/exp-02/",
  doc: "experiments/exp-02/index.html",
  contenders: [
    {
      role: "baseline", label: "Fable 5", model: "claude-fable-5", skill: "—",
      dir: "experiments/exp-02/fable-5/",
      result: "experiments/exp-02/fable-5/index.html",
      spec: "experiments/exp-02/fable-5/SPEC.md",
      journey: "experiments/exp-02/fable-5/JOURNEY.md",
      tokens: "120 k", cost: "$1.80", time: "95 s", prompts: 1, outcome: "Ran clean"
    },
    {
      role: "challenger", label: "Cheaper + Fabled", model: "claude-haiku-4-5", skill: "fabled",
      dir: "experiments/exp-02/glm-5-1-fabled/",
      result: "experiments/exp-02/glm-5-1-fabled/index.html",
      spec: "experiments/exp-02/glm-5-1-fabled/SPEC.md",
      journey: "experiments/exp-02/glm-5-1-fabled/JOURNEY.md",
      tokens: "140 k", cost: "$0.30", time: "60 s", prompts: 1, outcome: "Ran clean"
    }
  ],
  winner: "challenger",        // "baseline" | "challenger" | "tbd"
  notes: "Optional caption."
}
```

## Swap in real results

For each model folder, replace `index.html` with the actual build output (you can
paste a full standalone HTML doc — the shared CSS link is optional), fill in
`SPEC.md` and `JOURNEY.md`, then update the metrics + `winner` in `experiments.js`.
