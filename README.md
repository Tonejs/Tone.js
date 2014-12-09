Tone.js
=========

Tone.js is a Web Audio framework for creating interactive music in the browser. The architecture of Tone.js aims to be familiar to both musicians and audio programmers looking to create web-based audio applications. On the high-level, Tone offers common DAW (digital audio workstation) features like a global transport, prebuilt synths and effects, as well as presets for those synths and effects. For signal-processing programmers (coming from languages like Max/MSP), Tone provides a wealth of high performance, low latency building blocks and DSP modules to build your own synthesizers, effects, and complex control signals.

[Examples](http://tonenotone.github.io/Tone.js/examples/)

[API](http://tonenotone.github.io/Tone.js/doc/Tone.html)

# Installation

Tone can be installed in a few of ways. Download Tone.js from github, or user `bower install tone` or `npm install tone`. Additionally, Tone.js can be used with or without RequireJS.

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

# AudioContext

Tone.js creates an AudioContext when it loads and shims it for maximum browser compatibility. The AudioContext can be found at `Tone.context` or from within any Object extending Tone as `this.context`. 

Tone also let's you set your own AudioContext using `Tone.setContext`.

# Sources

Tone.js has a number of built in audio sources:

* [Tone.Oscillator](http://tonenotone.github.io/Tone.js/doc/Tone.Oscillator.html)
* [Tone.PulseOscillator](http://tonenotone.github.io/Tone.js/doc/Tone.PulseOscillator.html)
* [Tone.PWMOscillator](http://tonenotone.github.io/Tone.js/doc/Tone.PWMOscillator.html)
* [Tone.OmniOscillator](http://tonenotone.github.io/Tone.js/doc/Tone.OmniOscillator.html)
* [Tone.Player](http://tonenotone.github.io/Tone.js/doc/Tone.Player.html)
* [Tone.Noise](http://tonenotone.github.io/Tone.js/doc/Tone.Noise.html)

#### Tone.Oscillator

A wrapper around the native OscillatorNode which simplifies starting and stopping and includes additional parameters such as phase rotation. 

```javascript
//a square wave at 440hz:
var osc = new Tone.Oscillator(440, "square");
//connect it to the master output
osc.toMaster();
osc.start();
```

#### Tone.Player

```javascript
//the second argument is an onload callback
var player = new Tone.Player("./sound.mp3", function(){
	//now you can use the player...
});
player.toMaster();
```

# Tone.Transport

A unique feature of the library is the oscillator-based Transport which allows for application-wide synchronization of sources and signals. The Transport allows you to register callbacks at precise moments along the timeline which are invoked right before the event with the exact time of the event. Additionally, because the Transport is implemented with an oscillator, it is capable of elaborate tempo curves and automation. 

There are three methods for timing events with Tone.Transport:

#### Tone.Transport.setTimeline

```Tone.Transport.setTimeline``` will schedule an event relative to the start of the timeline. These events will start, stop and loop with the Transport. 

#### Tone.Transport.setInterval

like the native ```setInterval```, ```Tone.Transport.setInterval``` will schedule a repeating event at the interval specified. These events will only be invoked when the Transport is playing. 

```javascript
//this will start the player on every quarter note
Tone.Transport.setInterval(function(time){
	player.start(time);
}, "4n");
//start the Transport for the events to start
Tone.Transport.start();
```

#### Tone.Transport.setTimeout

Set a single event in the future relative to the current Transport position with ```Tone.Transport.setTimeout```

```javascript
//this will start an oscillator 5 seconds from now
Tone.Transport.setTimeout(function(time){
	osc.start(time);
}, 5);
Tone.Transport.start();
```
### Time

In the Tone library, time can be described in a number of ways. Any method which takes a time as a parameter will accept the number in seconds as well as a tempo-relative form. 

Read more about [Tone.Time](https://github.com/TONEnoTONE/Tone.js/wiki/Time)

# Instruments

Tone.js has a few built in synthesizers. 

* [Tone.AMSynth](http://tonenotone.github.io/Tone.js/doc/Tone.AMSynth.html)
* [Tone.DuoSynth](http://tonenotone.github.io/Tone.js/doc/Tone.DuoSynth.html)
* [Tone.FMSynth](http://tonenotone.github.io/Tone.js/doc/Tone.FMSynth.html)
* [Tone.MonoSynth](http://tonenotone.github.io/Tone.js/doc/Tone.MonoSynth.html)
* [Tone.NoiseSynth](http://tonenotone.github.io/Tone.js/doc/Tone.NoiseSynth.html)
* [Tone.PluckSynth](http://tonenotone.github.io/Tone.js/doc/Tone.PluckSynth.html)
* [Tone.Sampler](http://tonenotone.github.io/Tone.js/doc/Tone.Sampler.html)

Each of these synthesizers can be fed to the second argument of [Tone.PolySynth](http://tonenotone.github.io/Tone.js/doc/Tone.PolySynth.html) to turn the monophonic voice into a polyphonic synthesizer. 

### Presets

Each of the instruments also has a number of presets which can be found in the Tone/instrument/presets folder. These named synthesizer configurations are a starting point for exploring the features of each synthesizer. 

# Effects

Tone.js also has a few stereo and mono effects some of which also have their own presets. 

* [Tone.AutoPanner](http://tonenotone.github.io/Tone.js/doc/Tone.AutoPanner.html)
* [Tone.AutoWah](http://tonenotone.github.io/Tone.js/doc/Tone.AutoWah.html)
* [Tone.BitCrusher](http://tonenotone.github.io/Tone.js/doc/Tone.BitCrusher.html)
* [Tone.Chebyshev](http://tonenotone.github.io/Tone.js/doc/Tone.Chebyshev.html)
* [Tone.Chorus](http://tonenotone.github.io/Tone.js/doc/Tone.Chorus.html)
* [Tone.Convolver](http://tonenotone.github.io/Tone.js/doc/Tone.Convolver.html)
* [Tone.Distortion](http://tonenotone.github.io/Tone.js/doc/Tone.Distortion.html)
* [Tone.FeedbackDelay](http://tonenotone.github.io/Tone.js/doc/Tone.FeedbackDelay.html)
* [Tone.Freeverb](http://tonenotone.github.io/Tone.js/doc/Tone.Freeverb.html)
* [Tone.JCReverb](http://tonenotone.github.io/Tone.js/doc/Tone.JCReverb.html)
* [Tone.Phaser](http://tonenotone.github.io/Tone.js/doc/Tone.Phaser.html)
* [Tone.PingPongDelay](http://tonenotone.github.io/Tone.js/doc/Tone.PingPongDelay.html)
* [Tone.StereoWidener](http://tonenotone.github.io/Tone.js/doc/Tone.StereoWidener.html)

# Components

Tone.js provides a number number of useful components for building synthesizers and effects. 

* [Tone.AmplitudeEnvelope](http://tonenotone.github.io/Tone.js/doc/Tone.AmplitudeEnvelope.html)
* [Tone.Compressor](http://tonenotone.github.io/Tone.js/doc/Tone.Compressor.html)
* [Tone.DryWet](http://tonenotone.github.io/Tone.js/doc/Tone.DryWet.html)
* [Tone.Envelope](http://tonenotone.github.io/Tone.js/doc/Tone.Envelope.html)
* [Tone.EQ](http://tonenotone.github.io/Tone.js/doc/Tone.EQ.html)
* [Tone.FeedbackCombFilter](http://tonenotone.github.io/Tone.js/doc/Tone.FeedbackCombFilter.html)
* [Tone.Filter](http://tonenotone.github.io/Tone.js/doc/Tone.Filter.html)
* [Tone.Follower](http://tonenotone.github.io/Tone.js/doc/Tone.Follower.html)
* [Tone.Gate](http://tonenotone.github.io/Tone.js/doc/Tone.Gate.html)
* [Tone.LFO](http://tonenotone.github.io/Tone.js/doc/Tone.LFO.html)
* [Tone.LowpassCombFilter](http://tonenotone.github.io/Tone.js/doc/Tone.LowpassCombFilter.html)
* [Tone.Merge](http://tonenotone.github.io/Tone.js/doc/Tone.Merge.html)
* [Tone.Meter](http://tonenotone.github.io/Tone.js/doc/Tone.Meter.html)
* [Tone.Mono](http://tonenotone.github.io/Tone.js/doc/Tone.Mono.html)
* [Tone.MultibandCompressor](http://tonenotone.github.io/Tone.js/doc/Tone.MultibandCompressor.html)
* [Tone.MultibandSplit](http://tonenotone.github.io/Tone.js/doc/Tone.MultibandSplit.html)
* [Tone.Panner](http://tonenotone.github.io/Tone.js/doc/Tone.Panner.html)
* [Tone.PanVol](http://tonenotone.github.io/Tone.js/doc/Tone.PanVol.html)
* [Tone.ScaledEnvelope](http://tonenotone.github.io/Tone.js/doc/Tone.ScaledEnvelope.html)
* [Tone.Split](http://tonenotone.github.io/Tone.js/doc/Tone.Split.html)

# Signals

Like the underlying Web Audio API, Tone.js is built with audio-rate signal control over nearly everything. This is a powerful feature which allows for sample-accurate synchronization of multiple parameters with a single signal. Signals are built entirely without the ScriptProcessorNode so they do not introduce much latency and processing overhead. Instead, all signal math and logic let GainNodes and WaveShaperNodes do all of the work so that all processing is done in the underlying Assembly/C/C++ provided by the API. Signals are used extensively internally and are also useful for general DSP and control signal logic and transformations. 

### Math

* [Tone.Abs](http://tonenotone.github.io/Tone.js/doc/Tone.Abs.html)
* [Tone.Add](http://tonenotone.github.io/Tone.js/doc/Tone.Add.html)
* [Tone.Clip](http://tonenotone.github.io/Tone.js/doc/Tone.Clip.html)
* [Tone.Max](http://tonenotone.github.io/Tone.js/doc/Tone.Max.html)
* [Tone.Min](http://tonenotone.github.io/Tone.js/doc/Tone.Min.html)
* [Tone.Modulo](http://tonenotone.github.io/Tone.js/doc/Tone.Modulo.html)
* [Tone.Multiply](http://tonenotone.github.io/Tone.js/doc/Tone.Multiply.html)
* [Tone.Negate](http://tonenotone.github.io/Tone.js/doc/Tone.Negate.html)
* [Tone.Scale](http://tonenotone.github.io/Tone.js/doc/Tone.Scale.html)
* [Tone.ScaleExp](http://tonenotone.github.io/Tone.js/doc/Tone.ScaleExp.html)
* [Tone.Signal](http://tonenotone.github.io/Tone.js/doc/Tone.Signal.html)
* [Tone.Subtract](http://tonenotone.github.io/Tone.js/doc/Tone.Subtract.html)
* [Tone.WaveShaper](http://tonenotone.github.io/Tone.js/doc/Tone.WaveShaper.html)

### Logic

Audio-rate logic operator output 1 when true and 0 when false. 

* [Tone.AND](http://tonenotone.github.io/Tone.js/doc/Tone.AND.html)
* [Tone.Equal](http://tonenotone.github.io/Tone.js/doc/Tone.Equal.html)
* [Tone.EqualZero](http://tonenotone.github.io/Tone.js/doc/Tone.EqualZero.html)
* [Tone.GreaterThan](http://tonenotone.github.io/Tone.js/doc/Tone.GreaterThan.html)
* [Tone.GreaterThanZero](http://tonenotone.github.io/Tone.js/doc/Tone.GreaterThanZero.html)
* [Tone.LessThan](http://tonenotone.github.io/Tone.js/doc/Tone.LessThan.html)
* [Tone.NOT](http://tonenotone.github.io/Tone.js/doc/Tone.NOT.html)
* [Tone.OR](http://tonenotone.github.io/Tone.js/doc/Tone.OR.html)

### Routing

Signal can also be routed and gated for maximum flexibility. 

* [Tone.IfThenElse](http://tonenotone.github.io/Tone.js/doc/Tone.IfThenElse.html)
* [Tone.Route](http://tonenotone.github.io/Tone.js/doc/Tone.Route.html)
* [Tone.Select](http://tonenotone.github.io/Tone.js/doc/Tone.Select.html)
* [Tone.Switch](http://tonenotone.github.io/Tone.js/doc/Tone.Switch.html)

# Performance

Tone.js uses very few ScriptProcessorNodes. Nearly all of the Tone Modules find a native Web Audio component workaround, making extensive use of the GainNode and WaveShaperNode especially, which enables Tone.js to work well on both desktop and mobile browsers. While the ScripProcessorNode is extremely powerful, it introduces a lot of latency and the potential for glitches more than any other node.

# Demos

* [motionEmotion - emotion & gesture-based arpeggiator and synthesizer](http://motionemotion.herokuapp.com/)
* [A Tone.js Plugin Architecture with GUIs](https://github.com/billautomata/Tone.js.Plugins)
* [Hypercube by @eddietree](http://eddietree.github.io/hypercube/)

Using Tone.js? I'd love to hear it: yotammann@gmail.com

# References and Inspiration

* [Tuna.js](https://github.com/Dinahmoe/tuna)
* [Many of Chris Wilson's Repositories](https://github.com/cwilso)
* [The Spec](http://webaudio.github.io/web-audio-api/)
