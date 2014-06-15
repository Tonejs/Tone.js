///////////////////////////////////////////////////////////////////////////////
//
//	TONE.js
//
//	(c) Yotam Mann. 2014.
//	The MIT License (MIT)
///////////////////////////////////////////////////////////////////////////////
(function (root, factory) {
	//can run with or without requirejs
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define("Tone/core/Tone",[],function () {
			var Tone = factory(root);
			return Tone;
		});
	} else if (typeof root.Tone !== "function") {
		//make Tone public
		root.Tone = factory(root);
		//define 'define' to invoke the callbacks with Tone
		root.define = function(name, deps, func){
			func(root.Tone);
		};
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
	if (typeof global.AudioBufferSourceNode.prototype.start !== "function"){
		global.AudioBufferSourceNode.prototype.start = global.AudioBufferSourceNode.prototype.noteGrainOn;
	}
	if (typeof global.AudioBufferSourceNode.prototype.stop !== "function"){
		global.AudioBufferSourceNode.prototype.stop = global.AudioBufferSourceNode.prototype.noteOff;
	}
	if (typeof global.OscillatorNode.prototype.start !== "function"){
		global.OscillatorNode.prototype.start = global.OscillatorNode.prototype.noteOn;
	}
	if (typeof global.OscillatorNode.prototype.stop !== "function"){
		global.OscillatorNode.prototype.stop = global.OscillatorNode.prototype.noteOff;	
	}
	//extend the connect function to include Tones
	global.AudioNode.prototype._nativeConnect = global.AudioNode.prototype.connect;
	global.AudioNode.prototype.connect = function(B){
		if (B.input && B.input instanceof global.GainNode){
			this._nativeConnect(B.input);
		} else {
			try {
				this._nativeConnect.apply(this, arguments);
			} catch (e) {
				throw new Error("trying to connect to a node with no inputs");
			}
		}
	};

	///////////////////////////////////////////////////////////////////////////
	//	TONE
	//	@constructor
	///////////////////////////////////////////////////////////////////////////

	var Tone = function(){
		this.input = audioContext.createGain();
		this.output = audioContext.createGain();
	};

	///////////////////////////////////////////////////////////////////////////
	//	CLASS VARS
	///////////////////////////////////////////////////////////////////////////

	Tone.prototype.context = audioContext;
	Tone.prototype.fadeTime = 0.005; //5ms
	Tone.prototype.bufferSize = 2048; //default buffer size
	Tone.prototype.waveShaperResolution = 1024; //default buffer size
	
	///////////////////////////////////////////////////
	// 				CLASS METHODS					 //
	///////////////////////////////////////////////////

	/**
	 *  @return {Number} the currentTime from the AudioContext
	 */
	Tone.prototype.now = function(){
		return audioContext.currentTime;
	};

	/**
	 *  connect the output of a ToneNode to an AudioParam, AudioNode, or ToneNode
	 *  @param  {Tone | AudioParam | AudioNode} unit 
	 */
	Tone.prototype.connect = function(unit){
		this.output.connect(unit);
	};

	/**
	 *  disconnect the output
	 */
	Tone.prototype.disconnect = function(){
		this.output.disconnect();
	};
	
	/**
	 *  connect together all of the arguments in series
	 *  @param {...AudioParam | Tone}
	 */
	Tone.prototype.chain = function(){
		if (arguments.length > 1){
			var currentUnit = arguments[0];
			for (var i = 1; i < arguments.length; i++){
				var toUnit = arguments[i];
				currentUnit.connect(toUnit);
				currentUnit = toUnit;
			}
		}
	};

	///////////////////////////////////////////////////////////////////////////
	//	UTILITIES / HELPERS
	///////////////////////////////////////////////////////////////////////////

	function isUndef(val){
		return typeof val === "undefined";
	}

	//if the given argument is undefined, go with the default
	//@param {*} given
	//@param {*} fallback
	//@returns {*}
	Tone.prototype.defaultArg = function(given, fallback){
		return isUndef(given) ? fallback : given;
	};

	//@param {number} percent (0-1)
	//@returns {number} the equal power gain (0-1)
	//good for cross fades
	Tone.prototype.equalPowerScale = function(percent){
		return Math.sin((percent) * 0.5*Math.PI);
	};

	//@param {number} gain
	//@returns {number} gain (decibel scale but betwee 0-1)
	Tone.prototype.logScale = function(gain) {
		return  Math.max(this.normalize(this.gainToDb(gain), -100, 0), 0);
	};

	//@param {number} gain
	//@returns {number} gain (decibel scale but betwee 0-1)
	Tone.prototype.expScale = function(gain) {
		return this.dbToGain(this.interpolate(gain, -100, 0));
	};

	//@param {number} db
	//@returns {number} gain
	Tone.prototype.dbToGain = function(db) {
		return Math.pow(2, db / 6);
	};

	//@param {number} gain
	//@returns {number} db
	Tone.prototype.gainToDb = function(gain) {
		return  20 * (Math.log(gain) / Math.LN10);
	};

	//@param {number} input 0 to 1
	//@returns {number} between outputMin and outputMax
	Tone.prototype.interpolate = function(input, outputMin, outputMax){
		return input*(outputMax - outputMin) + outputMin;
	};

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
	};


	//@param {number} samples
	//@returns {number} the number of seconds
	Tone.prototype.samplesToSeconds = function(samples){
		return samples / audioContext.sampleRate;
	};

	///////////////////////////////////////////////////////////////////////////
	//	TIMING
	//
	//	numbers are passed through
	//	'+' prefixed values will be "now" relative
	///////////////////////////////////////////////////////////////////////////

	//@param {Tone.Time} timing
	//@param {number=} bpm
	//@param {number=} timeSignature
	//@returns {number} the time in seconds
	Tone.prototype.toSeconds = function(time, bpm, timeSignature){
		if (typeof time === "number"){
			return time; //assuming that it's seconds
		} else if (typeof time === "string"){
			var plusTime = 0;
			if(time.charAt(0) === "+") {
				plusTime = this.now();
				time = time.slice(1);				
			} 
			if (this.isNotation(time)){
				time = this.notationToSeconds(time, bpm, timeSignature);
			} else if (this.isTransportTime(time)){
				time = this.transportTimeToSeconds(time, bpm, timeSignature);
			} else if (this.isFrequency(time)){
				time = this.frequencyToSeconds(time);
			}
			return parseFloat(time) + plusTime;
		} else {
			return this.now();
		}
	};

	//@param {number|string} timing
	//@param {number=} bpm
	//@param {number=} timeSignature
	//@returns {number} the time in seconds
	Tone.prototype.toFrequency = function(time, bpm, timeSignature){
		if (this.isNotation(time) || this.isFrequency(time)){
			return this.secondsToFrequency(this.toSeconds(time, bpm, timeSignature));
		} else {
			return time;
		}
	};

	//@returns {number} the tempo
	//meant to be overriden by Transport
	Tone.prototype.getBpm = function(){
		return 120;
	};

	//@returns {number} the time signature / 4
	//meant to be overriden by Transport
	Tone.prototype.getTimeSignature = function(){
		return 4;
	};

	///////////////////////////////////////////////////////////////////////////
	//	TIMING CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	//@param {string} note
	//@returns {boolean} if the value is in notation form
	Tone.prototype.isNotation = (function(){
		var notationFormat = new RegExp(/[0-9]+[mnt]$/i);
		return function(note){
			return notationFormat.test(note);
		};
	})();

	//@param {string} transportTime
	//@returns {boolean} if the value is in notation form
	Tone.prototype.isTransportTime = (function(){
		var transportTimeFormat = new RegExp(/^\d+(\.\d+)?:\d+(\.\d+)?(:\d+(\.\d+)?)?$/);
		return function(transportTime){
			return transportTimeFormat.test(transportTime);
		};
	})();

	//@param {string} freq
	//@returns {boolean} if the value is in notation form
	Tone.prototype.isFrequency = (function(){
		var freqFormat = new RegExp(/[0-9]+hz$/i);
		return function(freq){
			return freqFormat.test(freq);
		};
	})();

	// 4n == quarter note; 16t == sixteenth note triplet; 1m == 1 measure
	//@param {string} notation 
	//@param {number=} bpm
	//@param {number} timeSignature (default 4)
	//@returns {number} time duration of notation
	Tone.prototype.notationToSeconds = function(notation, bpm, timeSignature){
		bpm = this.defaultArg(bpm, this.getBpm());
		timeSignature = this.defaultArg(timeSignature, this.getTimeSignature());
		var beatTime = (60 / bpm);
		var subdivision = parseInt(notation, 10);
		var beats = 0;
		if (subdivision === 0){
			beats = 0;
		}
		var lastLetter = notation.slice(-1);
		if (lastLetter === "t"){
			beats = (4 / subdivision) * 2/3;
		} else if (lastLetter === "n"){
			beats = 4 / subdivision;
		} else if (lastLetter === "m"){
			beats = subdivision * timeSignature;
		} else {
			beats = 0;
		}
		return beatTime * beats;
	};

	// 4:2:3 == 4 measures + 2 quarters + 3 sixteenths
	//@param {string} transportTime
	//@param {number=} bpm
	//@param {number=} timeSignature (default 4)
	//@returns {number} time duration of notation
	Tone.prototype.transportTimeToSeconds = function(transportTime, bpm, timeSignature){
		bpm = this.defaultArg(bpm, this.getBpm());
		timeSignature = this.defaultArg(timeSignature, this.getTimeSignature());
		var measures = 0;
		var quarters = 0;
		var sixteenths = 0;
		var split = transportTime.split(":");
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
		var beats = (measures * timeSignature + quarters + sixteenths / 4);
		return beats * this.notationToSeconds("4n", bpm, timeSignature);
	};

	//@param {string | number} freq (i.e. 440hz)
	//@returns {number} the time of a single cycle
	Tone.prototype.frequencyToSeconds = function(freq){
		return 1 / parseFloat(freq);
	};

	//@param {number} seconds
	//@param {number=} bpm
	//@param {number=}
	//@returns {string} the seconds in transportTime
	Tone.prototype.secondsToTransportTime = function(seconds, bpm, timeSignature){
		bpm = this.defaultArg(bpm, this.getBpm());
		timeSignature = this.defaultArg(timeSignature, this.getTimeSignature());
		var quarterTime = this.notationToSeconds("4n", bpm, timeSignature);
		var quarters = seconds / quarterTime;
		var measures = parseInt(quarters / timeSignature, 10);
		var sixteenths = parseInt((quarters % 1) * 4, 10);
		quarters = parseInt(quarters, 10) % timeSignature;
		var progress = [measures, quarters, sixteenths];
		return progress.join(":");
	};

	//@param {number} seconds
	//@returns {number} the frequency
	Tone.prototype.secondsToFrequency = function(seconds){
		return 1/seconds;
	};

	///////////////////////////////////////////////////////////////////////////
	//	STATIC METHODS
	///////////////////////////////////////////////////////////////////////////
		
	/**
	 *  have a child inherit all of Tone's (or a parent's) prototype
	 *  to inherit the parent's properties, make sure to call 
	 *  Parent.call(this) in the child's constructor
	 *
	 *  based on closure library's inherit function
	 *  
	 *  @param  {function} 	child  
	 *  @param  {function=} parent (optional) parent to inherit from
	 *                             if no parent is supplied, the child
	 *                             will inherit from Tone
	 */
	Tone.extend = function(child, parent){
		if (isUndef(parent)){
			parent = Tone;
		}
		function tempConstructor(){}
		tempConstructor.prototype = parent.prototype;
		child.prototype = new tempConstructor();
		/** @override */
		child.prototype.constructor = child;
	};

	Tone.context = audioContext;

	return Tone;
}));
