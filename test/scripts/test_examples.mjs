import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createFixture } from "fs-fixture";
import { glob } from "tinyglobby";
import ts from "typescript";

import { execPromise, ROOT_DIR } from "./utils.mjs";

/**
 * Get all of the @example blocks from the TypeScript source files
 */
async function findExamples() {
	const files = await glob(resolve(ROOT_DIR, "Tone/**/*.ts"), {
		absolute: true,
		ignore: ["**/*.test.ts"],
	});
	const examples = new Set();

	for (const file of files) {
		const source = await readFile(file, "utf-8");
		const sourceFile = ts.createSourceFile(
			file,
			source,
			ts.ScriptTarget.Latest,
			true
		);

		function visit(node) {
			for (const tag of ts.getJSDocTags(node)) {
				if (
					tag.tagName.text === "example" &&
					typeof tag.comment === "string"
				) {
					examples.add(
						tag.comment.trim().replace(/^```ts\n|```$/g, "")
					);
				}
			}
			ts.forEachChild(node, visit);
		}

		visit(sourceFile);
	}

	return [...examples];
}

async function createFixtureFiles(examples) {
	const createExampleString = (str) => `
import * as Tone from "tone";
function main(){
	${str}
}
main();
`;

	const data = {
		"tsconfig.json": JSON.stringify({
			compilerOptions: {
				target: "ES2022",
				module: "ESNext",
				moduleResolution: "bundler",
				lib: ["ES2022", "DOM", "DOM.Iterable"],
				experimentalDecorators: true,
				useDefineForClassFields: false,
				esModuleInterop: true,
				skipLibCheck: true,
				noEmit: true,
				paths: {
					tone: [resolve(ROOT_DIR, "Tone/index.ts")],
				},
			},
			include: ["*.ts"],
		}),
	};

	for (const [i, e] of Object.entries(examples)) {
		data[`${i}.ts`] = createExampleString(e);
	}

	return await createFixture(data);
}

/**
 * Run the string through the typescript compiler
 */
async function main() {
	const examples = await findExamples();
	const fixtures = await createFixtureFiles(examples);

	await execPromise(`tsc -p ${fixtures.path}`);

	await fixtures.rm();

	console.log(`Successfully tested ${examples.length} examples.`);
}

main();
