---
name: verify
description: Build and drive the examples/ UI components (tone-ui.js, lit) in headless Chrome to verify changes.
---

# Verifying examples/ui (tone-ui.js)

Build: `cd examples/ui && npm run build` → writes a minified `examples/js/tone-ui.js` (esbuild IIFE, exposes `Tone`, `bind()`, `ui()`, `drawer()`, `piano()`, `meter()`, `fft()`, `waveform()` on window; typed for the pages in `examples/ui/globals.d.ts`).

Page typecheck: `npm run test:html` typechecks each page's script against `globals.d.ts`.

Serve: `npm run watch -w examples/ui` rebuilds on change and serves `examples/` at http://localhost:8000 via http-server (extensionless URLs like `/offline` resolve to `.html`, caching off). The user may already have it running on 8000; probe with your own port and stop only processes you started (by PID, not `pkill -f`) (pages load `./js/tone-ui.js` and `./js/ExampleList.json` by relative path). `cd examples && python3 -m http.server 8765` also works against a one-off build.
Typecheck the UI with `npx tsc -p examples/ui` (the tsconfig has `noEmit`; without it tsc writes `.js` next to every source, including `Tone/`).

Drive: puppeteer is in root `node_modules` with a downloaded Chrome. From a script outside the repo:
`createRequire("<repo>/package.json")("puppeteer")`, launch with `--autoplay-policy=no-user-gesture-required`.

Gotchas:
- Everything is in nested shadow roots: walk with `el.shadowRoot.querySelector` per level, then click real coordinates via `page.mouse`.
- Triple-click doesn't select text in shadow-DOM inputs; call `input.select()` before typing.
- Piano: click white keys low (~85% height). The upper half is covered by the black-key row, including invisible `note=0` spacers.
- `tone-slider` wraps `md-slider`: target `tone-slider` → `md-slider` and click within its track, which is the host box minus 20px on each side.
- Page scripts declare top-level `const synth` etc., readable from `page.evaluate` by bare name (not `window.synth`).
- To see what a `bind()` wired up, spy on the Tone object's methods from `page.evaluate` (e.g. wrap `synth.triggerAttack`) and then drive the element.
- `tone-audio-node` editors: the inspector reverts invalid values from `tone.get()`, so check the input's value after Enter as well as the node's value.

Good flows: stepSequencer.html (cells, play toggle, tempo slider, transport highlight), amSynth.html (piano, audio-node editor, envelope vis, value reject), buses.html (drawer, Shift+H hide, slider → channel volume), mic.html, quantization.html, meter.html.
