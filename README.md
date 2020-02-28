Tone.js
=========

[![Build Status](https://travis-ci.org/Tonejs/Tone.js.svg?branch=dev)](https://travis-ci.org/Tonejs/Tone.js) [![codecov](https://codecov.io/gh/Tonejs/Tone.js/branch/dev/graph/badge.svg)](https://codecov.io/gh/Tonejs/Tone.js)


Tone.js is a Web Audio framework for creating interactive music in the browser. The architecture of Tone.js aims to be familiar to both musicians and audio programmers looking to create web-based audio applications. On the high-level, Tone offers common DAW (digital audio workstation) features like a global transport for scheduling events and prebuilt synths and effects. For signal-processing programmers (coming from languages like Max/MSP), Tone provides a wealth of high-performance building blocks to create your own synthesizers, effects, and complex control signals.

[API](https://tonejs.github.io/docs/)

[Examples](https://tonejs.github.io/examples/)

[Demos](https://tonejs.github.io/demos)

# Installation

* [download](https://unpkg.com/tone)
* `npm install tone`
* dev -> `npm install tone@next`

## importing

You can import the entire library: 

```typescript
import * as Tone from "tone";
```

or individual modules: 

```typescript
import { Synth } from "tone";
```

# Hello Tone

```javascript
//create a synth and connect it to the master output (your speakers)
const synth = new Tone.Synth().toMaster();

//play a middle 'C' for the duration of an 8th note
synth.triggerAttackRelease("C4", "8n");
```

#### Tone.Synth

[Tone.Synth](https://tonejs.github.io/docs/Synth) is a basic synthesizer with a single [oscillator](https://tonejs.github.io/docs/OmniOscillator) and an [ADSR envelope](https://tonejs.github.io/docs/Envelope).

#### triggerAttackRelease

`triggerAttackRelease` is a combination of two methods: `triggerAttack` when the amplitude is rising (for example from a 'key down' or 'note on' event), and `triggerRelease` is when the amplitude is going back to 0 ('key up' / 'note off').

The first argument to `triggerAttackRelease` is the frequency which can either be a number (like `440`) or as "pitch-octave" notation (like `"D#2"`). The second argument is the duration that the note is held. This value can either be in seconds, or as a [tempo-relative value](https://github.com/Tonejs/Tone.js/wiki/Time). The third (optional) argument of `triggerAttackRelease` is _when_ along the AudioContext time the note should play. It can be used to schedule events in the future.

#### Time

Tone.js abstracts away the AudioContext time. Instead of defining all values in seconds, any method which takes time as an argument can accept a number or a string. For example `"4n"` is a quarter-note, `"8t"` is an eighth-note triplet, and `"1m"` is one measure.

[Read about Time encodings](https://github.com/Tonejs/Tone.js/wiki/Time).

# Starting Audio

Browsers will not play _any_ audio until a user clicks something (like a play button) and the AudioContext has had a chance to start. Run your Tone.js code only after calling `Tone.start()` from a event listener which is triggered by a user action such as "click" or "keydown". 

`Tone.start` returns a promise, the audio will be ready only after that promise is resolved. Scheduling or playing audio before the AudioContext is running will result in silence or wrong scheduling.

```javascript
//attach a click listener to a play button
document.querySelector('button').addEventListener('click', async () => {
	await Tone.start()
	console.log('audio is ready')
})
``` 

# Scheduling

### Transport

[Tone.Transport](https://tonejs.github.io/docs/Transport) is the master timekeeper, allowing for application-wide synchronization and scheduling of sources, signals and events along a shared timeline. Time expressions (like the ones above) are evaluated against the Transport's BPM which can be set like this: `Tone.Transport.bpm.value = 120`.

### Loops

Tone.js provides higher-level abstractions for scheduling events. [Tone.Loop](https://tonejs.github.io/docs/Loop) is a simple way to create a looped callback that can be scheduled to start and stop.

```typescript
const synth = new Tone.Synth().toDestination();
//play a note every quarter-note
const loop = new Tone.Loop(time => {
	synth.triggerAttackRelease("C2", "8n", time);
}, "4n");
```

Since Javascript callbacks are **not** precisely timed, the sample-accurate time of the event is passed into the callback function. **Use this time value to schedule the events**.

You can then start and stop the loop along the Transport's timeline.

```javascript
//loop between the first and fourth measures of the Transport's timeline
loop.start("1m").stop("4m");
```

Then start the Transport to hear the loop:

```javascript
Tone.Transport.start();
```

[Read about Tone.js' Event classes](https://github.com/Tonejs/Tone.js/wiki/Events) and [scheduling events with the Transport.](https://github.com/Tonejs/Tone.js/wiki/Transport)

# Instruments

```javascript
//pass in some initial values for the filter and filter envelope
const synth = new Tone.Synth({
	oscillator : {
		type : "pwm",
		modulationFrequency : 0.2
	},
	envelope : {
		attack : 0.02,
		decay : 0.1,
		sustain : 0.2,
		release : 0.9,
	}
}).toDestination();

//start the note "D3" one second from now
synth.triggerAttack("D3", "+1");
```

All instruments are monophonic (one voice) but can be made polyphonic when the constructor is passed in as the first argument to [Tone.PolySynth](https://tonejs.github.io/docs/PolySynth).

```javascript
//a 4 voice Synth
const polySynth = new Tone.PolySynth(Tone.Synth).toDestination();
//play a chord
polySynth.triggerAttackRelease(["C4", "E4", "G4", "B4"], "2n");
```

[Read more about Instruments.](https://github.com/Tonejs/Tone.js/wiki/Instruments)

# Effects

In the above examples, the synthesizer was always connected directly to the [speakers](https://tonejs.github.io/docs/Destination), but the output of the synth could also be routed through one (or more) effects before going to the speakers.

```javascript
//create a distortion effect
const distortion = new Tone.Distortion(0.4).toDestination();
//connect a synth to the distortion
synth.connect(distortion);
```

[Read more about Effects](https://github.com/Tonejs/Tone.js/wiki/Effects)

# Sources

Tone has a few basic audio sources like [Tone.Oscillator](https://tonejs.github.io/docs/Oscillator) which has sine, square, triangle, and sawtooth waveforms, a buffer player ([Tone.Player](https://tonejs.github.io/docs/Player)), a noise generator ([Tone.Noise](https://tonejs.github.io/docs/Noise)), a few additional oscillator types ([pwm](https://tonejs.github.io/docs/PWMOscillator), [pulse](https://tonejs.github.io/docs/PulseOscillator), [fat](https://tonejs.github.io/docs/FatOscillator), [fm](https://tonejs.github.io/docs/FMOscillator)) and [external audio input](https://tonejs.github.io/docs/UserMedia) (when [WebRTC is supported](http://caniuse.com/#feat=stream)).

```javascript
//a pwm oscillator which is connected to the speaker and started right away
const pwm = new Tone.PWMOscillator("Bb3").toDestination().start();
```

[Read more](https://github.com/Tonejs/Tone.js/wiki/Sources)

# Signals

Like the underlying Web Audio API, Tone.js is built with audio-rate signal control over nearly everything. This is a powerful feature which allows for sample-accurate synchronization and scheduling of parameters.

[Read more](https://github.com/Tonejs/Tone.js/wiki/Signals).

# AudioContext

Tone.js creates an AudioContext when it loads and shims it for maximum browser compatibility using [standardized-audio-context](https://github.com/chrisguttandin/standardized-audio-context). The AudioContext can be accessed at `Tone.context`. Or set your own AudioContext using `Tone.setContext(audioContext)`.

# MIDI

To use MIDI files, you'll first need to convert them into a JSON format which Tone.js can understand using [Midi](https://tonejs.github.io/Midi/).

# Performance

Tone.js makes extensive use of the native Web Audio Nodes such as the GainNode and WaveShaperNode for all signal processing, which enables Tone.js to work well on both desktop and mobile browsers. 

[This wiki](https://github.com/Tonejs/Tone.js/wiki/Performance) article has some suggestions related to performance for best practices.

# Testing

Tone.js runs an extensive test suite using [mocha](https://mochajs.org/) and [chai](http://chaijs.com/) with nearly 100% coverage. Each commit and pull request is run on [Travis-CI](https://travis-ci.org/Tonejs/Tone.js/) across browsers and versions. Passing builds on the 'dev' branch are published on npm as `tone@next`. 

# Contributing

There are many ways to contribute to Tone.js. Check out [this wiki](https://github.com/Tonejs/Tone.js/wiki/Contributing) if you're interested.

If you have questions (or answers) that are not necessarily bugs/issues, please post them to the [forum](https://groups.google.com/forum/#!forum/tonejs).

# References and Inspiration

* [Tuna.js](https://github.com/Dinahmoe/tuna)
* [Many of Chris Wilson's Repositories](https://github.com/cwilso)
* [Many of Mohayonao's Repositories](https://github.com/mohayonao)
* [The Spec](http://webaudio.github.io/web-audio-api/)
* [Sound on Sound - Synth Secrets](http://www.soundonsound.com/sos/may99/articles/synthsec.htm)
* [Miller Puckette - Theory and Techniques of Electronic Music](http://msp.ucsd.edu/techniques.htm)
* [standardized-audio-context](https://github.com/chrisguttandin/standardized-audio-context)
