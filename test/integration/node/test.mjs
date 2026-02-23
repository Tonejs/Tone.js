/**
 * @fileoverview Basic loading in node.js
 */
import assert from "node:assert";
import * as Tone from "tone";

assert("MonoSynth" in Tone, "Tone missing expected export");
assert("start" in Tone, "Tone missing expected export");
