Tone.js
=========

Tone.js is a Web Audio framework for creating interactive music in the browser. The architecture of Tone.js aims to be familiar to both musicians and audio programmers looking to create web-based audio applications. On the high-level, Tone offers common DAW (digital audio workstation) features like a global transport for scheduling and timing events and prebuilt synths and effects. For signal-processing programmers (coming from languages like Max/MSP), Tone provides a wealth of high performance, low latency building blocks and DSP modules to build your own synthesizers, effects, and complex control signals.

[API](http://tonejs.org/docs/)

[Examples](http://tonejs.org/examples/)

# Demos

* [Jazz.Computer - Yotam Mann](http://jazz.computer/)
* [motionEmotion - Karen Peng, Jason Sigal](http://motionemotion.herokuapp.com/)
* [p5.sound - build with Tone.js](https://github.com/processing/p5.js-sound)
* [Hypercube - @eddietree](http://eddietree.github.io/hypercube/)
* [randomcommander.io - Jake Albaugh](http://randomcommander.io/)
* [Tone.js + NexusUI - Ben Taylor](http://taylorbf.github.io/Tone-Rack/)
* [Solarbeat - Luke Twyman](http://www.whitevinyldesign.com/solarbeat/)
* [Wind - João Costa](http://wind.joaocosta.co)
* [Block Chords - Abe Rubenstein](http://dev.abe.sh/block-chords/)
* [This is Not a Machine Learning - David Karam](http://posttool.github.io/)
* [Airjam - Seth Kranzler, Abe Rubenstein, and Teresa Lamb](http://airjam.band/)
* [Calculaural - Matthew Hasbach](https://github.com/mjhasbach/calculaural)
* [Scratch + Tone.js - Eric Rosenbaum](http://ericrosenbaum.github.io/tone-synth-extension/)
* [Game of Reich - Ben Taylor](http://nexusosc.com/gameofreich/)
* [Yume - Helios + Luke Twyman](http://www.unseen-music.com/yume/)

Using Tone.js? I'd love to hear it: yotammann@gmail.com

# Installation

* CDN - [full](http://cdn.tonejs.org/latest/Tone.js) | [min](http://cdn.tonejs.org/latest/Tone.min.js)
* [bower](http://bower.io/) - `bower install tone`
* [npm](https://www.npmjs.org/) - `npm install tone`

[Full Installation Instruction](https://github.com/Tonejs/Tone.js/wiki/Installation)

# Hello Tone

```javascript
//create one of Tone's built-in synthesizers and connect it to the master output
var synth = new Tone.SimpleSynth().toMaster();

//play a middle c for the duration of an 8th note
synth.triggerAttackRelease("C4", "8n");
```

[SimpleSynth](http://tonejs.org/docs/#SimpleSynth) is a single oscillator, single envelope synthesizer. It's [ADSR envelope](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope) has two phases: the attack and the release. These can be triggered by calling  `triggerAttack` and `triggerRelease` separately, or combined as shown above. The first argument of `triggerAttackRelease` is the frequency, which can be given either a number (like `440`) or as "pitch-octave" notation (like `"D#2"`). The second argument is the duration of the envelope's sustain (i.e. how long the note is held for). The third (optional) argument of `triggerAttackRelease` is the time the attack should start. With no argument, the time will evaluate to "now" and play immediately. Passing in a time value let's you schedule the event in the future. 

### Time

Any method which takes a time as a parameter will accept either a number or a string. Numbers will be taken literally as the time in seconds and strings can encode time expressions in terms of the current tempo. For example `"4n"` is a quarter-note, `"8t"` is an eighth-note triplet, and `"1m"` is one measure. Any value prefixed with `"+"` will be added to the current time. To trigger the same note one measure from now:

```javascript
synth.triggerAttackRelease("C4", "8n", "+1m");
```

[Read about Time encodings.](https://github.com/Tonejs/Tone.js/wiki/Time)

### Transport

Time expressions are evaluated against the Transport's BPM. [Tone.Transport](http://tonejs.org/docs/#Transport) is the master timekeeper, allowing for application-wide synchronization of sources, signals and events along a shared timeline. Callbacks scheduled with Tone.Transport will be invoked right before the scheduled time with the exact time of the event is passed in as the first parameter to the callback. 

```javascript
//schedule a callback on the second beat of the first measure
Tone.Transport.schedule(function(time){
	//schedule the synth's attackRelease using the passed-in time
	synth.triggerAttackRelease("C4", "8n", time);
}, "1:2:0");

//start the transport
Tone.Transport.start();
```
[Read more about scheduling events with the Transport.](https://github.com/Tonejs/Tone.js/wiki/Transport)

### Loops

Instead of scheduling events directly on the Transport, Tone.js provides a few higher-level classes for working with events. [Tone.Loop](http://tonejs.org/docs/#Loop) is a simple way to create a looped callback that can be scheduled to start and stop.

```javascript
//play a note every quarter-note
var loop = new Tone.Loop(function(time){
	synth.triggerAttackRelease("C2", "8n", time);
}, "4n");

//loop between the first and fourth measures of the Transport's timeline
loop.start("1m").stop("4m");
```

Start the Transport to hear the looped notes:

```javascript
Transport.start();
```

[Read about Tone.js' Event classes.](https://github.com/Tonejs/Tone.js/wiki/Events)

# Instruments

Tone has a number of instruments which all inherit from the same [Instrument base class](http://tonejs.org/docs/#Instrument), giving them a common API for playing notes. [Tone.MonoSynth](http://tonejs.org/docs/#MonoSynth) is composed of one oscillator, one filter, and two envelopes connected to the amplitude and the filter frequency. 

```javascript
//pass in some initial values for the filter and filter envelope
var monoSynth = new Tone.MonoSynth({
	"filter" : {
		"type" : "lowpass",
		"Q" : 7
	},
	"filterEnvelope" : {
		"attack" : 0.02,
		"decay" : 0.1,
		"sustain" : 0.2,
		"release" : 0.9,
	}
}).toMaster();

//start the note "D3" one second from now
monoSynth.triggerAttack("D3", "+1");
```

All instruments are monophonic (one voice) but can be made polyphonic when the constructor is passed in as the second argument to [Tone.PolySynth](http://tonejs.org/docs/#PolySynth). 

```javascript
//a 4 voice MonoSynth
var polySynth = new Tone.PolySynth(4, Tone.MonoSynth).toMaster();
//play a chord
polySimpleSynth.triggerAttackRelease(["C4", "E4", "G4", "B4"], "2n");
```

[Read more about Instruments.](https://github.com/Tonejs/Tone.js/wiki/Instruments)

# Effects

In the above examples, the synthesizer was always connected directly to the [master output](http://tonejs.org/docs/#Master), but the output of the synth could also be routed through one (or more) effects before going to the speakers. 

```javascript
//create a distortion effect
var distortion = new Tone.Distortion(0.4).toMaster();
//connect a synth to the distortion
synth.connect(distortion);
```

[Read more about Effects](https://github.com/Tonejs/Tone.js/wiki/Effects)

# Sources

Tone has a few basic audio sources like [Tone.Oscillator](http://tonejs.org/docs/#Oscillator) which has sine, square, triangle, and sawtooth waveforms, a buffer player ([Tone.Player](http://tonejs.org/docs/#Player)), a noise generator ([Tone.Noise]((http://tonejs.org/docs/#Noise))), two additional oscillator types ([pwm](http://tonejs.org/docs/#PWMOscillator), [pulse](http://tonejs.org/docs/#PulseOscillator)) and [external audio input](http://tonejs.org/docs/#Microphone) (when [WebRTC is supported](http://caniuse.com/#feat=stream)).

```javascript
//a pwm oscillator which is connected to the speaker and started right away
var pwm = new Tone.PWMOscillator("Bb3").toMaster().start();
```

[Read more](https://github.com/Tonejs/Tone.js/wiki/Sources)

# Signals

Like the underlying Web Audio API, Tone.js is built with audio-rate signal control over nearly everything. This is a powerful feature which allows for sample-accurate synchronization of multiple parameters with a single signal. Signals are built entirely without the ScriptProcessorNode so they do not introduce minimal processing overhead and no latency. Instead, this signal math and logic lets the native Web Audio GainNodes and WaveShaperNodes do all of the work meaning all processing is done in the underlying Assembly/C/C++ provided by the API. Signals are used extensively internally and are also useful for general DSP and control signal logic and transformations. 

[Read more](https://github.com/Tonejs/Tone.js/wiki/Signals)

# AudioContext

Tone.js creates an AudioContext when it loads and shims it for maximum browser compatibility. The AudioContext can be found at `Tone.context`. Or set your own AudioContext using `Tone.setContext(audioContext)`.

# MIDI

To use MIDI files, you'll first need to convert them into a JSON format which Tone.js can understand using [MidiConvert](http://tonejs.github.io/MidiConvert/).

# Performance

Tone.js uses only one ScriptProcessorNode (in Tone.Meter). The rest of Tone's modules find a native Web Audio component workaround, making extensive use of the GainNode and WaveShaperNode especially, which enables Tone.js to work well on both desktop and mobile browsers. While the ScriptProcessorNode is extremely powerful, it introduces a lot of latency and the potential for glitches more than any other node.

# Contributing

There are many ways to contribute to Tone.js. Check out [this wiki](https://github.com/Tonejs/Tone.js/wiki/Contributing) if you're interested. 

# References and Inspiration

* [Tuna.js](https://github.com/Dinahmoe/tuna)
* [Many of Chris Wilson's Repositories](https://github.com/cwilso)
* [The Spec](http://webaudio.github.io/web-audio-api/)
* [Sound on Sound - Synth Secrets](http://www.soundonsound.com/sos/may99/articles/synthsec.htm)
* [Miller Puckette - Theory and Techniques of Electronic Music](http://msp.ucsd.edu/techniques.htm)
