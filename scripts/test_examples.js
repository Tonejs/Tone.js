/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require("path");
const { exec } = require("child_process");
const { file } = require("tmp-promise");
const { writeFile } = require("fs-extra");
const toneJson = require("../docs/tone.json");
const eachLimit = require("async/eachLimit");

/**
 * Get all of the examples
 */
function findExamples(obj) {
	let examples = [];
	for (let prop in obj) {
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
				error(output);
			} else {
				done();
			}
		});
	});
}

/**
 * Run the string through the typescript compiler
 */
async function testExampleString(str) {
	str = str.replace("from \"tone\"", `from "${resolve(__dirname, "../")}"`);
	const { path, cleanup } = await file({ postfix: ".ts" });
	// work with file here in fd
	await writeFile(path, str);
	try {
		await execPromise(`tsc ${path}`);
	} finally {
		cleanup();
	}
}

const examples = findExamples(toneJson);

async function main() {
	let passed = 0;
	await eachLimit(examples, 4, async example => {
		try {
			await testExampleString(example);
			passed++;
		} catch (e) {
			console.log(example + "\n" + e);
		}
	});
	console.log(`valid examples ${passed}/${examples.length}`);
}
main();

