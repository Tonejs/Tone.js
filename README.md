Tone.js
=========

A collection of building blocks extending and wrapping the Web Audio API.  

# Installation

Tone.js can be used with or without require.js

### require.js

There are a couple ways to use the tone library with require.js and r.js. 

You can include the Tone.js build (located in the build folder), as one of the deps in your require.config

```javascript
require.config({
    baseUrl: './base',
    deps : ["../deps/Tone.js/build/Tone"],
});
```

or alternatively, keep the directory structure the same and make a path which points to the Tone directory

```javascript
require.config({
    baseUrl: './base',
    paths: {
        "Tone" : "../deps/Tone.js/Tone"
    }
});
```
### without require.js

To use Tone.js without require, just add the build source (located at build/Tone.js) to the top of your html page. Tone will add itself as a global. 

```html
<script type="text/javascript" src="../build/Tone.js"></script>
```

# API

## Tone()

Tone is the base-class of all ToneNode's

### Properties

#### .input {GainNode}

Connect all inputs to a ToneNode to the Node's input.

#### .output {GainNode}

A GainNode which is the output of all of the processing that occurs within the ToneNode

#### .context {AudioContext}

A reference to the AudioContext. It is also available globally as Tone.context

### Methods

#### .connect(node)

* node - {AudioNode | AudioParam | ToneNode}

Connects the node's output to the next node. If it is a ToneNode it will automatically connect to that Node's .input 

#### .now() {number}

* returns context.currentTime

## Master

Tone.Master is a single master output which connects to context.destination (the speakers). Before going to the DestinationNode, audio is run through a limiter (a DynamicsCompressorNode with threshold of 0db and a high ratio) to reduce the chances of blowing any ear drums. 

#### .toMaster()

.toMaster() can be called on any AudioNode or ToneNode and will send the output audio to the Master channel. 

## Transport

The Transport allows events to be triggered along a musical timeline. The clock-source is bound to an Oscillator which allows for smooth tempo-curving and sample-accurate timing. 

### Properties

#### .state {string}

The current state of the transport ('stopped' | 'started' | 'paused')

#### .loop {boolean}

Set the transport to loop over a section

### Methods

#### .setBpm(bpm)

* bpm - {number} the new tempo in beats per minute

#### .getBpm()

* returns - {number} the current bpm

#### .setInterval(callback, interval, context) {Timeout}

* callback - in the form: function(number)
* interval - {number | Notation | TransportTime} see Timing and Musical Notation for more information about timing in Tone.js
* context - {Object=} optional context in which the callback is invoked
* returns - a timeout which can be used to clear the interval

.setInterval is used for repeat events. The callback is invoked before the event will occur and is passed the exact event time as a parameter

```javascript
Tone.Transport.setInterval(function(time){
    samplePlayer.start(time);
}, "4n");
```

#### .setTimeout(callback, timeoutTime, context) {Timeout}

* callback - in the form: function(number)
* timeoutTime - {number | Notation | TransportTime} see Timing and Musical Notation for more information about timing in Tone.js
* context - {Object=} optional context in which the callback is invoked
* returns - a timeout which can be used to clear the timeout

.setTimeout is similar to .setInterval but for single occurance events. 

```javascript
Tone.Transport.setTimeout(function(time){
    samplePlayer.start(time);
}, "1:0:2");
```

# Timing and Musical Notation

All ToneNodes that accept a time as an argument can parse that time in a few ways. 

#### 'now' relative timing

A timing value preceeded by a "+" will be now-relative meaning that the time will be added to the context's currentTime. 

```javascript
oscillator.start("+1") //starts exactly 1 second from now
```

#### Notation

Timing can also be described in musical notation. A quarter-note is notated as "4n" and a sixteenth-note triplet is notated as "16t". Three measures is "3m". The tempo and time signature is set by Tone.Transport. This can be combined with now-relative timing. 

```javascript
lfo.setFrequency("4n") //oscillates at the rate of a quarter note
```

#### Transport Time

Transport Time is described measures:quater-notes:sixteenth-notes. 

```javascript
//Start the chorus 16 measures after the start of the Transport
Tone.Transport.setTimeline(startChorus, "32:0:0");
```








