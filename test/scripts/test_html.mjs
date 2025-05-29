import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { globSync } from "glob";
import { JSDOM } from "jsdom";
import { file } from "tmp-promise";

import { execPromise, ROOT_DIR } from "./utils.mjs";

async function testExampleString(str) {
	// str = str.replace("from \"tone\"", `from "${resolve(__dirname, "../../")}"`);
	str = `
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

const htmlFiles = globSync(resolve(ROOT_DIR, "examples/*.html"));

async function main() {
	for (let i = 0; i < htmlFiles.length; i++) {
		const path = htmlFiles[i];
		const fileAsString = (await readFile(path)).toString();
		const dom = new JSDOM(fileAsString);
		const scriptTag = dom.window.document.querySelector("body script");
		if (scriptTag) {
			try {
				await testExampleString(scriptTag.textContent);
				console.log("passed", path);
			} catch (e) {
				console.log("failed", path);
				console.log(e);
				throw new Error(e);
			}
		}
	}
}
main();
