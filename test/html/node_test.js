//test the tone.js build
const Tone = require("../../");
const assert = require("assert");
const { resolve } = require("path");
const fs = require("fs");
const semver = require("semver");

assert.strictEqual(Tone.global, global);

//test the version
const packageFile = resolve(__dirname, "../../package.json");
const { version } = JSON.parse(fs.readFileSync(packageFile, "utf-8"));
const diff = semver.diff(Tone.version, version);
assert(diff === "patch" || diff === null, "wrong version listed");
