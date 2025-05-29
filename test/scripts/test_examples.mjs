import { createFixture } from "fs-fixture";

import toneJson from "../../docs/tone.json" with { type: "json" };
import { execPromise, ROOT_DIR } from "./utils.mjs";

/**
 * Get all of the examples
 */
function findExamples(obj) {
	const examples = [];

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

async function createFixtureFiles(examples) {
	const createExampleString = (str) => `
import * as Tone from "${ROOT_DIR}"
function main(){
	${str}
}
main();
`;

	const data = {};

	for (const [i, e] of Object.entries(examples)) {
		data[`${i}.ts`] = createExampleString(e);
	}

	return await createFixture(data);
}

/**
 * Run the string through the typescript compiler
 */
async function main() {
	const examples = findExamples(toneJson);
	const fixtures = await createFixtureFiles(examples);

	await execPromise(
		`tsc --noEmit --target es5 --lib dom,ES2015 ${fixtures.path}/*.ts`
	);

	await fixtures.rm();

	console.log(`Tested ${examples.length} examples`);
}

main();
