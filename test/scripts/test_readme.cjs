/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const { JSDOM } = require("jsdom");
const { resolve } = require("path");
const { readFile, writeFile } = require("fs-extra");
const { exec } = require("child_process");
const { file } = require("tmp-promise");
const { Converter } = require("showdown");

/**
 * A promise version of exec
 */
function execPromise(cmd) {
	return new Promise((done, error) => {
		exec(cmd, (e, output) => {
			if (e) {
				error(output);
			} else {
				done();
			}
		});
	});
}

async function testExampleString(str) {
	// str = str.replace("from \"tone\"", `from "${resolve(__dirname, "../../")}"`);
	str = `
		import * as Tone from "${resolve(__dirname, "../../")}"
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
		await readFile(resolve(__dirname, "../../README.md"))
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
