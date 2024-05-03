/**
 * @fileoverview Basic loading in node.js
 */
import * as Tone from "tone";
import assert from "assert";

assert("MonoSynth" in Tone, "Tone missing expected export");
assert("start" in Tone, "Tone missing expected export");
