Tone.js
=========

Tone.js is a Web Audio framework for creating interactive music in the browser. The architecture of Tone.js aims to be familiar to both musicians and audio programmers looking to create web-based audio applications. On the high-level, Tone offers common DAW (digital audio workstation) features like a global transport for scheduling and timing events and prebuilt synths and effects. For signal-processing programmers (coming from languages like Max/MSP), Tone provides a wealth of high performance, low latency building blocks and DSP modules to build your own synthesizers, effects, and complex control signals.

[API](http://tonejs.org/docs/)

[Examples](http://tonejs.org/examples/)

# Demos

* [Jazz.Computer - Yotam Mann](http://jazz.computer/)
* [motionEmotion - Karen Peng, Jason Sigal](http://motionemotion.herokuapp.com/)
* [p5.sound - build with Tone.js](https://github.com/processing/p5.js-sound)
* [Hypercube by @eddietree](http://eddietree.github.io/hypercube/)
* [randomcommander.io by Jake Albaugh](http://randomcommander.io/)
* [Tone.js + NexusUI by taylorbf](http://taylorbf.github.io/Tone-Rack/)
* [Solarbeat - Luke Twyman](http://www.whitevinyldesign.com/solarbeat/)
* [Wind - João Costa](http://wind.joaocosta.co)
* [Block Chords - Abe Rubenstein](http://dev.abe.sh/block-chords/)
* [This is Not a Machine Learning - David Karam](http://posttool.github.io/)
* [Airjam - Seth Kranzler, Abe Rubenstein, and Teresa Lamb](http://airjam.band/)
* [Calculaural - Matthew Hasbach](https://github.com/mjhasbach/calculaural)
* [Scratch + Tone.js - Eric Rosenbaum](http://ericrosenbaum.github.io/tone-synth-extension/)
* [Game of Reich - Ben Taylor](http://nexusosc.com/gameofreich/)

Using Tone.js? I'd love to hear it: yotammann@gmail.com

# Installation

Tone can be installed in a few of ways:

* Download Tone.js from Github - [full](https://raw.githubusercontent.com/Tonejs/Tone.js/master/build/Tone.js) | [min](https://raw.githubusercontent.com/Tonejs/Tone.js/master/build/Tone.min.js)
* [bower](http://bower.io/) - `bower install tone`
* [npm](https://www.npmjs.org/) - `npm install tone`

The fastest way to include Tone.js on your page is to use the CDN (hosted by [github pages](https://pages.github.com/)).

```html
<script type="text/javascript" src="http://cdn.tonejs.org/latest/Tone.min.js"></script>
```

It's always much safer to use a specific version rather than just "latest".

[Full Installation Instruction](https://github.com/Tonejs/Tone.js/wiki/Installation)

# Hello World

```javascript
//create one of Tone's built-in synthesizers and connect it to the master output
var synth = new Tone.SimpleSynth().toMaster();

//play a middle c for the duratino of an 8th note
synth.triggerAttackRelease("C4", "8n");
```

# Tone.Transport

A unique feature of the library is the Transport which allows for application-wide synchronization of sources and signals with tempo curves and automation. The Transport allows you to register callbacks at precise moments along the timeline which are invoked right before the event with the exact time of the event.

[Read more](https://github.com/Tonejs/Tone.js/wiki/Transport).

### Time

In the Tone library, time can be described in a number of ways. Any method which takes a time as a parameter will accept the number in seconds as well as a tempo-relative form. 

For example to `"4n"` is a quarter-note and "4:2:0" is the third beat of the fifth measure (remember we're counting from 0). 

[Read more](https://github.com/Tonejs/Tone.js/wiki/Time).

# Sources

Aside from the 4 basic oscillator types (sine, square, triangle, sawtooth), Tone.js provides a few other sources such as a buffer player (Tone.Player), a noise generator, and two additional oscillator types (pwm, pulse). 

[Read more](https://github.com/Tonejs/Tone.js/wiki/Sources).

# Instruments

Tone has a number of instruments which all inherit from Tone.Instrument, giving them the same API for triggering notes. These instruments are all monophonic and can be made polyphonic if they are passed into the second argument of [Tone.PolySynth](http://tonejs.org/docs/#PolySynth). 

[Read more](https://github.com/Tonejs/Tone.js/wiki/Instruments).

# Effects

Tone.js also has many stereo and mono effects. Each effect lets you change the ratio between the dry (unaffected) and wet signal.

[Read more](https://github.com/Tonejs/Tone.js/wiki/Effects).

# Signals

Like the underlying Web Audio API, Tone.js is built with audio-rate signal control over nearly everything. This is a powerful feature which allows for sample-accurate synchronization of multiple parameters with a single signal. Signals are built entirely without the ScriptProcessorNode so they do not introduce much latency and processing overhead. Instead, all signal math and logic let GainNodes and WaveShaperNodes do all of the work so that all processing is done in the underlying Assembly/C/C++ provided by the API. Signals are used extensively internally and are also useful for general DSP and control signal logic and transformations. 

Read more about [signals](https://github.com/Tonejs/Tone.js/wiki/Signals). 

# AudioContext

Tone.js creates an AudioContext when it loads and shims it for maximum browser compatibility. The AudioContext can be found at `Tone.context` or from within any Object extending Tone as `this.context`. 

Tone also let's you set your own AudioContext using `Tone.setContext`.

# MIDI

To use MIDI files, you'll first need to convert them into a JSON format which Tone.js can understand using [MidiConvert](tonejs.github.io/MidiConvert/).

# Performance

Tone.js uses very few ScriptProcessorNodes. Nearly all of the Tone Modules find a native Web Audio component workaround, making extensive use of the GainNode and WaveShaperNode especially, which enables Tone.js to work well on both desktop and mobile browsers. While the ScriptProcessorNode is extremely powerful, it introduces a lot of latency and the potential for glitches more than any other node.

# References and Inspiration

* [Tuna.js](https://github.com/Dinahmoe/tuna)
* [Many of Chris Wilson's Repositories](https://github.com/cwilso)
* [The Spec](http://webaudio.github.io/web-audio-api/)
* [Sound on Sound - Synth Secrets](http://www.soundonsound.com/sos/may99/articles/synthsec.htm)
* [Miller Puckette - Theory and Techniques of Electronic Music](http://msp.ucsd.edu/techniques.htm)