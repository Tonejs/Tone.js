/* eslint-disable @typescript-eslint/no-var-requires */
const Tone = require("tone");
const assert = require("assert");

assert("MonoSynth" in Tone, "Tone missing expected export");
assert("start" in Tone, "Tone missing expected export");
