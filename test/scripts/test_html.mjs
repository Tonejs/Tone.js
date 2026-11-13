import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { createFixture } from "fs-fixture";
import { JSDOM } from "jsdom";
import { globSync } from "tinyglobby";

import { execPromise, ROOT_DIR } from "./utils.mjs";

const htmlFiles = globSync(resolve(ROOT_DIR, "examples/*.html"), {
	absolute: true,
});

async function createFixtureFiles(files) {
	// the UI globals are typed by examples/ui/globals.d.ts
	const createExampleString = (str) => `
export {};
let document: any;
let p5: any;
${str}
`;

	const data = {
		"tsconfig.json": JSON.stringify({
			compilerOptions: {
				target: "ES2022",
				module: "ESNext",
				moduleResolution: "bundler",
				lib: ["ES2022", "DOM", "DOM.Iterable"],
				experimentalDecorators: true,
				useDefineForClassFields: false,
				esModuleInterop: true,
				noEmit: true,
				skipLibCheck: true,
				paths: { tone: [resolve(ROOT_DIR, "Tone/index.ts")] },
			},
			include: ["*.ts", resolve(ROOT_DIR, "examples/ui/globals.d.ts")],
		}),
	};

	for (const file of files) {
		const name = basename(file).split(".")[0];
		const html = await readFile(file, "utf-8");
		const dom = new JSDOM(html);
		// the scripts share the global scope, so they are joined in order
		const script = Array.from(
			dom.window.document.querySelectorAll("body script")
		)
			.map((s) => s.textContent)
			.join("\n");

		if (!script.trim()) {
			console.warn("Could not get script contents: %s", file);
			continue;
		}

		data[`${name}.ts`] = createExampleString(script);
	}

	return await createFixture(data);
}

async function main() {
	const fixtures = await createFixtureFiles(htmlFiles);

	let failed = false;
	try {
		await execPromise(`tsc -p ${fixtures.path}`);
	} catch (error) {
		if (error instanceof Error && error?.stdout) {
			console.warn(error.stdout);
			failed = true;
		} else {
			throw Error("Unexpected", { cause: error });
		}
	}

	await fixtures.rm();

	if (failed) {
		console.warn("The examples have type errors.");
		process.exitCode = 1;
	} else {
		console.log(`Successfully tested ${htmlFiles.length} examples.`);
	}
}

main();
