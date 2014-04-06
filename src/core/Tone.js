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
	//	HELPERS
	///////////////////////////////////////////////////////////////////////////

	function isUndef(val){
		return typeof val === "undefined";
	}
	
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

	//@param {number} input 0-1
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
