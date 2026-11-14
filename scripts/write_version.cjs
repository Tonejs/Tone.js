const fs = require("node:fs");
const { resolve } = require("node:path");

const packageFile = resolve(__dirname, "../package.json");
const packageObj = JSON.parse(fs.readFileSync(packageFile, "utf-8"));
const version = packageObj.version;

console.log(`writing version ${version}`);

// write a version file
const versionFile = `export const version: string = ${JSON.stringify(version)};\n`;
fs.writeFileSync(resolve(__dirname, "../Tone/version.ts"), versionFile);
