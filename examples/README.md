The examples use web components (e.g. `<tone-example>`) and helpers like `ui()` and `bind()` from `tone-ui.js`, which is built from the source in [ui/](./ui).

### Running examples locally

Check out the repository, and from the root run:

```bash
npm install
npm run watch -w examples/ui
```

This builds `tone-ui.js`, rebuilds it on every change to the UI or to Tone.js, and serves the examples at http://localhost:8000.

To build `tone-ui.js` once without serving the examples, run `npm run build -w examples/ui`.

### Adding examples

To contribute examples, please follow the current style of the examples. Add your example's title and file name to `ExampleList.json` for it to appear in the examples list. (cf. [CONTRIBUTING.md](https://github.com/Tonejs/Tone.js/blob/dev/.github/CONTRIBUTING.md))

The Tone.js code of an example goes in a `<script data-tone-code>` block, which the page also displays. The code which connects it to the page's controls goes in a separate `<script>` after it. `npm run test:html` typechecks the scripts of all of the examples.
