Tone.js
=========

Tone.js is a Web Audio framework for creating interactive music in the browser. The architecture of Tone.js aims to be familiar to both musicians and audio programmers looking to create web-based audio applications. On the high-level, Tone offers common DAW (digital audio workstation) features like a global transport for scheduling events and prebuilt synths and effects. For signal-processing programmers (coming from languages like Max/MSP), Tone provides a wealth of high performance, low latency building blocks and DSP modules to build your own synthesizers, effects, and complex control signals.

[API](https://tonejs.github.io/docs/)

[Examples](https://tonejs.github.io/examples/)

# Demos

* [Chrome Music Lab - Google Creative Lab](https://musiclab.chromeexperiments.com)
* [Groove Pizza - NYU Music Experience Design Lab](https://apps.musedlab.org/groovepizza/)
* [Jazz.Computer - Yotam Mann](http://jazz.computer/)
* [motionEmotion - Karen Peng, Jason Sigal](http://motionemotion.herokuapp.com/)
* [p5.sound - build with Tone.js](https://github.com/processing/p5.js-sound)
* [Hypercube - @eddietree](http://eddietree.github.io/hypercube/)
* [Musical Chord Progression Arpeggiator - Jake Albaugh](http://codepen.io/jakealbaugh/full/qNrZyw/)
* [Tone.js + NexusUI - Ben Taylor](http://taylorbf.github.io/Tone-Rack/)
* [Solarbeat - Luke Twyman](http://www.whitevinyldesign.com/solarbeat/)
* [Block Chords - Abe Rubenstein](http://dev.abe.sh/block-chords/)
* [This is Not a Machine Learning - David Karam](http://posttool.github.io/)
* [Calculaural - Matthew Hasbach](https://github.com/mjhasbach/calculaural)
* [Scratch + Tone.js - Eric Rosenbaum](http://ericrosenbaum.github.io/tone-synth-extension/)
* [Game of Reich - Ben Taylor](http://nexusosc.com/gameofreich/)
* [Yume - Helios + Luke Twyman](http://www.unseen-music.com/yume/)
* [TR-808 - Gregor Adams](http://codepen.io/pixelass/full/adyLPR)
* [Tweet FM - Mike Mitchell](https://tweet-fm.herokuapp.com/)
* [TextXoX - Damon Holzborn](http://rustleworks.com/textxox/)
* [Stepping - John Hussey](http://stepping.audio/)
* [Limp Body Beat](http://www.adultswim.com/etcetera/limp-body-beat/)
* [MsCompose 95 - Autotel](http://autotel.co/mscompose95/)
* [Pedalboard - Micha Hanselmann](https://deermichel.github.io/pedalboard/)
* [Keyboard Boogie - Douglas Tarr](http://douglastarr.com/keyboard-boogie)
* [Reflect - Sydneyzh](http://reflect.sydneyzh.com/)
* [Anxiety - Eve Weinberg, Aaron Montoya-Moraga](http://anxietybrain.net/)
* [Ramsophone - Robert Vinluan](http://robertvinluan.com/Ramsophone/)

Using Tone.js? I'd love to hear it: yotam@tonejs.org

# Installation

* CDN - [full](https://tonejs.github.io/CDN/latest/Tone.js) | [min](https://tonejs.github.io/CDN/latest/Tone.min.js)
* [bower](http://bower.io/) - `bower install tone`
* [npm](https://www.npmjs.org/) - `npm install tone`

[Full Installation Instruction](https://github.com/Tonejs/Tone.js/wiki/Installation)

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

The "attack" of an envelope is the period when the amplitude is rising, and the "release" is when it is falling back to 0. These two methods can be invoked separately as `triggerAttack` and `triggerRelease`, or combined as shown above. The first argument is the frequency which can either be a number (like `440`) or as "pitch-octave" notation (like `"D#2"`). The second argument is how long the note should be held before triggering the release phases. An optional third argument schedules the event for some time in the future. With no third argument, the note will play immediately. 

#### Time

In the examples above, instead of using the time in seconds (for an 8th note at 120 BPM it would be 0.25 seconds), any method which takes time as an argument can accept a number or a string. Numbers will be taken literally as the time in seconds and strings can encode time expressions in terms of the current tempo. For example `"4n"` is a quarter-note, `"8t"` is an eighth-note triplet, and `"1m"` is one measure. 

[Read about Time encodings.](https://github.com/Tonejs/Tone.js/wiki/Time)

# Scheduling

### Transport

[Tone.Transport](https://tonejs.github.io/docs/#Transport) is the master timekeeper, allowing for application-wide synchronization of sources, signals and events along a shared timeline. Time expressions (like the ones above) are evaluated against the Transport's BPM which can be set like this: `Tone.Transport.bpm.value = 120`. 

### Loops

Tone.js provides higher-level abstractions for scheduling events. [Tone.Loop](https://tonejs.github.io/docs/#Loop) is a simple way to create a looped callback that can be scheduled to start and stop.

```javascript
//play a note every quarter-note
var loop = new Tone.Loop(function(time){
	synth.triggerAttackRelease("C2", "8n", time);
}, "4n");
```

Since Javascript timing is not sample-accurate, the precise time of the event is passed into the callback function. This time should be used to schedule events within the loop. 

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

Tone has a few basic audio sources like [Tone.Oscillator](https://tonejs.github.io/docs/#Oscillator) which has sine, square, triangle, and sawtooth waveforms, a buffer player ([Tone.Player](https://tonejs.github.io/docs/#Player)), a noise generator ([Tone.Noise](https://tonejs.github.io/docs/#Noise)), a few additional oscillator types ([pwm](https://tonejs.github.io/docs/#PWMOscillator), [pulse](https://tonejs.github.io/docs/#PulseOscillator), [fat](https://tonejs.github.io/docs/#FatOscillator), [fm](https://tonejs.github.io/docs/#FMOscillator)) and [external audio input](https://tonejs.github.io/docs/#Microphone) (when [WebRTC is supported](http://caniuse.com/#feat=stream)).

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

To use MIDI files, you'll first need to convert them into a JSON format which Tone.js can understand using [MidiConvert](https://tonejs.github.io/MidiConvert/).

# Performance

Tone.js makes extensive use of the native Web Audio Nodes such as the GainNode and WaveShaperNode for all signal processing, which enables Tone.js to work well on both desktop and mobile browsers. It uses no ScriptProcessorNodes.

# Contributing

There are many ways to contribute to Tone.js. Check out [this wiki](https://github.com/Tonejs/Tone.js/wiki/Contributing) if you're interested. 

If you have questions (or answers) that are not necessarily bugs/issues, please post them to the [forum](https://groups.google.com/forum/#!forum/tonejs).

# References and Inspiration

* [Tuna.js](https://github.com/Dinahmoe/tuna)
* [Many of Chris Wilson's Repositories](https://github.com/cwilso)
* [The Spec](http://webaudio.github.io/web-audio-api/)
* [Sound on Sound - Synth Secrets](http://www.soundonsound.com/sos/may99/articles/synthsec.htm)
* [Miller Puckette - Theory and Techniques of Electronic Music](http://msp.ucsd.edu/techniques.htm)
