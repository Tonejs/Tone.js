/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require("path");
const { exec } = require("child_process");
const { file } = require("tmp-promise");
const { writeFile } = require("fs-extra");
const toneJson = require("../../docs/tone.json");

/**
 * Get all of the examples
 */
function findExamples(obj) {
	let examples = [];

	function traverse(node) {
		if (node.comment && node.comment.blockTags) {
			node.comment.blockTags.forEach((tag) => {
				if (tag.tag === "@example") {
					tag.content.forEach((example) => {
						examples.push(
							example.text.trim().replace(/^```ts\n|```$/g, "")
						);
					});
				}
			});
		}

		["children", "getSignature", "setSignature", "signatures"].forEach(
			(prop) => {
				if (prop in node) {
					if (Array.isArray(node[prop])) {
						node[prop].forEach((child) => traverse(child));
					} else {
						traverse(node[prop]);
					}
				}
			}
		);
	}

	traverse(obj);
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
	const examples = findExamples(toneJson);
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
