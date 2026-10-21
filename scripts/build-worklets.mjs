import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { globSync } from "tinyglobby";

import { bundleWorkletToModule } from "./esbuild-worklet-plugin.mjs";

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	".."
);
const esmDir = path.join(rootDir, "build/esm/Tone");

// bundles every *.worklet.ts file
const workletFiles = globSync("Tone/**/*.worklet.ts", { cwd: rootDir }).sort();

if (workletFiles.length === 0) {
	throw new Error("No *.worklet.ts files were found");
}

for (const file of workletFiles) {
	const content = await bundleWorkletToModule(path.join(rootDir, file));
	const relativeGenerated = file
		.replace(/^Tone\//, "")
		// Outputs it as *.worklet.code.js
		.replace(/\.ts$/, ".code.js");

	const outPath = path.join(esmDir, relativeGenerated);
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, content);

	console.log(`Bundled ${file} -> Tone/${relativeGenerated}`);
}
