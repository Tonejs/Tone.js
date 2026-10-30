import * as path from "node:path";
import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes("--watch");

const buildConfig: esbuild.BuildOptions = {
	entryPoints: [path.resolve(__dirname, "index.ts")],
	outfile: path.resolve(__dirname, "../tone-ui.js"),
	bundle: true,
	format: "iife",
	globalName: "ToneUI",
	sourcemap: isWatch ? "inline" : false,
	minify: !isWatch,
	target: "es2021",
	alias: {
		tone: path.resolve(__dirname, "../../Tone/index.ts"),
	},
	footer: {
		js: "Object.assign(window, ToneUI);",
	},
	// esbuild reports the build and any errors
	logLevel: "info",
};

if (isWatch) {
	const ctx = await esbuild.context(buildConfig);
	await ctx.watch();
} else {
	await esbuild.build(buildConfig);
}
