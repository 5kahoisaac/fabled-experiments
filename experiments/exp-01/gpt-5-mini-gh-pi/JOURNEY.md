# JOURNEY

## Setup recap

- **Model**: gpt-5-mini
- **Skill**: —
- **Agent**: Pi
- **Variant**: `gpt-5-mini-gh-pi`
- **Prompt**: Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.
- **Human turns**: 8 (1 original prompt + 5 steering turns + 2 human-in-the-loop browser-error reports)

## Timeline

1. The agent (gpt-5-mini via GitHub Copilot) produced a 3D Flappy Bird codebase; local files were written to the working directory.
2. The developer opened the provided index.html in a modern browser to validate rendering and gameplay.
3. The page failed to load cleanly: module import resolution and CDN/example-module errors were observed in the browser console.
4. Several automated fixes were applied (import map, fallback CDNs, inline shader, low-quality fallbacks), but additional runtime failures persisted.
5. After repeated attempts to resolve the remaining browser errors the developer aborted the verification run and recorded this incident.

## Observations

- Browser console showed unresolved module specifier errors and CDN 404/500 responses (three example modules failed to load reliably).
- Postprocessing and heavy passes caused unplayable framerate on some devices; fallbacks were introduced but some race/reload conditions remained.
- No Fabled skill was used this session — this is a no-skill control run.

## Takeaway

The build produced working code but verification uncovered environment-specific module resolution and CDN reliability issues. The run is recorded as a failed control to surface the incident and aid future debugging.
