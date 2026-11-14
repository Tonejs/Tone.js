import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createFixture } from "fs-fixture";
import { JSDOM } from "jsdom";
import { marked } from "marked";

import { execPromise, ROOT_DIR } from "./utils.mjs";

const entry = "README.md";

async function findScripts() {
	const readme = await readFile(resolve(ROOT_DIR, entry), "utf-8");
	const html = await marked.parse(readme);
	const dom = new JSDOM(html);
	return dom.window.document.querySelectorAll("code.language-javascript");
}

async function createFixtureFiles(scripts) {
	const createExampleString = (str) => `
import * as Tone from "tone";
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
				skipLibCheck: true,
				noEmit: true,
				paths: {
					tone: [resolve(ROOT_DIR, "Tone/index.ts")],
				},
			},
			include: ["*.ts"],
		}),
	};

	for (const [i, e] of Object.entries(scripts)) {
		data[`${i}.ts`] = createExampleString(e.textContent);
	}

	return await createFixture(data);
}

async function main() {
	const scripts = await findScripts();
	const fixtures = await createFixtureFiles(scripts);

	await execPromise(`tsc -p ${fixtures.path}`);

	await fixtures.rm();

	console.log("Successfully tested %o scripts in %o", scripts.length, entry);
}

main();
