//test the tone.js build
const Tone = require("../../");
const assert = require("assert");

assert.strictEqual(Tone.global, global);
