import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { JSDOM } from "jsdom";
import showdown from "showdown";
import { file } from "tmp-promise";

import { execPromise, ROOT_DIR } from "./utils.mjs";

const { Converter } = showdown;

async function testExampleString(str) {
	// str = str.replace("from \"tone\"", `from "${resolve(__dirname, "../../")}"`);
	str = `
		import * as Tone from "${ROOT_DIR}"
		${str}
	`;
	const { path, cleanup } = await file({ postfix: ".ts" });
	// work with file here in fd
	await writeFile(path, str);
	try {
		await execPromise(
			`tsc  --noEmit --target es5 --lib dom,ES2015 ${path}`
		);
	} finally {
		cleanup();
	}
}

async function main() {
	const readme = (
		await readFile(resolve(ROOT_DIR, "README.md"))
	).toString();
	const html = new Converter().makeHtml(readme);
	const dom = new JSDOM(html);
	const scripts = dom.window.document.querySelectorAll("code.javascript");
	for (let i = 0; i < scripts.length; i++) {
		try {
			await testExampleString(scripts[i].textContent);
			process.stdout.write(".");
		} catch (e) {
			console.log("\nfailed", scripts[i].textContent);
			console.log(e);
			throw new Error(e);
		}
	}
	console.log("\n");
}
main();
