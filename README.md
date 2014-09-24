Tone.js
=========

Tone.js is a Web Audio framework for creating interactive music in the browser. The architecture of Tone.js aims to be familiar to both musicians and audio programmers looking to create web-based audio applications. On the high-level, Tone offers common DAW (digital audio workstation) features like a global transport, prebuilt synths and effects, as well as presets for those synths and effects. For signal-processing programmers (coming from languages like Max/MSP), Tone provides a wealth of high performance, low latency building blocks and DSP modules to build your own synthesizers, effects, and complex control signals.

[Examples](http://tonenotone.github.io/Tone.js/examples/)

[API](http://tonenotone.github.io/Tone.js/doc/Tone.html)

# Installation

RequireJS is the recommended way to use Tone.js but it can also be used just as well without it. 

### without RequireJS

Tone.js can also be used like any other script or library by dropping the [Tone.js Build](https://raw.githubusercontent.com/TONEnoTONE/Tone.js/master/build/Tone.js) into the <head> of your page. A global called ```Tone``` will be added to the ```window```. 

```html
<script type="text/javascript" src="path/to/Tone.js"></script>
```

To use any of the presets on instruments or effects, be sure to grab the [Tone.Presets build](https://raw.githubusercontent.com/TONEnoTONE/Tone.js/master/build/Tone.Preset.js) which is not included in the default build. 

### RequireJS

[RequireJS](http://requirejs.org/) is a JavaScript module loader which Tone.js uses internally for dependency management. It is a powerful tool for development and deploying. Using r.js (RequireJS's optimizer) can bring package size down significantly since it will only include the modules used in your code. 

To use Tone with RequireJS, add a path to the base directory where the library is stored and then refer all Tone module dependencies starting with "Tone/". 

To get all of the files in their directory structure, you can ```npm install tone```. 

```javascript
require.config({
    baseUrl: './base',
    paths: {
        "Tone" : "path/to/Tone.js/Tone"
    }
});
require(["Tone/core/Transport"], function(Transport){
    //...
```

# AudioContext

Tone.js creates an AudioContext when it loads and shims it for maximum browser compatibility. The AudioContext can be found at ```Tone.context``` or from within any Object extending Tone as ```this.context```. 

Tone also let's you set your own AudioContext using ```Tone.setContext```.

# Tone.Source

Tone.js has a number of built in audio sources:

* [Sine/Square/Sawtooth/Triangle Waves](http://tonenotone.github.io/Tone.js/doc/Tone.Oscillator.html)
* [Pulse Wave](http://tonenotone.github.io/Tone.js/doc/Tone.PulseOscillator.html)
* [Buffer Player](http://tonenotone.github.io/Tone.js/doc/Tone.Player.html)
* [Noise Generator](http://tonenotone.github.io/Tone.js/doc/Tone.Noise.html)

### Tone.Oscillator

A wrapper around the native OscillatorNode which simplifies starting and stopping and includes additional parameters such as phase rotation. 

```javascript
//a square wave at 440hz:
var osc = new Tone.Oscillator(440, "square");
//connect it to the master output
osc.toMaster();
osc.start();
```

### Tone.Player

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

### Tone.Transport.setTimeline

```Tone.Transport.setTimeline``` will schedule an event relative to the start of the timeline. These events will start, stop and loop with the Transport. 

### Tone.Transport.setInterval

like the native ```setInterval```, ```Tone.Transport.setInterval``` will schedule a repeating event at the interval specified. These events will only be invoked when the Transport is playing. 

```javascript
//this will start the player on every quarter note
Tone.Transport.setInterval(function(time){
	player.start(time);
}, "4n");
//start the Transport for the events to start
Tone.Transport.start();
```

### Tone.Transport.setTimeout

Set a single event in the future relative to the current Transport position with ```Tone.Transport.setTimeout```

```javascript
//this will start an oscillator 5 seconds from now
Tone.Transport.setTimeout(function(time){
	osc.start(time);
}, 5);
Tone.Transport.start();
```
### Time

In the Tone library, time can be described in a number of ways. Any method which takes a time as a parameter will accept any of these forms: 

__Numbers__: will be taken literally as the time (in seconds). 

__Notation__: describes time in BPM and time signature relative values. 

 * "4n" = quarter note
 * "8t" = eighth note triplet
 * "2m" = two measures

__Transport Time__: will also provide tempo and time signature relative times in the form BARS:QUARTERS:SIXTEENTHS.

* "32:0:0" = start of the 32nd measure. 
* "4:3:2" = 4 bars + 3 quarter notes + 2 sixteenth notes. 
* "1:2" =  1 bar + 2 quarter notes (sixteenth notes omitted)

__Frequency__: seconds can also be described in Hz. 

* "1hz" = 1 second
* "5hz" = 0.2 seconds

__Now-Relative__: prefix any of the above with "+" and it will be interpreted as "the current time plus whatever expression follows"

* "+1m" = 1 measure from now
* "+0.5" = half a second from now

__Expressions__: any of the above can also be combined into a mathematical expression which will be evaluated to compute the desired time.

* "3:0 + 2 - (1m / 7)" = 3 measures + 2 seconds - a 7th note
* "+1m + 0.002" = the current time + 1 measure and 2 milliseconds. 

__No Argument__: for methods which accept time, no argument will be interpreted as 0 seconds or "now" (i.e. the currentTime) depending on the context.

# Components

Tone.js provides a number number of useful components for building synthesizers and effects. 

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
* [Tone.Panner](http://tonenotone.github.io/Tone.js/doc/Tone.Panner.html)
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

### Logic

Audio-rate logic operator output 1 when true and 0 when false. 

* [Tone.Equal](http://tonenotone.github.io/Tone.js/doc/Tone.Equal.html)
* [Tone.EqualZero](http://tonenotone.github.io/Tone.js/doc/Tone.EqualZero.html)
* [Tone.GreaterThan](http://tonenotone.github.io/Tone.js/doc/Tone.GreaterThan.html)
* [Tone.LessThan](http://tonenotone.github.io/Tone.js/doc/Tone.LessThan.html)
* [Tone.Threshold](http://tonenotone.github.io/Tone.js/doc/Tone.Threshold.html)

### Routing

Signal can also be routed and gated for maximum flexibility. 

* [Tone.Route](http://tonenotone.github.io/Tone.js/doc/Tone.Route.html)
* [Tone.Select](http://tonenotone.github.io/Tone.js/doc/Tone.Select.html)
* [Tone.Switch](http://tonenotone.github.io/Tone.js/doc/Tone.Switch.html)

# Instruments

Tone.js has a few built in synthesizers. 

* [Tone.MonoSynth](http://tonenotone.github.io/Tone.js/doc/Tone.MonoSynth.html)
* [Tone.DuoSynth](http://tonenotone.github.io/Tone.js/doc/Tone.DuoSynth.html)
* [Tone.FMSynth](http://tonenotone.github.io/Tone.js/doc/Tone.FMSynth.html)
* [Tone.PluckSynth](http://tonenotone.github.io/Tone.js/doc/Tone.PluckSynth.html)
* [Tone.Sampler](http://tonenotone.github.io/Tone.js/doc/Tone.Sampler.html)

Each of these synthesizers can be fed to the second argument of [Tone.PolySynth](http://tonenotone.github.io/Tone.js/doc/Tone.PolySynth.html) to turn the monophonic voice into a polyphonic synthesizer. 

### Presets

Each of the instruments also has a number of presets which can be found in the Tone/instrument/presets folder. These named synthesizer configurations are a starting point for exploring the features of each synthesizer. 

# Effects

Tone.js also has a few stereo and mono effects which also have their own presets. 

* [Tone.AutoPanner](http://tonenotone.github.io/Tone.js/doc/Tone.AutoPanner.html)
* [Tone.AutoWah](http://tonenotone.github.io/Tone.js/doc/Tone.AutoWah.html)
* [Tone.BitCrusher](http://tonenotone.github.io/Tone.js/doc/Tone.BitCrusher.html)
* [Tone.Chorus](http://tonenotone.github.io/Tone.js/doc/Tone.Chorus.html)
* [Tone.FeedbackDelay](http://tonenotone.github.io/Tone.js/doc/Tone.FeedbackDelay.html)
* [Tone.Freeverb](http://tonenotone.github.io/Tone.js/doc/Tone.Freeverb.html)
* [Tone.JCReverb](http://tonenotone.github.io/Tone.js/doc/Tone.JCReverb.html)
* [Tone.Phaser](http://tonenotone.github.io/Tone.js/doc/Tone.Phaser.html)
* [Tone.PingPongDelay](http://tonenotone.github.io/Tone.js/doc/Tone.PingPongDelay.html)

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
