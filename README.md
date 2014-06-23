Tone.js
=========

A collection of building blocks extending and wrapping the Web Audio API.  

# Installation

Tone.js can be used with or without RequireJS

### RequireJS

[RequireJS](http://requirejs.org/) is a JavaScript module loader which Tone.js uses internally
for dependency management. It is a powerful tool for development and deploying. Using r.js (RequireJS's optimizer) 
can bring package size down significantly since it will only load the modules used in your code. 

There are a couple ways to use the tone library with require.js and r.js. 

The best way to use with  Tone.js is to make a path to the base directory:

```javascript
require.config({
    baseUrl: './base',
    paths: {
        "Tone" : "pathto/Tone.js/Tone"
    }
});
```

### without RequireJS

Tone.js can also be used without RequireJS. If you include the [Tone.js Build](https://raw.githubusercontent.com/TONEnoTONE/Tone.js/master/Tone.js)
as a script tag at the top of your page, a global called ```Tone``` will be added to the window. 

```html
<script type="text/javascript" src="pathto/Tone.js"></script>
```

# AudioContext

Tone.js creates an AudioContext when it loads and shims it for maximum browser compatibility. The AudioContext can be found at
```Tone.context``` or from within any Node in the Tone library as ```this.context```. For AudioNodes
to be able to connect together, they need to be created from the same AudioContext. 

# Audio Sources

Tone.js simplifies the creation of oscillators and buffer players. 

```javascript
//a square wave at 440hz:
var osc = new Tone.Oscillator(440, "square");
//connect it to the master output
osc.toMaster();
osc.start();
```

```javascript
//a buffer player which plays as soon as it's loaded
//the second argument is an onload callback
var player = new Tone.Player("./sound.mp3", function(){
	player.start();	
});
player.toMaster();
```

# Transport and Timing

A unique feature of the library is the oscillator-based Transport which allows for simple synchronization of 
sources and signals. The Transport allows you to register callbacks at precise moments along and get a callback
with the exact time requested. Pass the time to the Node you'd like to start or automate. 

```javascript
//this will start the player on every quarter note
Tone.Transport.setInterval(function(time){
	player.start(time);
}, "4n");
//start the Transport for the events to start
Tone.Transport.start();
```

The Transport also allows single events to occur in the future using setTimeout

```javascript
//this will start an oscillator 5 seconds from now
Tone.Transport.setTimeout(function(time){
	osc.start(time);
}, 5);
Tone.Transport.start();
```

Events can also be arranged on a timeline. Callbacks registered with ```setTimeline``` will
repeat even after the Transport is started, stopped or looped. 

```javascript
//this will start an oscillator 5 seconds from now
Tone.Transport.setTimeline(function(time){
	console.log("first measure")
}, "1:0:0");
Tone.Transport.setLoopEnd("4:0:0");
Tone.Transport.start();
```
### Time

In the Tone library, time can be described in a number of ways. Any method
which takes a time as a parameter will accept any of these forms: 

__Number__: these will be taken literally as the time (in seconds). 

__Notation__: describes time in BPM and time signature relative values. 

 * "4n" = quarter note
 * "8t" = eighth note triplet
 * "2m" = two measures

__Transport Time__: will also provide tempo and time signature relative times in the form BARS:QUARTERS:SIXTEENTHS.

* "32:0:0" = start of the 32nd measure. 
* "4:3:2" = 4 bars + 3 quarter notes + 2 sixteenth notes. 

__Frequency__: seconds can also be described in Hz. 

* "1hz" = 1 second
* "5hz" = 0.2 seconds

__Now-Relative__: prefix any of the above with "+" and it will be interpreted as "the current time + "

* "+1m" = 1 measure from now
* "+0.5" = half a second from now


# Components

Tone.js provides a number number of useful components for building synthesizers and audio applications.

* [Tone.Envelope](http://tonenotone.github.io/Tone.js/doc/Tone.Envelope.html)
* [Tone.LFO](http://tonenotone.github.io/Tone.js/doc/Tone.LFO.html)
* [Tone.Panner](http://tonenotone.github.io/Tone.js/doc/Tone.Panner.html)
* [Tone.DryWet](http://tonenotone.github.io/Tone.js/doc/Tone.DryWet.html)

# Control Signals

Like the underlying Web Audio API, Tone.js is built to work with audio-rate signal control of many parameters. 
This is a powerful feature which allows for sample-accurate synchronization of multiple parameters with a single 
signal and also lets you connect an LFO to nearly anything. 

```javascript
//use the same LFO to create a vibrato on a oscillator and pan the audio L/R
var lfo = new Tone.LFO(3, 0, 1); //3hz signal between 0-1

var panner = new Tone.Panner();
lfo.connect(panner.pan); //connect the lfo to the signal which controls panning

var scaler = new Tone.Scale(420, 460); //scale the lfo signal from 0-1 to 420-460
var osc = new Tone.Oscillator(440, "sine"); //create an oscillator

//route the lfo through the scaler to the oscillator frequency
lfo.connect(scaler);
scaler.connect(osc.frequency);

//connect the oscillator to the panner and the panner to master
osc.connect(panner);
panner.toMaster();

//start the oscillator and the lfo
lfo.start();
osc.start();
```

# Examples

More examples can be found [here](http://tonenotone.github.io/Tone.js/examples/).

# Documentation

JSDocs are [here](http://tonenotone.github.io/Tone.js/doc/).
