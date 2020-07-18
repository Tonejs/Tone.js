/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require("path");
const { exec } = require("child_process");
const { file } = require("tmp-promise");
const { writeFile } = require("fs-extra");
const toneJson = require("../../docs/tone.json");
const eachLimit = require("async/eachLimit");
const os = require("os");
const cpuCount = os.cpus().length;

/**
 * Get all of the examples
 */
function findExamples(obj) {
	let examples = [];
	for (const prop in obj) {
		if (Array.isArray(obj[prop])) {
			obj[prop].forEach(child => {
				examples = [...examples, ...findExamples(child)];
			});
		} else if (prop === "comment" && obj[prop].tags) {
			examples = [
				...examples,
				...obj[prop].tags.filter(tag => tag.tag === "example").map(tag => tag.text)
			];
		} else if (typeof obj[prop] === "object") {
			examples = [...examples, ...findExamples(obj[prop])];
		} else {
			// console.log(prop);
		}
	}
	// filter any repeats
	return [...new Set(examples)];
}

/**
 * A promise version of exec
 */
function execPromise(cmd) {
	return new Promise((done, error) => {
		exec(cmd, (e, output) => {
			if (e) {
				error(e);
			} else {
				done(output);
			}
		});
	});
}

/**
 * Run the string through the typescript compiler
 */
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
		await execPromise(`tsc  --noEmit --target es5 --lib dom,ES2015 ${path}`);
	} finally {
		cleanup();
	}
}

async function main() {
	const examples = findExamples(toneJson);
	let passed = 0;
	await eachLimit(examples, cpuCount, async example => {
		try {
			await testExampleString(example);
			passed++;
			// print a dot for each passed example
			process.stdout.write(".");
			// add a new line occasionally
			if (passed % 100 === 0) {
				process.stdout.write("\n");
			}
		} catch (e) {
			console.log(example + "\n" + e);
			throw e;
		}
	});
	console.log(`valid examples ${passed}/${examples.length}`);
}
main();

