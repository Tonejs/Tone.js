/**
 *  Tone.js
 *
 *  @author Yotam Mann
 *
 *  @license http://opensource.org/licenses/MIT MIT License 2014
 */

(function (root) {
	// Tone.js can run with or without requirejs
	//
	// this anonymous function checks to see if the 'define'
	// method exists, if it does not (and there is not already
	// a function called Tone) it will create a function called
	// 'define'. 'define' will invoke the 'core' module and attach
	// its return value to the root. for all other modules
	// Tone will be passed in as the argument.
	if (typeof define !== "function" && 
		typeof root.Tone !== "function") {
		//define 'define' to invoke the callbacks with Tone
		root.define = function(){
			//the last argument is the callback
			var lastArg = arguments[arguments.length - 1];
			//the first argument is the dependencies or name
			var firstArg = arguments[0];
			if (firstArg === "Tone/core/Tone"){
				//create the root object
				root.Tone = lastArg();
			} else if (typeof lastArg === "function"){
				//if it's not the root, pass in the root
				//as the parameter
				lastArg(root.Tone);
			}
		};
	}
} (this));

define("Tone/core/Tone", [], function(){

	"use strict";

	//////////////////////////////////////////////////////////////////////////
	//	WEB AUDIO CONTEXT
	///////////////////////////////////////////////////////////////////////////

	//borrowed from underscore.js
	function isUndef(val){
		return val === void 0;
	}

	var audioContext;

	//polyfill for AudioContext and OfflineAudioContext
	if (isUndef(window.AudioContext)){
		window.AudioContext = window.webkitAudioContext;
	} 
	if (isUndef(window.OfflineAudioContext)){
		window.OfflineAudioContext = window.webkitOfflineAudioContext;
	} 

	if (!isUndef(AudioContext)){
		audioContext = new AudioContext();
	} else {
		throw new Error("Web Audio is not supported in this browser");
	}

	//SHIMS////////////////////////////////////////////////////////////////////

	if (typeof AudioContext.prototype.createGain !== "function"){
		AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
	}
	if (typeof AudioContext.prototype.createDelay !== "function"){
		AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
	}
	if (typeof AudioContext.prototype.createPeriodicWave !== "function"){
		AudioContext.prototype.createPeriodicWave = AudioContext.prototype.createWaveTable;
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
	if (typeof OscillatorNode.prototype.setPeriodicWave !== "function"){
		OscillatorNode.prototype.setPeriodicWave = OscillatorNode.prototype.setWaveTable;	
	}
	//extend the connect function to include Tones
	AudioNode.prototype._nativeConnect = AudioNode.prototype.connect;
	AudioNode.prototype.connect = function(B, outNum, inNum){
		if (B.input){
			if (Array.isArray(B.input)){
				if (isUndef(inNum)){
					inNum = 0;
				}
				this.connect(B.input[inNum]);
			} else {
				this.connect(B.input);
			}
		} else {
			try {
				if (B instanceof AudioNode){
					this._nativeConnect(B, outNum, inNum);
				} else {
					this._nativeConnect(B, outNum);
				}
			} catch (e) {
				throw new Error("error connecting to node: "+B);
			}
		}
	};

	///////////////////////////////////////////////////////////////////////////
	//	TONE
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  @class  Tone is the baseclass of all Tone Modules. 
	 *  
	 *  @constructor
	 *  @alias Tone
	 */
	var Tone = function(){
		/**
		 *  default input of the ToneNode
		 *  
		 *  @type {GainNode}
		 */
		this.input = this.context.createGain();
		/**
		 *  default output of the ToneNode
		 *  
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();
	};

	///////////////////////////////////////////////////////////////////////////
	//	CLASS VARS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  A static pointer to the audio context
	 *  @static
	 *  @type {AudioContext}
	 */
	Tone.context = audioContext;

	/**
	 *  A static pointer to the audio context
	 *  @type {AudioContext}
	 */
	Tone.prototype.context = Tone.context;

	/**
	 *  the default buffer size
	 *  @type {number}
	 *  @static
	 *  @const
	 */
	Tone.prototype.bufferSize = 2048;
	
	///////////////////////////////////////////////////////////////////////////
	//	CONNECTIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  connect the output of a ToneNode to an AudioParam, AudioNode, or ToneNode
	 *  @param  {Tone | AudioParam | AudioNode} unit 
	 *  @param {number=} outputNum optionally which output to connect from
	 *  @param {number=} inputNum optionally which input to connect to
	 */
	Tone.prototype.connect = function(unit, outputNum, inputNum){
		if (Array.isArray(this.output)){
			outputNum = this.defaultArg(outputNum, 0);
			this.output[outputNum].connect(unit, 0, inputNum);
		} else {
			this.output.connect(unit, outputNum, inputNum);
		}
	};

	/**
	 *  disconnect the output
	 */
	Tone.prototype.disconnect = function(){
		this.output.disconnect();
	};
	
	/**
	 *  connect together all of the arguments in series
	 *  @param {...AudioParam|Tone|AudioNode}
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

	/**
	 *  fan out the connection from the first argument to the rest of the arguments
	 *  @param {...AudioParam|Tone|AudioNode}
	 */
	Tone.prototype.fan = function(){
		var connectFrom = arguments[0];
		if (arguments.length > 1){
			for (var i = 1; i < arguments.length; i++){
				var connectTo = arguments[i];
				connectFrom.connect(connectTo);
			}
		}
	};

	///////////////////////////////////////////////////////////////////////////
	//	UTILITIES / HELPERS / MATHS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  if a the given is undefined, use the fallback. 
	 *  if both given and fallback are objects, given
	 *  will be augmented with whatever properties it's
	 *  missing which are in fallback
	 *
	 *  warning: if object is self referential, it will go into an an 
	 *  infinite recursive loop. 
	 *  
	 *  @param  {*} given    
	 *  @param  {*} fallback 
	 *  @return {*}          
	 */
	Tone.prototype.defaultArg = function(given, fallback){
		if (typeof given === "object" && typeof fallback === "object"){
			var ret = {};
			//make a deep copy of the given object
			for (var givenProp in given) {
				ret[givenProp] = this.defaultArg(given[givenProp], given[givenProp]);
			}
			for (var prop in fallback) {
				ret[prop] = this.defaultArg(given[prop], fallback[prop]);
			}
			return ret;
		} else {
			return isUndef(given) ? fallback : given;
		}
	};

	/**
	 *  returns the args as an options object with given arguments
	 *  mapped to the names provided. 
	 *
	 *  if the args given is an array containing an object, it is assumed
	 *  that that's already the options object and will just return it. 
	 *  
	 *  @param  {Array} values  the 'arguments' object of the function
	 *  @param  {Array.<string>} keys the names of the arguments as they
	 *                                 should appear in the options object
	 *  @param {Object=} defaults optional defaults to mixin to the returned 
	 *                            options object                              
	 *  @return {Object}       the options object with the names mapped to the arguments
	 */
	Tone.prototype.optionsObject = function(values, keys, defaults){
		var options = {};
		if (values.length === 1 && typeof values[0] === "object"){
			options = values[0];
		} else {
			for (var i = 0; i < keys.length; i++){
				options[keys[i]] = values[i];
			}
		}
		if (!this.isUndef(defaults)){
			return this.defaultArg(options, defaults);
		} else {
			return options;
		}
	};

	/**
	 *  test if the arg is undefined
	 *  @param {*} arg the argument to test
	 *  @returns {boolean} true if the arg is undefined
	 *  @function
	 */
	Tone.prototype.isUndef = isUndef;

	/**
	 *  equal power gain scale
	 *  good for cross-fading
	 *  	
	 *  @param  {number} percent (0-1)
	 *  @return {number}         output gain (0-1)
	 */
	Tone.prototype.equalPowerScale = function(percent){
		var piFactor = 0.5 * Math.PI;
		return Math.sin(percent * piFactor);
	};

	/**
	 *  @param  {number} gain (0-1)
	 *  @return {number}      gain (decibel scale but betwee 0-1)
	 */
	Tone.prototype.logScale = function(gain) {
		return  Math.max(this.normalize(this.gainToDb(gain), -100, 0), 0);
	};

	/**
	 *  @param  {number} gain (0-1)
	 *  @return {number}      gain (decibel scale but betwee 0-1)
	 */
	Tone.prototype.expScale = function(gain) {
		return this.dbToGain(this.interpolate(gain, -100, 0));
	};

	/**
	 *  convert db scale to gain scale (0-1)
	 *  @param  {number} db
	 *  @return {number}   
	 */
	Tone.prototype.dbToGain = function(db) {
		return Math.pow(2, db / 6);
	};

	/**
	 *  convert gain scale to decibels
	 *  @param  {number} gain (0-1)
	 *  @return {number}   
	 */
	Tone.prototype.gainToDb = function(gain) {
		return  20 * (Math.log(gain) / Math.LN10);
	};

	/**
	 *  interpolate the input value (0-1) to be between outputMin and outputMax
	 *  @param  {number} input     
	 *  @param  {number} outputMin 
	 *  @param  {number} outputMax 
	 *  @return {number}           
	 */
	Tone.prototype.interpolate = function(input, outputMin, outputMax){
		return input*(outputMax - outputMin) + outputMin;
	};

	/**
	 *  normalize the input to 0-1 from between inputMin to inputMax
	 *  @param  {number} input    
	 *  @param  {number} inputMin 
	 *  @param  {number} inputMax 
	 *  @return {number}          
	 */
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

	/**
	 *  a dispose method 
	 */
	Tone.prototype.dispose = function(){
		if (!this.isUndef(this.input)){
			if (this.input instanceof AudioNode){
				this.input.disconnect();
			}
			this.input = null;
		}
		if (!this.isUndef(this.output)){
			if (this.output instanceof AudioNode){
				this.output.disconnect();
			}
			this.output = null;
		}
	};

	/**
	 *  a silent connection to the DesinationNode
	 *  which will ensure that anything connected to it
	 *  will not be garbage collected
	 *  
	 *  @private
	 */
	var _silentNode = null;

	/**
	 *  makes a connection to ensure that the node will not be garbage collected
	 *  until 'dispose' is explicitly called
	 *
	 *  use carefully. circumvents JS and WebAudio's normal Garbage Collection behavior
	 */
	Tone.prototype.noGC = function(){
		this.output.connect(_silentNode);
	};

	AudioNode.prototype.noGC = function(){
		this.connect(_silentNode);
	};

	///////////////////////////////////////////////////////////////////////////
	//	TIMING
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  @return {number} the currentTime from the AudioContext
	 */
	Tone.prototype.now = function(){
		return this.context.currentTime;
	};

	/**
	 *  convert a sample count to seconds
	 *  @param  {number} samples 
	 *  @return {number}         
	 */
	Tone.prototype.samplesToSeconds = function(samples){
		return samples / this.context.sampleRate;
	};

	/**
	 *  convert a time into samples
	 *  
	 *  @param  {Tone.time} time
	 *  @return {number}         
	 */
	Tone.prototype.toSamples = function(time){
		var seconds = this.toSeconds(time);
		return Math.round(seconds * this.context.sampleRate);
	};

	/**
	 *  convert time to seconds
	 *
	 *  this is a simplified version which only handles numbers and 
	 *  'now' relative numbers. If the Transport is included this 
	 *  method is overridden to include many other features including 
	 *  notationTime, Frequency, and transportTime
	 *  
	 *  @param  {number=} time 
	 *  @param {number=} now if passed in, this number will be 
	 *                       used for all 'now' relative timings
	 *  @return {number}   	seconds in the same timescale as the AudioContext
	 */
	Tone.prototype.toSeconds = function(time, now){
		now = this.defaultArg(now, this.now());
		if (typeof time === "number"){
			return time; //assuming that it's seconds
		} else if (typeof time === "string"){
			var plusTime = 0;
			if(time.charAt(0) === "+") {
				time = time.slice(1);	
				plusTime = now;			
			} 
			return parseFloat(time) + plusTime;
		} else {
			return now;
		}
	};

	/**
	 *  convert a frequency into seconds
	 *  accepts both numbers and strings 
	 *  	i.e. 10hz or 10 both equal .1
	 *  
	 *  @param  {number|string} freq 
	 *  @return {number}      
	 */
	Tone.prototype.frequencyToSeconds = function(freq){
		return 1 / parseFloat(freq);
	};

	/**
	 *  convert a number in seconds to a frequency
	 *  @param  {number} seconds 
	 *  @return {number}         
	 */
	Tone.prototype.secondsToFrequency = function(seconds){
		return 1/seconds;
	};

	///////////////////////////////////////////////////////////////////////////
	//	STATIC METHODS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  array of callbacks to be invoked when a new context is added
	 *  @internal 
	 *  @private
	 */
	var newContextCallbacks = [];

	/**
	 *  invoke this callback when a new context is added
	 *  will be invoked initially with the first context
	 *  @private 
	 *  @static
	 *  @param {function(AudioContext)} callback the callback to be invoked
	 *                                           with the audio context
	 */
	Tone._initAudioContext = function(callback){
		//invoke the callback with the existing AudioContext
		callback(Tone.context);
		//add it to the array
		newContextCallbacks.push(callback);
	};

	/**
	 *  @static
	 */
	Tone.setContext = function(ctx){
		//set the prototypes
		Tone.prototype.context = ctx;
		Tone.context = ctx;
		//invoke all the callbacks
		for (var i = 0; i < newContextCallbacks.length; i++){
			newContextCallbacks[i](ctx);
		}
	};
		
	/**
	 *  have a child inherit all of Tone's (or a parent's) prototype
	 *  to inherit the parent's properties, make sure to call 
	 *  Parent.call(this) in the child's constructor
	 *
	 *  based on closure library's inherit function
	 *
	 *  @static
	 *  @param  {function} 	child  
	 *  @param  {function=} parent (optional) parent to inherit from
	 *                             if no parent is supplied, the child
	 *                             will inherit from Tone
	 */
	Tone.extend = function(child, parent){
		if (isUndef(parent)){
			parent = Tone;
		}
		function TempConstructor(){}
		TempConstructor.prototype = parent.prototype;
		child.prototype = new TempConstructor();
		/** @override */
		child.prototype.constructor = child;
	};

	/**
	 *  bind this to a touchstart event to start the audio
	 *
	 *  http://stackoverflow.com/questions/12517000/no-sound-on-ios-6-web-audio-api/12569290#12569290
	 *  
	 *  @static
	 */
	Tone.startMobile = function(){
		var osc = Tone.context.createOscillator();
		var silent = Tone.context.createGain();
		silent.gain.value = 0;
		osc.connect(silent);
		silent.connect(Tone.context.destination);
		var now = Tone.context.currentTime;
		osc.start(now);
		osc.stop(now+1);
	};

	//setup the context
	Tone._initAudioContext(function(audioContext){
		_silentNode = audioContext.createGain();
		_silentNode.gain.value = 0;
		_silentNode.connect(audioContext.destination);
	});

	console.log("Tone.js r1");

	return Tone;
});
