/**
 *  Tone.js
 *
 *  @version 0.1.2
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
	// something called Tone) it will create a function called
	// 'define'. 'define' will invoke the 'core' module and attach
	// its return value to the root. for all other modules
	// Tone will be passed in as the argument.
	if (typeof define !== "function" && 
		typeof root.Tone !== "function") {
		//define 'define' to invoke the callbacks with Tone
		root.define = function(name, deps, func){
			//grab the one at the root
			if (name === "Tone/core/Tone"){
				root.Tone = func();
			} else {
				//for all others pass it in
				func(root.Tone);
			}
		};
	}
} (this));

define("Tone/core/Tone", [], function(){

	//////////////////////////////////////////////////////////////////////////
	//	WEB AUDIO CONTEXT
	///////////////////////////////////////////////////////////////////////////

	//borrowed from underscore.js
	function isUndef(val){
		return val === void 0;
	}

	//ALIAS
	if (isUndef(window.AudioContext)){
		window.AudioContext = window.webkitAudioContext;
	} 

	var audioContext;
	if (!isUndef(window.AudioContext)){
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
	 *  Tone is the baseclass of all ToneNodes
	 *  
	 *  From Tone, children inherit timing and math which is used throughout Tone.js
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
	 *  @type {AudioContext}
	 */
	Tone.context = audioContext;

	/**
	 *  A static pointer to the audio context
	 *  @type {AudioContext}
	 *  @static
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
	 *  @param {...AudioParam|Tone}
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
	//	UTILITIES / HELPERS / MATHS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  if a the given is undefined, use the fallback
	 *  
	 *  @param  {*} given    
	 *  @param  {*} fallback 
	 *  @return {*}          
	 */
	Tone.prototype.defaultArg = function(given, fallback){
		return isUndef(given) ? fallback : given;
	};

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
	 *  
	 *  @abstract
	 */
	Tone.prototype.dispose = function(){};


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
	 *  convert Tone.Time to seconds
	 *
	 *  this is a simplified version which only handles numbers and 
	 *  'now' relative numbers. If the Transport is included this 
	 *  method is overridden to include many other features including 
	 *  notationTime, Frequency, and transportTime
	 *  
	 *  @param  {Tone.Time} time 
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
			} 
			return parseFloat(time) + now;
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
	//	MUSIC NOTES
	///////////////////////////////////////////////////////////////////////////

	var noteToIndex = { "a" : 0, "a#" : 1, "bb" : 1, "b" : 2, "c" : 3, "c#" : 4,
		"db" : 4, "d" : 5, "d#" : 6, "eb" : 6, "e" : 7, "f" : 8, "f#" : 9, 
		"gb" : 9, "g" : 10, "g#" : 11, "ab" : 11
	};

	var noteIndexToNote = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

	/**
	 *  convert a note name to frequency (i.e. A4 to 440)
	 *  @param  {string} note
	 *  @return {number}         
	 */
	Tone.prototype.noteToFrequency = function(note){
		//break apart the note by frequency and octave
		var parts = note.split(/(\d+)/);
		if (parts.length === 3){
			var index = noteToIndex[parts[0].toLowerCase()];
			var octave = parts[1];
			var noteNumber = index + parseInt(octave, 10) * 12;
			return Math.pow(2, (noteNumber - 48) / 12) * 440;
		} else {
			return 0;
		}
	};

	/**
	 *  convert a note name (i.e. A4, C#5, etc to a frequency)
	 *  @param  {number} freq
	 *  @return {string}         
	 */
	Tone.prototype.frequencyToNote = function(freq){
		var log = Math.log(freq / 440) / Math.LN2;
		var noteNumber = Math.round(12 * log) + 48;
		var octave = Math.floor(noteNumber/12);
		var noteName = noteIndexToNote[noteNumber % 12];
		return noteName + octave.toString();
	};

	///////////////////////////////////////////////////////////////////////////
	//	STATIC METHODS / VARS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  the list of callbacks which should be invoked when the context is set/changed
	 *  
 	 *  @internal internal use only
	 *  @type {Array<function(AudioContext)>}
	 */
	Tone._onContextCallbacks = [];

	/**
	 *  invokes all of the callbacks with the new context
	 *  
	 *  @internal internal use only
	 */
	Tone._onContext = function(context){
		for (var i = 0; i < Tone._onContextCallbacks.length; i++){
			Tone._onContextCallbacks[i](context);
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
		function tempConstructor(){}
		tempConstructor.prototype = parent.prototype;
		child.prototype = new tempConstructor();
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

	return Tone;

});
