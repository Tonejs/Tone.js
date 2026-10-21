import path from "node:path";
import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";

import { workletInlinePlugin } from "./esbuild-worklet-plugin.mjs";

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	".."
);

await esbuild.build({
	entryPoints: [path.join(rootDir, "Tone/index.ts")],
	bundle: true,
	outfile: path.join(rootDir, "build/Tone.js"),
	format: "iife",
	globalName: "Tone",
	target: "es2017",
	platform: "browser",
	minify: true,
	sourcemap: true,
	tsconfig: path.join(rootDir, "tsconfig.json"),
	plugins: [workletInlinePlugin()],
});

console.log("Wrote build/Tone.js");
