/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require("path");
const { exec } = require("child_process");
const { dir } = require("tmp-promise");
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
async function testExampleString(str, tmpDir, index) {
	// str = str.replace("from \"tone\"", `from "${resolve(__dirname, "../../")}"`);
	str = `
		import * as Tone from "${resolve(__dirname, "../../")}"
		function main(){
			${str}
		}
		main();
	`;
	await writeFile(resolve(tmpDir, index + ".ts"), str);
}

async function main() {
	const examples = findExamples(toneJson);
	let passed = 0;

	const tmp = await dir({ unsafeCleanup: true });
	await Promise.all(
		examples.map((e, i) => testExampleString(e, tmp.path, i))
	);

	await execPromise(
		`tsc --noEmit --target es5 --lib dom,ES2015 ${tmp.path}/*.ts`
	);

	await tmp.cleanup();

	console.log(`Tested ${examples.length} examples`);
}
main();
