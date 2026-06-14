# JOURNEY

## Setup recap

- **Model**: gpt-5.5
- **Skill**: —
- **Agent**: Codex
- **Variant**: `gpt-5-5-no-omo-codex`
- **Prompt**: Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.

## Timeline

1. Inspected the empty workspace and project instructions, then chose a static web build instead of adding a framework.
2. Created `index.html`, `styles.css`, and `src/main.js` with a Three.js skyline scene, bird model, pipe obstacles, scoring, and restart flow.
3. Served the game locally with `python3 -m http.server 4173` and confirmed the page, module file, and Three.js CDN loaded.
4. Attempted Browser plugin verification, found the in-app browser endpoint unavailable, then used headless Google Chrome for render screenshots and JavaScript error checks.
5. Fixed a scenery recycling bug for building lights and added narrow-screen text safeguards after checking desktop and narrow viewport captures.

## Observations

- The Browser plugin was installed but unavailable as `iab` in this session, so verification used the system Chrome binary instead.
- Playwright CLI was available through `npx`, but its browser package/import path was not usable for the full interaction script without installing browsers.

## Takeaway

A compact static Three.js implementation was enough for a playable, visually rich result; the main verification gap was lack of full automated interaction coverage because the local Browser endpoint and Playwright browser install were unavailable.
