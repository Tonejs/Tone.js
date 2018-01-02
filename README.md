Tone.js
=========

[![Build Status](https://travis-ci.org/Tonejs/Tone.js.svg?branch=dev)](https://travis-ci.org/Tonejs/Tone.js) [![Coverage Status](https://coveralls.io/repos/github/Tonejs/Tone.js/badge.svg?branch=dev)](https://coveralls.io/github/Tonejs/Tone.js?branch=dev)

Tone.js is a Web Audio framework for creating interactive music in the browser. The architecture of Tone.js aims to be familiar to both musicians and audio programmers looking to create web-based audio applications. On the high-level, Tone offers common DAW (digital audio workstation) features like a global transport for scheduling events and prebuilt synths and effects. For signal-processing programmers (coming from languages like Max/MSP), Tone provides a wealth of high performance, low latency building blocks and DSP modules to build your own synthesizers, effects, and complex control signals.

[API](https://tonejs.github.io/docs/)

[Examples](https://tonejs.github.io/examples/)

[Demos](https://tonejs.github.io/demos)

# Installation

* download [full](https://tonejs.github.io/build/Tone.js) | [min](https://tonejs.github.io/build/Tone.min.js)
* `npm install tone`
* dev -> `npm install tone@next`

[Full Installation Instruction](https://github.com/Tonejs/Tone.js/wiki/Installation).

# Hello Tone

```javascript
//create a synth and connect it to the master output (your speakers)
var synth = new Tone.Synth().toMaster();

//play a middle 'C' for the duration of an 8th note
synth.triggerAttackRelease("C4", "8n");
```

#### Tone.Synth

[Tone.Synth](https://tonejs.github.io/docs/#Synth) is a basic synthesizer with a single [oscillator](https://tonejs.github.io/docs/#OmniOscillator) and an [ADSR envelope](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope).

#### triggerAttackRelease

`triggerAttackRelease` is a combination of two methods: `triggerAttack` when the amplitude is rising (for example from a 'key down' or 'note on' event), and `triggerRelease` is when the amplitude is going back to 0 ('key up' / 'note off').

The first argument to `triggerAttackRelease` is the frequency which can either be a number (like `440`) or as "pitch-octave" notation (like `"D#2"`). The second argument is the duration that the note is held. This value can either be in seconds, or as a [tempo-relative value](https://github.com/Tonejs/Tone.js/wiki/Time). The third (optional) argument of `triggerAttackRelease` is _when_ along the AudioContext time the note should play. It can be used to schedule events in the future.

#### Time

Tone.js abstracts away the AudioContext time. Instead of defining all values in seconds, any method which takes time as an argument can accept a number or a string. For example `"4n"` is a quarter-note, `"8t"` is an eighth-note triplet, and `"1m"` is one measure. These values can even be composed into expressions.

[Read about Time encodings](https://github.com/Tonejs/Tone.js/wiki/Time).

# Scheduling

### Transport

[Tone.Transport](https://tonejs.github.io/docs/#Transport) is the master timekeeper, allowing for application-wide synchronization and scheduling of sources, signals and events along a shared timeline. Time expressions (like the ones above) are evaluated against the Transport's BPM which can be set like this: `Tone.Transport.bpm.value = 120`.

### Loops

Tone.js provides higher-level abstractions for scheduling events. [Tone.Loop](https://tonejs.github.io/docs/#Loop) is a simple way to create a looped callback that can be scheduled to start and stop.

```javascript
//play a note every quarter-note
var loop = new Tone.Loop(function(time){
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

Tone has a number of instruments which all inherit from the same [Instrument base class](https://tonejs.github.io/docs/#Instrument), giving them a common API for playing notes. [Tone.Synth](https://tonejs.github.io/docs/#Synth) is composed of one oscillator and an amplitude envelope.

```javascript
//pass in some initial values for the filter and filter envelope
var synth = new Tone.Synth({
	"oscillator" : {
		"type" : "pwm",
		"modulationFrequency" : 0.2
	},
	"envelope" : {
		"attack" : 0.02,
		"decay" : 0.1,
		"sustain" : 0.2,
		"release" : 0.9,
	}
}).toMaster();

//start the note "D3" one second from now
synth.triggerAttack("D3", "+1");
```

All instruments are monophonic (one voice) but can be made polyphonic when the constructor is passed in as the second argument to [Tone.PolySynth](https://tonejs.github.io/docs/#PolySynth).

```javascript
//a 4 voice Synth
var polySynth = new Tone.PolySynth(4, Tone.Synth).toMaster();
//play a chord
polySynth.triggerAttackRelease(["C4", "E4", "G4", "B4"], "2n");
```

[Read more about Instruments.](https://github.com/Tonejs/Tone.js/wiki/Instruments)

# Effects

In the above examples, the synthesizer was always connected directly to the [master output](https://tonejs.github.io/docs/#Master), but the output of the synth could also be routed through one (or more) effects before going to the speakers.

```javascript
//create a distortion effect
var distortion = new Tone.Distortion(0.4).toMaster();
//connect a synth to the distortion
synth.connect(distortion);
```

[Read more about Effects](https://github.com/Tonejs/Tone.js/wiki/Effects)

# Sources

Tone has a few basic audio sources like [Tone.Oscillator](https://tonejs.github.io/docs/#Oscillator) which has sine, square, triangle, and sawtooth waveforms, a buffer player ([Tone.Player](https://tonejs.github.io/docs/#Player)), a noise generator ([Tone.Noise](https://tonejs.github.io/docs/#Noise)), a few additional oscillator types ([pwm](https://tonejs.github.io/docs/#PWMOscillator), [pulse](https://tonejs.github.io/docs/#PulseOscillator), [fat](https://tonejs.github.io/docs/#FatOscillator), [fm](https://tonejs.github.io/docs/#FMOscillator)) and [external audio input](https://tonejs.github.io/docs/#UserMedia) (when [WebRTC is supported](http://caniuse.com/#feat=stream)).

```javascript
//a pwm oscillator which is connected to the speaker and started right away
var pwm = new Tone.PWMOscillator("Bb3").toMaster().start();
```

[Read more](https://github.com/Tonejs/Tone.js/wiki/Sources)

# Signals

Like the underlying Web Audio API, Tone.js is built with audio-rate signal control over nearly everything. This is a powerful feature which allows for sample-accurate synchronization and scheduling of parameters.

[Read more](https://github.com/Tonejs/Tone.js/wiki/Signals).

# AudioContext

Tone.js creates an AudioContext when it loads and shims it for maximum browser compatibility. The AudioContext can be found at `Tone.context`. Or set your own AudioContext using `Tone.setContext(audioContext)`.

# MIDI

To use MIDI files, you'll first need to convert them into a JSON format which Tone.js can understand using [MidiConvert](https://tonejs.github.io/MidiConvert/).

# Performance

Tone.js makes extensive use of the native Web Audio Nodes such as the GainNode and WaveShaperNode for all signal processing, which enables Tone.js to work well on both desktop and mobile browsers. It uses no ScriptProcessorNodes.

[This wiki](https://github.com/Tonejs/Tone.js/wiki/Performance) article has some suggestions related to performance for best practices.

# Testing

Tone.js runs an extensive test suite using [mocha](https://mochajs.org/) and [chai](http://chaijs.com/) with nearly 100% coverage. Each commit and pull request is run on [Travis-CI](https://travis-ci.org/Tonejs/Tone.js/) across multiple versions of Chrome, Safari and Firefox to ensure backwards and future compatibility. Passing builds on the 'dev' branch are published on npm as `tone@next`. 

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
