Tone.js
=========

Tone.js is a Web Audio framework for creating interactive music in the browser. The architecture of Tone.js aims to be familiar to both musicians and audio programmers looking to create web-based audio applications. On the high-level, Tone offers common DAW (digital audio workstation) features like a global transport, prebuilt synths and effects, as well as presets for those synths and effects. For signal-processing programmers (coming from languages like Max/MSP), Tone provides a wealth of high performance, low latency building blocks and DSP modules to build your own synthesizers, effects, and complex control signals.

[Examples](http://tonenotone.github.io/Tone.js/examples/)

[API](http://tonejs.org/docs/Tone.html)

# Demos

* [motionEmotion - emotion & gesture-based arpeggiator and synthesizer](http://motionemotion.herokuapp.com/)
* [A Tone.js Plugin Architecture with GUIs](https://github.com/billautomata/Tone.js.Plugins)
* [Hypercube by @eddietree](http://eddietree.github.io/hypercube/)
* [randomcommander.io by Jake Albaugh](http://randomcommander.io/)
* [Tone.js + NexusUI by taylorbf](http://taylorbf.github.io/Tone-Rack/)
* [Solarbeat - Luke Twyman](http://www.whitevinyldesign.com/solarbeat/)

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
//create one of Tone's built-in synthesizers
var synth = new Tone.MonoSynth();

//connect the synth to the master output channel
synth.toMaster();

//create a callback which is invoked every quarter note
Tone.Transport.setInterval(function(time){
	//trigger middle C for the duration of an 8th note
	synth.triggerAttackRelease("C4", "8n", time);
}, "4n");

//start the transport
Tone.Transport.start();
```

# Tone.Transport

A unique feature of the library is the oscillator-based Transport which allows for application-wide synchronization of sources and signals. The Transport allows you to register callbacks at precise moments along the timeline which are invoked right before the event with the exact time of the event. Additionally, because the Transport is implemented with an oscillator, it is capable of elaborate tempo curves and automation. 

[Read more](https://github.com/TONEnoTONE/Tone.js/wiki/Transport).

### Time

In the Tone library, time can be described in a number of ways. Any method which takes a time as a parameter will accept the number in seconds as well as a tempo-relative form. 

[Read more about Tone.Time](https://github.com/TONEnoTONE/Tone.js/wiki/Time).

# Sources

Aside from the 4 basic oscillator types (sine, square, triangle, sawtooth), Tone.js provides a few other sources such as a buffer player (Tone.Player), a noise generator, and two additional oscillator types (pwm, pulse). 

[Read more](https://github.com/TONEnoTONE/Tone.js/wiki/Sources).

# Instruments

Tone has a few prebuilt synthesizers. 

[Read more about how to use them](https://github.com/TONEnoTONE/Tone.js/wiki/Instruments).

# Effects

Tone.js also has a few stereo and mono effects some of which also have their own presets. 

[Read more](https://github.com/TONEnoTONE/Tone.js/wiki/Effects).

# Components

Tone.js provides a number number of useful components for building synthesizers and effects. 

[Read more](https://github.com/TONEnoTONE/Tone.js/wiki/Components).

# Signals

Like the underlying Web Audio API, Tone.js is built with audio-rate signal control over nearly everything. This is a powerful feature which allows for sample-accurate synchronization of multiple parameters with a single signal. Signals are built entirely without the ScriptProcessorNode so they do not introduce much latency and processing overhead. Instead, all signal math and logic let GainNodes and WaveShaperNodes do all of the work so that all processing is done in the underlying Assembly/C/C++ provided by the API. Signals are used extensively internally and are also useful for general DSP and control signal logic and transformations. 

Read more about [signals](https://github.com/TONEnoTONE/Tone.js/wiki/Signals) and [signal operators](https://github.com/TONEnoTONE/Tone.js/wiki/Signal Math).

# AudioContext

Tone.js creates an AudioContext when it loads and shims it for maximum browser compatibility. The AudioContext can be found at `Tone.context` or from within any Object extending Tone as `this.context`. 

Tone also let's you set your own AudioContext using `Tone.setContext`.

# Performance

Tone.js uses very few ScriptProcessorNodes. Nearly all of the Tone Modules find a native Web Audio component workaround, making extensive use of the GainNode and WaveShaperNode especially, which enables Tone.js to work well on both desktop and mobile browsers. While the ScripProcessorNode is extremely powerful, it introduces a lot of latency and the potential for glitches more than any other node.

# References and Inspiration

* [Tuna.js](https://github.com/Dinahmoe/tuna)
* [Many of Chris Wilson's Repositories](https://github.com/cwilso)
* [The Spec](http://webaudio.github.io/web-audio-api/)
