Flappy 3D — Pretty web version of Flappy Bird

How to run

1. Open index.html in a modern browser (Chrome, Firefox, Edge). No build step required.
2. Click Start or press Space / tap to flap.

Features

- 3D bird with wing animation and simple physics (gravity + flap impulse).
- Moving textured pipes with rounded caps, scoring, increasing difficulty.
- Particles and satisfying SFX for flap, point, and hit (WebAudio synthesized).
- Ambient pad and simple arpeggio music loop (generated with WebAudio).
- Subtle postprocessing: bloom, film grain, vignette, and FXAA.
- Procedural mountains and swaying grass for parallax depth.
- Local leaderboard (top 5) and best score saved to localStorage.
- Mute button to toggle all audio.

Notes

- Built with Three.js via CDN. No external assets — textures are procedurally generated.
- Audio uses WebAudio; user interaction is required to start audio (click/space/tap).
- If performance is slow on low-end devices, try closing other tabs or disabling bloom in code.
- Tweak constants in main.js (gravity, flapPower, speed, pipeGap) to change difficulty.
