const fs = require("fs");
const semver = require("semver");
const { resolve } = require("path");
const child_process = require("child_process");

const tsVersion = child_process.execSync("npm show tone@typescript version").toString();
const masterVersion = child_process.execSync("npm show tone version").toString();

//go with whichever is the latest version
let version = masterVersion;
if (tsVersion && semver.gt(tsVersion, masterVersion)){
	version = tsVersion;
}

//increment the patch
version = semver.inc(version, "patch");

//write it to the package.json
const packageFile = resolve(__dirname, "../package.json");
const packageObj = JSON.parse(fs.readFileSync(packageFile, "utf-8"));

//if the package version if the latest, go with that one
if (semver.gt(packageObj.version, version)){
	version = packageObj.version;
}

console.log(`incrementing to version ${version}`);
packageObj.version = version;
//only if it's travis, update the package.json
if (process.env.TRAVIS){
	fs.writeFileSync(packageFile, JSON.stringify(packageObj, undefined, "  "));
}

//write a version file
var versionFile = `export const version: string = ${JSON.stringify(version)};\n`;
fs.writeFileSync(resolve(__dirname, "../Tone/version.ts"), versionFile);
