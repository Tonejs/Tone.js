import * as path from "node:path";
import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes("--watch") || process.argv.includes("-w");

const buildConfig: esbuild.BuildOptions = {
	entryPoints: [path.resolve(__dirname, "index.ts")],
	outfile: path.resolve(__dirname, "../js/tone-ui.js"),
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
};

async function main() {
	if (isWatch) {
		const ctx = await esbuild.context(buildConfig);
		await ctx.watch();
		console.log("Watching for changes in @tonejs/ui...");
	} else {
		await esbuild.build(buildConfig);
		console.log("Built tone-ui.js successfully.");
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
