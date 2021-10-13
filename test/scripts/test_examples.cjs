/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require("path");
const { exec } = require("child_process");
const { file } = require("tmp-promise");
const { writeFile } = require("fs-extra");
const toneJson = require("../../docs/tone.json");

const testSplit = parseInt(process.env.TEST_EXAMPLES || "0");

/**
 * Get all of the examples
 */
function findExamples(obj) {
	let examples = [];
	for (const prop in obj) {
		if (Array.isArray(obj[prop])) {
			obj[prop].forEach((child) => {
				examples = [...examples, ...findExamples(child)];
			});
		} else if (prop === "comment" && obj[prop].tags) {
			examples = [
				...examples,
				...obj[prop].tags
						.filter((tag) => tag.tag === "example")
						.map((tag) => tag.text),
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
		exec(cmd, (_, output) => {
			if (output) {
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
	// str = str.replace("from \"tone\"", `from "${resolve(__dirname, "../../")}"`);
	str = `
		import * as Tone from "${resolve(__dirname, "../../")}"
		function main(){
			${str}
		}
		main();
	`;
	const { path, cleanup } = await file({ postfix: ".ts" });
	try {
		// work with file here in fd
		await writeFile(path, str);
		await execPromise(
			`tsc  --noEmit --target es5 --lib dom,ES2015 ${path}`
		);
	} finally {
		cleanup();
	}
}

async function main() {
	let examples = findExamples(toneJson);
	if (testSplit > 0) {
		// split it in half and choose either the first or second half
		const halfLength = Math.ceil(examples.length / 2);
		const splitStart = (testSplit - 1) * halfLength;
		const splitEnd = (testSplit) * halfLength;
		examples = examples.slice(splitStart, splitEnd);
		console.log(`texting examples ${splitStart} - ${splitEnd}`);
	}
	let passed = 0;
	for (let i = 0; i < examples.length; i++) {
		const example = examples[i];
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
	}
	console.log(`\nvalid examples ${passed}/${examples.length}`);
	if (passed !== examples.length) {
		throw new Error("didn't pass all tests");
	}
}
main();
