const { execSync } = require("node:child_process");
const fs = require("node:fs");
const { resolve } = require("node:path");

const semver = require("semver");

const tsVersion = execSync("npm show tone@next version").toString();
const mainVersion = execSync("npm show tone version").toString();

// go with whichever is the latest version
let version = mainVersion;
if (tsVersion && semver.gt(tsVersion, mainVersion)) {
	version = tsVersion;
}

// increment the patch
version = semver.inc(version, "patch");

// write it to the package.json
const packageFile = resolve(__dirname, "../package.json");
const packageObj = JSON.parse(fs.readFileSync(packageFile, "utf-8"));

// if the package version if the latest, go with that one
if (semver.gt(packageObj.version, version)) {
	version = packageObj.version;
}

console.log(`incrementing to version ${version}`);
packageObj.version = version;
// only if it's travis, update the package.json
if (process.env.GITHUB_CI) {
	fs.writeFileSync(packageFile, JSON.stringify(packageObj, undefined, "  "));

	// write a version file
	const versionFile = `export const version: string = ${JSON.stringify(version)};\n`;
	fs.writeFileSync(resolve(__dirname, "../Tone/version.ts"), versionFile);
}

