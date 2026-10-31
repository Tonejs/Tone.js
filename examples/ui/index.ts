import "./controls/button";
import "./controls/mic-button";
import "./controls/momentary-button";
import "./controls/play-toggle";
import "./controls/slider";
import "./controls/slider-pad";
import "./controls/step-sequencer";
import "./inspector/drawer";
import "./page/example";
import "./piano/piano";
import "./vis/index";

import * as Tone from "tone";

import { addHeadElements } from "./head";

addHeadElements();

export { Tone };
export { bind } from "./bind";
export { ui } from "./inspector/audio-node";
export { drawer } from "./inspector/drawer";
export { piano } from "./piano/piano";
export { fft } from "./vis/fft";
export { meter } from "./vis/meter";
export { waveform } from "./vis/waveform";
