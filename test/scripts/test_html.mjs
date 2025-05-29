import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { createFixture } from "fs-fixture";
import { JSDOM } from "jsdom";
import { globSync } from "tinyglobby";

import { execPromise, ROOT_DIR } from "./utils.mjs";

const htmlFiles = globSync(resolve(ROOT_DIR, "examples/*.html"), { absolute: true });

async function createFixtureFiles(files) {
	const createExampleString = (str) => `
import * as Tone from "${ROOT_DIR}"
let ui: any;
let drawer: any;
let meter: any;
let piano: any;
let fft: any;
let waveform: any;
let document: any;
let p5: any;
${str}
`;

	const data = {};

	for (const file of files) {
		const name = basename(file).split(".")[0];
		const html = await readFile(file, "utf-8");
		const dom = new JSDOM(html);
		const script = dom.window.document.querySelector("body script");

		if (!script || !script.textContent) {
			console.warn("Could not get script contents: %s", file);
			continue;
		};

		data[`${name}.ts`] = createExampleString(script.textContent);
	}

	return await createFixture(data);
}

async function main() {
	const fixtures = await createFixtureFiles(htmlFiles);

	try {
		await execPromise(
			`tsc --noEmit --target es5 --lib dom,ES2015 ${fixtures.path}/*.ts`
		);
	} catch (error) {
		if (error instanceof Error && error?.stdout) {
			console.warn(error.stdout);
		} else {
			throw Error("Unexpected", { cause: error });
		}
	}

	await fixtures.rm();

	console.log(`Tested ${htmlFiles.length} examples`);
}

main();
