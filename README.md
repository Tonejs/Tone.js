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

Tone is the base-class of all ToneNode's. All ToneNode's extend Tone. 

### Properties

#### .input {GainNode}

Connect all inputs to a ToneNode to the Node's input.

#### .output {GainNode}

A GainNode which is the output of all of the processing that occurs within the ToneNode

#### .context {AudioContext}

A reference to the AudioContext. It is also available globally as Tone.context

### Methods

#### .connect(node)

node - {AudioNode | AudioParam | ToneNode}

Connects the node's output to the next node. If it is a ToneNode it will automatically connect to that Node's .input 

#### .now() {number}

returns context.currentTime

## Master

Tone.Master is a single master output which connects to context.destination (the speakers). Before going to the DestinationNode, audio is run through a limiter (a DynamicsCompressorNode with threshold of 0db and a high ratio) to reduce the chances of blowing any ear drums. 

#### .toMaster()

toMaster() can be called on any AudioNode or ToneNode and will send the output audio to the Master channel. 

## Transport

The Transport allows events to be triggered along a musical timeline. The clock-source is bound to an Oscillator which allows for smooth tempo-curving and sample-accurate timing. 

### Properties

#### .state {string}

The current state of the transport ('stopped' | 'started' | 'paused')

#### .loop {boolean}

Set the transport to loop over a section

### Methods

#### .setBpm(bpm)

bpm - {number} the new tempo in beats per minute

#### .getBpm() {number}

returns the current bpm

#### .setInterval(callback, interval, context) {Timeout}

callback - in the form: function(number)
interval - {number | Notation | TransportTime}
context - {Object=} optional context in which the callback is invoked

returns - a timeout which can be used to clear the interval

.setInterval is used for repeat events. The callback is invoked before the event will occur and is passed the exact event time as a parameter

```javascript
Tone.Transport.setInterval(function(time){
    samplePlayer.start(time);
}, "4n");
```

#### .setTimeout(callback, timeoutTime, context) {Timeout}

callback - in the form: function(number)
timeoutTime - {number | Notation | TransportTime}
context - {Object=} optional context in which the callback is invoked

returns - a timeout which can be used to clear the timeout

.setTimeout is similar to .setInterval but for single occurance events. 

```javascript
Tone.Transport.setTimeout(function(time){
    samplePlayer.start(time);
}, "4n");
```




