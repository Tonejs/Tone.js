
///////////////////////////////////////////////////////////////////////////////
//
//	TONE.js
//
//	(c) Yotam Mann. 2014.
//	MIT License (MIT)
///////////////////////////////////////////////////////////////////////////////
(function (root, factory) {
	//can run with or without requirejs
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define('core/Tone',[],function () {
			var Tone = factory(root);
			return Tone;
		});
	} else if (typeof root.Tone !== 'function') {
		//make Tone public
		root.Tone = factory(root);
		//define 'define' to invoke the callbacks with Tone
		root.define = function(name, deps, func){
			func(Tone);
		}
	}
} (this, function (global) {

	//////////////////////////////////////////////////////////////////////////
	//	WEB AUDIO CONTEXT
	///////////////////////////////////////////////////////////////////////////

	//ALIAS
	if (!global.AudioContext){
		global.AudioContext = global.webkitAudioContext;
	} 

	var audioContext;
	if (global.AudioContext){
		audioContext = new global.AudioContext();
	}

	//SHIMS////////////////////////////////////////////////////////////////////

	if (typeof audioContext.createGain !== "function"){
		audioContext.createGain = audioContext.createGainNode;
	}
	if (typeof audioContext.createDelay !== "function"){
		audioContext.createDelay = audioContext.createDelayNode;
	}
	if (typeof AudioBufferSourceNode.prototype.start !== "function"){
		AudioBufferSourceNode.prototype.start = AudioBufferSourceNode.prototype.noteGrainOn;
	}
	if (typeof AudioBufferSourceNode.prototype.stop !== "function"){
		AudioBufferSourceNode.prototype.stop = AudioBufferSourceNode.prototype.noteOff;
	}
	if (typeof OscillatorNode.prototype.start !== "function"){
		OscillatorNode.prototype.start = OscillatorNode.prototype.noteOn;
	}
	if (typeof OscillatorNode.prototype.stop !== "function"){
		OscillatorNode.prototype.stop = OscillatorNode.prototype.noteOff;	
	}
	//extend the connect function to include Tones
	AudioNode.prototype._nativeConnect = AudioNode.prototype.connect;
	AudioNode.prototype.connect = function(B){
		if (B.input && B.input instanceof GainNode){
			this._nativeConnect(B.input);
		} else {
			this._nativeConnect.apply(this, arguments);
		}
	}

	///////////////////////////////////////////////////////////////////////////
	//	TONE
	//	@constructor
	///////////////////////////////////////////////////////////////////////////

	var Tone = function(){
		this.input = audioContext.createGain();
		this.output = audioContext.createGain();
	}

	///////////////////////////////////////////////////////////////////////////
	//	CLASS VARS
	///////////////////////////////////////////////////////////////////////////

	Tone.prototype.context = audioContext;
	Tone.prototype.fadeTime = .005; //5ms
	Tone.prototype.bufferSize = 2048; //default buffer size
	Tone.prototype.waveShaperResolution = 1024; //default buffer size

	///////////////////////////////////////////////////////////////////////////
	//	CLASS METHODS
	///////////////////////////////////////////////////////////////////////////

	//@returns {number} the currentTime from the AudioContext
	Tone.prototype.now = function(){
		return audioContext.currentTime;
	}

	//@param {AudioParam | Tone} unit
	Tone.prototype.connect = function(unit){
		this.output.connect(unit);
	}

	//disconnect the output
	Tone.prototype.disconnect = function(){
		this.output.disconnect();
	}
	
	//connect together an array of units in series
	//@param {...AudioParam | Tone} units
	Tone.prototype.chain = function(){
		if (arguments.length > 1){
			var currentUnit = arguments[0];
			for (var i = 1; i < arguments.length; i++){
				var toUnit = arguments[i];
				currentUnit.connect(toUnit);
				currentUnit = toUnit;
			}
		}
	}

	//set the output volume
	//@param {number} vol
	Tone.prototype.setVolume = function(vol){
		this.output.gain.value = vol;
	}

	//fade the output volume
	//@param {number} value
	//@param {number=} duration (in seconds)
	Tone.prototype.fadeTo = function(value, duration){
		this.defaultArg(duration, this.fadeTime);
		this.rampToValue(this.output.gain, value, duration);
	}


	///////////////////////////////////////////////////////////////////////////
	//	UTILITIES / HELPERS
	///////////////////////////////////////////////////////////////////////////

	function isUndef(val){
		return typeof val === "undefined";
	}

	//ramps to value linearly starting now
	//@param {AudioParam} audioParam
	//@param {number} value
	//@param {number=} duration (in seconds)
	Tone.prototype.rampToValue = function(audioParam, value, duration){
		var currentValue = audioParam.value;
		var now = this.now();
		duration = this.defaultArg(duration, this.fadeTime);
		audioParam.setValueAtTime(currentValue, now);
		audioParam.linearRampToValueAtTime(value, now + duration);
	}

	//ramps to value exponentially starting now
	//@param {AudioParam} audioParam
	//@param {number} value
	//@param {number=} duration (in seconds)
	Tone.prototype.exponentialRampToValue = function(audioParam, value, duration){
		var currentValue = audioParam.value;
		var now = this.now();
		audioParam.setValueAtTime(currentValue, now);
		audioParam.exponentialRampToValueAtTime(value, now + duration);
	}

	//if the given argument is undefined, go with the default
	//@param {*} given
	//@param {*} fallback
	//@returns {*}
	Tone.prototype.defaultArg = function(given, fallback){
		return isUndef(given) ? fallback : given;
	}

	//@param {number} percent (0-1)
	//@returns {number} the equal power gain (0-1)
	//good for cross fades
	Tone.prototype.equalPowerScale = function(percent){
		return Math.sin((percent) * 0.5*Math.PI);
	}

	//@param {number} gain
	//@returns {number} gain (decibel scale but betwee 0-1)
	Tone.prototype.logScale = function(gain) {
		return  Math.max(this.normalize(this.gainToDb(gain), -100, 0), 0);
	}

	//@param {number} gain
	//@returns {number} gain (decibel scale but betwee 0-1)
	Tone.prototype.expScale = function(gain) {
		return this.dbToGain(this.interpolate(gain, -100, 0));
	}

	//@param {number} db
	//@returns {number} gain
	Tone.prototype.dbToGain = function(db) {
		return Math.pow(2, db / 6);
	}

	//@param {number} gain
	//@returns {number} db
	Tone.prototype.gainToDb = function(gain) {
		return  20 * (Math.log(gain) / Math.LN10);
	}

	//@param {number} input 0 to 1
	//@returns {number} between outputMin and outputMax
	Tone.prototype.interpolate = function(input, outputMin, outputMax){
		return input*(outputMax - outputMin) + outputMin;
	}

	//@returns {number} 0-1
	Tone.prototype.normalize = function(input, inputMin, inputMax){
		//make sure that min < max
		if (inputMin > inputMax){
			var tmp = inputMax;
			inputMax = inputMin;
			inputMin = tmp;
		} else if (inputMin == inputMax){
			return 0;
		}
		return (input - inputMin) / (inputMax - inputMin);
	}


	//@param {number} samples
	//@returns {number} the number of seconds
	Tone.prototype.samplesToSeconds = function(samples){
		return samples / audioContext.sampleRate;
	}

	///////////////////////////////////////////////////////////////////////////
	//	MUSICAL TIMING
	//
	//	numbers are passed through
	//	musical timing will be evaluated based on the passed in bpm
	//	notation values are 4n = quarter, 8t = 8th note tripplet
	//	'+' prefixed values will be "now" relative
	///////////////////////////////////////////////////////////////////////////

	//@param {number|string} timing
	//@param {number=} bpm
	//@returns {number} the time (clock relative)
	Tone.prototype.parseTime = function(time, bpm){
		if (typeof time === "number"){
			return time;
		} else if (typeof time === "string"){
			var plusTime = 0;
			if(time.charAt(0) === "+") {
				plusTime = this.now();
				time = time.slice(1);				
			} 
			//test if it's a beat format
			if (this.isNotation(time)){
				return this.notationTime(time, bpm) + plusTime;
			} else {
				return parseFloat(time) + plusTime;
			}
		}
	}

	Tone.prototype.isNotation = (function(){
		var notationFormat = new RegExp(/[0-9]+[mnt]$/);
		return function(note){
			return notationFormat.test(note);
		}
	})();

	//@param {string} notation
	//@param {number=} bpm
	//@param {number} timeSignature (default 4)
	//@returns {number} time duration of notation
	Tone.prototype.notationTime = function(notation, bpm, timeSignature){
		bpm = this.defaultArg(bpm, 120);
		var beatTime = (60 / bpm);
		return beatTime * this.notationToBeat(notation, timeSignature);
	}

	//@param {string} notation
	//@param {number} timeSignature (default 4)
	// 1m = 1 measure in 4/4 = returns 4
	// 4n always returns 1
	//@returns {number} the subdivison of a beat
	Tone.prototype.notationToBeat = function(notation, timeSignature){
		timeSignature = this.defaultArg(timeSignature, 4);
		var subdivision = parseInt(notation, 10);
		if (subdivision === 0){
			return 0;
		}
		var lastLetter = notation.slice(-1);
		if (lastLetter === "t"){
			return (4 / subdivision) * 2/3
		} else if (lastLetter === 'n'){
			return 4 / subdivision
		} else if (lastLetter === 'm'){
			return subdivision * timeSignature;
		} else {
			return 0;
		}
	}

	///////////////////////////////////////////////////////////////////////////
	//	STATIC METHODS
	///////////////////////////////////////////////////////////////////////////
	
	//based on closure library 'inherit' function
	Tone.extend = function(child, parent){
		if (isUndef(parent)){
			parent = Tone;
		}
		/** @constructor */
		function tempConstructor() {};
		tempConstructor.prototype = parent.prototype;
		child.prototype = new tempConstructor();
		/** @override */
		child.prototype.constructor = child;
	}

	Tone.context = audioContext;

	return Tone;
}));

///////////////////////////////////////////////////////////////////////////////
//
//  SIGNAL
//
//	audio-rate value
//	useful for controlling AudioParams
///////////////////////////////////////////////////////////////////////////////

define('signal/Signal',["core/Tone"], function(Tone){
	
	//@param {number=} value
	Tone.Signal = function(value){
		Tone.call(this);

		//components
		this.signal = this.context.createWaveShaper();
		this.scalar = this.context.createGain();
		//generator to drive values
		this.generator = this.context.createOscillator();

		//connections
		this.chain(this.generator, this.signal, this.scalar, this.output);
		//pass values through
		this.input.connect(this.output);

		//setup
		this.generator.start(0);
		this._signalCurve();
		this.setValue(this.defaultArg(value, 0));

	}

	Tone.extend(Tone.Signal);

	//generates a constant output of 1
	Tone.Signal.prototype._signalCurve = function(){
		var len = 8;
		var curve = new Float32Array(len);
		for (var i = 0; i < len; i++){
			//all inputs produce the output value
			curve[i] = 1;
		}
		//console.log(curve);
		this.signal.curve = curve;
	}

	Tone.Signal.prototype.getValue = function(val){
		return this.scalar.gain.value;
	}

	Tone.Signal.prototype.setValue = function(val){
		this.scalar.gain.value = val;
	}

	//all of the automation curves are available
	Tone.Signal.prototype.setValueAtTime = function(value, time){
		this.scalar.gain.setValueAtTime(value, time);
	}

	Tone.Signal.prototype.linearRampToValueAtTime = function(value, endTime){
		this.scalar.gain.linearRampToValueAtTime(value, endTime);
	}

	Tone.Signal.prototype.exponentialRampToValueAtTime = function(value, endTime){
		this.scalar.gain.exponentialRampToValueAtTime(value, endTime);
	}

	Tone.Signal.prototype.setTargetAtTime = function(target, startTime, timeConstant){
		this.scalar.gain.setTargetAtTime(target, startTime, timeConstant);
	}

	Tone.Signal.prototype.setValueCurveAtTime = function(values, startTime, duration){
		this.scalar.gain.setValueCurveAtTime(values, startTime, duration);
	}

	Tone.Signal.prototype.cancelScheduledValues = function(startTime){
		this.scalar.gain.cancelScheduledValues(startTime);
	}

	return Tone.Signal;
});
///////////////////////////////////////////////////////////////////////////////
//
//  SCALE
//
//	scales the input in normal range (-1 to 1) to the output between min and max
///////////////////////////////////////////////////////////////////////////////

define('signal/Scale',["core/Tone"], function(Tone){

	//@param {number} min
	//@param {number} max
	//@param {string} scaling (lin|exp|log|equalPower)
	Tone.Scale = function(min, max, scaling){
		Tone.call(this);

		//vals
		this.min = min;
		this.max = max;
		this.scaling = this.defaultArg(scaling, "lin");
		this.scalingFunction = this._selectScalingFunction(this.scaling);

		//components
		this.scaler = this.context.createWaveShaper();

		//connections
		this.chain(this.input, this.scaler, this.output);

		//setup
		this._scaleCurve();
	}

	//extend StereoSplit
	Tone.extend(Tone.Scale);

	//generates the values for the waveshaper
	Tone.Scale.prototype._scaleCurve = function(){
		var len = this.waveShaperResolution;
		var curve = new Float32Array(len);
		var min = this.min;
		var max = this.max;
		for (var i = 0; i < len; i++){
			//values between 0 and 1
			var terp = this.scalingFunction(i / (len - 1));
			curve[i] = terp * (max - min) + min;
		}
		this.scaler.curve = curve;
	}

	//
	Tone.Scale.prototype._selectScalingFunction = function(scaling){
		switch(scaling){
			case "lin" : return function(x) {return x};
			case "exp" : return this.expScale;
			case "log" : return this.logScale;
			case "equalPower" : return this.equalPowerScale;
		}
	}

	Tone.Scale.prototype.setMax = function(max){
		this.max = max;
		this._scaleCurve();
	}

	Tone.Scale.prototype.setMin = function(min){
		this.min = min;
		this._scaleCurve();
	}

	return Tone.Scale;
});

///////////////////////////////////////////////////////////////////////////////
//
//  DRY/WET KNOB
//
// 	equal power fading
//	control values:
// 	   -1 = 100% dry
//		1 = 100% wet
///////////////////////////////////////////////////////////////////////////////

define('component/DryWet',["core/Tone", "signal/Signal", "signal/Scale"], function(Tone){

	Tone.DryWet = function(initialDry){
		Tone.call(this);

		//components
		this.dry = this.context.createGain();
		this.wet = this.context.createGain();
		//control signal
		this.control = new Tone.Signal();
		this.invert = new Tone.Scale(1, -1);
		this.equalPowerD = new Tone.Scale(0, 1, "equalPower");
		this.equalPowerW = new Tone.Scale(0, 1, "equalPower");

		//connections
		this.dry.connect(this.output);
		this.wet.connect(this.output);
		//wet control
		this.chain(this.control, this.invert, this.equalPowerD, this.wet.gain);
		//dry control
		this.chain(this.control, this.equalPowerW, this.dry.gain);

		//setup
		this.dry.gain.value = 0;
		this.wet.gain.value = 0;
		this.setDry(0);
	}

	Tone.extend(Tone.DryWet);

	Tone.DryWet.prototype.setDry = function(val, rampTime){
		rampTime = this.defaultArg(rampTime, 0);
		this.control.linearRampToValueAtTime(val, rampTime);
	}

	Tone.DryWet.prototype.setWet = function(val, rampTime){
		this.setDry(-val, rampTime);
	}

	return Tone.DryWet;
});

///////////////////////////////////////////////////////////////////////////////
//
//	Envelope
//
//	ADR envelope generator attaches to an AudioParam
///////////////////////////////////////////////////////////////////////////////

define('component/Envelope',["core/Tone"], function(Tone){


	Tone.Envelope = function(attack, decay, sustain, release, audioParam, minOutput, maxOutput){
		//extend Unit
		Tone.call(this);

		//pass audio through
		this.input.connect(this.output);

		//set the parameters
		this.param = this.defaultArg(audioParam, this.input.gain);
		this.attack = this.defaultArg(attack, .01);
		this.decay = this.defaultArg(decay, .1);
		this.release = this.defaultArg(release, 1);
		this.sustain = this.defaultArg(.5);

		// this.setSustain(this.defaultArg(sustain, .1));
		this.min = this.defaultArg(minOutput, 0);
		this.max = this.defaultArg(maxOutput, 1);
		
		//set the initial value
		this.param.value = this.min;
	}

	Tone.extend(Tone.Envelope, Tone);

	//attack->decay->sustain
	Tone.Envelope.prototype.triggerAttack = function(time){
		var startVal = this.min;
		if (!time){
			startVal = this.param.value;
		}
		time = this.defaultArg(time, this.now());
		this.param.cancelScheduledValues(time);
		this.param.setValueAtTime(startVal, time);
		this.param.linearRampToValueAtTime(this.max, time + this.attack);
		var sustainVal = (this.max - this.min) * this.sustain + this.min;
		this.param.linearRampToValueAtTime(sustainVal, time + this.decay + this.attack);
	}

	//attack->decay->sustain
	Tone.Envelope.prototype.triggerAttackExp = function(time){
		var startVal = this.min;
		if (!time){
			startVal = this.param.value;
		}
		time = this.defaultArg(time, this.now());
		this.param.cancelScheduledValues(time);
		this.param.setValueAtTime(startVal, time);
		this.param.exponentialRampToValueAtTime(this.max, time + this.attack);
		var sustainVal = (this.max - this.min) * this.sustain + this.min;
		this.param.exponentialRampToValueAtTime(sustainVal, time + this.decay + this.attack);
	}

	//triggers the release of the envelope
	Tone.Envelope.prototype.triggerRelease = function(time){
		var startVal = this.param.value;
		if (time){
			startVal = (this.max - this.min) * this.sustain + this.min;
		}
		time = this.defaultArg(time, this.now());
		this.param.cancelScheduledValues(time);
		this.param.setValueAtTime(startVal, time);
		this.param.linearRampToValueAtTime(this.min, time + this.release);
	}


	//triggers the release of the envelope
	Tone.Envelope.prototype.triggerReleaseExp = function(time){
		var startVal = this.param.value;
		if (time){
			startVal = (this.max - this.min) * this.sustain + this.min;
		}
		time = this.defaultArg(time, this.now());
		this.param.cancelScheduledValues(time);
		this.param.setValueAtTime(startVal, time);
		this.param.exponentialRampToValueAtTime(this.min, time + this.release);
	}

	return Tone.Envelope;
});

///////////////////////////////////////////////////////////////////////////////
//
//  OSCILLATOR
//
//	just an oscillator, 
//	but starting and stopping is easier than the native version
///////////////////////////////////////////////////////////////////////////////

define('source/Oscillator',["core/Tone"], function(Tone){

	Tone.Oscillator = function(freq, type){
		Tone.call(this);

		this.playing = false;

		//components
		this.oscillator = this.context.createOscillator();
		this.oscillator.frequency.value = this.defaultArg(freq, 440);
		this.oscillator.type = this.defaultArg(type, "sine");
		//connections
		this.chain(this.oscillator, this.output);
	}

	Tone.extend(Tone.Oscillator);

	//@param {number=} time
	Tone.Oscillator.prototype.start = function(time){
		if (!this.playing){
			var freq = this.oscillator.frequency.value;
			var type = this.oscillator.type;
			var detune = this.oscillator.frequency.value;
			this.oscillator = this.context.createOscillator();
			this.oscillator.frequency.value = freq;
			this.oscillator.type = type;
			this.oscillator.detune.value = detune;
			this.oscillator.connect(this.output);
			this.playing = true;
			time = this.defaultArg(time, this.now());
			this.oscillator.start(time);
		}
	}

	//@param {number=} time
	Tone.Oscillator.prototype.stop = function(time){
		if (this.playing){
			time = this.defaultArg(time, this.now());
			this.oscillator.stop(time);
			this.playing = false;
		}
	}

	//@param {number} val
	//@param {number=} rampTime
	Tone.Oscillator.prototype.setFrequency = function(val, rampTime){
		rampTime = this.defaultArg(rampTime, 0);
		this.oscillator.linearRampToValueAtTime(val, rampTime);
	}

	//@param {string} type
	Tone.Oscillator.prototype.setType = function(type){
		this.oscillator.type = type;
	}

	return Tone.Oscillator;
});
///////////////////////////////////////////////////////////////////////////////
//
//  LFO
//
///////////////////////////////////////////////////////////////////////////////

define('component/LFO',["core/Tone", "source/Oscillator", "signal/Scale"], function(Tone){

	Tone.LFO = function(rate, outputMin, outputMax){
		//extends Unit
		Tone.call(this);

		//defaults
		rate = this.defaultArg(rate, 1);
		min = this.defaultArg(outputMin, -1);
		max = this.defaultArg(outputMax, 1);

		//the components
		this.oscillator = new Tone.Oscillator(rate, "sine");
		this.scaler = new Tone.Scale(min, max);

		//connect it up
		this.chain(this.oscillator, this.scaler, this.output);
	}

	Tone.extend(Tone.LFO, Tone);


	//start the lfo
	Tone.LFO.prototype.start = function(time){
		this.oscillator.start(time);
	}

	//stop
	Tone.LFO.prototype.stop = function(time){
		this.oscillator.stop(time);
	}


	//set the params
	Tone.LFO.prototype.setRate = function(rate){
		this.oscillator.setFrequency(rate);
	}

	//set the params
	Tone.LFO.prototype.setMin = function(min){
		this.scaler.setMin(min);
	}

	//set the params
	Tone.LFO.prototype.setMax = function(max){
		this.scaler.setMax(max);
	}

	//set the waveform of the LFO
	//@param {string | number} type ('sine', 'square', 'sawtooth', 'triangle', 'custom');
	Tone.LFO.prototype.setType = function(type){
		this.oscillator.setType(type);
	}

	return Tone.LFO;
});
///////////////////////////////////////////////////////////////////////////////
//
//	MASTER OUTPUT
//
//	a single master output
//	adds a toMaster method on AudioNodes and components
///////////////////////////////////////////////////////////////////////////////


define('core/Master',["core/Tone"], function(Tone){

	var Master = function(){
		//extend audio unit
		Tone.call(this);

		//put a hard limiter on the output so we don't blow any eardrums
		this.limiter = this.context.createDynamicsCompressor();
		this.limiter.threshold.value = 0;
		this.limiter.ratio.value = 20;
		this.chain(this.input, this.limiter, this.output, this.context.destination);
	}

	Tone.extend(Master);

	//a single master output
	Tone.Master = new Master();

	///////////////////////////////////////////////////////////////////////////
	//	Add toMaster methods
	///////////////////////////////////////////////////////////////////////////

	//@param {AudioNode|Tone=} unit
	Tone.prototype.toMaster = function(){
		this.connect(Tone.Master);
	}

	AudioNode.prototype.toMaster = function(){
		this.connect(Tone.Master);
	}

	return Tone.Master;
});
///////////////////////////////////////////////////////////////////////////////
//
//  METER
//
//	get the rms of the input signal with some averaging
//
//	inspired by https://github.com/cwilso/volume-meter/blob/master/volume-meter.js
//	The MIT License (MIT) Copyright (c) 2014 Chris Wilson
///////////////////////////////////////////////////////////////////////////////

define('component/Meter',["core/Tone", "core/Master"], function(Tone){

	//@param {number=} channels
	Tone.Meter = function(channels){
		//extends Unit
		Tone.call(this);

		this.channels = this.defaultArg(channels, 1);
		this.volume = new Array(this.channels);
		this.values = new Array(this.channels);
		//zero out the volume array
		for (var i = 0; i < this.channels; i++){
			this.volume[i] = 0;
			this.values[i] = 0;
		}
		this.clipTime = 0;
		
		//components
		this.jsNode = this.context.createScriptProcessor(this.bufferSize, this.channels, this.channels);
		this.jsNode.onaudioprocess = this.onprocess.bind(this);

		//signal just passes
		this.input.connect(this.output);
		this.input.connect(this.jsNode);
		//so it doesn't get garbage collected
		this.jsNode.toMaster();
	}

	Tone.extend(Tone.Meter, Tone);


	//@param {number=} channel
	//@returns {number}
	Tone.Meter.prototype.getLevel = function(channel){
		channel = this.defaultArg(channel, 0);
		var vol = this.volume[channel];
		if (vol < .00001){
			return 0;
		} else {
			return vol;
		}
	}

	//@param {number=} channel
	//@returns {number}
	Tone.Meter.prototype.getValue = function(channel){
		channel = this.defaultArg(channel, 0);
		return this.values[channel];
	}

	//@param {number=} channel
	//@returns {number} the channel volume in decibels
	Tone.Meter.prototype.getDb = function(channel){
		return this.gainToDb(this.getLevel(channel));
	}

	// @returns {boolean} if the audio has clipped in the last 500ms
	Tone.Meter.prototype.isClipped = function(){
		return Date.now() - this.clipTime < 500;
	}

	//get the max value
	Tone.Meter.prototype.onprocess = function(event){
		var bufferSize = this.jsNode.bufferSize;
		for (var channel = 0; channel < this.channels; channel++){
			var input = event.inputBuffer.getChannelData(channel);
			var sum = 0;
			var total = 0;
			var x;
			var clipped = false;
			for (var i = 0; i < bufferSize; i++){
				x = input[i];
				if (!clipped && x > .95){
					clipped = true;
					this.clipTime = Date.now();
				}
				total += x;
		    	sum += x * x;
			}
			var average = total / bufferSize;
			var rms = Math.sqrt(sum / bufferSize);
			this.volume[channel] = Math.max(rms, this.volume[channel] * .8);
			this.values[channel] = average;
		}
	}

	return Tone.Meter;
});
///////////////////////////////////////////////////////////////////////////////
//
//	MONO
//
//	Merge a left and a right into a single left/right channel
///////////////////////////////////////////////////////////////////////////////

define('signal/Merge',["core/Tone"], function(Tone){

	Tone.Merge = function(){
		Tone.call(this);

		//components
		this.left = this.context.createGain();
		this.right = this.context.createGain();
		this.merger = this.context.createChannelMerger(2);

		//connections
		this.left.connect(this.merger, 0, 0);
		this.right.connect(this.merger, 0, 1);
		this.merger.connect(this.output);
	}

	Tone.extend(Tone.Merge);

	return Tone.Merge;
})
;
///////////////////////////////////////////////////////////////////////////////
//
//  PANNER
//
//	Equal Power Gain L/R Panner. Not 3D
//	-1 = 100% Left
//	1 = 100% Right
///////////////////////////////////////////////////////////////////////////////

define('component/Panner',["core/Tone", "signal/Merge", "signal/Signal", "signal/Scale"], 
function(Tone){

	Tone.Panner = function(){
		Tone.call(this);

		//components
		//incoming signal is sent to left and right
		this.left = this.context.createGain();
		this.right = this.context.createGain();
		this.control = new Tone.Signal();
		this.merge = new Tone.Merge();
		this.invert = new Tone.Scale(1, -1);
		this.equalPowerL = new Tone.Scale(0, 1, "equalPower");
		this.equalPowerR = new Tone.Scale(0, 1, "equalPower");

		//connections
		this.chain(this.input, this.left, this.merge.left);
		this.chain(this.input, this.right, this.merge.right);
		this.merge.connect(this.output);
		//left channel control
		this.chain(this.control, this.invert, this.equalPowerL, this.left.gain);
		//right channel control
		this.chain(this.control, this.equalPowerR, this.right.gain);


		//setup
		this.left.gain.value = 0;
		this.right.gain.value = 0;
		this.setPan(0);
	}

	Tone.extend(Tone.Panner);

	Tone.Panner.prototype.setPan = function(val, rampTime){
		rampTime = this.defaultArg(rampTime, 0);
		this.control.linearRampToValueAtTime(val, rampTime);
	}

	return Tone.Panner;
});;
///////////////////////////////////////////////////////////////////////////////
//
//	TRANSPORT
//
//	oscillator-based transport allows for simple musical timing 
//	supports tempo curves and time changes
//	setInterval (repeated events)
//	setTimeout (single timeline event)
//
///////////////////////////////////////////////////////////////////////////////

define('core/Transport',["core/Tone"], function(Tone){

	//@param {number=} bpm
	//@param {number=} timeSignature (over 4);
	Tone.Transport = function(bpm, timeSignature){

		//components
		this.oscillator = null;
		this.jsNode = this.context.createScriptProcessor(this.bufferSize, 1, 1);
		this.jsNode.onaudioprocess = this._processBuffer.bind(this);
		this.timeSignature = this.defaultArg(timeSignature, 4);

		//privates
		this._tatum = 12; //subdivisions of the quarter note
		this._ticks = 0; //the number of tatums
		this._upTick = false; // if the wave is on the rise or fall
		this._bpm = bpm;

		//@type {Array.<Tone.Transport.Interval>}
		this._intervals = [];
		//@type {Array.<Tone.Transport.Timeout>}
		this._timeouts = [];
		this._timeoutProgress = 0;

		this.loopStart = 0;
		this.loopEnd = this._tatum * 4;
		this.loop = false;

		this.state = Tone.Transport.state.stopped;

		//so it doesn't get garbage collected
		this.jsNode.connect(Tone.Master);
	}

	Tone.extend(Tone.Transport, Tone);

	///////////////////////////////////////////////////////////////////////////////
	//	INTERNAL METHODS
	///////////////////////////////////////////////////////////////////////////////

	Tone.Transport.prototype._processBuffer = function(event){
		var now = this.defaultArg(event.playbackTime, this.now());
		var bufferSize = this.jsNode.bufferSize;
		var endTime = now + this.samplesToSeconds(bufferSize);
		var incomingBuffer = event.inputBuffer.getChannelData(0);
		var upTick = this._upTick;
		for (var i = 0; i < bufferSize; i++){
			var sample = incomingBuffer[i];
			if (sample > 0 && !upTick){
				upTick = true;	
				this._processTick(now + this.samplesToSeconds(i));
			} else if (sample < 0 && upTick){
				upTick = false;
			}
		}
		this._upTick = upTick;
	}

	//@param {number} tickTime
	Tone.Transport.prototype._processTick = function(tickTime){
		//do the looping stuff
		var ticks = this._ticks;
		//do the intervals
		this._processIntervals(ticks, tickTime);
		this._processTimeouts(ticks, tickTime);
		this._ticks = ticks + 1;
		if (this.loop){
			if (this._ticks === this.loopEnd){
				this._setTicks(this.loopStart);
			}
		}
	}

	//jump to a specific tick in the timeline
	Tone.Transport.prototype._setTicks = function(ticks){
		this._ticks = ticks;
		for (var i = 0; i < this._timeouts.length; i++){
			var timeout = this._timeouts[i];
			if (timeout.callbackTick() >= ticks){
				this._timeoutProgress = i;
				break;
			}
		}
	}

	///////////////////////////////////////////////////////////////////////////////
	//	TIMING
	///////////////////////////////////////////////////////////////////////////////


	//processes and invokes the intervals
	Tone.Transport.prototype._processIntervals = function(ticks, time){
		for (var i = 0, len = this._intervals.length; i<len; i++){
			var interval = this._intervals[i];
			if (interval.testCallback(ticks)){
				interval.doCallback(time);
			}
		}
	}

	//processes and invokes the timeouts
	Tone.Transport.prototype._processTimeouts = function(ticks, time){
		for (var i = this._timeoutProgress, len = this._timeouts.length; i<len; i++){
			var timeout = this._timeouts[i];
			var callbackTick = timeout.callbackTick();
			if (callbackTick === ticks){
				timeout.doCallback(time);
				//increment the timeoutprogress
				this._timeoutProgress = i + 1;
			} else if (callbackTick > ticks){
				break;
			} 
		}
	}


	//@param {function(number)} callback
	//@param {string} interval (01:02:0.2)
	//@param {Object=} ctx the 'this' object which the 
	//@returns {Tone.Transport.Event} the event
	Tone.Transport.prototype.setInterval = function(callback, interval, ctx){
		var ticks = this.progressToTicks(interval);
		ctx = this.defaultArg(ctx, window);
		var timeout = new Tone.Transport.Timeout(callback, ctx, ticks, this._ticks);
		this._intervals.push(timeout);
		return timeout;
	}

	//@param {number} intervalId
	//@param {}
	//@returns {boolean} true if the interval was removed
	Tone.Transport.prototype.clearInterval = function(rmInterval){
		for (var i = 0; i < this._intervals.length; i++){
			var interval = this._intervals[i];
			if (interval === rmInterval){
				this._intervals.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	//@param {function(number)} callback
	//@param {string} timeout colon seperated (bars:beats)
	//@param {Object=} ctx the 'this' object which the 
	//@returns {number} the timeoutID
	Tone.Transport.prototype.setTimeout = function(callback, timeout, ctx){
		var ticks = this.progressToTicks(timeout);
		ctx = this.defaultArg(ctx, window);
		var timeout = new Tone.Transport.Timeout(callback, ctx, ticks, this._ticks);
		//put it in the right spot
		this._addTimeout(timeout);
		return timeout;
	}

	//add an event in the correct position
	Tone.Transport.prototype._addTimeout = function(event){
		for (var i = this._timeoutProgress, len = this._timeouts.length; i<len; i++){
			var testEvnt = this._timeouts[i];
			if (testEvnt.callbackTick() > event.callbackTick()){
				this._timeouts.splice(i, 0, event);
				return;
			}
		}
		//otherwise push it on the end
		this._timeouts.push(event);
	}

	//@param {string} timeoutID returned by setTimeout
	Tone.Transport.prototype.clearTimeout = function(timeoutID){
		for (var i = 0; i < this._timeouts.length; i++){
			var timeout = this._timeouts[i];
			if (timeout.id === timeoutID){
				this._timeouts.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	//@param {string} measures (measures:beats:sixteenths)
	//@returns {number} the the conversion to ticks
	Tone.Transport.prototype.progressToTicks = function(progress){
		var measures = 0;
		var quarters = 0;
		var sixteenths = 0;
		if (typeof progress === "number"){
			quarters = progress;
		} else if (typeof progress === "string"){
			if (this.isNotation(progress)){
				quarters = this.notationToBeat(progress);
			} else {
				var split = progress.split(":");
				if (split.length === 2){
					measures = parseFloat(split[0]);
					quarters = parseFloat(split[1]);
				} else if (split.length === 1){
					quarters = parseFloat(split[0]);
				} else if (split.length === 3){
					measures = parseFloat(split[0]);
					quarters = parseFloat(split[1]);
					sixteenths = parseFloat(split[2]);
				}
			}
		}
		var ticks = (measures * this.timeSignature + quarters + sixteenths / 4) * this._tatum;
		//quantize to tick value
		return Math.round(ticks);
	}

	//@param {number} ticks
	//@returns {string} progress (measures:beats:sixteenths)
	Tone.Transport.prototype.ticksToProgress = function(ticks){
		var quarters = ticks / this._tatum;
		var measures = parseInt(quarters / this.timeSignature, 10);
		var sixteenths = parseInt((quarters % 1) * 4, 10);
		quarters = parseInt(quarters, 10) % this.timeSignature;
		var progress = [measures, quarters, sixteenths];
		return progress.join(":");
	}

	//@returns {string} progress (measures:beats:sixteenths)
	Tone.Transport.prototype.getProgress = function(){
		return this.ticksToProgress(this._ticks);
	}

	//jump to a specific measure
	//@param {string} progress
	Tone.Transport.prototype.setProgress = function(progress){
		var ticks = this.progressToTicks(progress);
		this._setTicks(ticks);
	}

	///////////////////////////////////////////////////////////////////////////////
	//	START/STOP/PAUSE
	///////////////////////////////////////////////////////////////////////////////

	Tone.Transport.prototype.start = function(time){
		if (this.state !== Tone.Transport.state.playing){
			this.state = Tone.Transport.state.playing;
			this.upTick = false;
			time = this.defaultArg(time, this.now());
			this.oscillator	= this.context.createOscillator();
			this.oscillator.type = "square";
			this.setTempo(this._bpm);
			this.oscillator.connect(this.jsNode);
			this.oscillator.start(time);
		}
	}

	Tone.Transport.prototype.stop = function(time){
		if (this.state !== Tone.Transport.state.stopped){
			this.state = Tone.Transport.state.stopped;
			time = this.defaultArg(time, this.now());
			this.oscillator.stop(time);
			this._setTicks(0);
		}
	}

	Tone.Transport.prototype.pause = function(time){
		this.state = Tone.Transport.state.paused;
		time = this.defaultArg(time, this.now());
		this.oscillator.stop(time);
	}

	///////////////////////////////////////////////////////////////////////////////
	//	TEMPO CONTROLS
	///////////////////////////////////////////////////////////////////////////////

	//@param {number} bpm
	//@param {number=} rampTime Optionally speed the tempo up over time
	Tone.Transport.prototype.setTempo = function(bpm, rampTime){
		this._bpm = bpm;
		if (this.state === Tone.Transport.state.playing){
			//convert the bpm to frequency
			var freqVal = 4 / this.notationTime(this._tatum.toString() + "n", this._bpm);
			if (!rampTime){
				this.oscillator.frequency.value = freqVal;
			} else {
				this.exponentialRampToValue(this.oscillator.frequency, freqVal, rampTime);
			}
		}
	}

	//@returns {number} the current bpm
	Tone.Transport.prototype.getTempo = function(){
		//if the oscillator isn't running, return _bpm
		if (this.state === Tone.Transport.state.playing){
			//convert the current frequency of the oscillator to bpm
			var freq = this.oscillator.frequency.value;
		} else {
			return this._bpm;
		}
	}

	//@param {Array.<number>} noteValues
	//@param {string} subdivision
	//@returns {Array.<number>} the 
	Tone.Transport.prototype.quantize = function(noteValues, subdivision, percentage){

	}

	//@enum
	Tone.Transport.state = {
		playing : "playing",
		paused : "paused",
		stopped : "stopped"
	}

	///////////////////////////////////////////////////////////////////////////////
	//
	//	TRANSPORT EVENT
	//
	///////////////////////////////////////////////////////////////////////////////

	//@constructor
	//@param {function(number)} callback
	//@param {object} context
	//@param {number} interval (in ticks)
	//@param {number} startTicks
	//@param {boolean} repeat
	Tone.Transport.Timeout = function(callback, context, interval, startTicks){
		this.interval = interval;
		this.start = startTicks;
		this.callback = callback;
		this.context = context;
	}

	Tone.Transport.Timeout.prototype.doCallback = function(playbackTime){
		this.callback.call(this.context, playbackTime); 
	}

	Tone.Transport.Timeout.prototype.callbackTick = function(){
		return this.start + this.interval;
	}

	Tone.Transport.Timeout.prototype.testCallback = function(tick){
		return (tick - this.start) % this.interval === 0;
	}

	return Tone.Transport;
});

///////////////////////////////////////////////////////////////////////////////
//
//  EFFECTS UNIT
//
// 	connect the effect to the effectSend and to the effectReturn
//	setDry(-1) = 100% Wet
//	setDry(1) = 100% Dry
///////////////////////////////////////////////////////////////////////////////

define('effects/Effect',["core/Tone", "component/DryWet"], function(Tone){

	Tone.Effect = function(){
		//extends Unit
		Tone.call(this);

		//components
		this.dryWet = new Tone.DryWet();
		this.effectSend = this.context.createGain();
		this.effectReturn = this.context.createGain();

		//connections
		this.input.connect(this.dryWet.dry);
		this.input.connect(this.effectSend);
		this.effectReturn.connect(this.dryWet.wet);
		this.dryWet.connect(this.output);
		
		//setup
		this.setDry(0);
	}

	Tone.extend(Tone.Effect, Tone);

	//adjust the dry/wet balance
	//dryness -1 to 1
	// 1 = 100% dry
	//-1 = 100% wet
	//@param {number} dryness
	//@param {number=} rampTime
	Tone.Effect.prototype.setDry = function(dryness, rampTime){
		this.dryWet.setDry(dryness, rampTime)
	}

	//@param {number} dryness
	//@param {number=} rampTime
	Tone.Effect.prototype.setWet = function(wetVal, rampTime){
		this.setDry(-wetVal, rampTime);
	}

	Tone.Effect.prototype.bypass = function(){
		this.setDry(1, 0);
	}

	Tone.Effect.prototype.connectEffect = function(effect){
		this.chain(this.effectSend, effect, this.effectReturn);
	}

	return Tone.Effect;
});
///////////////////////////////////////////////////////////////////////////////
//
//  AUTO PANNER
//
//	not a 3d panner. just LR
//	
///////////////////////////////////////////////////////////////////////////////

define('effects/AutoPanner',["core/Tone", "source/Oscillator", "component/Panner", "effects/Effect"], function(Tone){


	Tone.AutoPanner = function(rate, amount){
		Tone.Effect.call(this);

		//defaults
		amount = this.defaultArg(amount, 1);
		rate = this.defaultArg(rate, 1);

		//components
		this.osc = new Tone.Oscillator(rate);
		this.amount = this.context.createGain();
		this.panner = new Tone.Panner();

		//connections
		this.connectEffect(this.panner);
		this.chain(this.osc, this.amount, this.panner.control);
	}

	//extend Effect
	Tone.extend(Tone.AutoPanner, Tone.Effect);

	Tone.AutoPanner.prototype.start = function(time){
		this.osc.start(time);
	}

	Tone.AutoPanner.prototype.stop = function(time){
		this.osc.stop(time);
	}

	Tone.AutoPanner.prototype.setType = function(type){
		this.osc.setType(type);
	}

	Tone.AutoPanner.prototype.setRate = function(rate){
		this.osc.setRate(rate);
	}

	Tone.AutoPanner.prototype.setAmount = function(amount){
		this.amount.gain.value = amount;
	}

	return Tone.AutoPanner;
});

///////////////////////////////////////////////////////////////////////////////
//
//  FEEDBACK EFFECTS
//
// 	an effect with feedback
///////////////////////////////////////////////////////////////////////////////

define('effects/FeedbackEffect',["core/Tone", "effects/Effect"], function(Tone){

	Tone.FeedbackEffect = function(){
		//extends Unit
		Tone.Effect.call(this);

		this.feedback = this.context.createGain();
		//feedback loop
		this.chain(this.effectReturn, this.feedback, this.effectSend);

		//some initial values
		this.setDry(.5);
	}

	Tone.extend(Tone.FeedbackEffect, Tone.Effect);

	Tone.FeedbackEffect.prototype.setFeedback = function(fback){
		this.rampToValue(this.feedback.gain, fback);
	}

	return Tone.FeedbackEffect;
});

///////////////////////////////////////////////////////////////////////////////
//
//	FEEDBACK DELAY
//
///////////////////////////////////////////////////////////////////////////////

define('effects/FeedbackDelay',["core/Tone", "effects/FeedbackEffect"], function(Tone){

	//@param {number} delayTime
	Tone.FeedbackDelay = function(delayTime){
		Tone.FeedbackEffect.call(this);

		this.delay = this.context.createDelay(4);
		this.delay.delayTime.value = this.defaultArg(delayTime, .25);

		//connect it up
		this.connectEffect(this.delay);
	}

	Tone.extend(Tone.FeedbackDelay, Tone.FeedbackEffect);

	Tone.FeedbackDelay.prototype.setDelayTime = function(delayTime){
		this.rampToValue(this.delay.delayTime, delayTime);
	}

	return Tone.FeedbackDelay;
});
///////////////////////////////////////////////////////////////////////////////
//
//	PING PONG DELAY
//
///////////////////////////////////////////////////////////////////////////////

define('effects/PingPongDelay',["core/Tone", "effects/FeedbackDelay"], function(Tone){


	//@param {number=} delayTime
	Tone.PingPongDelay = function(delayTime){
		Tone.StereoSplit.call(this);

		//components
		this.leftDelay = new Tone.FeedbackDelay(delayTime);
		this.rightDelay = new Tone.FeedbackDelay(delayTime);


		//connect it up
		this.connectLeft(this.leftDelay);
		this.connectRight(this.rightDelay);

		//disconnect the feedback lines to connect them to the other delay
		// http://jvzaudio.files.wordpress.com/2011/04/delay-f43.gif
		this.leftDelay.feedback.disconnect();
		this.rightDelay.feedback.disconnect();
		this.leftDelay.feedback.connect(this.rightDelay.effectSend);
		this.rightDelay.feedback.connect(this.leftDelay.effectSend);

		//initial vals;
		this.setDelayTime(delayTime);
	}

	Tone.extend(Tone.PingPongDelay, Tone.StereoSplit);

	//@param {number} delayTime
	Tone.PingPongDelay.prototype.setDelayTime = function(delayTime){
		this.leftDelay.setDelayTime(delayTime);
		this.rightDelay.setDelayTime(delayTime * 2);
	}

	//@param {number} feedback (0 - 1)
	Tone.PingPongDelay.prototype.setFeedback = function(feedback){
		this.leftDelay.setFeedback(feedback);
		this.rightDelay.setFeedback(feedback);
	}

	//@param {number} wet (0 - 1)
	Tone.PingPongDelay.prototype.setWet = function(wet){
		this.leftDelay.setWet(wet);
		this.rightDelay.setWet(wet);
	}

	//@param {number} dry (0 - 1)
	Tone.PingPongDelay.prototype.setDry = function(dry){
		this.leftDelay.setDry(dry);
		this.rightDelay.setDry(dry);
	}

	return Tone.PingPongDelay;
});

define('instrument/MonoSynth',["core/Tone", "component/Envelope", "source/Oscillator"], function(Tone){


	Tone.MonoSynth = function(){
		//one oscillator
		this.oscillator = this.context.createOscillator();
		this.glideTime = .01;
		this.filterEnvelope = new Tone.Envelope();
	}

	return Tone.MonoSynth;
});
///////////////////////////////////////////////////////////////////////////////
//
//  AUDIO PLAYER
//
///////////////////////////////////////////////////////////////////////////////

define('source/Player',["core/Tone"], function(Tone){

	Tone.Player = function(url){
		//extend Unit
		Tone.call(this);

		//player vars
		this.url = url;
		this.source = null;
		this.buffer = null;

		this.onended = function(){};
	}

	Tone.extend(Tone.Player, Tone);

	//makes an xhr for the buffer at the url
	//invokes the callback at the end
	//@param {function(Tone.Player)} callback
	Tone.Player.prototype.load = function(callback){
		if (!this.buffer){
			var request = new XMLHttpRequest();
			request.open('GET', this.url, true);
			request.responseType = 'arraybuffer';
			// decode asynchronously
			var self = this;
			request.onload = function() {
				self.context.decodeAudioData(request.response, function(buff) {
					self.buffer = buff;
					if (callback){
						callback(self);
					}
				});
			}
			//send the request
			request.send();
		} else {
			if (callback){
				callback(this);
			}
		}
	}

	//play the buffer from start to finish at a time
	Tone.Player.prototype.start = function(startTime, offset, duration, volume){
		if (this.buffer){
			//default args
			startTime = this.defaultArg(startTime, this.now());
			offset = this.defaultArg(offset, 0);
			duration = this.defaultArg(duration, this.buffer.duration - offset);
			volume = this.defaultArg(volume, 1);
			//make the source
			this.source = this.context.createBufferSource();
			this.source.buffer = this.buffer;
			this.source.loop = false;
			this.source.start(startTime, offset, duration);
			this.source.onended = this._onended.bind(this);
			var gain = this.context.createGain();
			gain.gain.value = volume;
			this.chain(this.source, gain, this.output);
		}
	}

	//play the buffer from start to finish at a time
	Tone.Player.prototype.loop = function(startTime, loopStart, loopEnd, offset, duration, volume){
		if (this.buffer){
			//default args
			startTime = this.defaultArg(startTime, this.now());
			loopStart = this.defaultArg(loopStart, 0);
			loopEnd = this.defaultArg(loopEnd, this.buffer.duration);
			offset = this.defaultArg(offset, loopStart);
			duration = this.defaultArg(duration, this.buffer.duration - offset);
			//make/play the source
			this.start(startTime, offset, duration, volume);
			this.source.loop = true;
			this.source.loopStart = loopStart;
			this.source.loopEnd = loopEnd;
		}
	}

	//stop playback
	Tone.Player.prototype.stop = function(stopTime){
		if (this.buffer && this.source){
			stopTime = this.defaultArg(stopTime, this.now());
			this.source.stop(stopTime);
		}
	}

	//@returns {number} the buffer duration
	Tone.Player.prototype.getDuration = function(){
		if (this.buffer){
			this.buffer.duration;
		} else {
			return 0;
		}
	}

	//@param {function(Event)} callback
	Tone.Player.prototype._onended = function(e){
		this.onended(e);
	}

	return Tone.Player;
});

///////////////////////////////////////////////////////////////////////////////
//
//  SAMPLE PLAYER
//
//	dependencies : Tone, Player, Envelope, LFO
///////////////////////////////////////////////////////////////////////////////

define('instrument/Sampler',["core/Tone", "component/Envelope", "source/Player"], function(Tone){

	Tone.Sampler = function(url){
		Tone.call(this);

		//components
		this.player = new Tone.Player(url);
		this.envelope = new Tone.Envelope(.1, .01, .1, 1);
		this.filter = this.context.createBiquadFilter();
		this.filter.type = "lowpass";
		this.filter.Q.value = 12;
		this.filterEnvelope = new Tone.Envelope(.4, 0, 1, .6, this.filter.frequency, 0, 1200);

		//connect it up
		this.chain(this.player, this.envelope, this.filter, this.output);
	}

	Tone.extend(Tone.Sampler, Tone);


	//@param {function()=} callback
	Tone.Sampler.prototype.load = function(callback){
		this.player.load(callback);
	}

	Tone.Sampler.prototype.triggerAttack = function(startTime){
		this.player.start(startTime);
		this.envelope.triggerAttack(startTime);
		this.filterEnvelope.triggerAttack(startTime);
	}

	Tone.Sampler.prototype.triggerRelease = function(stopTime){
		stopTime = this.defaultArg(stopTime, this.now());
		this.player.stop(stopTime + Math.max(this.envelope.release, this.filterEnvelope.release));
		this.envelope.triggerRelease(stopTime);
		this.filterEnvelope.triggerRelease(stopTime);
	}

	return Tone.Sampler;
});
///////////////////////////////////////////////////////////////////////////////
//
//  ADD
//
//	adds a constant value to the incoming signal in normal range (-1 to 1)
///////////////////////////////////////////////////////////////////////////////

define('signal/Add',["core/Tone"], function(Tone){

	Tone.Add = function(constant){
		Tone.call(this);

		this.constant = constant;

		//component
		this.adder = this.context.createWaveShaper();

		//connections
		this.chain(this.input, this.adder, this.output);

		//setup
		this._adderCurve();
	}

	Tone.extend(Tone.Add);

	//adds a constant value to the incoming signal
	Tone.Add.prototype._adderCurve = function(){
		var len = this.waveShaperResolution;
		var curve = new Float32Array(len);
		for (var i = 0; i < len; i++){
			///scale the values between -1 to 1
			var baseline = (i / (len - 1)) * 2 - 1;
			//all inputs produce the output value
			curve[i] = baseline + this.constant;
		}
		//console.log(curve);
		this.adder.curve = curve;
	}

	return Tone.Add;
});
///////////////////////////////////////////////////////////////////////////////
//
// 	BIT CRUSHER
//
// 	downsample incoming signal
// 	inspiration from https://github.com/jaz303/bitcrusher/blob/master/index.js
///////////////////////////////////////////////////////////////////////////////

define('signal/BitCrusher',["core/Tone"], function(Tone){

	//@param {number=} bits
	//@param {number=} frequency
	Tone.BitCrusher = function(bits, frequency){
		Tone.call(this);

		//the math
		this.bits = this.defaultArg(bits, 8);
		this.frequency = this.defaultArg(frequency, .5);
		this.step = 2 * Math.pow(0.5, this.bits);
		this.invStep = 1/this.step;
		this.phasor = 0;
		this.last = 0;
		
		//the node
		this.crusher = this.context.createScriptProcessor(this.bufferSize, 1, 1);
		this.crusher.onaudioprocess = this.audioprocess.bind(this);

		//connect it up
		this.chain(this.input, this.crusher, this.output);
	}

	Tone.extend(Tone.BitCrusher);

	Tone.BitCrusher.prototype.audioprocess = function(event){
		var bufferSize = this.crusher.bufferSize;
		var phasor = this.phasor;
		var freq = this.frequency;
		var invStep = this.invStep;
		var last = this.last;
		var step = this.step;
		var input = event.inputBuffer.getChannelData(0);
		var output = event.outputBuffer.getChannelData(0);
		for (var i = 0, len = output.length; i < len; i++) {
			phasor += freq;
		    if (phasor >= 1) {
		        phasor -= 1;
		        last = step * ((input[i] * invStep) | 0 + 0.5);
		    }
		    output[i] = last;
		}
		this.phasor = phasor;
		this.last = last;
	}

	Tone.BitCrusher.prototype.setBits = function(bits){
		this.bits = bits;
		this.step = 2 * Math.pow(0.5, this.bits);
		this.invStep = 1/this.step;
	}

	Tone.BitCrusher.prototype.setFrequency = function(freq){
		this.frequency = freq;
	}

	return Tone.BitCrusher;
});
///////////////////////////////////////////////////////////////////////////////
//
//  NORMALIZE
//
//	normalizes the incoming signal (between inputMin and inputMax)
//	to normal range (-1 to 1)
//	should deprecate!
///////////////////////////////////////////////////////////////////////////////

define('signal/Normalize',["core/Tone"], function(Tone){	

	Tone.Normalize = function(inputMin, inputMax){
		Tone.call(this);

		//vars
		this.inputMin = this.defaultArg(inputMin, -1);
		this.inputMax = this.defaultArg(inputMax, 1);

		//components
		this.normalize = this.context.createScriptProcessor(this.bufferSize, 1, 1);

		//connections
		this.chain(this.input, this.normalize, this.output);

		//setup
		this.normalize.onaudioprocess = this._process.bind(this);
	}

	Tone.extend(Tone.Normalize);

	Tone.Normalize.prototype._process = function(e) {
		var bufferSize = this.normalize.bufferSize;
		var input = e.inputBuffer.getChannelData(0);
		var output = e.outputBuffer.getChannelData(0);
		var min = this.inputMin;
		var max = this.inputMax;
		var divisor = (max - min) / 2;
		for (var i = 0; i < bufferSize; i++) {
			output[i] = (input[i] - min) / divisor - 1;
		}
	}

	return Tone.Normalize;
})
;
///////////////////////////////////////////////////////////////////////////////
//
//  STEREO
//
//	splits the incoming signal into left and right outputs
//	 one input two outputs
///////////////////////////////////////////////////////////////////////////////

define('signal/Split',["core/Tone"], function(Tone){

	Tone.Split = function(){
		Tone.call(this);

		//components
		this.splitter = this.context.createChannelSplitter(2);
		this.left = this.context.createGain();
		this.right = this.context.createGain();
		
		//connections
		this.input.connect(this.splitter);
		this.splitter.connect(this.left, 1, 0);
		this.splitter.connect(this.right, 0, 0);
	}

	Tone.extend(Tone.Split);

	return Tone.Split;
});
///////////////////////////////////////////////////////////////////////////////
//
//  SUBTRACT FROM
//
//	subtract the signal from the constant
//	for subtracting from the signal, use Tone.Add with a negative number
///////////////////////////////////////////////////////////////////////////////

define('signal/Subtract',["core/Tone"], function(Tone){

	Tone.Subtract = function(constant){
		Tone.call(this);

		this.constant = constant;

		//component
		this.subber = this.context.createWaveShaper();

		//connections
		this.chain(this.input, this.subber, this.output);

		//setup
		this._subCurve();
	}

	Tone.extend(Tone.Subtract);

	//subtracts the signal from the value
	Tone.Subtract.prototype._subCurve = function(){
		var len = this.waveShaperResolution;
		var curve = new Float32Array(len);
		for (var i = 0; i < len; i++){
			///scale the values between -1 to 1
			var baseline = (i / (len - 1)) * 2 - 1;
			//all inputs produce the output value
			curve[i] = this.constant - baseline;
		}
		//console.log(curve);
		this.subber.curve = curve;
	}

	return Tone.Subtract;
});
///////////////////////////////////////////////////////////////////////////////
//
//	WEB RTC MICROPHONE
//
///////////////////////////////////////////////////////////////////////////////

define('source/Microphone',["core/Tone"], function(Tone){

	//@param {number=} inputNum
	Tone.Microphone = function(inputNum){
		//extend the base class
		Tone.call(this);

		//components
		this.mediaStream = null;
		this.stream = null;
		this.constraints = {"audio" : true};
		//get that option
		var self = this;
		MediaStreamTrack.getSources(function (media_sources) {
			if (inputNum < media_sources.length){
				self.constraints.audio = {
					optional : [{ sourceId: media_sources[inputNum].id}]
				}
			}
		});		
	}

	Tone.extend(Tone.Microphone, Tone);

	//stop the WebRTC connection
	Tone.Microphone.prototype.start = function(){
		// Only get the audio stream.
		navigator.getUserMedia(this.constraints, this._onStream.bind(this), this._onStreamError.bind(this));
	}

	//stop the WebRTC connection
	Tone.Microphone.prototype.stop = function(){
		if (this.stream){
			this.stream.stop();
		}
	}

	//when the stream is setup
	Tone.Microphone.prototype._onStream = function(stream) {
		this.stream = stream;
		// Wrap a MediaStreamSourceNode around the live input stream.
		this.mediaStream =  this.context.createMediaStreamSource(stream);
		this.mediaStream.connect(this.output);
	};

	//on error
	Tone.Microphone.prototype._onStreamError = function(e) {
		console.error(e);
	};

	//polyfill
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia 
		|| navigator.mozGetUserMedia || navigator.msGetUserMedia;

	return Tone.Microphone;
});
///////////////////////////////////////////////////////////////////////////////
//
//  NOISE
//
///////////////////////////////////////////////////////////////////////////////
define('source/Noise',["core/Tone"], function(Tone){

    //@param {string} type the noise type
    Tone.Noise = function(type){
    	//extend Unit
    	Tone.call(this);

    	//components
    	this.jsNode = this.context.createScriptProcessor(this.bufferSize, 0, 1);

    	//connections
        this.jsNode.connect(this.output);

    	this.setType(this.defaultArg(type, "white"));
    }

    Tone.extend(Tone.Noise, Tone);

    //@param {string} type ('white', 'pink', 'brown')
    Tone.Noise.prototype.setType = function(type){
    	switch (type){
    		case "white" : 
    			this.jsNode.onaudioprocess = this._whiteNoise.bind(this);
    			break;
    		case "pink" : 
    			this.jsNode.onaudioprocess = this._pinkNoise.bind(this);
    			break;
    		case "brown" : 
    			this.jsNode.onaudioprocess = this._brownNoise.bind(this);
    			break;
    		default : 
    			this.jsNode.onaudioprocess = this._whiteNoise.bind(this);
    	}
    }

    //modified from http://noisehack.com/generate-noise-web-audio-api/
    Tone.Noise.prototype._pinkNoise = (function() {
        var b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        return function(e) {
            var bufferSize = this.jsNode.bufferSize;
            var output = e.outputBuffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                var white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11; // (roughly) compensate for gain
                b6 = white * 0.115926;
            }
        }
    })();

    //modified from http://noisehack.com/generate-noise-web-audio-api/
    Tone.Noise.prototype._brownNoise = (function() {
        var lastOut = 0.0;
        return function(e) {
            var bufferSize = this.jsNode.bufferSize;
            var output = e.outputBuffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                var white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // (roughly) compensate for gain
            }
        }
        return node;
    })();

    //modified from http://noisehack.com/generate-noise-web-audio-api/
    Tone.Noise.prototype._whiteNoise = function(e){
        var bufferSize = this.jsNode.bufferSize;
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
    }

    return Tone.Noise;
});
