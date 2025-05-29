import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createFixture } from "fs-fixture";
import { JSDOM } from "jsdom";
import showdown from "showdown";

import { execPromise, ROOT_DIR } from "./utils.mjs";

const { Converter } = showdown;

const entry = "README.md";

async function findScripts() {
	const readme = await readFile(resolve(ROOT_DIR, entry), "utf-8");
	const html = (new Converter()).makeHtml(readme);
	const dom = new JSDOM(html);
	return dom.window.document.querySelectorAll("code.javascript");
}

async function createFixtureFiles(scripts) {
	const createExampleString = (str) => `
import * as Tone from "${ROOT_DIR}"
${str}
`;

	const data = {};

	for (const [i, e] of Object.entries(scripts)) {
		data[`${i}.ts`] = createExampleString(e.textContent);
	}

	return await createFixture(data);
}

async function main() {
	const scripts = await findScripts();
	const fixtures = await createFixtureFiles(scripts);

	await execPromise(
		`tsc --noEmit --target es5 --lib dom,ES2015 ${fixtures.path}/*.ts`
	);

	await fixtures.rm();

	console.log("Tested %o scripts in %o", scripts.length, entry);
}

main();
