Tone.js
=========

Tone.js is a Web Audio framework for creating interactive music in the browser. The architecture of Tone.js aims to be familiar to both musicians and audio programmers looking to create web-based audio applications. On the high-level, Tone offers common DAW (digital audio workstation) features like a global transport for scheduling and timing events and prebuilt synths and effects. For signal-processing programmers (coming from languages like Max/MSP), Tone provides a wealth of high performance, low latency building blocks and DSP modules to build your own synthesizers, effects, and complex control signals.

[API](http://tonejs.org/docs/)

[Examples](http://tonejs.org/examples/)

# Demos

* [Jazz.Computer - Yotam Mann](http://jazz.computer/)
* [motionEmotion - emotion & gesture-based arpeggiator and synthesizer](http://motionemotion.herokuapp.com/)
* [A Tone.js Plugin Architecture with GUIs](https://github.com/billautomata/Tone.js.Plugins)
* [p5.sound - build with Tone.js](https://github.com/processing/p5.js-sound)
* [Hypercube by @eddietree](http://eddietree.github.io/hypercube/)
* [randomcommander.io by Jake Albaugh](http://randomcommander.io/)
* [Tone.js + NexusUI by taylorbf](http://taylorbf.github.io/Tone-Rack/)
* [Solarbeat - Luke Twyman](http://www.whitevinyldesign.com/solarbeat/)
* [João Costa - Wind](http://wind.joaocosta.co)
* [Abe Rubenstein - Block Chords](http://dev.abe.sh/block-chords/)

Using Tone.js? I'd love to hear it: yotammann@gmail.com

# Installation

Tone can be installed in a few of ways:

* Download Tone.js from Github - [full](https://raw.githubusercontent.com/TONEnoTONE/Tone.js/master/build/Tone.js) | [min](https://raw.githubusercontent.com/TONEnoTONE/Tone.js/master/build/Tone.min.js)
* [bower](http://bower.io/) - `bower install tone`
* [npm](https://www.npmjs.org/) - `npm install tone`

The fastest way to include Tone.js on your page is to use the CDN (not for production use, please):

```html
<script type="text/javascript" src="http://cdn.tonejs.org/latest/Tone.min.js"></script>
```

It's always much safer to use a specific version rather than just "latest".

[Full Installation Instruction](https://github.com/TONEnoTONE/Tone.js/wiki/Installation)

# Hello World

```javascript
//create one of Tone's built-in synthesizers and connect it to the master output
var synth = new Tone.SimpleSynth().toMaster();

//play a middle c for the duratino of an 8th note
synth.triggerAttackRelease("C4", "8n");
```

# Tone.Transport

A unique feature of the library is the oscillator-based Transport which allows for application-wide synchronization of sources and signals. The Transport allows you to register callbacks at precise moments along the timeline which are invoked right before the event with the exact time of the event. Additionally, because the Transport is implemented with an oscillator, it is capable of elaborate tempo curves and automation. 

[Read more](https://github.com/TONEnoTONE/Tone.js/wiki/Transport).

### Time

In the Tone library, time can be described in a number of ways. Any method which takes a time as a parameter will accept the number in seconds as well as a tempo-relative form. 

For example to `"4n"` is a quarter-note and "4:2:0" is the third beat of the fifth measure (remember we're counting from 0). 

[Read more Time](https://github.com/TONEnoTONE/Tone.js/wiki/Time).

# Sources

Aside from the 4 basic oscillator types (sine, square, triangle, sawtooth), Tone.js provides a few other sources such as a buffer player (Tone.Player), a noise generator, and two additional oscillator types (pwm, pulse). 

[Read more](https://github.com/TONEnoTONE/Tone.js/wiki/Sources).

# Instruments

Tone has a few prebuilt synthesizers. [Read more about their common interface](https://github.com/TONEnoTONE/Tone.js/wiki/Instruments).

# Effects

Tone.js also has a few stereo and mono effects some of which also have their own presets. [Read more about using effects](https://github.com/TONEnoTONE/Tone.js/wiki/Effects).

# Signals

Like the underlying Web Audio API, Tone.js is built with audio-rate signal control over nearly everything. This is a powerful feature which allows for sample-accurate synchronization of multiple parameters with a single signal. Signals are built entirely without the ScriptProcessorNode so they do not introduce much latency and processing overhead. Instead, all signal math and logic let GainNodes and WaveShaperNodes do all of the work so that all processing is done in the underlying Assembly/C/C++ provided by the API. Signals are used extensively internally and are also useful for general DSP and control signal logic and transformations. 

Read more about [signals](https://github.com/TONEnoTONE/Tone.js/wiki/Signals). 

# AudioContext

Tone.js creates an AudioContext when it loads and shims it for maximum browser compatibility. The AudioContext can be found at `Tone.context` or from within any Object extending Tone as `this.context`. 

Tone also let's you set your own AudioContext using `Tone.setContext`.

# Performance

Tone.js uses very few ScriptProcessorNodes. Nearly all of the Tone Modules find a native Web Audio component workaround, making extensive use of the GainNode and WaveShaperNode especially, which enables Tone.js to work well on both desktop and mobile browsers. While the ScriptProcessorNode is extremely powerful, it introduces a lot of latency and the potential for glitches more than any other node.

# References and Inspiration

* [Tuna.js](https://github.com/Dinahmoe/tuna)
* [Many of Chris Wilson's Repositories](https://github.com/cwilso)
* [The Spec](http://webaudio.github.io/web-audio-api/)
