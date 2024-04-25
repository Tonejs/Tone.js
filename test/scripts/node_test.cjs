/* eslint-disable @typescript-eslint/no-var-requires */
// test the tone.js build
const Tone = require("../../build/esm");
const assert = require("assert");
const semver = require("semver");
const { version } = require("../../package.json");

// test the version
const diff = semver.diff(Tone.version, version);
assert(diff === "patch" || diff === null, "wrong version listed");
