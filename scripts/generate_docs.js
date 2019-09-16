/* eslint-disable @typescript-eslint/no-var-requires, no-console */
const { resolve } = require("path");
const { execSync } = require("child_process");
const { writeFileSync, readFileSync, unlinkSync } = require("fs");

function generateDocs() {
	const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
	console.log(`commit hash ${commitHash}`);
	const outputDir = resolve(__dirname, "../docs");
	const tmpFile = resolve(outputDir, "tmp.json");
	const outputFile = resolve(outputDir, "tone.json");
	// generate the doc file
	execSync(`npm run docs:json --docs_json=${tmpFile}`);
	// add the version and commit to the file
	const json = JSON.parse(readFileSync(tmpFile, "utf-8"));
	console.log(`doc files: ${json.children.length}`);
	json.commit = commitHash;
	const package = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));
	json.version = package.version;
	writeFileSync(outputFile, JSON.stringify(json));
	unlinkSync(tmpFile);
}

generateDocs();
