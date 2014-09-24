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

	console.log("Tone.js r2");

	return Tone;
});

define('Tone/signal/Signal',["Tone/core/Tone"], function(Tone){

	

	/**
	 *  @class  Constant audio-rate signal.
	 *          Tone.Signal is a core component which allows for sample-accurate 
	 *          synchronization of many components. Tone.Signal can be scheduled 
	 *          with all of the functions available to AudioParams
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} value (optional) initial value
	 */
	Tone.Signal = function(value){

		Tone.call(this);

		/**
		 *  scales the constant output to the desired output
		 *  @type {GainNode}
		 *  @private
		 */
		this._scalar = this.context.createGain();
		/**
		 *  the ratio of the this value to the control signal value
		 *
		 *  @private
		 *  @type {number}
		 */
		this._syncRatio = 1;

		//connect the constant 1 output to the node output
		this.chain(constant, this._scalar, this.output);
		//signal passes through
		this.input.connect(this.output);

		//set the default value
		this.setValue(this.defaultArg(value, 0));
	};

	Tone.extend(Tone.Signal);

	/**
	 *  @return {number} the current value of the signal
	 */
	Tone.Signal.prototype.getValue = function(){
		return this._scalar.gain.value;
	};

	/**
	 *  set the value of the signal right away
	 *  will be overwritten if there are previously scheduled automation curves
	 *  
	 *  @param {number} value 
	 */
	Tone.Signal.prototype.setValue = function(value){
		if (this._syncRatio === 0){
			value = 0;
		} else {
			value *= this._syncRatio;
		}
		this._scalar.gain.value = value;
	};

	/**
	 *  Schedules a parameter value change at the given time.
	 *  
	 *  @param {number}		value 
	 *  @param {Tone.Time}  time 
	 */
	Tone.Signal.prototype.setValueAtTime = function(value, time){
		value *= this._syncRatio;
		this._scalar.gain.setValueAtTime(value, this.toSeconds(time));
	};

	/**
	 *  creates a schedule point with the current value at the current time
	 *
	 *  @param {number=} now (optionally) pass the now value in
	 *  @returns {number} the current value
	 */
	Tone.Signal.prototype.setCurrentValueNow = function(now){
		now = this.defaultArg(now, this.now());
		var currentVal = this.getValue();
		this.cancelScheduledValues(now);
		this._scalar.gain.setValueAtTime(currentVal, now);
		return currentVal;
	};

	/**
	 *  Schedules a linear continuous change in parameter value from the 
	 *  previous scheduled parameter value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} endTime 
	 */
	Tone.Signal.prototype.linearRampToValueAtTime = function(value, endTime){
		value *= this._syncRatio;
		this._scalar.gain.linearRampToValueAtTime(value, this.toSeconds(endTime));
	};

	/**
	 *  Schedules an exponential continuous change in parameter value from 
	 *  the previous scheduled parameter value to the given value.
	 *
	 *  NOTE: Chrome will throw an error if you try to exponentially ramp to a 
	 *  value 0 or less. 
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} endTime 
	 */
	Tone.Signal.prototype.exponentialRampToValueAtTime = function(value, endTime){
		value *= this._syncRatio;
		try {
			this._scalar.gain.exponentialRampToValueAtTime(value, this.toSeconds(endTime));
		} catch(e){
			//firefox won't let the signal ramp past 1, in these cases, revert to linear ramp
			this._scalar.gain.linearRampToValueAtTime(value, this.toSeconds(endTime));
		}
	};

	/**
	 *  Schedules an exponential continuous change in parameter value from 
	 *  the current time and current value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} endTime 
	 */
	Tone.Signal.prototype.exponentialRampToValueNow = function(value, endTime){
		var now = this.now();
		this.setCurrentValueNow(now);
		//make sure that the endTime doesn't start with +
		if (endTime.toString().charAt(0) === "+"){
			endTime = endTime.substr(1);
		}
		this.exponentialRampToValueAtTime(value, now + this.toSeconds(endTime));
	};

	/**
	 *  Schedules an linear continuous change in parameter value from 
	 *  the current time and current value to the given value at the given time.
	 *  
	 *  @param  {number} value   
	 *  @param  {Tone.Time} endTime 
	 */
	Tone.Signal.prototype.linearRampToValueNow = function(value, endTime){
		var now = this.now();
		this.setCurrentValueNow(now);
		value *= this._syncRatio;
		//make sure that the endTime doesn't start with +
		if (endTime.toString().charAt(0) === "+"){
			endTime = endTime.substr(1);
		}
		this._scalar.gain.linearRampToValueAtTime(value, now + this.toSeconds(endTime));
	};

	/**
	 *  Start exponentially approaching the target value at the given time with
	 *  a rate having the given time constant.
	 *  	
	 *  @param {number} value        
	 *  @param {Tone.Time} startTime    
	 *  @param {number} timeConstant 
	 */
	Tone.Signal.prototype.setTargetAtTime = function(value, startTime, timeConstant){
		value *= this._syncRatio;
		this._scalar.gain.setTargetAtTime(value, this.toSeconds(startTime), timeConstant);
	};

	/**
	 *  Sets an array of arbitrary parameter values starting at the given time
	 *  for the given duration.
	 *  	
	 *  @param {Array<number>} values    
	 *  @param {Tone.Time} startTime 
	 *  @param {Tone.Time} duration  
	 */
	Tone.Signal.prototype.setValueCurveAtTime = function(values, startTime, duration){
		for (var i = 0; i < values.length; i++){
			values[i] *= this._syncRatio;
		}
		this._scalar.gain.setValueCurveAtTime(values, this.toSeconds(startTime), this.toSeconds(duration));
	};

	/**
	 *  Cancels all scheduled parameter changes with times greater than or 
	 *  equal to startTime.
	 *  
	 *  @param  {Tone.Time} startTime
	 */
	Tone.Signal.prototype.cancelScheduledValues = function(startTime){
		this._scalar.gain.cancelScheduledValues(this.toSeconds(startTime));
	};

	/**
	 *  Sync this to another signal and it will always maintain the 
	 *  ratio between the two signals until it is unsynced
	 *
	 *  Signals can only be synced to one other signal. while syncing, 
	 *  if a signal's value is changed, the new ratio between the signals
	 *  is maintained as the syncing signal is changed. 
	 *  
	 *  @param  {Tone.Signal} signal to sync to
	 *  @param {number=} ratio optionally pass in the ratio between 
	 *                         the two signals, otherwise it will be computed
	 */
	Tone.Signal.prototype.sync = function(signal, ratio){
		if (ratio){
			this._syncRatio = ratio;
		} else {
			//get the sync ratio
			if (signal.getValue() !== 0){
				this._syncRatio = this.getValue() / signal.getValue();
			} else {
				this._syncRatio = 0;
			}
		}
		//make a new scalar which is not connected to the constant signal
		this._scalar.disconnect();
		this._scalar = this.context.createGain();
		this.chain(signal, this._scalar, this.output);
		//set it ot the sync ratio
		this._scalar.gain.value = this._syncRatio;
	};

	/**
	 *  unbind the signal control
	 *
	 *  will leave the signal value as it was without the influence of the control signal
	 */
	Tone.Signal.prototype.unsync = function(){
		//make a new scalar so that it's disconnected from the control signal
		//get the current gain
		var currentGain = this.getValue();
		this._scalar.disconnect();
		this._scalar = this.context.createGain();
		this._scalar.gain.value = currentGain / this._syncRatio;
		this._syncRatio = 1;
		//reconnect things up
		this.chain(constant, this._scalar, this.output);
	};

	/**
	 *  internal dispose method to tear down the node
	 */
	Tone.Signal.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._scalar.disconnect();
		this._scalar = null;
	};

	/**
	 *  Signals can connect to other Signals
	 *
	 *  @override
	 *  @param {AudioParam|AudioNode|Tone.Signal|Tone} node 
	 *  @param {number=} outputNumber 
	 *  @param {number=} inputNumber 
	 */
	Tone.Signal.prototype.connect = function(node, outputNumber, inputNumber){
		//zero it out so that the signal can have full control
		if (node instanceof Tone.Signal){
			node.setValue(0);
		} else if (node instanceof AudioParam){
			node.value = 0;
		} 
		Tone.prototype.connect.call(this, node, outputNumber, inputNumber);
	};

	///////////////////////////////////////////////////////////////////////////
	//	STATIC
	///////////////////////////////////////////////////////////////////////////

	/**
	 *	all signals share a common constant signal generator
	 *  
	 *  @static
	 *  @private
	 *  @type {OscillatorNode} 
	 */
	var generator = null;

	/**
	 *  @static
	 *  @private
	 *  @type {WaveShaperNode} 
	 */
	var constant = null;

	/**
	 *  initializer function
	 */
	Tone._initAudioContext(function(audioContext){
		generator = audioContext.createOscillator();
		constant = audioContext.createWaveShaper();
		//generate the waveshaper table which outputs 1 for any input value
		var len = 8;
		var curve = new Float32Array(len);
		for (var i = 0; i < len; i++){
			//all inputs produce the output value
			curve[i] = 1;
		}
		constant.curve = curve;
		//connect it up
		generator.connect(constant);
		generator.start(0);
		generator.noGC();
	});

	return Tone.Signal;
});
define('Tone/component/Envelope',["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class  ADSR envelope generator attaches to an AudioParam or Signal
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Tone.Time|Object=} attack
	 *  @param {Tone.Time=} decay
	 *  @param {number=} sustain 	a percentage (0-1) of the full amplitude
	 *  @param {Tone.Time=} release
	 */
	Tone.Envelope = function(){

		//get all of the defaults
		var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);

		/** 
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/** 
		 *  the attack time in seconds
		 *  @type {number}
		 */
		this.attack = this.toSeconds(options.attack);

		/**
		 *  the decay time in seconds
		 *  @type {number}
		 */
		this.decay = this.toSeconds(options.decay);
		
		/**
		 *  the sustain is a value between 0-1
		 *  @type {number}
		 */
		this.sustain = this.toSeconds(options.sustain);

		/**
		 *  the release time in seconds
		 *  @type {number}
		 */
		this.release = this.toSeconds(options.release);

		/**
		 *  the minimum output of the envelope
		 *  @type {number}
		 */
		this.min = this.toSeconds(options.min);

		/**
		 *  the maximum output of the envelope
		 *  @type {number}
		 */
		this.max = this.toSeconds(options.max);
		
		/** 
		 *  the control signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._control = new Tone.Signal(this.min);

		//connections
		this._control.connect(this.output);
	};

	Tone.extend(Tone.Envelope);

	/**
	 *  the default parameters
	 *
	 *  @static
	 */
	Tone.Envelope.defaults = {
		"attack" : 0.01,
		"decay" : 0.1,
		"sustain" : 0.5,
		"release" : 1,
		"min" : 0,
		"max" : 1
	};

	// SETTERS //

	/**
	 *  set all of the parameters in bulk
	 *  @param {Object} param the name of member as the key
	 *                        and the value as the value 
	 */
	Tone.Envelope.prototype.set = function(params){
		if (!this.isUndef(params.attack)) this.setAttack(params.attack);
		if (!this.isUndef(params.decay)) this.setDecay(params.decay);
		if (!this.isUndef(params.sustain)) this.setSustain(params.sustain);
		if (!this.isUndef(params.release)) this.setRelease(params.release);
		if (!this.isUndef(params.min)) this.setMin(params.min);
		if (!this.isUndef(params.max)) this.setMax(params.max);
	};

	/**
	 *  set the attack time
	 *  @param {Tone.Time} time
	 */
	Tone.Envelope.prototype.setAttack = function(time){
		this.attack = this.toSeconds(time);
	};

	/**
	 *  set the decay time
	 *  @param {Tone.Time} time
	 */
	Tone.Envelope.prototype.setDecay = function(time){
		this.decay = this.toSeconds(time);
	};

	/**
	 *  set the release time
	 *  @param {Tone.Time} time
	 */
	Tone.Envelope.prototype.setRelease = function(time){
		this.release = this.toSeconds(time);
	};

	/**
	 *  set the sustain amount
	 *  @param {number} sustain value between 0-1
	 */
	Tone.Envelope.prototype.setSustain = function(sustain){
		this.sustain = sustain;
	};

	/**
	 *  set the envelope max
	 *  @param {number} max
	 */
	Tone.Envelope.prototype.setMax = function(max){
		this.max = max;
	};

	/**
	 *  set the envelope min
	 *  @param {number} min
	 */
	Tone.Envelope.prototype.setMin = function(min){
		this.min = min;
		//should move the signal to the min
		this._control.setValueAtTime(this.min, this.now());
	};

	/**
	 * attack->decay->sustain linear ramp
	 * @param  {Tone.Time=} time
	 * @param {number=} [velocity=1] the velocity of the envelope scales the vales.
	 *                               number between 0-1
	 */
	Tone.Envelope.prototype.triggerAttack = function(time, velocity){
		velocity = this.defaultArg(velocity, 1);
		var scaledMax = this.max * velocity;
		var sustainVal = (scaledMax - this.min) * this.sustain + this.min;
		time = this.toSeconds(time);
		this._control.cancelScheduledValues(time);
		this._control.setTargetAtTime(scaledMax, time, this.attack / 4);
		this._control.setTargetAtTime(sustainVal, time + this.attack, this.decay / 4);	
	};
	
	/**
	 * triggers the release of the envelope with a linear ramp
	 * @param  {Tone.Time=} time
	 */
	Tone.Envelope.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		this._control.cancelScheduledValues(time);
		this._control.setTargetAtTime(this.min, time, this.toSeconds(this.release) / 4);
	};

	/**
	 *  trigger the attack and release after a sustain time
	 *  @param {Tone.Time} duration the duration of the note
	 *  @param {Tone.Time=} time the time of the attack
	 *  @param {number=} velocity the velocity of the note
	 */
	Tone.Envelope.prototype.triggerAttackRelease = function(duration, time, velocity) {
		time = this.toSeconds(time);
		this.triggerAttack(time, velocity);
		this.triggerRelease(time + this.toSeconds(duration));
	};

	/**
	 *  borrows the connect method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Envelope.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  disconnect and dispose
	 */
	Tone.Envelope.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._control.dispose();
		this._control = null;
	};

	return Tone.Envelope;
});

define('Tone/component/AmplitudeEnvelope',["Tone/core/Tone", "Tone/component/Envelope"], function(Tone){

	

	/**
	 *  @class  An Envelope connected to a gain node which can be used as an amplitude envelope.
	 *  
	 *  @constructor
	 *  @extends {Tone.Envelope}
	 *  @param {Tone.Time|Object=} attack  the attack time or an options object will all of the parameters
	 *  @param {Tone.Time=} decay   the decay time
	 *  @param {number=} sustain the sustain amount
	 *  @param {Tone.Time=} release the release time
	 */
	Tone.AmplitudeEnvelope = function(){

		Tone.Envelope.apply(this, arguments);

		/**
		 *  the input node
		 *  @type {GainNode}
		 */
		this.input = this.context.createGain();

		//disconenct the signal from the output
		this._control.disconnect();
		//connect it to the output gain
		this._control.connect(this.output.gain);
		//input -> output
		this.input.connect(this.output);
	};

	Tone.extend(Tone.AmplitudeEnvelope, Tone.Envelope);

	/**
	 *  clean up
	 */
	Tone.AmplitudeEnvelope.prototype.dispose = function(){
		Tone.Envelope.prototype.dispose.call(this);
	};

	return Tone.AmplitudeEnvelope;
});
define('Tone/signal/Add',["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class Adds a value to an incoming signal
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} value
	 */
	Tone.Add = function(value){
		/**
		 *  @private
		 *  @type {Tone}
		 */
		this._value = new Tone.Signal(value);

		/**
		 *  @type {GainNode}
		 */
		this.input = this.output = this.context.createGain();

		//connections
		this._value.connect(this.output);
	};

	Tone.extend(Tone.Add);

	/**
	 *  set the constant
	 *  
	 *  @param {number} value 
	 */
	Tone.Add.prototype.setValue = function(value){
		this._value.setValue(value);
	}; 

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Add.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.Add.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._value.dispose();
		this._value = null;
	}; 

	return Tone.Add;
});
define('Tone/signal/Multiply',["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class  Multiply the incoming signal by some factor
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} value constant value to multiple
	 */
	Tone.Multiply = function(value){
		/**
		 *  the input node is the same as the output node
		 *  it is also the GainNode which handles the scaling of incoming signal
		 *  
		 *  @type {GainNode}
		 */
		this.input = this.output = this.context.createGain();
		
		//apply the inital scale factor
		this.input.gain.value = this.defaultArg(value, 1);
	};

	Tone.extend(Tone.Multiply);

	/**
	 *  set the constant multiple
	 *  	
	 *  @param {number} value 
	 */
	Tone.Multiply.prototype.setValue = function(value){
		this.input.gain.value = value;
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Multiply.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Multiply.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
	}; 

	return Tone.Multiply;
});

define('Tone/signal/Scale',["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Multiply", "Tone/signal/Signal"], function(Tone){

	
	
	/**
	 *  @class  performs a linear scaling on an input signal.
	 *          Scales from the input range of inputMin to inputMax 
	 *          to the output range of outputMin to outputMax.
	 *
	 *  @description If only two arguments are provided, the inputMin and inputMax are set to -1 and 1
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} inputMin  
	 *  @param {number} inputMax  
	 *  @param {number=} outputMin 
	 *  @param {number=} outputMax 
	 */
	Tone.Scale = function(inputMin, inputMax, outputMin, outputMax){
		Tone.call(this);

		//if there are only two args
		if (arguments.length == 2){
			outputMin = inputMin;
			outputMax = inputMax;
			inputMin = -1;
			inputMax = 1;
		}

		/** @private 
			@type {number} */
		this._inputMin = inputMin;
		/** @private 
			@type {number} */
		this._inputMax = inputMax;
		/** @private 
			@type {number} */
		this._outputMin = outputMin;
		/** @private 
			@type {number} */
		this._outputMax = outputMax;


		/** @private 
			@type {Tone.Add} */
		this._plusInput = new Tone.Add(0);
		/** @private 
			@type {Tone.Multiply} */
		this._scale = new Tone.Multiply(1);
		/** @private 
			@type {Tone.Add} */
		this._plusOutput = new Tone.Add(0);

		//connections
		this.chain(this.input, this._plusInput, this._scale, this._plusOutput, this.output);

		//set the scaling values
		this._setScalingParameters();
	};

	Tone.extend(Tone.Scale);

	/**
	 *  set the scaling parameters
	 *  
	 *  @private
	 */
	Tone.Scale.prototype._setScalingParameters = function(){
		//components
		this._plusInput.setValue(-this._inputMin);
		this._scale.setValue((this._outputMax - this._outputMin)/(this._inputMax - this._inputMin));
		this._plusOutput.setValue(this._outputMin);
	};

	/**
	 *  set the input min value
	 *  @param {number} val 
	 */
	Tone.Scale.prototype.setInputMin = function(val){
		this._inputMin = val;
		this._setScalingParameters();
	};

	/**
	 *  set the input max value
	 *  @param {number} val 
	 */
	Tone.Scale.prototype.setInputMax = function(val){
		this._inputMax = val;
		this._setScalingParameters();
	};

	/**
	 *  set the output min value
	 *  @param {number} val 
	 */
	Tone.Scale.prototype.setOutputMin = function(val){
		this._outputMin = val;
		this._setScalingParameters();
	};

	/**
	 *  set the output max value
	 *  @param {number} val 
	 */
	Tone.Scale.prototype.setOutputMax = function(val){
		this._outputMax = val;
		this._setScalingParameters();
	};

	/**
	 *  borrows connect from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Scale.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Scale.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._plusInput.dispose();
		this._plusOutput.dispose();
		this._scale.dispose();
		this._plusInput = null;
		this._plusOutput = null;
		this._scale = null;
	}; 


	return Tone.Scale;
});

define('Tone/component/DryWet',["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Scale"], function(Tone){

	

	/**
	 * @class  dry/wet knob.
	 *         equal power fading control values:
	 * 	       0 = 100% wet  -    0% dry
	 * 	       1 =   0% wet  -  100% dry
	 *
	 * @constructor
	 * @extends {Tone}
	 * @param {number=} initialDry
	 */		
	Tone.DryWet = function(initialDry){
		Tone.call(this);

		/**
		 *  connect this input to the dry signal
		 *  the dry signal is also the default input
		 *  
		 *  @type {GainNode}
		 */
		this.dry = this.input;

		/**
		 *  connect this input to the wet signal
		 *  
		 *  @type {GainNode}
		 */
		this.wet = this.context.createGain();

		/**
		 *  controls the amount of wet signal 
		 *  which is mixed into the dry signal
		 *  
		 *  @type {Tone.Signal}
		 */
		this.wetness = new Tone.Signal();
		
		/**
		 *  invert the incoming signal
		 *  @private
		 *  @type {Tone}
		 */
		this._invert = new Tone.Scale(0, 1, 1, 0);

		//connections
		this.dry.connect(this.output);
		this.wet.connect(this.output);
		//wet control
		this.chain(this.wetness, this.wet.gain);
		//dry control is the inverse of the wet
		this.chain(this.wetness, this._invert, this.dry.gain);
		this.setDry(this.defaultArg(initialDry, 0));
	};

	Tone.extend(Tone.DryWet);

	/**
	 * Set the dry value 
	 * 
	 * @param {number} val
	 * @param {Tone.Time=} rampTime
	 */
	Tone.DryWet.prototype.setDry = function(val, rampTime){
		this.setWet(1-val, rampTime);
	};

	/**
	 * Set the wet value
	 * 
	 * @param {number} val
	 * @param {Tone.Time=} rampTime
	 */
	Tone.DryWet.prototype.setWet = function(val, rampTime){
		if (rampTime){
			this.wetness.linearRampToValueNow(val, rampTime);
		} else {
			this.wetness.setValue(val);
		}
	};

	/**
	 *  clean up
	 */
	Tone.DryWet.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.dry.disconnect();
		this.wet.disconnect();
		this.wetness.dispose();
		this._invert.dispose();
		this.dry = null;
		this.wet = null;
		this.wetness = null;
		this._invert = null;
	};

	return Tone.DryWet;
});

define('Tone/component/Filter',["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class  Filter object which allows for all of the same native methods
	 *          as the BiquadFilter (with AudioParams implemented as Tone.Signals)
	 *          but adds the ability to set the filter rolloff at -12 (default), 
	 *          -24 and -48. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number|Object=} freq the frequency
	 *  @param {string=} type the type of filter
	 *  @param {number=} [rolloff=-12] the rolloff which is the drop per octave. 
	 *                                 3 choices: -12, -24, and -48
	 */
	Tone.Filter = function(){
		Tone.call(this);

		var options = this.optionsObject(arguments, ["frequency", "type", "rolloff"], Tone.Filter.defaults);

		/**
		 *  the filter(s)
		 *  @type {Array.<BiquadFilterNode>}
		 *  @private
		 */
		this._filters = [];

		/**
		 *  the frequency of the filter
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(options.frequency);

		/**
		 *  the detune parameter
		 *  @type {Tone.Signal}
		 */
		this.detune = new Tone.Signal(0);

		/**
		 *  the gain of the filter, only used in certain filter types
		 *  @type {AudioParam}
		 */
		this.gain = new Tone.Signal(options.gain);

		/**
		 *  the Q or Quality of the filter
		 *  @type {Tone.Signal}
		 */
		this.Q = new Tone.Signal(options.Q);

		/**
		 *  the type of the filter
		 *  @type {string}
		 *  @private
		 */
		this._type = options.type;

		//set the rolloff and make the connections
		this.setRolloff(options.rolloff);
	};

	Tone.extend(Tone.Filter);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @type {Object}
	 */
	Tone.Filter.defaults = {
		"type" : "lowpass",
		"frequency" : 350,
		"rolloff" : -12,
		"Q" : 1,
		"gain" : 0,
	};

	/**
	 *  set the parameters at once
	 *  @param {Object} params
	 */
	Tone.Filter.prototype.set = function(params){
		if (!this.isUndef(params.type)) this.setType(params.type);
		if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
		if (!this.isUndef(params.frequency)) this.frequency.setValue(params.frequency);
		if (!this.isUndef(params.Q)) this.Q.setValue(params.Q);
		if (!this.isUndef(params.gain)) this.gain.setValue(params.gain);
		if (!this.isUndef(params.rolloff)) this.setRolloff(params.rolloff);
	};

	/**
	 *  set the type
	 *  @param {string} type the filter type
	 */
	Tone.Filter.prototype.setType = function(type){
		this._type = type;
		for (var i = 0; i < this._filters.length; i++){
			this._filters[i].type = type;
		}
	};

	/**
	 *  get the type
	 *  @return {string} the type of the filter
	 */
	Tone.Filter.prototype.getType = function(){
		return this._type;
	};

	/**
	 *  set the frequency
	 *  @param {number} freq the frequency value
	 */
	Tone.Filter.prototype.setFrequency = function(freq){
		this.frequency.setValue(freq);
	};

	/**
	 *  set the quality of the filter
	 *  @param {number} Q the filter's Q
	 */
	Tone.Filter.prototype.setQ = function(Q){
		this.Q.setValue(Q);
	};

	/**
	 *  set the rolloff frequency which is the drop in db
	 *  per octave. implemented internally by cascading filters
	 *  
	 *  @param {number} rolloff the slope of the rolloff. only accepts
	 *                          -12, -24, and -48. 
	 */
	Tone.Filter.prototype.setRolloff = function(rolloff){
		var cascadingCount = Math.log(rolloff / -12) / Math.LN2 + 1;
		//check the rolloff is valid
		if (cascadingCount % 1 !== 0){
			throw new RangeError("Filter rolloff can only be -12, -24, or -48");
		}
		//first disconnect the filters and throw them away
		this.input.disconnect();
		for (var i = 0; i < this._filters.length; i++) {
			this._filters[i].disconnect();
			this._filters[i] = null;
		}
		this._filters = new Array(cascadingCount);
		for (var count = 0; count < cascadingCount; count++){
			var filter = this.context.createBiquadFilter();
			filter.type = this._type;
			this.frequency.connect(filter.frequency);
			this.detune.connect(filter.detune);
			this.Q.connect(filter.Q);
			this.gain.connect(filter.gain);
			this._filters[count] = filter;
		}
		//connect them up
		var connectionChain = [this.input].concat(this._filters).concat([this.output]);
		this.chain.apply(this, connectionChain);
	};

	/**
	 *  clean up
	 */
	Tone.Filter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		for (var i = 0; i < this._filters.length; i++) {
			this._filters[i].disconnect();
			this._filters[i] = null;
		}
		this.frequency.dispose();
		this.Q.dispose();
		this.detune.dispose();
		this.gain.dispose();
		this._filters = null;
		this.frequency = null;
		this.Q = null;
		this.gain = null;
		this.detune = null;
	};

	return Tone.Filter;
});
define('Tone/component/EQ',["Tone/core/Tone", "Tone/signal/Signal", "Tone/component/Filter"], function(Tone){

	

	/**
	 *  @class A 3 band EQ with control over low, mid, and high gain as
	 *         well as the low and high crossover frequencies. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  
	 *  @param {number|object} [lowLevel=0] the gain applied to the lows (in db)
	 *  @param {number} [midLevel=0] the gain applied to the mid (in db)
	 *  @param {number} [highLevel=0] the gain applied to the high (in db)
	 */
	Tone.EQ = function(){

		Tone.call(this);

		var options = this.optionsObject(arguments, ["low", "mid", "high"], Tone.EQ.defaults);

		/**
		 *  the low band
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this._lowFilter = new Tone.Filter(0, "lowpass");

		/**
		 *  the lower filter of the mid band
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this._lowMidFilter = new Tone.Filter(0, "highpass");

		/**
		 *  the lower filter of the mid band
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this._highMidFilter = new Tone.Filter(0, "lowpass");

		/**
		 *  the high filter
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this._highFilter = new Tone.Filter(0, "highpass");

		/**
		 *  the crossover frequency for lows
		 *  @type {Tone.Signal}
		 */
		this.lowFrequency = new Tone.Signal(options.lowFrequency);

		/**
		 *  the crossover frequency for highs
		 *  @type {Tone.Signal}
		 */
		this.highFrequency = new Tone.Signal(options.highFrequency);

		/**
		 *  the low gain
		 *  @type {GainNode}
		 */
		this.lowGain = this.context.createGain();

		/**
		 *  the mid gain
		 *  @type {GainNode}
		 */
		this.midGain = this.context.createGain();

		/**
		 *  the high gain
		 *  @type {GainNode}
		 */
		this.highGain = this.context.createGain();

		//the frequency bands
		this.chain(this.input, this._lowFilter, this.lowGain, this.output);
		this.chain(this.input, this._lowMidFilter, this._highMidFilter, this.midGain, this.output);
		this.chain(this.input, this._highFilter, this.highGain, this.output);
		//frequency control
		this.lowFrequency.connect(this._lowFilter.frequency);
		this.lowFrequency.connect(this._lowMidFilter.frequency);
		this.highFrequency.connect(this._highMidFilter.frequency);
		this.highFrequency.connect(this._highFilter.frequency);
		//set the gains
		this.setLow(options.low);
		this.setMid(options.mid);
		this.setHigh(options.high);
	};

	Tone.extend(Tone.EQ);

	/**
	 *  the default values
	 *  @type {Object}
	 *  @static
	 */
	Tone.EQ.defaults = {
		"low" : 0,
		"mid" : 0,
		"high" : 0,
		"lowFrequency" : 400,
		"highFrequency" : 2500
	};

	/**
	 *  set the values in bulk
	 *  @param {object} params the parameters
	 */
	Tone.EQ.prototype.set = function(params){
		if (!this.isUndef(params.mid)) this.setMid(params.mid);
		if (!this.isUndef(params.high)) this.setHigh(params.high);
		if (!this.isUndef(params.low)) this.setLow(params.low);
		if (!this.isUndef(params.lowFrequency)) this.lowFrequency.setValue(params.lowFrequency);
		if (!this.isUndef(params.highFrequency)) this.highFrequency.setValue(params.highFrequency);
	};

	/**
	 *  set the mid range
	 *  @param {number} db the db of the mids
	 */
	Tone.EQ.prototype.setMid = function(db){
		this.midGain.gain.value = this.dbToGain(db);
	};

	/**
	 *  set the high range
	 *  @param {number} db the db of the highs
	 */
	Tone.EQ.prototype.setHigh = function(db){
		this.highGain.gain.value = this.dbToGain(db);
	};

	/**
	 *  set the low range
	 *  @param {number} db the db of the lows
	 */
	Tone.EQ.prototype.setLow = function(db){
		this.lowGain.gain.value = this.dbToGain(db);
	};

	/**
	 *  clean up
	 */
	Tone.EQ.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._lowFilter.dispose();
		this._lowMidFilter.dispose();
		this._highMidFilter.dispose();
		this._highFilter.dispose();
		this.lowFrequency.dispose();
		this.highFrequency.dispose();
		this.lowGain.disconnect();
		this.midGain.disconnect();
		this.highGain.disconnect();
		this._lowFilter = null;
		this._lowMidFilter = null;
		this._highMidFilter = null;
		this._highFilter = null;
		this.lowFrequency = null;
		this.highFrequency = null;
		this.lowGain = null;
		this.midGain = null;
		this.highGain = null;
	};

	return Tone.EQ;
});
define('Tone/signal/ScaleExp',["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Multiply", "Tone/signal/Signal"], function(Tone){
	
	/**
	 *  @class  performs an exponential scaling on an input signal.
	 *          Scales from the input range of inputMin to inputMax 
	 *          to the output range of outputMin to outputMax.
	 *
	 *  @description If only two arguments are provided, the inputMin and inputMax are set to -1 and 1
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} inputMin  
	 *  @param {number} inputMax  
	 *  @param {number} outputMin 
	 *  @param {number=} outputMax 
	 *  @param {number=} [exponent=2] the exponent which scales the incoming signal
	 */
	Tone.ScaleExp = function(inputMin, inputMax, outputMin, outputMax, exponent){

		Tone.call(this);

		//if there are only two args
		if (arguments.length === 2){
			outputMin = inputMin;
			outputMax = inputMax;
			exponent = 2;
			inputMin = -1;
			inputMax = 1;
		} else if (arguments.length === 3){
			exponent = outputMin;
			outputMin = inputMin;
			outputMax = inputMax;
			inputMin = -1;
			inputMax = 1;
		}

		/** 
		 *  @private
		 *  @type {number}
		 */
		this._inputMin = inputMin;
		
		/** 
		 *  @private
		 *  @type {number}
		 */
		this._inputMax = inputMax;

		/** 
		 *  @private
		 *  @type {number}
		 */
		this._outputMin = outputMin;

		/** 
		 *  @private
		 *  @type {number}
		 */
		this._outputMax = outputMax;


		/** 
		 *  @private
		 *  @type {Tone.Add}
		 */
		this._plusInput = new Tone.Add(0);

		/** 
		 *  @private
		 *  @type {Tone.Multiply}
		 */
		this._normalize = new Tone.Multiply(1);

		/** 
		 *  @private
		 *  @type {Tone.Multiply}
		 */
		this._scale = new Tone.Multiply(1);

		/** 
		 *  @private
		 *  @type {Tone.Add}
		 */
		this._plusOutput = new Tone.Add(0);

		/**
		 *  @private
		 *  @type {WaveShaperNode}
		 */
		this._expScaler = this.context.createWaveShaper();

		//connections
		this.chain(this.input, this._plusInput, this._normalize, this._expScaler, this._scale, this._plusOutput, this.output);
		//set the scaling values
		this._setScalingParameters();
		this.setExponent(this.defaultArg(exponent, 2));
	};

	Tone.extend(Tone.ScaleExp);

	/**
	 *  set the scaling parameters
	 *  
	 *  @private
	 */
	Tone.ScaleExp.prototype._setScalingParameters = function(){
		//components
		this._plusInput.setValue(-this._inputMin);
		this._scale.setValue((this._outputMax - this._outputMin));
		this._normalize.setValue(1 / (this._inputMax - this._inputMin));
		this._plusOutput.setValue(this._outputMin);
	};

	/**
	 *  set the exponential scaling curve
	 *  @param {number} exp the exponent to raise the incoming signal to
	 */
	Tone.ScaleExp.prototype.setExponent = function(exp){
		var curveLength = 1024;
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = (i / (curveLength)) * 2 - 1;
			if (normalized >= 0){
				curve[i] = Math.pow(normalized, exp);
			} else {
				curve[i] = normalized;
			}
		}
		this._expScaler.curve = curve;
	};

	/**
	 *  set the input min value
	 *  @param {number} val 
	 */
	Tone.ScaleExp.prototype.setInputMin = function(val){
		this._inputMin = val;
		this._setScalingParameters();
	};

	/**
	 *  set the input max value
	 *  @param {number} val 
	 */
	Tone.ScaleExp.prototype.setInputMax = function(val){
		this._inputMax = val;
		this._setScalingParameters();
	};

	/**
	 *  set the output min value
	 *  @param {number} val 
	 */
	Tone.ScaleExp.prototype.setOutputMin = function(val){
		this._outputMin = val;
		this._setScalingParameters();
	};

	/**
	 *  set the output max value
	 *  @param {number} val 
	 */
	Tone.ScaleExp.prototype.setOutputMax = function(val){
		this._outputMax = val;
		this._setScalingParameters();
	};

	/**
	 *  borrows connect from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.ScaleExp.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.ScaleExp.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._plusInput.dispose();
		this._plusOutput.dispose();
		this._normalize.dispose();
		this._scale.dispose();
		this._expScaler.disconnect();
		this._plusInput = null;
		this._plusOutput = null;
		this._scale = null;
		this._normalize = null;
		this._expScaler = null;
	}; 


	return Tone.ScaleExp;
});

define('Tone/component/FeedbackCombFilter',["Tone/core/Tone", "Tone/signal/ScaleExp", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class A comb filter with feedback
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} [minDelay=0.1] the minimum delay time which the filter can have
	 */
	Tone.FeedbackCombFilter = function(minDelay){

		Tone.call(this);

		minDelay = this.defaultArg(minDelay, 0.01);
		//the delay * samplerate = number of samples. 
		// buffersize / number of samples = number of delays needed per buffer frame
		var delayCount = Math.ceil(this.bufferSize / (minDelay * this.context.sampleRate));
		//set some ranges
		delayCount = Math.min(delayCount, 10);
		delayCount = Math.max(delayCount, 1);

		/**
		 *  the number of filter delays
		 *  @type {number}
		 *  @private
		 */
		this._delayCount = delayCount;

		/**
		 *  @type {Array.<FilterDelay>}
		 *  @private
		 */
		this._delays = new Array(this._delayCount);

		/**
		 *  the delayTime control
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._delayTime = new Tone.Signal(1);

		/**
		 *  the resonance control
		 *  @type {Tone.Signal}
		 */
		this.resonance = new Tone.Signal(0.5);

		/**
		 *  scale the resonance value to the normal range
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._resScale = new Tone.ScaleExp(0, 1, 0.01, 1 / this._delayCount - 0.001, 0.5);

		/**
		 *  internal flag for keeping track of when frequency
		 *  correction has been used
		 *  @type {boolean}
		 *  @private
		 */
		this._highFrequencies = false;

		/**
		 *  the feedback node
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedback = this.context.createGain();

		//make the filters
		for (var i = 0; i < this._delayCount; i++) {
			var delay = this.context.createDelay();
			delay.connect(this._feedback);
			this._delayTime.connect(delay.delayTime);
			this._delays[i] = delay;
		}

		//connections
		this.input.connect(this._delays[0]);
		this._feedback.connect(this._delays[0]);
		this.chain.apply(this, this._delays);
		//resonance control
		this.chain(this.resonance, this._resScale, this._feedback.gain);
		this._feedback.connect(this.output);
		//set the delay to the min value initially
		this.setDelayTime(minDelay);
	};

	Tone.extend(Tone.FeedbackCombFilter);

	/**
	 *  set the delay time of the comb filter
	 *  auto corrects for sample offsets for small delay amounts
	 *  	
	 *  @param {number} delayAmount the delay amount
	 *  @param {Tone.Time=} time        when the change should occur
	 */
	Tone.FeedbackCombFilter.prototype.setDelayTime = function(delayAmount, time) {
		time = this.toSeconds(time);
		//the number of samples to delay by
		var sampleRate = this.context.sampleRate;
		var delaySamples = sampleRate * delayAmount;
		// delayTime corection when frequencies get high
		time = this.toSeconds(time);
		var cutoff = 100;
		if (delaySamples < cutoff){
			this._highFrequencies = true;
			var changeNumber = Math.round((delaySamples / cutoff) * this._delayCount);
			for (var i = 0; i < changeNumber; i++) {
				this._delays[i].delayTime.setValueAtTime(1 / sampleRate, time);
			}
			delayAmount = Math.floor(delaySamples) / sampleRate;
		} else if (this._highFrequencies){
			this._highFrequencies = false;
			for (var j = 0; j < this._delays.length; j++) {
				this._delays[j].delayTime.setValueAtTime(0, time);
			}
		}
		this._delayTime.setValueAtTime(delayAmount, time);
	};

	/**
	 *  clean up
	 */
	Tone.FeedbackCombFilter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		//dispose the filter delays
		for (var i = 0; i < this._delays.length; i++) {
			this._delays[i].disconnect();
			this._delays[i] = null;
		}
		this._delayTime.dispose();
		this.resonance.dispose();
		this._resScale.dispose();
		this._feedback.disconnect();
		this._delays = null;
		this.resonance = null;
		this._resScale = null;
		this._feedback = null;
		this._delayTime = null;
	};

	return Tone.FeedbackCombFilter;
});
define('Tone/signal/Threshold',["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class  Threshold an incoming signal. the signal is assumed to be in the normal range (-1 to 1)
	 *          Creates a threshold value such that signal above the value will equal 1, 
	 *          and below will equal 0.
	 *  
	 *  @constructor
	 *  @param {number=} [thresh=0] threshold value above which the output will equal 1 
	 *                          and below which the output will equal 0
	 *  @extends {Tone}
	 */
	Tone.Threshold = function(thresh){
		
		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._thresh = this.context.createWaveShaper();

		/**
		 *  make doubly sure that the input is thresholded by 
		 *  passing it through two waveshapers
		 *  
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._doubleThresh = this.context.createWaveShaper();

		/**
		 *  @type {WaveShaperNode}
		 */
		this.input = this._thresh;
		this.output = this._doubleThresh;

		this._thresh.connect(this._doubleThresh);

		this._setThresh(this._thresh, this.defaultArg(thresh, 0));
		this._setThresh(this._doubleThresh, 0.5);
	};

	Tone.extend(Tone.Threshold);

	/**
	 *  @param {number} thresh 
	 *  @private
	 */
	Tone.Threshold.prototype._setThresh = function(component, thresh){
		var curveLength = 1023;
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = (i / (curveLength - 1)) * 2 - 1;
			var val;
			if (normalized < thresh){
				val = 0;
			} else {
				val = 1;
			}
			curve[i] = val;
		}
		component.curve = curve;
	};

	/**
	 *  sets the threshold value
	 *  
	 *  @param {number} thresh number must be between -1 and 1
	 */
	Tone.Threshold.prototype.setThreshold = function(thresh){
		this._setThresh(this._thresh, thresh);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Threshold.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.Threshold.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._thresh.disconnect();
		this._doubleThresh.disconnect();
		this._thresh = null;
		this._doubleThresh = null;
	};

	return Tone.Threshold;
});
define('Tone/signal/EqualZero',["Tone/core/Tone", "Tone/signal/Threshold", "Tone/signal/Signal"], 
function(Tone){

	

	/**
	 *  @class  Output 1 if the signal is equal to 0, otherwise outputs 0
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.EqualZero = function(){
		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._equals = this.context.createWaveShaper();

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._thresh = new Tone.Threshold(1);

		/**
		 *  @type {WaveShaperNode}
		 */
		this.input = this._equals;

		this._equals.connect(this._thresh);

		this.output = this._thresh;


		this._setEquals();
	};

	Tone.extend(Tone.EqualZero);

	/**
	 *  @private
	 */
	Tone.EqualZero.prototype._setEquals = function(){
		var curveLength = 1023;
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = (i / (curveLength - 1)) * 2 - 1;
			if (normalized === 0){
				curve[i] = 1;
			} else {
				curve[i] = 0;
			}
		}
		this._equals.curve = curve;
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.EqualZero.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.EqualZero.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._equals.disconnect();
		this._thresh.dispose();
		this._equals = null;
		this._thresh = null;
	};

	return Tone.EqualZero;
});
define('Tone/signal/Equal',["Tone/core/Tone", "Tone/signal/EqualZero", "Tone/signal/Add", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class  Output 1 if the signal is equal to the value, otherwise outputs 0
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} value the number to compare the incoming signal to
	 */
	Tone.Equal = function(value){

		/**
		 *  subtract the value from the incoming signal
		 *  
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._adder = new Tone.Add(-value);
		/**
		 *  @type {Tone.EqualZero}
		 *  @private
		 */
		this._equals = new Tone.EqualZero();

		/**
		 *  @type {Tone.Add}
		 */
		this.input = this._adder;

		/**
		 *  @type {Tone.EqualZero}
		 */
		this.output = this._equals;

		this._adder.connect(this._equals);
	};

	Tone.extend(Tone.Equal);

	/**
	 * 	@param {number} value set the comparison value
	 */
	Tone.Equal.prototype.setValue = function(value){
		this._adder.setValue(-value);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Equal.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.Equal.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._equals.disconnect();
		this._adder.dispose();
		this._equals = null;
		this._adder = null;
	};

	return Tone.Equal;
});
define('Tone/signal/Select',["Tone/core/Tone", "Tone/signal/Equal", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class Select between any number of inputs, sending the one 
	 *         selected by the gate signal to the output
	 *
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [sourceCount=2] the number of inputs the switch accepts
	 */
	Tone.Select = function(sourceCount){

		sourceCount = this.defaultArg(sourceCount, 2);

		/**
		 *  the array of inputs
		 *  @type {Array<SelectGate>}
		 */
		this.input = new Array(sourceCount);

		/**
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the control signal
		 *  @type {Tone.Signal}
		 */
		this.gate = new Tone.Signal(0);

		//make all the inputs and connect them
		for (var i = 0; i < sourceCount; i++){
			var switchGate = new SelectGate(i);
			this.input[i] = switchGate;
			this.gate.connect(switchGate.selecter);
			switchGate.connect(this.output);
		}
	};

	Tone.extend(Tone.Select);

	/**
	 *  open one of the inputs and close the other
	 *  @param {number=} [which=0] open one of the gates (closes the other)
	 *  @param {Tone.Time} time the time when the switch will open
	 */
	Tone.Select.prototype.select = function(which, time){
		//make sure it's an integer
		which = Math.floor(which);
		this.gate.setValueAtTime(which, this.toSeconds(time));
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Select.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.Select.prototype.dispose = function(){
		this.gate.dispose();
		for (var i = 0; i < this.input.length; i++){
			this.input[i].dispose();
			this.input[i] = null;
		}
		Tone.prototype.dispose.call(this);
		this.gate = null;
	}; 

	////////////START HELPER////////////

	/**
	 *  helper class for Tone.Select representing a single gate
	 *  @constructor
	 *  @extends {Tone}
	 *  @internal only used by Tone.Select
	 */
	var SelectGate = function(num){

		/**
		 *  the selector
		 *  @type {Tone.Equal}
		 */
		this.selecter = new Tone.Equal(num);

		/**
		 *  the gate
		 *  @type {GainNode}
		 */
		this.gate = this.input = this.output = this.context.createGain();

		//connect the selecter to the gate gain
		this.selecter.connect(this.gate.gain);
	};

	Tone.extend(SelectGate);

	/**
	 *  clean up
	 *  @private
	 */
	SelectGate.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.selecter.dispose();
		this.gate.disconnect();
		this.selecter = null;
		this.gate = null;
	};

	////////////END HELPER////////////

	//return Tone.Select
	return Tone.Select;
});
define('Tone/signal/Negate',["Tone/core/Tone", "Tone/signal/Multiply", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class Negate the incoming signal. i.e. an input signal of 10 will output -10
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Negate = function(){
		/**
		 *  negation is done by multiplying by -1
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._multiply = new Tone.Multiply(-1);

		/**
		 *  the input and output
		 */
		this.input = this.output = this._multiply;
	};

	Tone.extend(Tone.Negate);

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Negate.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Negate.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._multiply.dispose();
		this._multiply = null;
	}; 

	return Tone.Negate;
});
define('Tone/signal/Not',["Tone/core/Tone", "Tone/signal/EqualZero"], function(Tone){

	

	Tone.Not = Tone.EqualZero;

	return Tone.Not;
});
define('Tone/signal/LessThan',["Tone/core/Tone", "Tone/signal/Threshold", "Tone/signal/Add", "Tone/signal/Signal", "Tone/signal/Not"], function(Tone){

	

	/**
	 *  @class  Output 1 if the signal is less than the value, otherwise outputs 0
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [value=0] the value to compare to the incoming signal
	 */
	Tone.LessThan = function(value){

		/**
		 *  subtract the value from the incoming signal
		 *  
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._adder = new Tone.Add(this.defaultArg(-value, 0));

		/**
		 *  @type {Tone.Threshold}
		 *  @private
		 */
		this._thresh = new Tone.Threshold(0);

		/**
		 *  @type {Tone.Not}
		 *  @private
		 */
		this._not = new Tone.Not();

		/**
	 	 *  alias for the adder
		 *  @type {Tone.Add}
		 */
		this.input = this._adder;

		/**
		 *  alias for the thresh
		 *  @type {Tone.Threshold}
		 */
		this.output = this._not;

		//connect
		this.chain(this._adder, this._thresh, this._not);
	};

	Tone.extend(Tone.LessThan);

	/**
	 *  set the value to compare to
	 *  
	 *  @param {number} value
	 */
	Tone.LessThan.prototype.setValue = function(value){
		this._adder.setValue(-value);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.LessThan.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.LessThan.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._adder.disconnect();
		this._thresh.dispose();
		this._not.dispose();
		this._adder = null;
		this._thresh = null;
		this._not = null;
	};

	return Tone.LessThan;
});
define('Tone/signal/Abs',["Tone/core/Tone", "Tone/signal/Select", "Tone/signal/Negate", "Tone/signal/LessThan", "Tone/signal/Signal"], 
function(Tone){

	

	/**
	 *  @class return the absolute value of an incoming signal
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Abs = function(){
		Tone.call(this);

		/**
		 *  @type {Tone.LessThan}
		 *  @private
		 */
		this._ltz = new Tone.LessThan(0);

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._switch = new Tone.Select(2);
		
		/**
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._negate = new Tone.Negate();

		//two signal paths, positive and negative
		this.input.connect(this._switch, 0, 0);
		this.input.connect(this._negate);
		this._negate.connect(this._switch, 0, 1);
		this._switch.connect(this.output);
		
		//the control signal
		this.chain(this.input, this._ltz, this._switch.gate);
	};

	Tone.extend(Tone.Abs);

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Abs.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.Abs.prototype.dispose = function(){
		this._switch.dispose();
		this._ltz.dispose();
		this._negate.dispose();
		this.input.disconnect();
		this.output.disconnect();
		this._switch = null;
		this._ltz = null;
		this._negate = null;
		this.input = null;
		this.output = null;
	}; 

	return Tone.Abs;
});
define('Tone/component/Follower',["Tone/core/Tone", "Tone/signal/Abs", "Tone/signal/Negate", "Tone/signal/Multiply", "Tone/signal/Signal"], 
function(Tone){

	

	/**
	 *  @class  Follow the envelope of the incoming signal. 
	 *          Careful with small (< 0.02) attack or decay values. 
	 *          The follower has some ripple which gets exaggerated
	 *          by small values. 
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Tone.Time=} [attack = 0.05] 
	 *  @param {Tone.Time=} [release = 0.5] 
	 */
	Tone.Follower = function(){

		Tone.call(this);
		var options = this.optionsObject(arguments, ["attack", "release"], Tone.Follower.defaults);

		/**
		 *  @type {Tone.Abs}
		 *  @private
		 */
		this._abs = new Tone.Abs();

		/**
		 *  the lowpass filter which smooths the input
		 *  @type {BiquadFilterNode}
		 *  @private
		 */
		this._filter = this.context.createBiquadFilter();
		this._filter.type = "lowpass";
		this._filter.frequency.value = 0;
		this._filter.Q.value = -100;

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._frequencyValues = this.context.createWaveShaper();
		
		/**
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._negate = new Tone.Negate();

		/**
		 *  @type {GainNode}
		 *  @private
		 */
		this._difference = this.context.createGain();

		/**
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delay = this.context.createDelay();
		this._delay.delayTime.value = 0.02; //20 ms delay

		/**
		 *  this keeps it far from 0, even for very small differences
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._mult = new Tone.Multiply(1000);

		/**
		 *  @private
		 *  @type {number}
		 */
		this._attack = this.secondsToFrequency(options.attack);

		/**
		 *  @private
		 *  @type {number}
		 */
		this._release = this.secondsToFrequency(options.release);

		//the smoothed signal to get the values
		this.chain(this.input, this._abs, this._filter, this.output);
		//the difference path
		this.chain(this._abs, this._negate, this._difference);
		this.chain(this._filter, this._delay, this._difference);
		//threshold the difference and use the thresh to set the frequency
		this.chain(this._difference, this._mult, this._frequencyValues, this._filter.frequency);
		//set the attack and release values in the table
		this._setAttackRelease(this._attack, this._release);
	};

	Tone.extend(Tone.Follower);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Follower.defaults = {
		"attack" : 0.05, 
		"release" : 0.5
	};

	/**
	 *  sets the attack and release times in the wave shaper
	 *  @param   {number} attack  
	 *  @param   {number} release 
	 *  @private
	 */
	Tone.Follower.prototype._setAttackRelease = function(attack, release){
		var curveLength = 1024;
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = (i / (curveLength - 1)) * 2 - 1;
			var val;
			if (normalized <= 0){
				val = attack;
			} else {
				val = release;
			} 
			curve[i] = val;
		}
		this._frequencyValues.curve = curve;
	};

	/**
	 *  set the attack time
	 *  @param {Tone.Time} attack
	 */
	Tone.Follower.prototype.setAttack = function(attack){
		this._attack = this.secondsToFrequency(attack);
		this._setAttackRelease(this._attack, this._release);
	};

	/**
	 *  set the release time
	 *  @param {Tone.Time} release
	 */
	Tone.Follower.prototype.setRelease = function(release){
		this._release = this.secondsToFrequency(release);
		this._setAttackRelease(this._attack, this._release);
	};

	/**
	 *  setter in bulk
	 *  @param {Object} params 
	 */
	Tone.Follower.prototype.set = function(params){
		if (!this.isUndef(params.attack)) this.setAttack(params.attack);
		if (!this.isUndef(params.release)) this.setRelease(params.release);
		Tone.Effect.prototype.set.call(this, params);
	};

	/**
	 *  borrows the connect method from Signal so that the output can be used
	 *  as a control signal {@link Tone.Signal}
	 */
	Tone.Follower.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose
	 */
	Tone.Follower.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._filter.disconnect();
		this._frequencyValues.disconnect();
		this._delay.disconnect();
		this._difference.disconnect();
		this._abs.dispose();
		this._negate.dispose();
		this._mult.dispose();
		this._filter = null;
		this._delay = null;
		this._frequencyValues = null;
		this._abs = null;
		this._negate = null;
		this._difference = null;
		this._mult = null;
	};

	return Tone.Follower;
});
define('Tone/signal/GreaterThan',["Tone/core/Tone", "Tone/signal/LessThan", "Tone/signal/Negate", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class  Output 1 if the signal is greater than the value, otherwise outputs 0
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [value=0] the value to compare to the incoming signal
	 */
	Tone.GreaterThan = function(value){
		/**
		 *  @type {Tone.LessThan}
		 *  @private
		 */
		this._lt = new Tone.LessThan(-value);

		/**
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._neg = new Tone.Negate();

		/**
	 	 *  alias for the adder
		 *  @type {Tone.Add}
		 */
		this.input = this._neg;

		/**
		 *  alias for the thresh
		 *  @type {Tone.Threshold}
		 */
		this.output = this._lt;

		//connect
		this._neg.connect(this._lt);
	};

	Tone.extend(Tone.GreaterThan);

	/**
	 *  set the value to compare to
	 *  
	 *  @param {number} value
	 */
	Tone.GreaterThan.prototype.setValue = function(value){
		this._lt.setValue(-value);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.GreaterThan.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.GreaterThan.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._lt.disconnect();
		this._neg.disconnect();
		this._lt = null;
		this._neg = null;
	};

	return Tone.GreaterThan;
});
define('Tone/component/Gate',["Tone/core/Tone", "Tone/component/Follower", "Tone/signal/GreaterThan"], function(Tone){

	

	/**
	 *  @class  Only pass signal through when it's signal exceeds the
	 *          specified threshold.
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [thresh = -40] the threshold in Decibels
	 *  @param {number=} [attackTime = 0.1] the follower's attacktime
	 *  @param {number=} [releaseTime = 0.1] the follower's release time
	 */
	Tone.Gate = function(thresh, attackTime, releaseTime){
		Tone.call(this);

		//default values
		thresh = this.defaultArg(thresh, -40);
		attackTime = this.defaultArg(attackTime, 0.1);
		releaseTime = this.defaultArg(releaseTime, 0.2);

		/**
		 *  @type {Tone.Follower}
		 *  @private
		 */
		this._follower = new Tone.Follower(attackTime, releaseTime);

		/**
		 *  @type {Tone.GreaterThan}
		 *  @private
		 */
		this._gt = new Tone.GreaterThan(this.dbToGain(thresh));

		//the connections
		this.chain(this.input, this.output);
		//the control signal
		this.chain(this.input, this._gt, this._follower, this.output.gain);
	};

	Tone.extend(Tone.Gate);

	/**
	 *  set the gating threshold
	 *  @param {number} thresh the gating threshold
	 */
	Tone.Gate.prototype.setThreshold = function(thresh){
		this._gt.setValue(this.dbToGain(thresh));
	};

	/**
	 *  set attack time of the follower
	 *  @param {Tone.Time} attackTime
	 */
	Tone.Gate.prototype.setAttack = function(attackTime){
		this._follower.setAttack(attackTime);
	};

	/**
	 *  set attack time of the follower
	 *  @param {Tone.Time} releaseTime
	 */
	Tone.Gate.prototype.setRelease = function(releaseTime){
		this._follower.setRelease(releaseTime);
	};

	/**
	 *  dispose
	 */
	Tone.Gate.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._follower.dispose();
		this._gt.dispose();
		this._follower = null;
		this._gt = null;
	};

	return Tone.Gate;
});
define('Tone/core/Clock',["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	
	
	/**
	 *  @class  a sample accurate clock built on an oscillator.
	 *          Invokes the onTick method at the set rate
	 *          NB: can cause audio glitches. use sparingly. 
	 *
	 * 	@internal
	 * 	@constructor
	 * 	@extends {Tone}
	 * 	@param {number} rate the rate of the callback
	 * 	@param {function} callback the callback to be invoked with the time of the audio event
	 * 	                           NB: it is very important that only 
	 */
	Tone.Clock = function(rate, callback){

		/**
		 *  the oscillator
		 *  @type {OscillatorNode}
		 *  @private
		 */
		this._oscillator = null;

		/**
		 *  the script processor which listens to the oscillator
		 *  @type {ScriptProcessorNode}
		 *  @private
		 */
		this._jsNode = this.context.createScriptProcessor(this.bufferSize, 1, 1);
		this._jsNode.onaudioprocess = this._processBuffer.bind(this);

		/**
		 *  the rate control signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._controlSignal = new Tone.Signal(1);

		/**
		 *  whether the tick is on the up or down
		 *  @type {boolean}
		 *  @private
		 */
		this._upTick = false;

		/**
		 *  the callback which is invoked on every tick
		 *  with the time of that tick as the argument
		 *  @type {function(number)}
		 */
		this.tick = this.defaultArg(callback, function(){});

		//setup
		this._jsNode.noGC();
		this.setRate(rate);
	};

	Tone.extend(Tone.Clock);

	/**
	 *  set the rate of the clock
	 *  optionally ramp to the rate over the rampTime
	 *  @param {Tone.Time} rate 
	 *  @param {Tone.Time=} rampTime 
	 */
	Tone.Clock.prototype.setRate = function(rate, rampTime){
		//convert the time to a to frequency
		var freqVal = this.secondsToFrequency(this.toSeconds(rate));
		if (!rampTime){
			this._controlSignal.cancelScheduledValues(0);
			this._controlSignal.setValue(freqVal);
		} else {
			this._controlSignal.exponentialRampToValueNow(freqVal, rampTime);
		}
	};

	/**
	 *  return the current rate
	 *  
	 *  @return {number} 
	 */
	Tone.Clock.prototype.getRate = function(){
		return this._controlSignal.getValue();
	};

	/**
	 *  start the clock
	 *  @param {Tone.Time} time the time when the clock should start
	 */
	Tone.Clock.prototype.start = function(time){
		//reset the oscillator
		this._oscillator = this.context.createOscillator();
		this._oscillator.type = "square";
		this._oscillator.connect(this._jsNode);
		//connect it up
		this._controlSignal.connect(this._oscillator.frequency);
		this._upTick = false;
		var startTime = this.toSeconds(time);
		this._oscillator.start(startTime);
		this._oscillator.onended = function(){};
	};

	/**
	 *  stop the clock
	 *  @param {Tone.Time} time the time when the clock should stop
	 *  @param {function} onend called when the oscilator stops
	 */
	Tone.Clock.prototype.stop = function(time, onend){
		var stopTime = this.toSeconds(time);
		this._oscillator.onended = onend;
		this._oscillator.stop(stopTime);
	};

	/**
	 *  @private
	 *  @param  {AudioProcessingEvent} event
	 */
	Tone.Clock.prototype._processBuffer = function(event){
		var now = this.defaultArg(event.playbackTime, this.now());
		var bufferSize = this._jsNode.bufferSize;
		var incomingBuffer = event.inputBuffer.getChannelData(0);
		var upTick = this._upTick;
		var self = this;
		for (var i = 0; i < bufferSize; i++){
			var sample = incomingBuffer[i];
			if (sample > 0 && !upTick){
				upTick = true;	
				//get the callback out of audio thread
				setTimeout(function(){
					//to account for the double buffering
					var tickTime = now + self.samplesToSeconds(i + bufferSize * 2);
					return function(){
						self.tick(tickTime);
					};
				}(), 0); // jshint ignore:line
			} else if (sample < 0 && upTick){
				upTick = false;
			}
		}
		this._upTick = upTick;
	};

	/**
	 *  clean up
	 */
	Tone.Clock.prototype.dispose = function(){
		this._jsNode.disconnect();
		this._controlSignal.dispose();
		if (this._oscillator){
			this._oscillator.onended();
			this._oscillator.disconnect();
		}
		this._jsNode.onaudioprocess = function(){};
		this._jsNode = null;
		this._controlSignal = null;
		this._oscillator = null;
	};

	return Tone.Clock;
});
define('Tone/core/Transport',["Tone/core/Tone", "Tone/core/Clock", "Tone/signal/Signal"], 
function(Tone){

	

	/**
	 *  Time can be descibed in a number of ways. 
	 *  Any Method which accepts Tone.Time as a parameter will accept: 
	 *  
	 *  Numbers, which will be taken literally as the time (in seconds). 
	 *  
	 *  Notation, ("4n", "8t") describes time in BPM and time signature relative values. 
	 *  
	 *  Transport Time, ("4:3:2") will also provide tempo and time signature relative times 
	 *  in the form BARS:QUARTERS:SIXTEENTHS.
	 *  
	 *  Frequency, ("8hz") is converted to the length of the cycle in seconds.
	 *  
	 *  Now-Relative, ("+1") prefix any of the above with "+" and it will be interpreted as 
	 *  "the current time plus whatever expression follows".
	 *  
	 *  Expressions, ("3:0 + 2 - (1m / 7)") any of the above can also be combined 
	 *  into a mathematical expression which will be evaluated to compute the desired time.
	 *  
	 *  No Argument, for methods which accept time, no argument will be interpreted as 
	 *  0 seconds or "now" (i.e. the currentTime) depending on the context.
	 *  
	 *  @typedef {number|string|undefined} Tone.Time 
	 */

	/**
	 *  @class  oscillator-based transport allows for simple musical timing
	 *          supports tempo curves and time changes
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Transport = function(){

		/**
		 *  watches the main oscillator for timing ticks
		 *  initially starts at 120bpm
		 *  
		 *  @private
		 *  @type {Tone.Clock}
		 */
		this._clock = new Tone.Clock(1, this._processTick.bind(this));

		/** 
		 *  @type {boolean}
		 */
		this.loop = false;

		/**
		 *  @type {TransportState}
		 */
		this.state = TransportState.STOPPED;
	};

	Tone.extend(Tone.Transport);

	/** 
	 * @private 
	 * @type {number} 
	 */
	var timelineTicks = 0;

	/** 
	 * @private 
	 * @type {number} 
	 */
	var transportTicks = 0;

	/** 
	 * @private
	 * @type {number}
	 */
	var tatum = 12;

	/** 
	 * @private
	 * @type {number}
	 */
	var transportTimeSignature = 4;

	/** 
	 * @private
	 * @type {number}
	 */
	var loopStart = 0;
	/** 
	 * @private
	 * @type {number}
	 */
	var loopEnd = tatum * 4;

	/** 
	 * @private
	 * @type {Array}
	 */
	var intervals = [];
	
	/** 
	 * @private
	 * @type {Array}
	 */
	var timeouts = [];
	
	/** 
	 * @private
	 * @type {Array}
	 */
	var transportTimeline = [];
	
	/** 
	 * @private
	 * @type {number}
	 */
	var timelineProgress = 0;

	/** 
	 *  All of the synced components
	 *  @private 
	 *  @type {Array<Tone>}
	 */
	var SyncedSources = [];

	/**
	 *  @enum
	 */
	 var TransportState = {
	 	STARTED : "started",
	 	PAUSED : "paused",
	 	STOPPED : "stopped"
	 };

	///////////////////////////////////////////////////////////////////////////////
	//	TICKS
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  called on every tick
	 *  @param   {number} tickTime clock relative tick time
	 *  @private
	 */
	Tone.Transport.prototype._processTick = function(tickTime){
		if (this.state === TransportState.STARTED){
			processIntervals(tickTime);
			processTimeouts(tickTime);
			processTimeline(tickTime);
			transportTicks += 1;
			timelineTicks += 1;
			if (this.loop){
				if (timelineTicks === loopEnd){
					this._setTicks(loopStart);
				}
			}
		}
	};

	/**
	 *  jump to a specific tick in the timeline
	 *  updates the timeline callbacks
	 *  
	 *  @param   {number} ticks the tick to jump to
	 *  @private
	 */
	Tone.Transport.prototype._setTicks = function(ticks){
		timelineTicks = ticks;
		for (var i = 0; i < transportTimeline.length; i++){
			var timeout = transportTimeline[i];
			if (timeout.callbackTick() >= ticks){
				timelineProgress = i;
				break;
			}
		}
	};

	///////////////////////////////////////////////////////////////////////////////
	//	EVENT PROCESSING
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  process the intervals
	 *  @param  {number} time 
	 */
	var processIntervals = function(time){
		for (var i = 0, len = intervals.length; i<len; i++){
			var interval = intervals[i];
			if (interval.testInterval(transportTicks)){
				interval.doCallback(time);
			}
		}
	};

	/**
	 *  process the timeouts
	 *  @param  {number} time 
	 */
	var processTimeouts = function(time){
		var removeTimeouts = 0;
		for (var i = 0, len = timeouts.length; i<len; i++){
			var timeout = timeouts[i];
			var callbackTick = timeout.callbackTick();
			if (callbackTick <= transportTicks){
				timeout.doCallback(time);
				removeTimeouts++;
			} else if (callbackTick > transportTicks){
				break;
			} 
		}
		//remove the timeouts off the front of the array after they've been called
		timeouts.splice(0, removeTimeouts);
	};

	/**
	 *  process the transportTimeline events
	 *  @param  {number} time 
	 */
	var processTimeline = function(time){
		for (var i = timelineProgress, len = transportTimeline.length; i<len; i++){
			var evnt = transportTimeline[i];
			var callbackTick = evnt.callbackTick();
			if (callbackTick === timelineTicks){
				timelineProgress = i;
				evnt.doCallback(time);
			} else if (callbackTick > timelineTicks){
				break;
			} 
		}
	};

	///////////////////////////////////////////////////////////////////////////////
	//	INTERVAL
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  intervals are recurring events 
	 *
	 *  @example
	 *  //triggers a callback every 8th note with the exact time of the event
	 *  Tone.Transport.setInterval(function(time){
	 *  	envelope.triggerAttack(time);
	 *  }, "8n");
	 *  
	 *  @param {function} callback
	 *  @param {Tone.Time}   interval 
	 *  @param {Object}   ctx  the context the function is invoked in
	 *  @return {number} the id of the interval
	 */
	Tone.Transport.prototype.setInterval = function(callback, interval, ctx){
		var tickTime = this.toTicks(interval);
		var timeout = new TimelineEvent(callback, ctx, tickTime, transportTicks);
		intervals.push(timeout);
		return timeout.id;
	};

	/**
	 *  clear an interval from the processing array
	 *  @param  {number} rmInterval 	the interval to remove
	 *  @return {boolean}            	true if the event was removed
	 */
	Tone.Transport.prototype.clearInterval = function(rmInterval){
		for (var i = 0; i < intervals.length; i++){
			var interval = intervals[i];
			if (interval.id === rmInterval){
				intervals.splice(i, 1);
				return true;
			}
		}
		return false;
	};

	/**
	 *  removes all of the intervals that are currently set
	 */
	Tone.Transport.prototype.clearIntervals = function(){
		intervals = [];
	};

	///////////////////////////////////////////////////////////////////////////////
	//	TIMEOUT
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  set a timeout to occur after time from now. NB: the transport must be 
	 *  running for this to be triggered. All timeout events are cleared when the 
	 *  transport is stopped. 
	 *
	 *  @example
	 *  //trigger an event to happen 1 second from now
	 *  Tone.Transport.setTimeout(function(time){
	 *  	player.start(time);
	 *  }, 1)
	 *  
	 *  @param {function} callback 
	 *  @param {Tone.Time}   time     
	 *  @param {Object}   ctx      the context to invoke the callback in
	 *  @return {number} the id of the timeout for clearing timeouts
	 */
	Tone.Transport.prototype.setTimeout = function(callback, time, ctx){
		var ticks = this.toTicks(time);
		var timeout = new TimelineEvent(callback, ctx, ticks + transportTicks, 0);
		//put it in the right spot
		for (var i = 0, len = timeouts.length; i<len; i++){
			var testEvnt = timeouts[i];
			if (testEvnt.callbackTick() > timeout.callbackTick()){
				timeouts.splice(i, 0, timeout);
				return timeout.id;
			}
		}
		//otherwise push it on the end
		timeouts.push(timeout);
		return timeout.id;
	};

	/**
	 *  clear the timeout based on it's ID
	 *  @param  {number} timeoutID 
	 *  @return {boolean}           true if the timeout was removed
	 */
	Tone.Transport.prototype.clearTimeout = function(timeoutID){
		for (var i = 0; i < timeouts.length; i++){
			var testTimeout = timeouts[i];
			if (testTimeout.id === timeoutID){
				timeouts.splice(i, 1);
				return true;
			}
		}
		return false;
	};

	/**
	 *  removes all of the timeouts that are currently set
	 */
	Tone.Transport.prototype.clearTimeouts = function(){
		timeouts = [];
	};

	///////////////////////////////////////////////////////////////////////////////
	//	TIMELINE
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Timeline events are synced to the transportTimeline of the Tone.Transport
	 *  Unlike Timeout, Timeline events will restart after the 
	 *  Tone.Transport has been stopped and restarted. 
	 *
	 *  @example
	 *  //trigger the start of a part on the 16th measure
	 *  Tone.Transport.setTimeline(function(time){
	 *  	part.start(time);
	 *  }, "16m");
	 *
	 *  
	 *  @param {function} 	callback 	
	 *  @param {Tome.Time}  timeout  
	 *  @param {Object}   	ctx      	the context in which the funtion is called
	 *  @return {number} 				the id for clearing the transportTimeline event
	 */
	Tone.Transport.prototype.setTimeline = function(callback, timeout, ctx){
		var ticks = this.toTicks(timeout);
		var timelineEvnt = new TimelineEvent(callback, ctx, ticks, 0);
		//put it in the right spot
		for (var i = timelineProgress, len = transportTimeline.length; i<len; i++){
			var testEvnt = transportTimeline[i];
			if (testEvnt.callbackTick() > timelineEvnt.callbackTick()){
				transportTimeline.splice(i, 0, timelineEvnt);
				return timelineEvnt.id;
			}
		}
		//otherwise push it on the end
		transportTimeline.push(timelineEvnt);
		return timelineEvnt.id;
	};

	/**
	 *  clear the transportTimeline event from the 
	 *  @param  {number} timelineID 
	 *  @return {boolean} true if it was removed
	 */
	Tone.Transport.prototype.clearTimeline = function(timelineID){
		for (var i = 0; i < transportTimeline.length; i++){
			var testTimeline = transportTimeline[i];
			if (testTimeline.id === timelineID){
				transportTimeline.splice(i, 1);
				return true;
			}
		}
		return false;
	};

	/**
	 *  remove all events from the timeline
	 */
	Tone.Transport.prototype.clearTimelines = function(){
		timelineProgress = 0;
		transportTimeline = [];
	};

	///////////////////////////////////////////////////////////////////////////////
	//	TIME CONVERSIONS
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  turns the time into
	 *  @param  {Tone.Time} time
	 *  @return {number}      
	 */
	Tone.Transport.prototype.toTicks = function(time){
		//get the seconds
		var seconds = this.toSeconds(time);
		var quarter = this.notationToSeconds("4n");
		var quarters = seconds / quarter;
		var tickNum = quarters * tatum;
		//quantize to tick value
		return Math.round(tickNum);
	};

	/**
	 *  get the transport time
	 *  @return {string} in transportTime format (measures:beats:sixteenths)
	 */
	Tone.Transport.prototype.getTransportTime = function(){
		var quarters = timelineTicks / tatum;
		var measures = Math.floor(quarters / transportTimeSignature);
		var sixteenths = Math.floor((quarters % 1) * 4);
		quarters = Math.floor(quarters) % transportTimeSignature;
		var progress = [measures, quarters, sixteenths];
		return progress.join(":");
	};

	/**
	 *  set the transport time, jump to the position right away
	 *  	
	 *  @param {Tone.Time} progress 
	 */
	Tone.Transport.prototype.setTransportTime = function(progress){
		var ticks = this.toTicks(progress);
		this._setTicks(ticks);
	};

	///////////////////////////////////////////////////////////////////////////////
	//	START/STOP/PAUSE
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  start the transport and all sources synced to the transport
	 *  
	 *  @param  {Tone.Time} time
	 */
	Tone.Transport.prototype.start = function(time){
		if (this.state === TransportState.STOPPED || this.state === TransportState.PAUSED){
			this.state = TransportState.STARTED;
			var startTime = this.toSeconds(time);
			this._clock.start(startTime);
			//call start on each of the synced sources
			for (var i = 0; i < SyncedSources.length; i++){
				var source = SyncedSources[i].source;
				var delay = SyncedSources[i].delay;
				source.start(startTime + delay);
			}
		}
	};


	/**
	 *  stop the transport and all sources synced to the transport
	 *  
	 *  @param  {Tone.Time} time
	 */
	Tone.Transport.prototype.stop = function(time){
		if (this.state === TransportState.STARTED || this.state === TransportState.PAUSED){
			var stopTime = this.toSeconds(time);
			this._clock.stop(stopTime, this._onend.bind(this));
			//call start on each of the synced sources
			for (var i = 0; i < SyncedSources.length; i++){
				var source = SyncedSources[i].source;
				source.stop(stopTime);
			}
		} else {
			this._onend();
		}
	};

	/**
	 *  invoked when the transport is stopped
	 *  @private
	 */
	Tone.Transport.prototype._onend = function(){
		transportTicks = 0;
		this._setTicks(0);
		this.clearTimeouts();
		this.state = TransportState.STOPPED;
	};

	/**
	 *  pause the transport and all sources synced to the transport
	 *  
	 *  @param  {Tone.Time} time
	 */
	Tone.Transport.prototype.pause = function(time){
		if (this.state === TransportState.STARTED){
			this.state = TransportState.PAUSED;
			var stopTime = this.toSeconds(time);
			this._clock.stop(stopTime);
			//call pause on each of the synced sources
			for (var i = 0; i < SyncedSources.length; i++){
				var source = SyncedSources[i].source;
				source.pause(stopTime);
			}
		}
	};

	///////////////////////////////////////////////////////////////////////////////
	//	SETTERS/GETTERS
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  set the BPM
	 *  optionally ramp to the bpm over some time
	 *  @param {number} bpm   
	 *  @param {Tone.Time=} rampTime 
	 */
	Tone.Transport.prototype.setBpm = function(bpm, rampTime){
		var quarterTime = this.notationToSeconds(tatum.toString() + "n", bpm, transportTimeSignature) / 4;
		this._clock.setRate(quarterTime, rampTime);
	};

	/**
	 *  return the current BPM
	 *  
	 *  @return {number} 
	 */
	Tone.Transport.prototype.getBpm = function(){
		//convert the current frequency of the oscillator to bpm
		var freq = this._clock.getRate();
		return 60 * (freq / tatum);
	};

	/**
	 *  set the time signature
	 *  
	 *  @example
	 *  this.setTimeSignature(3, 8); // 3/8
	 *  this.setTimeSignature(4); // 4/4
	 *  
	 *  @param {number} numerator  the numerator of the time signature
	 *  @param {number=} [denominator=4] the denominator of the time signature. this should
	 *                                   be a multiple of 2. 
	 */
	Tone.Transport.prototype.setTimeSignature = function(numerator, denominator){
		denominator = this.defaultArg(denominator, 4);
		transportTimeSignature = numerator / (denominator / 4);
	};

	/**
	 *  return the time signature as just the numerator over 4. 
	 *  for example 4/4 would return 4 and 6/8 would return 3
	 *  
	 *  @return {number} 
	 */
	Tone.Transport.prototype.getTimeSignature = function(){
		return transportTimeSignature;
	};

	/**
	 *  set the loop start position
	 *  
	 *  @param {Tone.Time} startPosition
	 */
	Tone.Transport.prototype.setLoopStart = function(startPosition){
		loopStart = this.toTicks(startPosition);
	};

	/**
	 *  set the loop start position
	 *  
	 *  @param {Tone.Time} endPosition
	 */
	Tone.Transport.prototype.setLoopEnd = function(endPosition){
		loopEnd = this.toTicks(endPosition);
	};

	/**
	 *  shorthand loop setting
	 *  @param {Tone.Time} startPosition 
	 *  @param {Tone.Time} endPosition   
	 */
	Tone.Transport.prototype.setLoopPoints = function(startPosition, endPosition){
		this.setLoopStart(startPosition);
		this.setLoopEnd(endPosition);
	};

	///////////////////////////////////////////////////////////////////////////////
	//	SYNCING
	///////////////////////////////////////////////////////////////////////////////
	

	/**
	 *  Sync a source to the transport so that 
	 *  @param  {Tone.Source} source the source to sync to the transport
	 *  @param {Tone.Time} delay (optionally) start the source with a delay from the transport
	 */
	Tone.Transport.prototype.syncSource = function(source, startDelay){
		SyncedSources.push({
			source : source,
			delay : this.toSeconds(this.defaultArg(startDelay, 0))
		});
	};

	/**
	 *  remove the source from the list of Synced Sources
	 *  
	 *  @param  {Tone.Source} source [description]
	 */
	Tone.Transport.prototype.unsyncSource = function(source){
		for (var i = 0; i < SyncedSources.length; i++){
			if (SyncedSources[i].source === source){
				SyncedSources.splice(i, 1);
			}
		}
	};

	/**
	 *  attaches the signal to the tempo control signal so that 
	 *  any changes in the tempo will change the signal in the same
	 *  ratio
	 *  
	 *  @param  {Tone.Signal} signal 
	 */
	Tone.Transport.prototype.syncSignal = function(signal){
		//overreaching. fix this. 
		signal.sync(this._clock._controlSignal);
	};

	/**
	 *  clean up
	 */
	Tone.Transport.prototype.dispose = function(){
		this._clock.dispose();
		this._clock = null;
	};

	///////////////////////////////////////////////////////////////////////////////
	//	TIMELINE EVENT
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  @static
	 *  @type {number}
	 */
	var TimelineEventIDCounter = 0;

	/**
	 *  A Timeline event
	 *
	 *  @constructor
	 *  @internal
	 *  @param {function(number)} callback   
	 *  @param {Object}   context    
	 *  @param {number}   tickTime
 	 *  @param {number}   startTicks
	 */
	var TimelineEvent = function(callback, context, tickTime, startTicks){
		this.startTicks = startTicks;
		this.tickTime = tickTime;
		this.callback = callback;
		this.context = context;
		this.id = TimelineEventIDCounter++;
	};
	
	/**
	 *  invoke the callback in the correct context
	 *  passes in the playback time
	 *  
	 *  @param  {number} playbackTime 
	 */
	TimelineEvent.prototype.doCallback = function(playbackTime){
		this.callback.call(this.context, playbackTime); 
	};

	/**
	 *  get the tick which the callback is supposed to occur on
	 *  
	 *  @return {number} 
	 */
	TimelineEvent.prototype.callbackTick = function(){
		return this.startTicks + this.tickTime;
	};

	/**
	 *  test if the tick occurs on the interval
	 *  
	 *  @param  {number} tick 
	 *  @return {boolean}      
	 */
	TimelineEvent.prototype.testInterval = function(tick){
		return (tick - this.startTicks) % this.tickTime === 0;
	};


	///////////////////////////////////////////////////////////////////////////////
	//	AUGMENT TONE'S PROTOTYPE TO INCLUDE TRANSPORT TIMING
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  tests if a string is musical notation
	 *  i.e.:
	 *  	4n = quarter note
	 *   	2m = two measures
	 *    	8t = eighth-note triplet
	 *  
	 *  @return {boolean} 
	 *  @method isNotation
	 *  @lends Tone.prototype.isNotation
	 */
	Tone.prototype.isNotation = (function(){
		var notationFormat = new RegExp(/[0-9]+[mnt]$/i);
		return function(note){
			return notationFormat.test(note);
		};
	})();

	/**
	 *  tests if a string is in Tick notation
	 *  @return {boolean} 
	 *  @method isTicks
	 *  @lends Tone.prototype.isNotation
	 */
	Tone.prototype.isTicks = (function(){
		var tickFormat = new RegExp(/[0-9]+[i]$/i);
		return function(tick){
			return tickFormat.test(tick);
		};
	})();

	/**
	 *  tests if a string is transportTime
	 *  i.e. :
	 *  	1:2:0 = 1 measure + two quarter notes + 0 sixteenth notes
	 *  	
	 *  @return {boolean} 
	 *
	 *  @method isTransportTime
	 *  @lends Tone.prototype.isTransportTime
	 */
	Tone.prototype.isTransportTime = (function(){
		var transportTimeFormat = new RegExp(/^\d+(\.\d+)?:\d+(\.\d+)?(:\d+(\.\d+)?)?$/);
		return function(transportTime){
			return transportTimeFormat.test(transportTime);
		};
	})();

	/**
	 *  true if the input is in the format number+hz
	 *  i.e.: 10hz
	 *
	 *  @param {number} freq 
	 *  @return {boolean} 
	 *
	 *  @method isFrequency
	 *  @lends Tone.prototype.isFrequency
	 */
	Tone.prototype.isFrequency = (function(){
		var freqFormat = new RegExp(/[0-9]+hz$/i);
		return function(freq){
			return freqFormat.test(freq);
		};
	})();


	/**
	 *
	 *  convert notation format strings to seconds
	 *  @param  {string} notation     
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature 
	 *  @return {number} 
	 *                
	 */
	Tone.prototype.notationToSeconds = function(notation, bpm, timeSignature){
		bpm = this.defaultArg(bpm, Tone.Transport.getBpm());
		timeSignature = this.defaultArg(timeSignature, transportTimeSignature);
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

	/**
	 *  convert transportTime into seconds
	 *  
	 *  ie: 4:2:3 == 4 measures + 2 quarters + 3 sixteenths
	 *
	 *  @param  {string} transportTime 
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature
	 *  @return {number}               seconds
	 *
	 *  @lends Tone.prototype.transportTimeToSeconds
	 */
	Tone.prototype.transportTimeToSeconds = function(transportTime, bpm, timeSignature){
		bpm = this.defaultArg(bpm, Tone.Transport.getBpm());
		timeSignature = this.defaultArg(timeSignature, transportTimeSignature);
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
		return beats * this.notationToSeconds("4n");
	};

	/**
	 *  convert ticks into seconds
	 *  @param  {number} ticks 
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature
	 *  @return {number}               seconds
	 */
	Tone.prototype.ticksToSeconds = function(ticks, bpm, timeSignature){
		ticks = Math.floor(ticks);
		var quater = this.notationToSeconds("4n", bpm, timeSignature);
		return (quater * ticks) / (tatum);
	};

	/**
	 *  Convert seconds to the closest transportTime in the form 
	 *  	measures:quarters:sixteenths
	 *
	 *  @method toTransportTime
	 *  
	 *  @param {Tone.Time} seconds 
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature
	 *  @return {string}  
	 *  
	 *  @lends Tone.prototype.toTransportTime
	 */
	Tone.prototype.toTransportTime = function(time, bpm, timeSignature){
		var seconds = this.toSeconds(time, bpm, timeSignature);
		bpm = this.defaultArg(bpm, Tone.Transport.getBpm());
		timeSignature = this.defaultArg(timeSignature, transportTimeSignature);
		var quarterTime = this.notationToSeconds("4n");
		var quarters = seconds / quarterTime;
		var measures = Math.floor(quarters / timeSignature);
		var sixteenths = Math.floor((quarters % 1) * 4);
		quarters = Math.floor(quarters) % timeSignature;
		var progress = [measures, quarters, sixteenths];
		return progress.join(":");
	};

	/**
	 *  convert a time to a frequency
	 *  	
	 *  @param  {Tone.Time} time 
	 *  @return {number}      the time in hertz
	 */
	Tone.prototype.toFrequency = function(time, now){
		if (this.isFrequency(time)){
			return parseFloat(time);
		} else if (this.isNotation(time) || this.isTransportTime(time)) {
			return this.secondsToFrequency(this.toSeconds(time, now));
		} else {
			return time;
		}
	};

	/**
	 *  convert Tone.Time into seconds.
	 *  
	 *  unlike the method which it overrides, this takes into account 
	 *  transporttime and musical notation
	 *
	 *  Time : 1.40
	 *  Notation: 4n|1m|2t
	 *  TransportTime: 2:4:1 (measure:quarters:sixteens)
	 *  Now Relative: +3n
	 *  Math: 3n+16n or even very complicated expressions ((3n*2)/6 + 1)
	 *  Ticks: "146i"
	 *
	 *  @override
	 *  @param  {Tone.Time} time       
	 *  @param {number=} 	now 	if passed in, this number will be 
	 *                        		used for all 'now' relative timings
	 *  @return {number} 
	 */
	Tone.prototype.toSeconds = function(time, now){
		now = this.defaultArg(now, this.now());
		if (typeof time === "number"){
			return time; //assuming that it's seconds
		} else if (typeof time === "string"){
			var plusTime = 0;
			if(time.charAt(0) === "+") {
				plusTime = now;
				time = time.slice(1);				
			} 
			var components = time.split(/[\(\)\-\+\/\*]/);
			if (components.length > 1){
				var oringalTime = time;
				for(var i = 0; i < components.length; i++){
					var symb = components[i];
					if (symb !== ""){
						var val = this.toSeconds(symb.trim());
						time = time.replace(symb, val);
					}
				}
				try {
					//i know eval is evil, but i think it's safe here
					time = eval(time); // jshint ignore:line
				} catch (e){
					throw new EvalError("problem evaluating Tone.Time: "+oringalTime);
				}
			} else if (this.isNotation(time)){
				time = this.notationToSeconds(time);
			} else if (this.isTransportTime(time)){
				time = this.transportTimeToSeconds(time);
			} else if (this.isFrequency(time)){
				time = this.frequencyToSeconds(time);
			} else {
				time = parseFloat(time);
			}
			return time + plusTime;
		} else {
			return now;
		}
	};

	var TransportConstructor = Tone.Transport;
	//a single transport object
	Tone.Transport = new Tone.Transport();
	Tone.Transport.setBpm(120);

	Tone._initAudioContext(function(){
		//stop the clock
		Tone.Transport.stop();
		//get the previous bpm
		var bpm = Tone.Transport.getBpm();
		//destory the old clock
		Tone.Transport._clock.dispose();
		//make new Transport insides
		TransportConstructor.call(Tone.Transport);
		//set the bpm
		Tone.Transport.setBpm(bpm);

	});

	return Tone.Transport;
});

define('Tone/source/Source',["Tone/core/Tone", "Tone/core/Transport"], function(Tone){

	
	
	/**
	 *  @class  Base class for sources.
	 *          Sources have start/stop/pause and 
	 *          the ability to be synced to the 
	 *          start/stop/pause of Tone.Transport.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */	
	Tone.Source = function(){
		/**
		 *  unlike most ToneNodes, Sources only have an output and no input
		 *  
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  @type {Tone.Source.State}
		 */
		this.state = Tone.Source.State.STOPPED;
	};

	Tone.extend(Tone.Source);

	/**
	 *  @abstract
	 *  @param  {Tone.Time} time 
	 */
	Tone.Source.prototype.start = function(){};

	/**
 	 *  @abstract
	 *  @param  {Tone.Time} time 
	 */
	Tone.Source.prototype.stop = function(){};


	/**
 	 *  @abstract
	 *  @param  {Tone.Time} time 
	 */
	Tone.Source.prototype.pause = function(time){
		//if there is no pause, just stop it
		this.stop(time);
	};

	/**
	 *  sync the source to the Transport
	 *
	 *  @param {Tone.Time=} delay optional delay time before starting the source
	 */
	Tone.Source.prototype.sync = function(delay){
		Tone.Transport.syncSource(this, delay);
	};

	/**
	 *  unsync the source to the Transport
	 */
	Tone.Source.prototype.unsync = function(){
		Tone.Transport.unsyncSource(this);
	};


	/**
	 *  set the volume in decibels
	 *  @param {number} db in decibels
	 *  @param {Tone.Time=} fadeTime (optional) time it takes to reach the value
	 */
	Tone.Source.prototype.setVolume = function(db, fadeTime){
		var now = this.now();
		var gain = this.dbToGain(db);
		if (fadeTime){
			var currentVolume = this.output.gain.value;
			this.output.gain.cancelScheduledValues(now);
			this.output.gain.setValueAtTime(currentVolume, now);
			this.output.gain.linearRampToValueAtTime(gain, now + this.toSeconds(fadeTime));
		} else {
			this.output.gain.setValueAtTime(gain, now);
		}
	};

	/**
	 *	clean up  
	 */
	Tone.Source.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.state = null;
	};

	/**
	 *  @enum {string}
	 */
	Tone.Source.State = {
		STARTED : "started",
		PAUSED : "paused",
		STOPPED : "stopped",
		SYNCED : "synced"
 	};

	return Tone.Source;
});
define('Tone/source/Oscillator',["Tone/core/Tone", "Tone/signal/Signal", "Tone/source/Source"], 
function(Tone){

	

	/**
	 *  @class Oscilator with start, pause, stop and sync to Transport methods
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number|string=} frequency starting frequency
	 *  @param {string=} type type of oscillator (sine|square|triangle|sawtooth)
	 */
	Tone.Oscillator = function(){
		
		Tone.Source.call(this);
		var options = this.optionsObject(arguments, ["frequency", "type"], Tone.Oscillator.defaults);

		/**
		 *  the main oscillator
		 *  @type {OscillatorNode}
		 *  @private
		 */
		this.oscillator = this.context.createOscillator();
		
		/**
		 *  the frequency control signal
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(options.frequency);

		/**
		 *  the detune control signal
		 *  @type {Tone.Signal}
		 */
		this.detune = new Tone.Signal(options.detune);

		/**
		 *  callback which is invoked when the oscillator is stoped
		 *  @type {function()}
		 */
		this.onended = options.onended;

		/**
		 *  the periodic wave
		 *  @type {PeriodicWave}
		 *  @private
		 */
		this._wave = null;

		/**
		 *  the phase of the oscillator
		 *  between 0 - 360
		 *  @type {number}
		 *  @private
		 */
		this._phase = options.phase;

		/**
		 *  the type of the oscillator
		 *  @type {string}
		 *  @private
		 */
		this._type = options.type;
		
		//connections
		this.oscillator.connect(this.output);
		//setup
		this.setPhase(this._phase);
	};

	Tone.extend(Tone.Oscillator, Tone.Source);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @type {Object}
	 */
	Tone.Oscillator.defaults = {
		"type" : "sine",
		"frequency" : 440,
		"onended" : function(){},
		"detune" : 0,
		"phase" : 0
	};

	/**
	 *  start the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.Oscillator.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
			//get previous values
			//new oscillator with previous values
			this.oscillator = this.context.createOscillator();
			this.oscillator.setPeriodicWave(this._wave);
			//connect the control signal to the oscillator frequency & detune
			this.oscillator.connect(this.output);
			this.frequency.connect(this.oscillator.frequency);
			this.detune.connect(this.oscillator.detune);
			//start the oscillator
			this.oscillator.start(this.toSeconds(time));
			this.oscillator.onended = this._onended.bind(this);
		}
	};

	/**
	 *  stop the oscillator
	 *  @param  {Tone.Time=} time (optional) timing parameter
	 */
	Tone.Oscillator.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED){
			if (!time){
				this.state = Tone.Source.State.STOPPED;
			}
			this.oscillator.stop(this.toSeconds(time));
		}
	};

	/**
	 *  exponentially ramp the frequency of the oscillator over the rampTime
	 *  
	 *  @param {Tone.Time}	val
	 *  @param {Tone.Time=} rampTime when the oscillator will arrive at the frequency
	 */
	Tone.Oscillator.prototype.setFrequency = function(val, rampTime){
		if (rampTime){
			this.frequency.exponentialRampToValueAtTime(this.toFrequency(val), this.toSeconds(rampTime));
		} else {
			this.frequency.setValue(this.toFrequency(val));
		}
	};

	/**
	 *  set the oscillator type
	 *
	 *  uses PeriodicWave even for native types so that it can set the phase
	 *
	 *  the the PeriodicWave equations are from the Web Audio Source code
	 *  here: https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/modules/webaudio/PeriodicWave.cpp&sq=package:chromium
	 *  
	 *  @param {string} type (sine|square|triangle|sawtooth)
	 */
	Tone.Oscillator.prototype.setType = function(type){
		var fftSize = 4096;
		var halfSize = fftSize / 2;

		var real = new Float32Array(halfSize);
		var imag = new Float32Array(halfSize);
		
		// Clear DC and Nyquist.
		real[0] = 0;
		imag[0] = 0;

		var shift = this._phase;	
		for (var n = 1; n < halfSize; ++n) {
			var piFactor = 2 / (n * Math.PI);
			var b; 
			switch (type) {
				case "sine": 
					b = (n === 1) ? 1 : 0;
					break;
				case "square":
					b = (n & 1) ? 2 * piFactor : 0;
					break;
				case "sawtooth":
					b = piFactor * ((n & 1) ? 1 : -1);
					break;
				case "triangle":
					if (n & 1) {
						b = 2 * (piFactor * piFactor) * ((((n - 1) >> 1) & 1) ? -1 : 1);
					} else {
						b = 0;
					}
					break;
				default:
					throw new TypeError("invalid oscillator type: "+type);
			}
			if (b !== 0){
				real[n] = -b * Math.sin(shift);
				imag[n] = b * Math.cos(shift);
			} else {
				real[n] = 0;
				imag[n] = 0;
			}
		}
		var periodicWave = this.context.createPeriodicWave(real, imag);
		this._wave = periodicWave;
		this.oscillator.setPeriodicWave(this._wave);
		this._type = type;
	};

	/**
	 *  @return {string} the type of oscillator
	 */
	Tone.Oscillator.prototype.getType = function() {
		return this._type;
	};

	/**
	 *  set the phase of the oscillator (in degrees)
	 *  @param {number} degrees the phase in degrees
	 */
	Tone.Oscillator.prototype.setPhase = function(phase) {
		this._phase = phase * Math.PI / 180;
		this.setType(this._type);
	};

	/**
	 *  set the parameters at once
	 *  @param {Object} params
	 */
	Tone.Oscillator.prototype.set = function(params){
		if (!this.isUndef(params.type)) this.setType(params.type);
		if (!this.isUndef(params.phase)) this.setPhase(params.phase);
		if (!this.isUndef(params.frequency)) this.frequency.setValue(params.frequency);
		if (!this.isUndef(params.onended)) this.onended = params.onended;
		if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
	};

	/**
	 *  internal on end call
	 *  @private
	 */
	Tone.Oscillator.prototype._onended = function(){
		this.state = Tone.Source.State.STOPPED;
		this.onended();
	};

	/**
	 *  dispose and disconnect
	 */
	Tone.Oscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this.stop();
		if (this.oscillator !== null){
			this.oscillator.disconnect();
			this.oscillator = null;
		}
		this.frequency.dispose();
		this.detune.dispose();
		this._wave = null;
		this.detune = null;
		this.frequency = null;
	};

	return Tone.Oscillator;
});
define('Tone/component/LFO',["Tone/core/Tone", "Tone/source/Oscillator", "Tone/signal/Scale", "Tone/signal/Signal"], 
function(Tone){

	

	/**
	 *  @class  The Low Frequency Oscillator produces an output signal 
	 *          which can be attached to an AudioParam or Tone.Signal 
	 *          for constant control over that parameter. the LFO can 
	 *          also be synced to the transport to start/stop/pause
	 *          and change when the tempo changes.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} rate      
	 *  @param {number=} outputMin 
	 *  @param {number=} outputMax
	 */
	Tone.LFO = function(rate, outputMin, outputMax){

		/** 
		 *  the oscillator
		 *  @type {Tone.Oscillator}
		 */
		this.oscillator = new Tone.Oscillator(this.defaultArg(rate, 1), "sine");

		/**
		 *  pointer to the oscillator's frequency
		 *  @type {Tone.Signal}
		 */
		this.frequency = this.oscillator.frequency;

		/**
		 *  @type {Tone.Scale} 
		 *  @private
		 */
		this._scaler = new Tone.Scale(this.defaultArg(outputMin, 0), this.defaultArg(outputMax, 1));

		/** 
		 *  alias for the output
		 *  @type {Tone.Scale}
		 */
		this.output = this._scaler;

		//connect it up
		this.chain(this.oscillator, this.output);
	};

	Tone.extend(Tone.LFO);

	/**
	 *  start the LFO
	 *  @param  {Tone.Time=} [time=now] the time the LFO will start
	 */
	Tone.LFO.prototype.start = function(time){
		this.oscillator.start(time);
	};

	/**
	 *  stop the LFO
	 *  @param  {Tone.Time=} [time=now] the time the LFO will stop
	 */
	Tone.LFO.prototype.stop = function(time){
		this.oscillator.stop(time);
	};

	/**
	 *  Sync the start/stop/pause to the transport 
	 *  and the frequency to the bpm of the transport
	 *
	 *  @param {Tone.Time=} [delay=0] the time to delay the start of the
	 *                                LFO from the start of the transport
	 */
	Tone.LFO.prototype.sync = function(delay){
		Tone.Transport.syncSource(this.oscillator, delay);
		Tone.Transport.syncSignal(this.oscillator.frequency);
	};

	/**
	 *  unsync the LFO from transport control
	 */
	Tone.LFO.prototype.unsync = function(){
		Tone.Transport.unsyncSource(this.oscillator);
		Tone.Transport.unsyncSignal(this.oscillator.frequency);
	};


	/**
	 *  set the frequency
	 *  @param {number} rate 
	 */
	Tone.LFO.prototype.setFrequency = function(rate){
		this.oscillator.setFrequency(rate);
	};

	/**
	 *  set the phase
	 *  @param {number} phase 
	 */
	Tone.LFO.prototype.setPhase = function(phase){
		this.oscillator.setPhase(phase);
	};

	/**
	 *  set the minimum output of the LFO
	 *  @param {number} min 
	 */
	Tone.LFO.prototype.setMin = function(min){
		this._scaler.setOutputMin(min);
	};

	/**
	 *  Set the maximum output of the LFO
	 *  @param {number} min 
	 */
	Tone.LFO.prototype.setMax = function(max){
		this._scaler.setOutputMax(max);
	};

	/**
	 *  Set the waveform of the LFO
	 *  @param {string} type 
	 */
	Tone.LFO.prototype.setType = function(type){
		this.oscillator.setType(type);
	};

	/**
	 *  set all of the parameters with an object
	 *  @param {Object} params 
	 */
	Tone.LFO.prototype.set = function(params){
		if (!this.isUndef(params.frequency)) this.setFrequency(params.frequency);
		if (!this.isUndef(params.type)) this.setType(params.type);
		if (!this.isUndef(params.min)) this.setMin(params.min);
		if (!this.isUndef(params.max)) this.setMax(params.max);
	};

	/**
	 *	Override the connect method so that it 0's out the value 
	 *	if attached to an AudioParam or Tone.Signal. 
	 *	
	 *	Borrowed from {@link Tone.Signal}
	 *	
	 *  @function
	 */
	Tone.LFO.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  disconnect and dispose
	 */
	Tone.LFO.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.oscillator.dispose();
		this._scaler.dispose();
		this._scaler = null;
		this.oscillator = null;
		this.frequency = null;
	};

	return Tone.LFO;
});
define('Tone/component/LowpassCombFilter',["Tone/core/Tone", "Tone/signal/ScaleExp", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class A lowpass feedback comb filter. 
	 *         DelayNode -> Lowpass Filter -> feedback
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} [minDelay=0.1] the minimum delay time which the filter can have
	 */
	Tone.LowpassCombFilter = function(minDelay){

		Tone.call(this);

		minDelay = this.defaultArg(minDelay, 0.01);
		//the delay * samplerate = number of samples. 
		// buffersize / number of samples = number of delays needed per buffer frame
		var delayCount = Math.ceil(this.bufferSize / (minDelay * this.context.sampleRate));
		//set some ranges
		delayCount = Math.min(delayCount, 10);
		delayCount = Math.max(delayCount, 1);

		/**
		 *  the number of filter delays
		 *  @type {number}
		 *  @private
		 */
		this._filterDelayCount = delayCount;

		/**
		 *  @type {Array.<FilterDelay>}
		 *  @private
		 */
		this._filterDelays = new Array(this._filterDelayCount);

		/**
		 *  the delayTime control
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._delayTime = new Tone.Signal(1);

		/**
		 *  the dampening control
		 *  @type {Tone.Signal}
		 */
		this.dampening = new Tone.Signal(3000);

		/**
		 *  the resonance control
		 *  @type {Tone.Signal}
		 */
		this.resonance = new Tone.Signal(0.5);

		/**
		 *  scale the resonance value to the normal range
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._resScale = new Tone.ScaleExp(0, 1, 0.01, 1 / this._filterDelayCount - 0.001, 0.5);

		/**
		 *  internal flag for keeping track of when frequency
		 *  correction has been used
		 *  @type {boolean}
		 *  @private
		 */
		this._highFrequencies = false;

		/**
		 *  the feedback node
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedback = this.context.createGain();

		//make the filters
		for (var i = 0; i < this._filterDelayCount; i++) {
			var filterDelay = new FilterDelay(this._delayTime, this.dampening);
			filterDelay.connect(this._feedback);
			this._filterDelays[i] = filterDelay;
		}

		//connections
		this.input.connect(this._filterDelays[0]);
		this._feedback.connect(this._filterDelays[0]);
		this.chain.apply(this, this._filterDelays);
		//resonance control
		this.chain(this.resonance, this._resScale, this._feedback.gain);
		this._feedback.connect(this.output);
		//set the delay to the min value initially
		this.setDelayTime(minDelay);
	};

	Tone.extend(Tone.LowpassCombFilter);

	/**
	 *  set the delay time of the comb filter
	 *  auto corrects for sample offsets for small delay amounts
	 *  	
	 *  @param {number} delayAmount the delay amount
	 *  @param {Tone.Time=} time        when the change should occur
	 */
	Tone.LowpassCombFilter.prototype.setDelayTime = function(delayAmount, time) {
		time = this.toSeconds(time);
		//the number of samples to delay by
		var sampleRate = this.context.sampleRate;
		var delaySamples = sampleRate * delayAmount;
		// delayTime corection when frequencies get high
		time = this.toSeconds(time);
		var cutoff = 100;
		if (delaySamples < cutoff){
			this._highFrequencies = true;
			var changeNumber = Math.round((delaySamples / cutoff) * this._filterDelayCount);
			for (var i = 0; i < changeNumber; i++) {
				this._filterDelays[i].setDelay(1 / sampleRate, time);
			}
			delayAmount = Math.floor(delaySamples) / sampleRate;
		} else if (this._highFrequencies){
			this._highFrequencies = false;
			for (var j = 0; j < this._filterDelays.length; j++) {
				this._filterDelays[j].setDelay(0, time);
			}
		}
		this._delayTime.setValueAtTime(delayAmount, time);
	};

	/**
	 *  clean up
	 */
	Tone.LowpassCombFilter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		//dispose the filter delays
		for (var i = 0; i < this._filterDelays.length; i++) {
			this._filterDelays[i].dispose();
			this._filterDelays[i] = null;
		}
		this._delayTime.dispose();
		this.dampening.dispose();
		this.resonance.dispose();
		this._resScale.dispose();
		this._feedback.disconnect();
		this._filterDelays = null;
		this.dampening = null;
		this.resonance = null;
		this._resScale = null;
		this._feedback = null;
		this._delayTime = null;
	};

	// BEGIN HELPER CLASS //

	/**
	 *  FilterDelay
	 *  @internal
	 *  @constructor
	 *  @extends {Tone}
	 */
	var FilterDelay = function(delayTime, filterFreq){
		this.delay = this.input = this.context.createDelay();
		delayTime.connect(this.delay.delayTime);

		this.filter = this.output = this.context.createBiquadFilter();
		filterFreq.connect(this.filter.frequency);

		this.filter.type = "lowpass";
		this.filter.Q.value = 0;

		this.delay.connect(this.filter);
	};

	Tone.extend(FilterDelay);

	FilterDelay.prototype.setDelay = function(amount, time) {
		this.delay.delayTime.setValueAtTime(amount, time);
	};

	/**
	 *  clean up
	 */
	FilterDelay.prototype.dispose = function(){
		this.delay.disconnect();
		this.filter.disconnect();
		this.delay = null;
		this.filter = null;
	};

	// END HELPER CLASS //

	return Tone.LowpassCombFilter;
});
define('Tone/component/Merge',["Tone/core/Tone"], function(Tone){

	

	/**
	 *  @class  merge a left and a right channel into a single stereo channel
	 *          instead of connecting to the input, connect to either the left, or right input.
	 *          default input for connect is left input.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Merge = function(){

		/**
		 *  the output node
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the two input nodes
		 *  @type {Array.<GainNode>}
		 */
		this.input = new Array(2);

		/**
		 *  the left input channel
		 *  alias for input 0
		 *  @type {GainNode}
		 */
		this.left = this.input[0] = this.context.createGain();

		/**
		 *  the right input channel
		 *  alias for input 1
		 *  @type {GainNode}
		 */
		this.right = this.input[1] = this.context.createGain();

		/**
		 *  the merger node for the two channels
		 *  @type {ChannelMergerNode}
		 *  @private
		 */
		this._merger = this.context.createChannelMerger(2);

		//connections
		this.left.connect(this._merger, 0, 0);
		this.right.connect(this._merger, 0, 1);
		this._merger.connect(this.output);
	};

	Tone.extend(Tone.Merge);

	/**
	 *  clean up
	 */
	Tone.Merge.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.left.disconnect();
		this.right.disconnect();
		this._merger.disconnect();
		this.left = null;
		this.right = null;
		this._merger = null;
	}; 

	return Tone.Merge;
});

define('Tone/core/Master',["Tone/core/Tone"], function(Tone){

	
	
	/**
	 *  @class  A single master output. 
	 *          adds toMaster to Tone
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Master = function(){
		//extend audio unit
		Tone.call(this);

		/**
		 *  put a hard limiter on the output so we don't blow any eardrums
		 *  
		 *  @type {DynamicsCompressorNode}
		 */
		this.limiter = this.context.createDynamicsCompressor();
		this.limiter.threshold.value = 0;
		this.limiter.ratio.value = 20;
		//connect it up
		this.chain(this.input, this.limiter, this.output, this.context.destination);
	};

	Tone.extend(Tone.Master);

	/**
	 *  mute the output
	 *  @param {boolean} muted
	 */
	Tone.Master.prototype.mute = function(muted){
		muted = this.defaultArg(muted, true);
		if (muted){
			this.output.gain.value = 0;
		} else {
			this.output.gain.value = 1;
		}
	};

	/**
	 *  @param {number} db volume in decibels 
	 *  @param {Tone.Time=} fadeTime (optional) time it takes to reach the value
	 */
	Tone.Master.prototype.setVolume = function(db, fadeTime){
		var now = this.now();
		var gain = this.dbToGain(db);
		if (fadeTime){
			var currentVolume = this.output.gain.value;
			this.output.gain.cancelScheduledValues(now);
			this.output.gain.setValueAtTime(currentVolume, now);
			this.output.gain.linearRampToValueAtTime(gain, now + this.toSeconds(fadeTime));
		} else {
			this.output.gain.setValueAtTime(gain, now);
		}
	};

	///////////////////////////////////////////////////////////////////////////
	//	AUGMENT TONE's PROTOTYPE
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  connect 'this' to the master output
	 */
	Tone.prototype.toMaster = function(){
		this.connect(Tone.Master);
	};

	/**
	 *  Also augment AudioNode's prototype to include toMaster
	 *  as a convenience
	 */
	AudioNode.prototype.toMaster = function(){
		this.connect(Tone.Master);
	};

	var MasterConstructor = Tone.Master;

	//a single master output
	Tone.Master = new Tone.Master();

	/**
	 *  initialize the module and listen for new audio contexts
	 */
	Tone._initAudioContext(function(){
		MasterConstructor.call(Tone.Master);
	});

	return Tone.Master;
});
define('Tone/component/Meter',["Tone/core/Tone", "Tone/core/Master"], function(Tone){

	

	/**
	 *  @class  Get the rms of the input signal with some averaging.
	 *          can also just get the value of the signal
	 *          or the value in dB. inspired by https://github.com/cwilso/volume-meter/blob/master/volume-meter.js
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} channels (optional) number of channels being metered
	 *  @param {number=} smoothing (optional) amount of smoothing applied to the volume
	 *  @param {number=} clipMemory (optional) number in ms that a "clip" should be remembered
	 */
	Tone.Meter = function(channels, smoothing, clipMemory){
		//extends Unit
		Tone.call(this);

		/** @type {number} */
		this.channels = this.defaultArg(channels, 1);

		/** @type {number} */
		this.smoothing = this.defaultArg(smoothing, 0.8);

		/** @type {number} */
		this.clipMemory = this.defaultArg(clipMemory, 500);

		/** 
		 *  the rms for each of the channels
		 *  @private
		 *  @type {Array<number>}
		 */
		this._volume = new Array(this.channels);

		/** 
		 *  the raw values for each of the channels
		 *  @private
		 *  @type {Array<number>}
		 */
		this._values = new Array(this.channels);

		//zero out the volume array
		for (var i = 0; i < this.channels; i++){
			this._volume[i] = 0;
			this._values[i] = 0;
		}

		/** 
		 *  last time the values clipped
		 *  @private
		 *  @type {number}
		 */
		this._lastClip = 0;
		
		/** 
		 *  @private
		 *  @type {ScriptProcessorNode}
		 */
		this._jsNode = this.context.createScriptProcessor(this.bufferSize, this.channels, 1);
		this._jsNode.onaudioprocess = this._onprocess.bind(this);
		//so it doesn't get garbage collected
		this._jsNode.noGC();

		//signal just passes
		this.input.connect(this.output);
		this.input.connect(this._jsNode);
	};

	Tone.extend(Tone.Meter);

	/**
	 *  called on each processing frame
	 *  @private
	 *  @param  {AudioProcessingEvent} event 
	 */
	Tone.Meter.prototype._onprocess = function(event){
		var bufferSize = this._jsNode.bufferSize;
		var smoothing = this.smoothing;
		for (var channel = 0; channel < this.channels; channel++){
			var input = event.inputBuffer.getChannelData(channel);
			var sum = 0;
			var total = 0;
			var x;
			var clipped = false;
			for (var i = 0; i < bufferSize; i++){
				x = input[i];
				if (!clipped && x > 0.95){
					clipped = true;
					this._lastClip = Date.now();
				}
				total += x;
		    	sum += x * x;
			}
			var average = total / bufferSize;
			var rms = Math.sqrt(sum / bufferSize);
			this._volume[channel] = Math.max(rms, this._volume[channel] * smoothing);
			this._values[channel] = average;
		}
	};

	/**
	 *  get the rms of the signal
	 *  	
	 *  @param  {number=} channel which channel
	 *  @return {number}         the value
	 */
	Tone.Meter.prototype.getLevel = function(channel){
		channel = this.defaultArg(channel, 0);
		var vol = this._volume[channel];
		if (vol < 0.00001){
			return 0;
		} else {
			return vol;
		}
	};

	/**
	 *  get the value of the signal
	 *  @param  {number=} channel 
	 *  @return {number}         
	 */
	Tone.Meter.prototype.getValue = function(channel){
		channel = this.defaultArg(channel, 0);
		return this._values[channel];
	};

	/**
	 *  get the volume of the signal in dB
	 *  @param  {number=} channel 
	 *  @return {number}         
	 */
	Tone.Meter.prototype.getDb = function(channel){
		return this.gainToDb(this.getLevel(channel));
	};

	// @returns {boolean} if the audio has clipped in the last 500ms
	Tone.Meter.prototype.isClipped = function(){
		return Date.now() - this._lastClip < this.clipMemory;
	};

	/**
	 *  @override
	 */
	Tone.Meter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._jsNode.disconnect();
		this._jsNode.onaudioprocess = null;
		this._volume = null;
		this._values = null;
	};

	return Tone.Meter;
});
define('Tone/component/Mono',["Tone/core/Tone", "Tone/component/Merge"], function(Tone){

	

	/**
	 *  @class Transform the incoming mono or stereo signal into mono
	 *
	 *  @extends {Tone}
	 *  @constructor
	 */
	Tone.Mono = function(){
		Tone.call(this);

		/**
		 *  merge the signal
		 *  @type {Tone.Merge}
		 *  @private
		 */
		this._merge = new Tone.Merge();

		this.input.connect(this._merge, 0, 0);
		this.input.connect(this._merge, 0, 1);
		this.input.gain.value = this.dbToGain(-10);
		this._merge.connect(this.output);
	};

	Tone.extend(Tone.Mono);

	/**
	 *  clean up
	 */
	Tone.Mono.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._merge.dispose();
		this._merge = null;
	};

	return Tone.Mono;
});
define('Tone/component/Split',["Tone/core/Tone"], function(Tone){

	

	/**
	 *	@class  Split the incoming signal into left and right channels
	 *	
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Split = function(){
		
		/**
		 *  the input node
		 *  @type {GainNode}
		 */
		this.input = this.context.createGain();

		/**
		 *  the output nodes
		 *  @type {Array.<GainNode>}
		 */
		this.output = new Array(2);

		/** 
		 *  @type {ChannelSplitterNode}
		 *  @private
		 */
		this._splitter = this.context.createChannelSplitter(2);

		/** 
		 *  left channel output
		 *  alais for the first output
		 *  @type {GainNode}
		 */
		this.left = this.output[0] = this.context.createGain();

		/**
		 *  the right channel output
		 *  alais for the second output
		 *  @type {GainNode}
		 */
		this.right = this.output[1] = this.context.createGain();
		
		//connections
		this.input.connect(this._splitter);
		this._splitter.connect(this.left, 0, 0);
		this._splitter.connect(this.right, 1, 0);
	};

	Tone.extend(Tone.Split);

	/**
	 *  dispose method
	 */
	Tone.Split.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._splitter.disconnect();
		this.left.disconnect();
		this.right.disconnect();
		this.left = null;
		this.right = null;
		this._splitter = null;
	}; 

	return Tone.Split;
});
define('Tone/component/Panner',["Tone/core/Tone", "Tone/component/DryWet", "Tone/component/Merge", "Tone/component/Split"], 
function(Tone){

	

	/**
	 *  Panner. 
	 *  
	 *  @class  Equal Power Gain L/R Panner. Not 3D. 
	 *          0 = 100% Left
	 *          1 = 100% Right
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} initialPan the initail panner value (defaults to 0.5 = center)
	 */
	Tone.Panner = function(initialPan){
		
		Tone.call(this);

		/**
		 *  the dry/wet knob
		 *  @type {Tone.DryWet}
		 *  @private
		 */
		this._dryWet = new Tone.DryWet();
		/**
		 *  @type {Tone.Merge}
		 *  @private
		 */
		this._merger = new Tone.Merge();
		/**
		 *  @type {Tone.Split}
		 *  @private
		 */
		this._splitter = new Tone.Split();
		/**
		 *  the pan control
		 *  @type {Tone.Signal}
		 */	
		this.pan = this._dryWet.wetness;

		//CONNECTIONS:
		this.input.connect(this._splitter.left);
		this.input.connect(this._splitter.right);
		//left channel is dry, right channel is wet
		this._splitter.left.connect(this._dryWet.dry);
		this._splitter.right.connect(this._dryWet.wet);
		//merge it back together
		this._dryWet.dry.connect(this._merger.left);
		this._dryWet.wet.connect(this._merger.right);
		this._merger.connect(this.output);

		//initial value
		this.setPan(this.defaultArg(initialPan, 0.5));
	};

	Tone.extend(Tone.Panner);

	/**
	 *  set the l/r pan.
	 *  
	 *  0 = 100% left.
	 *  1 = 100% right.
	 *  
	 *  @param {number} pan 0-1
	 *  @param {Tone.Time=} rampTime (optionally) ramp to the pan position
	 */
	Tone.Panner.prototype.setPan = function(pan, rampTime){
		this._dryWet.setWet(pan, rampTime);
	};

	/**
	 *  clean up
	 */
	Tone.Panner.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._dryWet.dispose();
		this._splitter.dispose();
		this._merger.dispose();
		this._dryWet = null;
		this._splitter = null;
		this._merger = null;
		this.pan = null;
	};

	return Tone.Panner;
});
define('Tone/component/Recorder',["Tone/core/Tone", "Tone/core/Master"], function(Tone){

	

	/**
	 *  @class  Record an input into an array or AudioBuffer. 
	 *          it is limited in that the recording length needs to be known beforehand
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} channels 
	 */
	Tone.Recorder = function(channels){

		Tone.call(this);

		/**
		 *  the number of channels in the recording
		 *  @type {number}
		 */
		this.channels = this.defaultArg(channels, 1);

		/**
		 *  @private
		 *  @type {ScriptProcessorNode}
		 */
		this._jsNode = this.context.createScriptProcessor(this.bufferSize, this.channels, 1);
		this._jsNode.onaudioprocess = this._audioprocess.bind(this);

		/**
		 *  Float32Array for each channel
		 *  @private
		 *  @type {Array<Float32Array>}
		 */
		this._recordBuffers = new Array(this.channels);

		/**
		 *  @type {number}
		 *  @private
		 */
		this._recordStartSample = 0;

		/**
		 *  @type {number}
		 *  @private
		 */
		this._recordEndSample = 0;

		/**
		 *  @type {number}
		 *  @private
		 */
		this._recordDuration = 0;

		/**
		 *  @type {RecordState}
		 */
		this.state = RecordState.STOPPED;

		/** 
		 *  @private
		 *  @type {number}
		 */
		this._recordBufferOffset = 0;

		/** 
		 *  callback invoked when the recording is over
		 *  @private
		 *  @type {function(Float32Array)}
		 */
		this._callback = function(){};

		//connect it up
		this.input.connect(this._jsNode);
		//pass thru audio
		this.input.connect(this.output);
		//so it doesn't get garbage collected
		this._jsNode.noGC();
		//clear it to start
		this.clear();
	};

	Tone.extend(Tone.Recorder);

	/**
	 *  internal method called on audio process
	 *  
	 *  @private
	 *  @param   {AudioProcessorEvent} event 
	 */
	Tone.Recorder.prototype._audioprocess = function(event){
		if (this.state === RecordState.STOPPED){
			return;
		} else if (this.state === RecordState.RECORDING){
			//check if it's time yet
			var now = this.defaultArg(event.playbackTime, this.now());
			var processPeriodStart = this.toSamples(now);
			var bufferSize = this._jsNode.bufferSize;
			var processPeriodEnd = processPeriodStart + bufferSize;
			var bufferOffset, len;
			if (processPeriodStart > this._recordEndSample){
				this.state = RecordState.STOPPED;
				this._callback(this._recordBuffers);
			} else if (processPeriodStart > this._recordStartSample) {
				bufferOffset = 0;
				len = Math.min(this._recordEndSample - processPeriodStart, bufferSize);
				this._recordChannels(event.inputBuffer, bufferOffset, len, bufferSize);
			} else if (processPeriodEnd > this._recordStartSample) {
				len = processPeriodEnd - this._recordStartSample;
				bufferOffset = bufferSize - len;
				this._recordChannels(event.inputBuffer, bufferOffset, len, bufferSize);
			} 

		}
	};

	/**
	 *  record an input channel
	 *  @param   {AudioBuffer} inputBuffer        
	 *  @param   {number} from  
	 *  @param   {number} to  
	 *  @private
	 */
	Tone.Recorder.prototype._recordChannels = function(inputBuffer, from, to, bufferSize){
		var offset = this._recordBufferOffset;
		var buffers = this._recordBuffers;
		for (var channelNum = 0; channelNum < inputBuffer.numberOfChannels; channelNum++){
			var channel = inputBuffer.getChannelData(channelNum);
			if ((from === 0) && (to === bufferSize)){
				//set the whole thing
				this._recordBuffers[channelNum].set(channel, offset);
			} else {
				for (var i = from; i < from + to; i++){
					var zeroed = i - from; 
					buffers[channelNum][zeroed + offset] = channel[i];				
				}
			}
		}
		this._recordBufferOffset += to;
	};	

	/**
	 *  Record for a certain period of time
	 *  
	 *  will clear the internal buffer before starting
	 *  
	 *  @param  {Tone.Time} duration 
	 *  @param  {Tone.Time} wait the wait time before recording
	 *  @param {function(Float32Array)} callback the callback to be invoked when the buffer is done recording
	 */
	Tone.Recorder.prototype.record = function(duration, startTime, callback){
		if (this.state === RecordState.STOPPED){
			this.clear();
			this._recordBufferOffset = 0;
			startTime = this.defaultArg(startTime, 0);
			this._recordDuration = this.toSamples(duration);
			this._recordStartSample = this.toSamples("+"+startTime);
			this._recordEndSample = this._recordStartSample + this._recordDuration;
			for (var i = 0; i < this.channels; i++){
				this._recordBuffers[i] = new Float32Array(this._recordDuration);
			}
			this.state = RecordState.RECORDING;
			this._callback = this.defaultArg(callback, function(){});
		}
	};

	/**
	 *  clears the recording buffer
	 */
	Tone.Recorder.prototype.clear = function(){
		for (var i = 0; i < this.channels; i++){
			this._recordBuffers[i] = null;
		}
		this._recordBufferOffset = 0;
	};


	/**
	 *  true if there is nothing in the buffers
	 *  @return {boolean} 
	 */
	Tone.Recorder.prototype.isEmpty = function(){
		return this._recordBuffers[0] === null;
	};

	/**
	 *  @return {Array<Float32Array>}
	 */
	Tone.Recorder.prototype.getFloat32Array = function(){
		if (this.isEmpty()){
			return null;
		} else {
			return this._recordBuffers;
		}
	};

	/**
	 *  @return {AudioBuffer}
	 */
	Tone.Recorder.prototype.getAudioBuffer = function(){
		if (this.isEmpty()){
			return null;
		} else {
			var audioBuffer = this.context.createBuffer(this.channels, this._recordBuffers[0].length, this.context.sampleRate);
			for (var channelNum = 0; channelNum < audioBuffer.numberOfChannels; channelNum++){
				var channel = audioBuffer.getChannelData(channelNum);
				channel.set(this._recordBuffers[channelNum]);
			}
			return audioBuffer;
		}
	};

	/**
	 *  clean up
	 */
	Tone.Recorder.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._jsNode.disconnect();
		this._jsNode.onaudioprocess = undefined;
		this._jsNode = null;
		this._recordBuffers = null;
	};

	/**
	 *  @enum {string}
	 */
	var RecordState = {
		STOPPED : "stopped",
		SCHEDULED : "scheduled",
		RECORDING : "recording"
	};

	return Tone.Recorder;
});
define('Tone/core/Bus',["Tone/core/Tone"], function(Tone){

	

	/**
	 *  buses are another way of routing audio
	 *
	 *  augments Tone.prototype to include send and recieve
	 */

	 /**
	  *  All of the routes
	  *  
	  *  @type {Object}
	  *  @static
	  *  @private
	  */
	var Buses = {};

	/**
	 *  send signal to a channel name
	 *
	 *  @param  {string} channelName 
	 *  @param  {number} amount      
	 *  @return {GainNode}             
	 */
	Tone.prototype.send = function(channelName, amount){
		if (!Buses.hasOwnProperty(channelName)){
			Buses[channelName] = this.context.createGain();
		}
		var sendKnob = this.context.createGain();
		sendKnob.gain.value = this.defaultArg(amount, 1);
		this.chain(this.output, sendKnob, Buses[channelName]);
		return sendKnob;		
	};

	/**
	 *  recieve the input from the desired channelName to the input
	 *
	 *  @param  {string} channelName 
	 *  @param {AudioNode=} [input=this.input] if no input is selected, the
	 *                                         input of the current node is
	 *                                         chosen. 
	 */
	Tone.prototype.receive = function(channelName, input){
		if (!Buses.hasOwnProperty(channelName)){
			Buses[channelName] = this.context.createGain();	
		}
		input = this.defaultArg(input, this.input);
		Buses[channelName].connect(input);
	};
});
define('Tone/core/Note',["Tone/core/Tone", "Tone/core/Transport"], function(Tone){

	

	/**
	 *  @class  A timed note. Creating a note will register a callback 
	 *          which will be invoked on the channel at the time with
	 *          whatever value was specified. 
	 *
	 *  @constructor
	 *  @param {number|string} channel the channel name of the note
	 *  @param {Tone.Time} time the time when the note will occur
	 *  @param {string|number|Object|Array} value the value of the note
	 */
	Tone.Note = function(channel, time, value){

		/**
		 *  the value of the note. This value is returned
		 *  when the channel callback is invoked.
		 *  
		 *  @type {string|number|Object}
		 */
		this.value = value;

		/**
		 *  the channel name or number
		 *  
		 *  @type {string|number}
		 *  @private
		 */
		this._channel = channel;

		/**
		 *  an internal reference to the id of the timeline
		 *  callback which is set. 
		 *  
		 *  @type {number}
		 *  @private
		 */
		this._timelineID = Tone.Transport.setTimeline(this._trigger.bind(this), time);
	};

	/**
	 *  invoked by the timeline
	 *  @private
	 *  @param {number} time the time at which the note should play
	 */
	Tone.Note.prototype._trigger = function(time){
		//invoke the callback
		channelCallbacks(this._channel, time, this.value);
	};

	/**
	 *  clean up
	 */
	Tone.Note.prototype.dispose = function(){ 
		Tone.Tranport.clearTimeline(this._timelineID);
		this.value = null;
	};

	/**
	 *  @private
	 *  @static
	 *  @type {Object}
	 */
	var NoteChannels = {};

	/**
	 *  invoke all of the callbacks on a specific channel
	 *  @private
	 */
	function channelCallbacks(channel, time, value){
		if (NoteChannels.hasOwnProperty(channel)){
			var callbacks = NoteChannels[channel];
			for (var i = 0, len = callbacks.length; i < len; i++){
				var callback = callbacks[i];
				if (Array.isArray(value)){
					callback.apply(window, [time].concat(value));
				} else {
					callback(time, value);
				}
			}
		}
	}

	/**
	 *  listen to a specific channel, get all of the note callbacks
	 *  @static
	 *  @param {string|number} channel the channel to route note events from
	 *  @param {function(*)} callback callback to be invoked when a note will occur
	 *                                        on the specified channel
	 */
	Tone.Note.route = function(channel, callback){
		if (NoteChannels.hasOwnProperty(channel)){
			NoteChannels[channel].push(callback);
		} else {
			NoteChannels[channel] = [callback];
		}
	};

	/**
	 *  remove a callback from a channel
	 *  @static
	 */
	Tone.Note.unroute = function(channel, callback){
		if (NoteChannels.hasOwnProperty(channel)){
			var channelCallback = NoteChannels[channel];
			var index = channelCallback.indexOf(callback);
			if (index !== -1){
				NoteChannels[channel].splice(index, 1);
			}
		}
	};

	/**
	 *  Parses a score and registers all of the notes along the timeline. 
	 *
	 *  Scores are a JSON object with instruments at the top level
	 *  and an array of time and values. The value of a note can be 0 or more 
	 *  parameters. 
	 *
	 *  To convert MIDI files to score notation, take a look at utils/MidiToScore.js
	 *
	 *  @example
	 *  var score = { 
	 *  	"synth"  : [["0", "C3"], ["0:1", "D3"], ["0:2", "E3"], ... ],
	 *  	"bass"  : [["0", "C2"], ["1:0", "A2"], ["2:0", "C2"], ["3:0", "A2"], ... ],
	 *  	"drums"  : [["0", "kick"], ["0:2", "snare"], ["1:0", "kick"], ["1:2", "snare"], ... ],
	 *  	...
	 *  };
	 *
	 *  @static
	 *  @param {Object} score
	 *  @return {Array<Tone.Note>} an array of all of the notes that were created
	 */
	Tone.Note.parseScore = function(score){
		var notes = [];
		for (var inst in score){
			var part = score[inst];
			if (inst === "tempo"){
				Tone.Transport.setBpm(part);
			} else if (inst === "timeSignature"){
				Tone.Transport.setTimeSignature(part[0], part[1]);
			} else if (Array.isArray(part)){
				for (var i = 0; i < part.length; i++){
					var noteDescription = part[i];
					var note;
					if (Array.isArray(noteDescription)){
						var time = noteDescription[0];
						var value = noteDescription.slice(1);
						note = new Tone.Note(inst, time, value);
					} else {
						note = new Tone.Note(inst, noteDescription);
					}
					notes.push(note);
				}
			} else {
				throw new TypeError("score parts must be Arrays");
			}
		}
		return notes;
	};

	///////////////////////////////////////////////////////////////////////////
	//	MUSIC NOTES
	//	
	//	Augments Tone.prototype to include note methods
	///////////////////////////////////////////////////////////////////////////

	var noteToIndex = { "c" : 0, "c#" : 1, "db" : 1, "d" : 2, "d#" : 3, "eb" : 3, 
		"e" : 4, "f" : 5, "f#" : 6, "gb" : 6, "g" : 7, "g#" : 8, "ab" : 8, 
		"a" : 9, "a#" : 10, "bb" : 10, "b" : 11
	};

	var noteIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

	var middleC = 261.6255653005986;

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
			return Math.pow(2, (noteNumber - 48) / 12) * middleC;
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
		var log = Math.log(freq / middleC) / Math.LN2;
		var noteNumber = Math.round(12 * log) + 48;
		var octave = Math.floor(noteNumber/12);
		var noteName = noteIndexToNote[noteNumber % 12];
		return noteName + octave.toString();
	};

	/**
	 *  convert an interval (in semitones) to a frequency ratio
	 *
	 *  @example
	 *  tone.intervalToFrequencyRatio(0); // returns 1
	 *  tone.intervalToFrequencyRatio(12); // returns 2
	 *  
	 *  @param  {number} interval the number of semitones above the base note
	 *  @return {number}          the frequency ratio
	 */
	Tone.prototype.intervalToFrequencyRatio = function(interval){
		return Math.pow(2,(interval/12));
	};

	/**
	 *  convert a midi note number into a note name
	 *
	 *  @example
	 *  tone.midiToNote(60); // returns "C3"
	 *  
	 *  @param  {number} midiNumber the midi note number
	 *  @return {string}            the note's name and octave
	 */
	Tone.prototype.midiToNote = function(midiNumber){
		var octave = Math.floor(midiNumber / 12) - 2;
		var note = midiNumber % 12;
		return noteIndexToNote[note] + octave;
	};

	/**
	 *  convert a note to it's midi value
	 *
	 *  @example
	 *  tone.noteToMidi("C3"); // returns 60
	 *  
	 *  @param  {string} note the note name (i.e. "C3")
	 *  @return {number} the midi value of that note
	 */
	Tone.prototype.noteToMidi = function(note){
		//break apart the note by frequency and octave
		var parts = note.split(/(\d+)/);
		if (parts.length === 3){
			var index = noteToIndex[parts[0].toLowerCase()];
			var octave = parts[1];
			return index + (parseInt(octave, 10) + 2) * 12;
		} else {
			return 0;
		}
	};

	return Tone.Note;
});
define('Tone/effect/Effect',["Tone/core/Tone", "Tone/component/DryWet"], function(Tone){

	
	
	/**
	 * 	@class  Effect is the base class for effects. connect the effect between
	 * 	        the effectSend and effectReturn GainNodes. then control the amount of
	 * 	        effect which goes to the output using the dry/wet control.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [initalDry=0] the starting dry value
	 *                             defaults to 100% wet
	 */
	Tone.Effect = function(){

		Tone.call(this);

		//get all of the defaults
		var options = this.optionsObject(arguments, ["dry"], Tone.Effect.defaults);

		/**
		 *  the drywet knob to control the amount of effect
		 *  
		 *  @type {Tone.DryWet}
		 */
		this.dryWet = new Tone.DryWet();

		/**
		 *  connect the effectSend to the input of hte effect
		 *  
		 *  @type {GainNode}
		 */
		this.effectSend = this.context.createGain();

		/**
		 *  connect the output of the effect to the effectReturn
		 *  
		 *  @type {GainNode}
		 */
		this.effectReturn = this.context.createGain();

		//connections
		this.input.connect(this.dryWet.dry);
		this.input.connect(this.effectSend);
		this.effectReturn.connect(this.dryWet.wet);
		this.dryWet.connect(this.output);
		//setup values
		this.setDry(options.dry);
	};

	Tone.extend(Tone.Effect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Effect.defaults = {
		"dry" : 0
	};

	/**
	 * setDry adjusts the dry / wet balance
	 * dryness is 0 (100% wet) to 1 (100% dry)
	 * 
	 * @param {number} dryness
	 * @param {Tone.Time=} rampTime
	 */
	Tone.Effect.prototype.setDry = function(dryness, rampTime){
		this.dryWet.setDry(dryness, rampTime);
	};

	/**
	 * setWet also adjusts the dry / wet balance
	 * wetVal is 0 (100% dry) to 1 (100% wet)
	 * 
	 * @param {number} wetness
	 * @param {Tone.Time=} rampTime
	 */
	Tone.Effect.prototype.setWet = function(wetVal, rampTime){
		this.dryWet.setWet(wetVal, rampTime);
	};

	/**
	 *  set in bulk
	 *  @param {Object} param
	 */
	Tone.Effect.prototype.set = function(params){
		if (!this.isUndef(params.dry)) this.setDry(params.dry);
		if (!this.isUndef(params.wet)) this.setWet(params.wet);
	};

	/**
	 *  bypass the effect
	 */
	Tone.Effect.prototype.bypass = function(){
		this.setDry(1);
	};

	/**
	 *  chains the effect in between the effectSend and effectReturn
	 *  @param  {Tone} effect
	 */
	Tone.Effect.prototype.connectEffect = function(effect){
		this.chain(this.effectSend, effect, this.effectReturn);
	};

	/**
	 *  set the preset if it exists
	 *  @param {string} presetName the name of the preset
	 */
	Tone.Effect.prototype.setPreset = function(presetName){
		if (!this.isUndef(this.preset) && this.preset.hasOwnProperty(presetName)){
			this.set(this.preset[presetName]);
		}
	};

	/**
	 *  tear down
	 */
	Tone.Effect.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.dryWet.dispose();
		this.effectSend.disconnect();
		this.effectReturn.disconnect();
		this.dryWet = null;
		this.effectSend = null;
		this.effectReturn = null;
	};

	return Tone.Effect;
});
define('Tone/effect/AutoPanner',["Tone/core/Tone", "Tone/effect/Effect", "Tone/component/LFO", "Tone/component/Panner"], function(Tone){

	

	/**
	 *  @class AutoPanner is a Tone.Panner with an LFO connected to the pan amount
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param { number= } frequency (optional) rate in HZ of the left-right pan
	 */
	Tone.AutoPanner = function(){

		var options = this.optionsObject(arguments, ["frequency"], Tone.AutoPanner.defaults);
		Tone.Effect.call(this, options);

		/**
		 *  the lfo which drives the panning
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfo = new Tone.LFO(options.frequency, 0, 1);

		/**
		 *  the panner node which does the panning
		 *  @type {Tone.Panner}
		 *  @private
		 */
		this._panner = new Tone.Panner();

		//connections
		this.connectEffect(this._panner);
		this._lfo.connect(this._panner.pan);
		this.setType(options.type);
	};

	//extend Effect
	Tone.extend(Tone.AutoPanner, Tone.Effect);

	/**
	 *  defaults
	 *  @static
	 *  @type {Object}
	 */
	Tone.AutoPanner.defaults = {
		"frequency" : 1,
		"type" : "sine"
	};
	
	/**
	 * Start the panner
	 * 
	 * @param {Tone.Time=} Time the panner begins.
	 */
	Tone.AutoPanner.prototype.start = function(time){
		this._lfo.start(time);
	};

	/**
	 * Stop the panner
	 * 
	 * @param {Tone.Time=} time the panner stops.
	 */
	Tone.AutoPanner.prototype.stop = function(time){
		this._lfo.stop(time);
	};

	/**
	 * Set the type of oscillator attached to the AutoPanner.
	 * 
	 * @param {string} type of oscillator the panner is attached to (sine|sawtooth|triangle|square)
	 */
	Tone.AutoPanner.prototype.setType = function(type){
		this._lfo.setType(type);
	};

	/**
	 * Set frequency of the oscillator attached to the AutoPanner.
	 * 
	 * @param {number|string} freq in HZ of the oscillator's frequency.
	 */
	Tone.AutoPanner.prototype.setFrequency = function(freq){
		this._lfo.setFrequency(freq);
	};

	/**
	 *  set all of the parameters with an object
	 *  @param {Object} params 
	 */
	Tone.AutoPanner.prototype.set = function(params){
		if (!this.isUndef(params.frequency)) this.setFrequency(params.frequency);
		if (!this.isUndef(params.type)) this.setType(params.type);
		Tone.Effect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.AutoPanner.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._lfo.dispose();
		this._panner.dispose();
		this._lfo = null;
		this._panner = null;
	};

	return Tone.AutoPanner;
});

define('Tone/effect/AutoWah',["Tone/core/Tone", "Tone/component/Follower", "Tone/signal/ScaleExp", 
"Tone/effect/Effect", "Tone/component/Filter"], 
function(Tone){

	

	/**
	 *  @class  AutoWah connects an envelope follower to a bandpass filter.
	 *          Some inspiration from Tuna.js https://github.com/Dinahmoe/tuna
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {number=} [baseFrequency=100] the frequency the filter is set 
	 *                                       to at the low point of the wah
	 *  @param {number=} [octaves=5] the number of octaves above the baseFrequency
	 *                               the filter will sweep to when fully open
	 *  @param {number=} [sensitivity=0] the decibel threshold sensitivity for 
	 *                                   the incoming signal. Normal range of -40 to 0. 
	 */
	Tone.AutoWah = function(){

		var options = this.optionsObject(arguments, ["baseFrequency", "octaves", "sensitivity"], Tone.AutoWah.defaults);
		Tone.Effect.call(this, options);

		/**
		 *  the envelope follower
		 *  @type {Tone.Follower}
		 *  @private
		 */
		this._follower = new Tone.Follower(options.follower);

		/**
		 *  scales the follower value to the frequency domain
		 *  @type {Tone}
		 *  @private
		 */
		this._sweepRange = new Tone.ScaleExp(0, 1, 0, 1, 0.5);

		/**
		 *  @type {number}
		 *  @private
		 */
		this._baseFrequency = options.baseFrequency;

		/**
		 *  @type {number}
		 *  @private
		 */
		this._octaves = options.octaves;

		/**
		 *  @type {BiquadFilterNode}
		 *  @private
		 */
		this._bandpass = new Tone.Filter(0, "bandpass");
		this._bandpass.setRolloff(options.rolloff);
		// this._bandpass.type = "bandpass";
		// this._bandpass.Q.value = options.Q;

		/**
		 *  @type {BiquadFilterNode}
		 *  @private
		 */
		this._peaking = this.context.createBiquadFilter();
		this._peaking.type = "peaking";
		this._peaking.gain.value = options.gain;

		//the control signal path
		this.chain(this.effectSend, this._follower, this._sweepRange);
		this._sweepRange.connect(this._bandpass.frequency);
		this._sweepRange.connect(this._peaking.frequency);
		//the filtered path
		this.chain(this.effectSend, this._bandpass, this._peaking, this.effectReturn);
		//set the initial value
		this._setSweepRange();
		this.setSensitiviy(options.sensitivity);
	};

	Tone.extend(Tone.AutoWah, Tone.Effect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.AutoWah.defaults = {
		"baseFrequency" : 100,
		"octaves" : 6,
		"sensitivity" : 0,
		"Q" : 2,
		"gain" : 2,
		"rolloff" : -48,
		/** attributes for the envelope follower */
		"follower" : {
			"attack" : 0.3,
			"release" : 0.5
		}
	};

	/**
	 *  set the number of octaves that the filter will sweep
	 *  @param {number} octaves the number of octaves above the base frequency the filter will sweep
	 */
	Tone.AutoWah.prototype.setOctaves = function(octaves){
		this._octaves = octaves;
		this._setSweepRange();
	};

	/**
	 *  set the number of octaves that the filter will sweep
	 *  @param {number} octaves the number of octaves above the base frequency the filter will sweep
	 */
	Tone.AutoWah.prototype.setBaseFrequency = function(baseFreq){
		this._baseFrequency = baseFreq;
		this._setSweepRange();
	};

	/**
	 *  set the sensitivity to control how responsive to the input signal
	 *  the wah is. 
	 *  
	 *  @param {number} sensitivy the sensitivity to the input signal in dB
	 */
	Tone.AutoWah.prototype.setSensitiviy = function(sensitivy){
		this._sweepRange.setInputMax(this.dbToGain(sensitivy));
	};

	/**
	 *  sets the sweep range of the scaler
	 *  @private
	 */
	Tone.AutoWah.prototype._setSweepRange = function(){
		this._sweepRange.setOutputMin(this._baseFrequency);
		this._sweepRange.setOutputMax(Math.min(this._baseFrequency * Math.pow(2, this._octaves), this.context.sampleRate / 2));
	};

	/**
	 *  set all of the parameters with an object
	 *  @param {Object} params 
	 */
	Tone.AutoWah.prototype.set = function(params){
		if (!this.isUndef(params.baseFrequency)) this.setBaseFrequency(params.baseFrequency);
		if (!this.isUndef(params.sensitivity)) this.setSensitiviy(params.sensitivity);
		if (!this.isUndef(params.octaves)) this.setOctaves(params.octaves);
		if (!this.isUndef(params.follower)) this._follower.set(params.follower);
		if (!this.isUndef(params.Q)) this._bandpass.Q.value = params.Q;
		if (!this.isUndef(params.gain)) this._peaking.gain.value = params.gain;
		Tone.Effect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.AutoWah.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._follower.dispose();
		this._sweepRange.dispose();
		this._bandpass.disconnect();
		this._peaking.disconnect();
		this._follower = null;
		this._sweepRange = null;
		this._bandpass = null;
		this._peaking = null;
	};

	return Tone.AutoWah;
});
define('Tone/signal/Modulo',["Tone/core/Tone", "Tone/signal/Multiply"], function(Tone){

	

	/**
	 *  @class Signal-rate modulo operator. Specify the modulus and the 
	 *         number of bits of the incoming signal. Because the operator is composed of many components, 
	 *         fewer bits will improve performance. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} modulus the modolus to apply
	 *  @param {number} [bits=8]	optionally set the maximum bits the incoming signal can have. 
	 *                           	defaults to 8 meaning that incoming values must be in the range
	 *                            	[-255,255]. (2^8 = 256);
	 */
	Tone.Modulo = function(modulus, bits){

		Tone.call(this);

		bits = this.defaultArg(bits, 8);

		/**
		 *  the array of Modulus Subroutine objects
		 *  @type {Array.<ModulusSubroutine>}
		 *  @private
		 */
		this._modChain = [];

		//create all of the subroutines
		for (var i = bits - 1; i >= 0; i--){
			var mod = new ModuloSubroutine(modulus, Math.pow(2, i));
			this._modChain.push(mod);
		}
		this.chain.apply(this, this._modChain);
		this.input.connect(this._modChain[0]);
		this._modChain[this._modChain.length - 1].connect(this.output);
	};

	Tone.extend(Tone.Modulo);

	Tone.Modulo.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		for (var i = 0; i < this._modChain.length; i++) {
			this._modChain[i].dispose();
			this._modChain[i] = null;
		}
		this._modChain = null;
	};

	/**
	 *  @class applies a modolus at a single bit depth. 
	 *         uses this operation: http://stackoverflow.com/a/14842954
	 *
	 *  
	 *  @internal helper class for modulo
	 *  @constructor
	 *  @extends {Tone}
	 */
	var ModuloSubroutine = function(modulus, multiple){

		var val = modulus * multiple;

		/**
		 *  the input node
		 */
		this.input = this.context.createGain();

		/**
		 *  divide the incoming signal so it's on a 0 to 1 scale
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._div = new Tone.Multiply(1 / val);

		/**
		 *  apply the equation logic
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._operator = this.context.createWaveShaper();

		//connect it up
		this.chain(this.input, this._div, this._operator);
		this._makeCurve(val);
	};

	Tone.extend(ModuloSubroutine);

	/**
	 * make the operator curve
	 * @param {number} val
	 * @private 
	 */
	ModuloSubroutine.prototype._makeCurve = function(val){
		var arrayLength = Math.pow(2, 18);
		var curve = new Float32Array(arrayLength);
		for (var i = 0; i < curve.length; i++) {
			if (i === arrayLength - 1){
				curve[i] = -val;
			} else if (i === 0){
				curve[i] = val;
			} else {
				curve[i] = 0;
			}
		}
		this._operator.curve = curve;
	};

	/**
	 *  @override the default connection to connect the operator and the input to the next node
	 *  @private
	 */
	ModuloSubroutine.prototype.connect = function(node){
		this._operator.connect(node);
		this.input.connect(node);
	};

	 /**
	  *  internal class clean up
	  */
	ModuloSubroutine.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._div.dispose();
		this._operator.disconnect();
		this._div = null;
		this._operator = null;
	};

	return Tone.Modulo;
});
define('Tone/effect/BitCrusher',["Tone/core/Tone", "Tone/effect/Effect", "Tone/signal/Modulo", "Tone/signal/Negate", "Tone/signal/Add"], 
function(Tone){

	

	/**
	 *  @class downsample incoming signal. 
	 *
	 *  The algorithm to downsample the incoming signal is to scale the input
	 *  to between [0, 2^bits) and then apply a Floor function to the scaled value, 
	 *  then scale it back to audio range [-1, 1]
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {number} bits 1-8. 
	 */
	Tone.BitCrusher = function(){

		var options = this.optionsObject(arguments, ["bits"], Tone.BitCrusher.defaults);
		Tone.Effect.call(this, options);

		/**
		 *  Used for the floor function
		 *  @type {Tone.Modulo}
		 *  @private
		 */
		this._modulo = new Tone.Modulo(1, options.bits);

		/**
		 *  used for the floor function
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._neg = new Tone.Negate();

		/**
		 *  Node where the subtraction occurs for floor function
		 *  @type {GainNode}
		 *  @private
		 */
		this._sub = this.context.createGain();

		var valueRange = Math.pow(2, options.bits - 1);

		/**
		 *  scale the incoming signal to [0, valueRange)
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._scale = new Tone.Scale(-1, 1, 0, valueRange);

		/**
		 *  scale it back to the audio range [-1, 1]
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._invScale = new Tone.Scale(0, valueRange, -1, 1);

		//connect it up
		this.effectSend.connect(this._scale);
		this._scale.connect(this._invScale);
		this.chain(this._scale, this._modulo, this._neg, this._invScale, this.effectReturn);
	};

	Tone.extend(Tone.BitCrusher, Tone.Effect);

	/**
	 *  the default values
	 *  @static
	 *  @type {Object}
	 */
	Tone.BitCrusher.defaults = {
		"bits" : 4
	};

	/**
	 *  set the bit rate
	 *  
	 *  @param {number} bits the number of bits in the range [1,8]
	 */
	Tone.BitCrusher.prototype.setBits = function(bits){
		bits = Math.min(bits, 8);
		var valueRange = Math.pow(2, bits - 1);
		this._scale.setOutputMax(valueRange);
		this._invScale.setInputMax(valueRange);
	};

	/**
	 *  set all of the parameters with an object
	 *  @param {Object} params 
	 */
	Tone.BitCrusher.prototype.set = function(params){
		if (!this.isUndef(params.bits)) this.setBits(params.bits);
		Tone.Effect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.BitCrusher.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._modulo.dispose();
		this._neg.dispose();
		this._sub.disconnect();
		this._scale.dispose();
		this._invScale.dispose();
		this._modulo = null;
		this._neg = null;
		this._sub = null;
		this._scale = null;
		this._invScale = null;
	}; 

	return Tone.BitCrusher;
});
define('Tone/effect/StereoEffect',["Tone/core/Tone", "Tone/effect/Effect", "Tone/component/Split", "Tone/component/Merge", "Tone/component/Mono"], 
function(Tone){

	

	/**
	 *  @class Creates an effect with an effectSendL/R and effectReturnL/R
	 *
	 *	@constructor
	 *	@extends {Tone.Effect}
	 */
	Tone.StereoEffect = function(){

		Tone.call(this);
		//get the defaults
		var options = this.optionsObject(arguments, ["dry"], Tone.Effect.defaults);

		/**
		 *  the drywet knob to control the amount of effect
		 *  
		 *  @type {Tone.DryWet}
		 */
		this.dryWet = new Tone.DryWet();

		/**
		 *  make the incoming signal mono
		 *  @type {Tone.Mono}
		 *  @private
		 */
		this._mono = new Tone.Mono();

		/**
		 *  then split it
		 *  @type {Tone.Split}
		 *  @private
		 */
		this._split = new Tone.Split();

		/**
		 *  the effects send LEFT
		 *  @type {GainNode}
		 */
		this.effectSendL = this._split.left;

		/**
		 *  the effects send RIGHT
		 *  @type {GainNode}
		 */
		this.effectSendR = this._split.right;

		/**
		 *  the stereo effect merger
		 *  @type {Tone.Merge}
		 *  @private
		 */
		this._merge = new Tone.Merge();

		/**
		 *  the effect return LEFT
		 *  @type {GainNode}
		 */
		this.effectReturnL = this._merge.left;

		/**
		 *  the effect return RIGHT
		 *  @type {GainNode}
		 */
		this.effectReturnR = this._merge.right;

		//connections
		this.input.connect(this._mono);
		this._mono.connect(this._split);
		//dry wet connections
		this._mono.connect(this.dryWet.dry);
		this._merge.connect(this.dryWet.wet);
		this.dryWet.connect(this.output);
		//setup values
		this.setDry(options.dry);
	};

	Tone.extend(Tone.StereoEffect, Tone.Effect);

	/**
	 *  clean up
	 */
	Tone.StereoEffect.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.dryWet.dispose();
		this._mono.dispose();
		this._split.dispose();
		this._merge.dispose();
		this._mono = null;
		this._split = null;
		this._merge = null;
		this.effectSendL = null;
		this.effectSendR = null;
		this.effectReturnL = null;
		this.effectReturnR = null;
		this.dryWet = null;
	};

	return Tone.StereoEffect;
});
define('Tone/effect/FeedbackEffect',["Tone/core/Tone", "Tone/effect/Effect", "Tone/signal/Signal", "Tone/signal/Multiply"], function(Tone){

	
	
	/**
	 * 	@class  Feedback Effect (a sound loop between an audio source and its own output)
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {number|object=} [initialFeedback=0.25] the initial feedback value (defaults to 0.25)
	 */
	Tone.FeedbackEffect = function(){

		var options = this.optionsObject(arguments, ["feedback"]);
		options = this.defaultArg(options, Tone.FeedbackEffect.defaults);

		Tone.Effect.call(this, options);

		/**
		 *  controls the amount of feedback
		 *  @type {Tone.Signal}
		 */
		this.feedback = new Tone.Signal(options.feedback);

		/**
		 *  scales the feedback in half
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._half = new Tone.Multiply(0.5);
		
		/**
		 *  the gain which controls the feedback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackGain = this.context.createGain();

		//the feedback loop
		this.chain(this.effectReturn, this._feedbackGain, this.effectSend);
		this.chain(this.feedback, this._half, this._feedbackGain.gain);
	};

	Tone.extend(Tone.FeedbackEffect, Tone.Effect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.FeedbackEffect.defaults = {
		"feedback" : 0.25
	};

	/**
	 *  set the feedback amount
	 *
	 *  @param {number} value  the amount of feedback
	 *  @param {Tone.Time=} rampTime (optionally) set the ramp time it takes 
	 *                               to reach the new feedback value
	 */
	Tone.FeedbackEffect.prototype.setFeedback = function(value, rampTime){
		if (rampTime){
			this.feedback.linearRampToValueNow(value, rampTime);
		} else {
			this.feedback.setValue(value);
		}
	};

	/**
	 *  set the parameters in bulk
	 *  @param {Object} params
	 */
	Tone.FeedbackEffect.prototype.set = function(params){
		if (!this.isUndef(params.feedback)) this.setFeedback(params.feedback);
		Tone.Effect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.FeedbackEffect.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this.feedback.dispose();
		this._half.dispose();
		this._feedbackGain.disconnect();
		this.feedback = null;
		this._feedbackGain = null;
		this._half = null;
	};

	return Tone.FeedbackEffect;
});

define('Tone/effect/StereoXFeedbackEffect',["Tone/core/Tone", "Tone/effect/StereoEffect", "Tone/effect/FeedbackEffect"], 
function(Tone){

	

	/**
	 *  @class Just like a stereo feedback effect, but the feedback is routed from left to right
	 *         and right to left instead of on the same channel.
	 *
	 *	@constructor
	 *	@extends {Tone.FeedbackEffect}
	 */
	Tone.StereoXFeedbackEffect = function(){

		var options = this.optionsObject(arguments, ["feedback"], Tone.FeedbackEffect.defaults);
		Tone.StereoEffect.call(this, options);

		/**
		 *  controls the amount of feedback
		 *  @type {Tone.Signal}
		 */
		this.feedback = new Tone.Signal(options.feedback);

		/**
		 *  scales the feedback in half
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._half = new Tone.Multiply(0.5);

		/**
		 *  the left side feeback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackLR = this.context.createGain();

		/**
		 *  the right side feeback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackRL = this.context.createGain();

		//connect it up
		this.chain(this.effectReturnL, this._feedbackLR, this.effectSendR);
		this.chain(this.effectReturnR, this._feedbackRL, this.effectSendL);
		this.feedback.connect(this._half);
		this.fan(this._half, this._feedbackLR.gain, this._feedbackRL.gain);
	};

	Tone.extend(Tone.StereoXFeedbackEffect, Tone.FeedbackEffect);

	/**
	 *  clean up
	 */
	Tone.StereoXFeedbackEffect.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		this.feedback.dispose();
		this._half.dispose();
		this._feedbackLR.disconnect();
		this._feedbackRL.disconnect();
		this.feedback = null;
		this._feedbackLR = null;
		this._feedbackRL = null;
		this._half = null;
	};

	return Tone.StereoXFeedbackEffect;
});
define('Tone/effect/Chorus',["Tone/core/Tone", "Tone/component/LFO", "Tone/effect/StereoXFeedbackEffect"], 
function(Tone){

	

	/**
	 *  @class A Chorus effect with feedback. inspiration from https://github.com/Dinahmoe/tuna/blob/master/tuna.js
	 *
	 *	@constructor
	 *	@extends {Tone.StereoXFeedbackEffect}
	 *	@param {number|Object=} [rate=2] the rate of the effect
	 *	@param {number=} [delayTime=3.5] the delay of the chorus effect in ms
	 *	@param {number=} [depth=0.7] the depth of the chorus
	 */
	Tone.Chorus = function(){

		var options = this.optionsObject(arguments, ["rate", "delayTime", "depth"], Tone.Chorus.defaults);
		Tone.StereoXFeedbackEffect.call(this, options);

		/**
		 *  the depth of the chorus
		 *  @type {number}
		 *  @private
		 */
		this._depth = options.depth;

		/**
		 *  the delayTime
		 *  @type {number}
		 *  @private
		 */
		this._delayTime = options.delayTime / 1000;

		/**
		 *  the lfo which controls the delayTime
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfoL = new Tone.LFO(options.rate, 0, 1);

		/**
		 *  another LFO for the right side with a 180 degree phase diff
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfoR = new Tone.LFO(options.rate, 0, 1);
		this._lfoR.setPhase(180);

		/**
		 *  delay for left
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNodeL = this.context.createDelay();

		/**
		 *  delay for right
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNodeR = this.context.createDelay();

		//connections
		this.chain(this.effectSendL, this._delayNodeL, this.effectReturnL);
		this.chain(this.effectSendR, this._delayNodeR, this.effectReturnR);
		//and pass through
		this.effectSendL.connect(this.effectReturnL);
		this.effectSendR.connect(this.effectReturnR);
		//lfo setup
		this._lfoL.connect(this._delayNodeL.delayTime);
		this._lfoR.connect(this._delayNodeR.delayTime);
		//start the lfo
		this._lfoL.start();
		this._lfoR.start();
		//have one LFO frequency control the other
		this._lfoL.frequency.connect(this._lfoR.frequency);
		//set the initial values
		this.setDepth(this._depth);
		this.setRate(options.rate);
		this.setType(options.type);
	};

	Tone.extend(Tone.Chorus, Tone.StereoXFeedbackEffect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Chorus.defaults = {
		"rate" : 1.5, 
		"delayTime" : 3.5,
		"depth" : 0.7,
		"feedback" : 0.4,
		"type" : "sine"
	};

	/**
	 *  set the depth of the chorus
	 *  @param {number} depth
	 */
	Tone.Chorus.prototype.setDepth = function(depth){
		this._depth = depth;
		var deviation = this._delayTime * depth;
		this._lfoL.setMin(this._delayTime - deviation);
		this._lfoL.setMax(this._delayTime + deviation);
		this._lfoR.setMin(this._delayTime - deviation);
		this._lfoR.setMax(this._delayTime + deviation);
	};

	/**
	 *  set the delay time
	 *  @param {number} delayTime in milliseconds
	 */
	Tone.Chorus.prototype.setDelayTime = function(delayTime){
		this._delayTime = delayTime / 1000;
		this.setDepth(this._depth);
	};

	/**
	 *  set the chorus rate
	 *  @param {number} rate in hertz
	 */
	Tone.Chorus.prototype.setRate = function(rate){
		this._lfoL.setFrequency(rate);
	};

	/**
	 *  set the LFO type
	 *  @param {number} type
	 */
	Tone.Chorus.prototype.setType = function(type){
		this._lfoL.setType(type);
		this._lfoR.setType(type);
	};

	/**
	 *  set multiple parameters at once with an object
	 *  @param {Object} params the parameters as an object
	 */
	Tone.Chorus.prototype.set = function(params){
		if (!this.isUndef(params.rate)) this.setRate(params.rate);
		if (!this.isUndef(params.delayTime)) this.setDelayTime(params.delayTime);
		if (!this.isUndef(params.depth)) this.setDepth(params.depth);
		if (!this.isUndef(params.type)) this.setType(params.type);
		Tone.FeedbackEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.Chorus.prototype.dispose = function(){
		Tone.StereoXFeedbackEffect.prototype.dispose.call(this);
		this._lfoL.dispose();
		this._lfoR.dispose();
		this._delayNodeL.disconnect();
		this._delayNodeR.disconnect();
		this._lfoL = null;
		this._lfoR = null;
		this._delayNodeL = null;
		this._delayNodeR = null;
	};

	return Tone.Chorus;
});
define('Tone/effect/FeedbackDelay',["Tone/core/Tone", "Tone/effect/FeedbackEffect", "Tone/signal/Signal"], function(Tone){

	
	
	/**
	 *  @class  A feedback delay
	 *
	 *  @constructor
	 *  @extends {Tone.FeedbackEffect}
	 *  @param {Tone.Time|Object=} delayTime
	 */
	Tone.FeedbackDelay = function(){
		
		var options = this.optionsObject(arguments, ["delayTime"], Tone.FeedbackDelay.defaults);
		Tone.FeedbackEffect.call(this, options);

		/**
		 *  Tone.Signal to control the delay amount
		 *  @type {Tone.Signal}
		 */
		this.delayTime = new Tone.Signal();

		/**
		 *  the delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNode = this.context.createDelay(4);

		// connect it up
		this.connectEffect(this._delayNode);
		this.delayTime.connect(this._delayNode.delayTime);
		//set the initial delay
		this.setDelayTime(options.delayTime);
	};

	Tone.extend(Tone.FeedbackDelay, Tone.FeedbackEffect);

	/**
	 *  [defaults description]
	 *  @type {Object}
	 */
	Tone.FeedbackDelay.defaults = {
		"delayTime" : 0.25
	};

	/**
	 *  Sets the delay time
	 *  
	 *  @param {Tone.Time} delayTime 
	 *  @param {Tone.Time=} rampTime time it takes to reach the desired delayTime
	 */
	Tone.FeedbackDelay.prototype.setDelayTime = function(delayTime, rampTime){
		if (rampTime){
			this.delayTime.linearRampToValueNow(this.toSeconds(delayTime), rampTime);
		} else {
			this.delayTime.setValue(this.toSeconds(delayTime));
		}
	};

	/**
	 *  sets the params in bulk
	 *  @param {Object} param 
	 */
	Tone.FeedbackDelay.prototype.set = function(params){
		if (!this.isUndef(params.delayTime)) this.setDelayTime(params.delayTime);
		Tone.FeedbackEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.FeedbackDelay.prototype.dispose = function(){
		Tone.FeedbackEffect.prototype.dispose.call(this);
		this.delayTime.dispose();
		this._delayNode.disconnect();
		this._delayNode = null;
		this.delayTime = null;
	};

	return Tone.FeedbackDelay;
});
define('Tone/effect/Freeverb',["Tone/core/Tone", "Tone/component/LowpassCombFilter", "Tone/effect/StereoEffect", "Tone/signal/Signal", "Tone/component/Split", "Tone/component/Merge"], 
function(Tone){

	

	/**
	 *  an array of comb filter delay values from Freeverb implementation
	 *  @static
	 *  @private
	 *  @type {Array}
	 */
	var combFilterTunings = [1557 / 44100, 1617 / 44100, 1491 / 44100, 1422 / 44100, 1277 / 44100, 1356 / 44100, 1188 / 44100, 1116 / 44100];

	/**
	 *  an array of allpass filter frequency values from Freeverb implementation
	 *  @private
	 *  @static
	 *  @type {Array}
	 */
	var allpassFilterFrequencies = [225, 556, 441, 341];

	/**
	 *  @class Reverb based on the Freeverb
	 *
	 *  @extends {Tone.Effect}
	 *  @constructor
	 *  @param {number} [roomSize=0.7] correlated to the decay time. 
	 *                                 value between (0,1)
	 *  @param {number} [dampening=0.5] filtering which is applied to the reverb. 
	 *                                  value between [0,1]
	 */
	Tone.Freeverb = function(){

		var options = this.optionsObject(arguments, ["roomSize", "dampening"], Tone.Freeverb.defaults);
		Tone.StereoEffect.call(this, options);

		/**
		 *  the roomSize value between (0,1)
		 *  @type {Tone.Signal}
		 */
		this.roomSize = new Tone.Signal(options.roomSize);

		/**
		 *  the amount of dampening
		 *  value between [0,1]
		 *  @type {Tone.Signal}
		 */
		this.dampening = new Tone.Signal(options.dampening);

		/**
		 *  scale the dampening
		 *  @type {Tone.ScaleExp}
		 *  @private
		 */
		this._dampeningScale = new Tone.ScaleExp(0, 1, 100, 8000, 0.5);

		/**
		 *  the comb filters
		 *  @type {Array.<Tone.LowpassCombFilter>}
		 *  @private
		 */
		this._combFilters = [];

		/**
		 *  the allpass filters on the left
		 *  @type {Array.<BiqaudFilterNode>}
		 *  @private
		 */
		this._allpassFiltersL = [];

		/**
		 *  the allpass filters on the right
		 *  @type {Array.<BiqaudFilterNode>}
		 *  @private
		 */
		this._allpassFiltersR = [];

		//make the allpass filters on teh right
		for (var l = 0; l < allpassFilterFrequencies.length; l++){
			var allpassL = this.context.createBiquadFilter();
			allpassL.type = "allpass";
			allpassL.frequency.value = allpassFilterFrequencies[l];
			this._allpassFiltersL.push(allpassL);
		}

		//make the allpass filters on the left
		for (var r = 0; r < allpassFilterFrequencies.length; r++){
			var allpassR = this.context.createBiquadFilter();
			allpassR.type = "allpass";
			allpassR.frequency.value = allpassFilterFrequencies[r];
			this._allpassFiltersR.push(allpassR);
		}

		//make the comb filters
		for (var c = 0; c < combFilterTunings.length; c++){
			var lfpf = new Tone.LowpassCombFilter(combFilterTunings[c]);
			if (c < combFilterTunings.length / 2){
				this.chain(this.effectSendL, lfpf, this._allpassFiltersL[0]);
			} else {
				this.chain(this.effectSendR, lfpf, this._allpassFiltersR[0]);
			}
			this.roomSize.connect(lfpf.resonance);
			this._dampeningScale.connect(lfpf.dampening);
			this._combFilters.push(lfpf);
		}

		//chain the allpass filters togetehr
		this.chain.apply(this, this._allpassFiltersL);
		this.chain.apply(this, this._allpassFiltersR);
		this._allpassFiltersL[this._allpassFiltersL.length - 1].connect(this.effectReturnL);
		this._allpassFiltersR[this._allpassFiltersR.length - 1].connect(this.effectReturnR);
		this.dampening.connect(this._dampeningScale);
	};

	Tone.extend(Tone.Freeverb, Tone.StereoEffect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Freeverb.defaults = {
		"roomSize" : 0.7, 
		"dampening" : 0.5
	};

	/**
	 *  set the room size
	 *  @param {number} roomsize roomsize value between 0-1
	 */
	Tone.Freeverb.prototype.setRoomSize = function(roomsize) {
		this.roomSize.setValue(roomsize);
	};

	/**
	 *  set the dampening
	 *  @param {number} dampening dampening between 0-1
	 */
	Tone.Freeverb.prototype.setDampening = function(dampening) {
		this.dampening.setValue(dampening);
	};

	/**
	 *  set multiple parameters at once with an object
	 *  @param {Object} params the parameters as an object
	 */
	Tone.Freeverb.prototype.set = function(params){
		if (!this.isUndef(params.dampening)) this.setDampening(params.dampening);
		if (!this.isUndef(params.roomSize)) this.setRoomSize(params.roomSize);
		Tone.StereoEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.Freeverb.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		for (var al = 0; al < this._allpassFiltersL.length; al++) {
			this._allpassFiltersL[al].disconnect();
			this._allpassFiltersL[al] = null;
		}
		this._allpassFiltersL = null;
		for (var ar = 0; ar < this._allpassFiltersR.length; ar++) {
			this._allpassFiltersR[ar].disconnect();
			this._allpassFiltersR[ar] = null;
		}
		this._allpassFiltersR = null;
		for (var cf = 0; cf < this._combFilters.length; cf++) {
			this._combFilters[cf].dispose();
			this._combFilters[cf] = null;
		}
		this._combFilters = null;
		this.roomSize.dispose();
		this.dampening.dispose();
		this._dampeningScale.dispose();
		this.roomSize = null;
		this.dampening = null;
		this._dampeningScale = null;
	};

	return Tone.Freeverb;
});
define('Tone/effect/JCReverb',["Tone/core/Tone", "Tone/component/FeedbackCombFilter", "Tone/effect/StereoEffect", "Tone/signal/Scale"], 
function(Tone){

	

	/**
	 *  an array of the comb filter delay time values
	 *  @private
	 *  @static
	 *  @type {Array}
	 */
	var combFilterDelayTimes = [1687 / 25000, 1601 / 25000, 2053 / 25000, 2251 / 25000];

	/**
	 *  the resonances of each of the comb filters
	 *  @private
	 *  @static
	 *  @type {Array}
	 */
	var combFilterResonances = [0.773, 0.802, 0.753, 0.733];

	/**
	 *  the allpass filter frequencies
	 *  @private
	 *  @static
	 *  @type {Array}
	 */
	var allpassFilterFreqs = [347, 113, 37];

	/**
	 *  @class a simple Schroeder Reverberators tuned by John Chowning in 1970
	 *         made up of 3 allpass filters and 4 feedback comb filters. 
	 *         https://ccrma.stanford.edu/~jos/pasp/Schroeder_Reverberators.html
	 *
	 *  @extends {Tone.Effect}
	 *  @constructor
	 */
	Tone.JCReverb = function(){
		Tone.StereoEffect.call(this);

		/**
		 *  room size control values between [0,1]
		 *  @type {Tone.Signal}
		 */
		this.roomSize = new Tone.Signal(0.5);

		/**
		 *  scale the room size
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._scaleRoomSize = new Tone.Scale(0, 1, -0.733, 0.197);

		/**
		 *  a series of allpass filters
		 *  @type {Array.<BiquadFilterNode>}
		 *  @private
		 */
		this._allpassFilters = [];

		/**
		 *  parallel feedback comb filters
		 *  @type {Array.<Tone.FeedbackCombFilter>}
		 *  @private
		 */
		this._feedbackCombFilters = [];

		//make the allpass filters
		for (var af = 0; af < allpassFilterFreqs.length; af++) {
			var allpass = this.context.createBiquadFilter();
			allpass.type = "allpass";
			allpass.frequency.value = allpassFilterFreqs[af];
			this._allpassFilters.push(allpass);
		}

		//and the comb filters
		for (var cf = 0; cf < combFilterDelayTimes.length; cf++) {
			var fbcf = new Tone.FeedbackCombFilter(combFilterDelayTimes[cf]);
			this._scaleRoomSize.connect(fbcf.resonance);
			fbcf.resonance.setValue(combFilterResonances[cf]);
			this._allpassFilters[this._allpassFilters.length - 1].connect(fbcf);
			if (cf < combFilterDelayTimes.length / 2){
				fbcf.connect(this.effectReturnL);
			} else {
				fbcf.connect(this.effectReturnR);
			}
			this._feedbackCombFilters.push(fbcf);
		}

		//chain the allpass filters together
		this.roomSize.connect(this._scaleRoomSize);
		this.chain.apply(this, this._allpassFilters);
		this.effectSendL.connect(this._allpassFilters[0]);
		this.effectSendR.connect(this._allpassFilters[0]);
	};

	Tone.extend(Tone.JCReverb, Tone.StereoEffect);

	/**
	 *  set the room size
	 *  @param {number} roomsize roomsize value between 0-1
	 */
	Tone.JCReverb.prototype.setRoomSize = function(roomsize) {
		this.roomSize.setValue(roomsize);
	};

	/**
	 *  set multiple parameters at once with an object
	 *  @param {Object} params the parameters as an object
	 */
	Tone.JCReverb.prototype.set = function(params){
		if (!this.isUndef(params.roomSize)) this.setRoomSize(params.roomSize);
		Tone.StereoEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.JCReverb.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		for (var apf = 0; apf < this._allpassFilters.length; apf++) {
			this._allpassFilters[apf].disconnect();
			this._allpassFilters[apf] = null;
		}
		this._allpassFilters = null;
		for (var fbcf = 0; fbcf < this._feedbackCombFilters.length; fbcf++) {
			this._feedbackCombFilters[fbcf].dispose();
			this._feedbackCombFilters[fbcf] = null;
		}
		this._feedbackCombFilters = null;
		this.roomSize.dispose();
		this._scaleRoomSize.dispose();
		this.roomSize = null;
		this._scaleRoomSize = null;
	};

	return Tone.JCReverb;
});
define('Tone/effect/StereoFeedbackEffect',["Tone/core/Tone", "Tone/effect/StereoEffect", "Tone/effect/FeedbackEffect"], 
function(Tone){

	

	/**
	 *  @class A stereo feedback effect where the feedback is on the same channel
	 *
	 *	@constructor
	 *	@extends {Tone.FeedbackEffect}
	 */
	Tone.StereoFeedbackEffect = function(){

		var options = this.optionsObject(arguments, ["feedback"], Tone.FeedbackEffect.defaults);
		Tone.StereoEffect.call(this, options);

		/**
		 *  controls the amount of feedback
		 *  @type {Tone.Signal}
		 */
		this.feedback = new Tone.Signal(options.feedback);

		/**
		 *  scales the feedback in half
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._half = new Tone.Multiply(0.5);

		/**
		 *  the left side feeback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackL = this.context.createGain();

		/**
		 *  the right side feeback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackR = this.context.createGain();

		//connect it up
		this.chain(this.effectReturnL, this._feedbackL, this.effectSendL);
		this.chain(this.effectReturnR, this._feedbackR, this.effectSendR);
		this.feedback.connect(this._half);
		this.fan(this._half, this._feedbackL.gain, this._feedbackR.gain);
	};

	Tone.extend(Tone.StereoFeedbackEffect, Tone.FeedbackEffect);

	/**
	 *  clean up
	 */
	Tone.StereoFeedbackEffect.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		this.feedback.dispose();
		this._half.dispose();
		this._feedbackL.disconnect();
		this._feedbackR.disconnect();
		this.feedback = null;
		this._feedbackL = null;
		this._feedbackR = null;
		this._half = null;
	};

	return Tone.StereoFeedbackEffect;
});
define('Tone/effect/Phaser',["Tone/core/Tone", "Tone/component/LFO", "Tone/effect/FeedbackEffect", "Tone/component/Filter", "Tone/effect/StereoFeedbackEffect"], 
function(Tone){

	

	/**
	 *  @class A Phaser effect with feedback. inspiration from https://github.com/Dinahmoe/tuna/
	 *
	 *	@extends {Tone.StereoFeedbackEffect}
	 *	@constructor
	 *	@param {number|object=} rate the speed of the phasing
	 *	@param {number=} depth the depth of the effect
	 *	@param {number} baseFrequency the base frequency of the filters
	 */
	Tone.Phaser = function(){

		//set the defaults
		var options = this.optionsObject(arguments, ["rate", "depth", "baseFrequency"], Tone.Phaser.defaults);
		Tone.StereoFeedbackEffect.call(this, options);

		/**
		 *  the lfo which controls the frequency on the left side
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfoL = new Tone.LFO(options.rate, 0, 1);

		/**
		 *  the lfo which controls the frequency on the right side
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfoR = new Tone.LFO(options.rate, 0, 1);
		this._lfoR.setPhase(180);

		/**
		 *  the base modulation frequency
		 *  @type {number}
		 *  @private
		 */
		this._baseFrequency = options.baseFrequency;

		/**
		 *  the depth of the phasing
		 *  @type {number}
		 *  @private
		 */
		this._depth = options.depth;
		
		/**
		 *  the array of filters for the left side
		 *  @type {Array.<Tone.Filter>}
		 *  @private
		 */
		this._filtersL = this._makeFilters(options.stages, this._lfoL, options.Q);

		/**
		 *  the array of filters for the left side
		 *  @type {Array.<Tone.Filter>}
		 *  @private
		 */
		this._filtersR = this._makeFilters(options.stages, this._lfoR, options.Q);
		
		//connect them up
		this.effectSendL.connect(this._filtersL[0]);
		this.effectSendR.connect(this._filtersR[0]);
		this._filtersL[options.stages - 1].connect(this.effectReturnL);
		this._filtersR[options.stages - 1].connect(this.effectReturnR);
		this.effectSendL.connect(this.effectReturnL);
		this.effectSendR.connect(this.effectReturnR);
		//control the frequency with one LFO
		this._lfoL.frequency.connect(this._lfoR.frequency);
		//set the options
		this.setBaseFrequency(options.baseFrequency);
		this.setDepth(options.depth);
		this.setRate(options.rate);
		//start the lfo
		this._lfoL.start();
		this._lfoR.start();
	};

	Tone.extend(Tone.Phaser, Tone.StereoFeedbackEffect);

	/**
	 *  defaults
	 *  @static
	 *  @type {object}
	 */
	Tone.Phaser.defaults = {
		"rate" : 0.5,
		"depth" : 1,
		"stages" : 4,
		"Q" : 6,
		"baseFrequency" : 400,
		"feedback" : 0.6
	};

	/**
	 *  @param {number} stages
	 *  @returns {Array} the number of filters all connected together
	 *  @private
	 */
	Tone.Phaser.prototype._makeFilters = function(stages, connectToFreq, Q){
		var filters = new Array(stages);
		//make all the filters
		for (var i = 0; i < stages; i++){
			var filter = this.context.createBiquadFilter();
			filter.type = "allpass";
			filter.Q.value = Q;
			connectToFreq.connect(filter.frequency);
			filters[i] = filter;
		}
		this.chain.apply(this, filters);
		return filters;
	};

	/**
	 *  set the depth of the chorus
	 *  @param {number} depth
	 */
	Tone.Phaser.prototype.setDepth = function(depth){
		this._depth = depth;
		var max = this._baseFrequency + this._baseFrequency * depth;
		this._lfoL.setMax(max);
		this._lfoR.setMax(max);
	};

	/**
	 *  set the base frequency of the filters
	 *  @param {number} freq
	 */
	Tone.Phaser.prototype.setBaseFrequency = function(freq){
		this._baseFrequency = freq;	
		this._lfoL.setMin(freq);
		this._lfoR.setMin(freq);
		this.setDepth(this._depth);
	};

	/**
	 *  set the phaser rate
	 *  @param {number} rate in hertz
	 */
	Tone.Phaser.prototype.setRate = function(rate){
		this._lfoL.setFrequency(rate);
	};

	/**
	 *  bulk setter
	 *  @param {object} params
	 */
	Tone.Phaser.prototype.set = function(params){
		if (!this.isUndef(params.rate)) this.setRate(params.rate);
		if (!this.isUndef(params.baseFrequency)) this.setBaseFrequency(params.baseFrequency);
		if (!this.isUndef(params.depth)) this.setDepth(params.depth);
		Tone.StereoFeedbackEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.Phaser.prototype.dispose = function(){
		Tone.StereoFeedbackEffect.prototype.dispose.call(this);
		this._lfoL.dispose();
		this._lfoR.dispose();
		for (var i = 0; i < this._filtersL.length; i++){
			this._filtersL[i].disconnect();
			this._filtersL[i] = null;
		}
		for (var i = 0; i < this._filtersR.length; i++){
			this._filtersR[i].disconnect();
			this._filtersR[i] = null;
		}
		this._filtersL = null;
		this._filtersR = null;
		this._lfoL = null;
		this._lfoR = null;
	};

	return Tone.Phaser;
});
define('Tone/effect/PingPongDelay',["Tone/core/Tone", "Tone/effect/StereoXFeedbackEffect", "Tone/signal/Signal", "Tone/signal/Multiply"], 
function(Tone){

	

	/**
	 *  @class  PingPongDelay is a dual delay effect where the echo is heard
	 *          first in one channel and next in the opposite channel
	 *
	 * 	@constructor
	 * 	@extends {Tone.StereoXFeedbackEffect}
	 *  @param {Tone.Time|Object=} delayTime is the interval between consecutive echos
	 */
	Tone.PingPongDelay = function(){
		
		var options = this.optionsObject(arguments, ["delayTime"], Tone.PingPongDelay.defaults);
		Tone.StereoXFeedbackEffect.call(this, options);

		/**
		 *  the delay node on the left side
		 *  @type {DelayNode}
		 *  @private
		 */
		this._leftDelay = this.context.createDelay();

		/**
		 *  the delay node on the right side
		 *  @type {DelayNode}
		 *  @private
		 */
		this._rightDelay = this.context.createDelay();

		/**
		 *  the delay time signal
		 *  @type {Tone.Signal}
		 */
		this.delayTime = new Tone.Signal(0);

		/**
		 *  double the delayTime
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._timesTwo = new Tone.Multiply(2);

		//connect it up
		this.chain(this.effectSendL, this._leftDelay, this.effectReturnL);
		this.chain(this.effectSendR, this._rightDelay, this.effectReturnR);

		this.delayTime.connect(this._leftDelay.delayTime);
		this.chain(this.delayTime, this._timesTwo, this._rightDelay.delayTime);

		this.setDelayTime(options.delayTime);
	};

	Tone.extend(Tone.PingPongDelay, Tone.StereoXFeedbackEffect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.PingPongDelay.defaults = {
		"delayTime" : 0.25,
	};

	/**
	 * setDelayTime
	 * 
	 * @param {Tone.Time} delayTime
	 */
	Tone.PingPongDelay.prototype.setDelayTime = function(delayTime){
		this.delayTime.setValue(this.toSeconds(delayTime));
	};

	/**
	 *  set all of the parameters with an object
	 *  @param {Object} params 
	 */
	Tone.PingPongDelay.prototype.set = function(params){
		if (!this.isUndef(params.delayTime)) this.setDelayTime(params.delayTime);
		Tone.StereoXFeedbackEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.PingPongDelay.prototype.dispose = function(){
		Tone.StereoXFeedbackEffect.prototype.dispose.call(this);
		this._leftDelay.disconnect();
		this._rightDelay.disconnect();
		this._timesTwo.dispose();
		this.delayTime.dispose();
		this._leftDelay = null;
		this._rightDelay = null;
		this._timesTwo = null;
		this.delayTime = null;
	};

	return Tone.PingPongDelay;
});
define('Tone/instrument/Instrument',["Tone/core/Tone", "Tone/source/Source", "Tone/core/Note"], function(Tone){

	

	/**
	 *  @class  Base-class for all instruments
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Instrument = function(){

		/**
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();
	};

	Tone.extend(Tone.Instrument);

	/**
	 *  @abstract
	 *  @param {string|number} note the note to trigger
	 *  @param {Tone.Time=} time the time to trigger the ntoe
	 *  @param {number=} velocity the velocity to trigger the note
	 */
	Tone.Instrument.prototype.triggerAttack = function(){};

	/**
	 *  @abstract
	 *  @param {Tone.Time=} time when to trigger the release
	 */
	Tone.Instrument.prototype.triggerRelease = function(){};

	/**
	 *  trigger the attack and then the release
	 *  @param  {string|number} note     the note to trigger
	 *  @param  {Tone.Time=} duration the duration of the note
	 *  @param  {Tone.Time=} time     the time of the attack
	 *  @param  {number} velocity the velocity
	 */
	Tone.Instrument.prototype.triggerAttackRelease = function(note, duration, time, velocity){
		time = this.toSeconds(time);
		duration = this.toSeconds(duration);
		this.triggerAttack(note, time, velocity);
		this.triggerRelease(time + duration);
	};

	/**
	 *  gets the setVolume method from {@link Tone.Source}
	 *  @method
	 */
	Tone.Instrument.prototype.setVolume = Tone.Source.prototype.setVolume;

	/**
	 *  clean up
	 */
	Tone.Instrument.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
	};

	return Tone.Instrument;
});
define('Tone/instrument/Monophonic',["Tone/core/Tone", "Tone/instrument/Instrument", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class  this is a base class for monophonic instruments. 
	 *          it defines their interfaces
	 *
	 *  @constructor
	 *  @abstract
	 *  @extends {Tone.Instrument}
	 */
	Tone.Monophonic = function(options){

		Tone.Instrument.call(this);

		//get the defaults
		options = this.defaultArg(options, Tone.Monophonic.defaults);

		/**
		 *  the portamento time
		 *  @type {number}
		 */
		this.portamento = options.portamento;
	};

	Tone.extend(Tone.Monophonic, Tone.Instrument);

	/**
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Monophonic.defaults = {
		"portamento" : 0
	};

	/**
	 *  trigger the attack. start the note, at the time with the velocity
	 *  
	 *  @param  {string|string} note     the note
	 *  @param  {Tone.Time=} [time=now]     the time, if not given is now
	 *  @param  {number=} [velocity=1] velocity defaults to 1
	 */
	Tone.Monophonic.prototype.triggerAttack = function(note, time, velocity) {
		time = this.toSeconds(time);
		this.triggerEnvelopeAttack(time, velocity);
		this.setNote(note, time);
	};

	/**
	 *  trigger the release portion of the envelope
	 *  @param  {Tone.Time} [time=now] if no time is given, the release happens immediatly
	 */
	Tone.Monophonic.prototype.triggerRelease = function(time){
		this.triggerEnvelopeRelease(time);
	};

	/**
	 *  override this method with the actual method
	 *  @abstract
	 *  @param {Tone.Time} [time=now] the time the attack should happen
	 *  @param {number} [velocity=1] the velocity of the envelope
	 */	
	Tone.Monophonic.prototype.triggerEnvelopeAttack = function() {};

	/**
	 *  override this method with the actual method
	 *  @abstract
	 *  @param {Tone.Time} [time=now] the time the attack should happen
	 *  @param {number} [velocity=1] the velocity of the envelope
	 */	
	Tone.Monophonic.prototype.triggerEnvelopeRelease = function() {};

	/**
	 *  set the note to happen at a specific time
	 *  @param {number|string} note if the note is a string, it will be 
	 *                              parsed as (NoteName)(Octave) i.e. A4, C#3, etc
	 *                              otherwise it will be considered as the frequency
	 */
	Tone.Monophonic.prototype.setNote = function(note, time){
		if (typeof note === "string"){
			note = this.noteToFrequency(note);
		}
		time = this.toSeconds(time);
		if (this.portamento > 0){
			var currentNote = this.frequency.getValue();
			this.frequency.setValueAtTime(currentNote, time);
			this.frequency.exponentialRampToValueAtTime(note, time + this.portamento);
		} else {
			this.frequency.setValueAtTime(note, time);
		}
	};

	/**
	 *  set the glide time between notes
	 *  @param {Tone.Time} port glide time
	 */
	Tone.Monophonic.prototype.setPortamento = function(port){
		this.portamento = this.toSeconds(port);
	};

	/**
	 *  bulk setter
	 *  @param {Object} params the params
	 */
	Tone.Monophonic.prototype.set = function(params) {
		if (!this.isUndef(params.volume)) this.setVolume(params.volume);
		if (!this.isUndef(params.portamento)) this.setPortamento(params.portamento);
	};

	/**
	 *  set the preset if it exists
	 *  @param {string} presetName the name of the preset
	 */
	Tone.Monophonic.prototype.setPreset = function(presetName){
		if (!this.isUndef(this.preset) && this.preset.hasOwnProperty(presetName)){
			this.set(this.preset[presetName]);
		}
	};

	/**
	 *  clean up
	 */
	Tone.Monophonic.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
	};

	return Tone.Monophonic;
});
define('Tone/instrument/MonoSynth',["Tone/core/Tone", "Tone/component/Envelope", "Tone/source/Oscillator", 
	"Tone/signal/Signal", "Tone/component/Filter", "Tone/signal/Add", "Tone/instrument/Monophonic"], 
function(Tone){

	

	/**
	 *  @class  the MonoSynth is a single oscillator, monophonic synthesizer
	 *          with a filter, and two envelopes (on the filter and the amplitude)
	 *
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} options the options available for the synth 
	 *                          see defaults below
	 */
	Tone.MonoSynth = function(options){

		//get the defaults
		options = this.defaultArg(options, Tone.MonoSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  the first oscillator
		 *  @type {Tone.Oscillator}
		 */
		this.oscillator = new Tone.Oscillator(0, options.oscType);

		/**
		 *  the frequency control signal
		 *  @type {Tone.Signal}
		 */
		this.frequency = this.oscillator.frequency;

		/**
		 *  the detune control signal
		 *  @type {Tone.Signal}
		 */
		this.detune = this.oscillator.detune;

		/**
		 *  the filter
		 *  @type {Tone.Filter}
		 */
		this.filter = new Tone.Filter(options.filter);

		/**
		 *  the filter envelope
		 *  @type {Tone.Envelope}
		 */
		this.filterEnvelope = new Tone.Envelope(options.filterEnvelope);

		/**
		 *  the amplitude envelope
		 *  @type {Tone.Envelope}
		 */
		this.envelope = new Tone.Envelope(options.envelope);

		/**
		 *  the amplitude
		 *  @type {GainNode}
		 *  @private
		 */
		this._amplitude = this.context.createGain();

		//connect the oscillators to the output
		this.oscillator.connect(this.filter);
		this.filter.connect(this._amplitude);
		//start the oscillators
		this.oscillator.start();
		//connect the envelopes
		this.filterEnvelope.connect(this.filter.frequency);
		this.envelope.connect(this._amplitude.gain);
		this._amplitude.connect(this.output);
	};

	Tone.extend(Tone.MonoSynth, Tone.Monophonic);

	/**
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.MonoSynth.defaults = {
		"oscType" : "square",
		"filter" : {
			"Q" : 6,
			"type" : "lowpass",
			"rolloff" : -24
		},
		"envelope" : {
			"attack" : 0.005,
			"decay" : 0.1,
			"sustain" : 0.9,
			"release" : 1
		},
		"filterEnvelope" : {
			"attack" : 0.06,
			"decay" : 0.2,
			"sustain" : 0.5,
			"release" : 2,
			"min" : 20,
			"max" : 4000
		}
	};

	/**
	 *  start the attack portion of the envelope
	 *  @param {Tone.Time=} [time=now] the time the attack should start
	 *  @param {number=} velocity the velocity of the note (0-1)
	 */
	Tone.MonoSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
		//the envelopes
		this.envelope.triggerAttack(time, velocity);
		this.filterEnvelope.triggerAttack(time);		
	};

	/**
	 *  start the release portion of the envelope
	 *  @param {Tone.Time=} [time=now] the time the release should start
	 */
	Tone.MonoSynth.prototype.triggerEnvelopeRelease = function(time){
		this.envelope.triggerRelease(time);
		this.filterEnvelope.triggerRelease(time);
	};

	/**
	 *  set the oscillator type
	 *  @param {string} oscType the type of oscillator
	 */
	Tone.MonoSynth.prototype.setOscType = function(type){
		this.oscillator.setType(type);
	};

	/**
	 *  set the members at once
	 *  @param {Object} params all of the parameters as an object.
	 *                         params for envelope and filterEnvelope 
	 *                         should be nested objects. 
	 */
	Tone.MonoSynth.prototype.set = function(params){
		if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
		if (!this.isUndef(params.oscType)) this.setOscType(params.oscType);
		if (!this.isUndef(params.filterEnvelope)) this.filterEnvelope.set(params.filterEnvelope);
		if (!this.isUndef(params.envelope)) this.envelope.set(params.envelope);
		if (!this.isUndef(params.filter)) this.filter.set(params.filter);
		Tone.Monophonic.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.MonoSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this.oscillator.dispose();
		this.envelope.dispose();
		this.filterEnvelope.dispose();
		this.filter.dispose();
		this._amplitude.disconnect();
		this.oscillator = null;
		this.filterEnvelope = null;
		this.envelope = null;
		this.filter = null;
		this.detune = null;
		this._amplitude = null;
		this.frequency = null;
		this.detune = null;
	};

	return Tone.MonoSynth;
});
define('Tone/instrument/DuoSynth',["Tone/core/Tone", "Tone/instrument/MonoSynth", "Tone/component/LFO", "Tone/signal/Signal", "Tone/signal/Multiply", "Tone/instrument/Monophonic"], 
function(Tone){

	

	/**
	 *  @class  the DuoSynth is a monophonic synth composed of two 
	 *          MonoSynths run in parallel with control over the 
	 *          frequency ratio between the two voices and vibrato effect.
	 *
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} options the options available for the synth 
	 *                          see defaults below
	 */
	Tone.DuoSynth = function(options){

		options = this.defaultArg(options, Tone.DuoSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  the first voice
		 *  @type {Tone.MonoSynth}
		 */
		this.voice0 = new Tone.MonoSynth(options.voice0);
		this.voice0.setVolume(-10);

		/**
		 *  the second voice
		 *  @type {Tone.MonoSynth}
		 */
		this.voice1 = new Tone.MonoSynth(options.voice1);
		this.voice1.setVolume(-10);

		/**
		 *  the vibrato lfo
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._vibrato = new Tone.LFO(options.vibratoRate, -50, 50);
		this._vibrato.start();

		/**
		 *  the vibrato gain
		 *  @type {GainNode}
		 *  @private
		 */
		this._vibratoGain = this.context.createGain();
		this._vibratoGain.gain.value = options.vibratoAmount;

		/**
		 *  the delay before the vibrato starts
		 *  @type {number}
		 *  @private
		 */
		this._vibratoDelay = this.toSeconds(options.vibratoDelay);

		/**
		 *  the amount before the vibrato starts
		 *  @type {number}
		 *  @private
		 */
		this._vibratoAmount = options.vibratoAmount;

		/**
		 *  the frequency control
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(440);

		/**
		 *  the ratio between the two voices
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._harmonicity = new Tone.Multiply(options.harmonicity);

		//control the two voices frequency
		this.frequency.connect(this.voice0.frequency);
		this.chain(this.frequency, this._harmonicity, this.voice1.frequency);
		this._vibrato.connect(this._vibratoGain);
		this.fan(this._vibratoGain, this.voice0.detune, this.voice1.detune);
		this.voice0.connect(this.output);
		this.voice1.connect(this.output);
	};

	Tone.extend(Tone.DuoSynth, Tone.Monophonic);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.DuoSynth.defaults = {
		"vibratoAmount" : 0.5,
		"vibratoRate" : 5,
		"vibratoDelay" : 1,
		"harmonicity" : 1.5,
		"voice0" : {
			"volume" : -10,
			"portamento" : 0,
			"oscType" : "sine",
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			}
		},
		"voice1" : {
			"volume" : -10,
			"portamento" : 0,
			"oscType" : "sine",
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			}
		}
	};

	/**
	 *  start the attack portion of the envelopes
	 *  
	 *  @param {Tone.Time=} [time=now] the time the attack should start
	 *  @param {number=} velocity the velocity of the note (0-1)
	 */
	Tone.DuoSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
		time = this.toSeconds(time);
		this.voice0.envelope.triggerAttack(time, velocity);
		this.voice1.envelope.triggerAttack(time, velocity);
		this.voice0.filterEnvelope.triggerAttack(time);
		this.voice1.filterEnvelope.triggerAttack(time);
	};

	/**
	 *  start the release portion of the envelopes
	 *  
	 *  @param {Tone.Time=} [time=now] the time the release should start
	 */
	Tone.DuoSynth.prototype.triggerEnvelopeRelease = function(time){
		this.voice0.triggerRelease(time);
		this.voice1.triggerRelease(time);
	};

	/**
	 *  set the ratio between the two oscillator
	 *  @param {number} ratio
	 */
	Tone.DuoSynth.prototype.setHarmonicity = function(ratio){
		this._harmonicity.setValue(ratio);
	};

	/**
	 *  the glide time between frequencies
	 *  @param {Tone.Time} port
	 */
	Tone.DuoSynth.prototype.setPortamento = function(port){
		this.portamento = this.toSeconds(port);
	};

	/**
	 *  the delay before the vibrato kicks in
	 *  @param {Tone.Time} delay
	 */
	Tone.DuoSynth.prototype.setVibratoDelay = function(delay){
		this._vibratoDelay = this.toSeconds(delay);
	};

	/**
	 *  the vibrato amount. 1 is full vib. 0 is none.
	 *  @param {number} amount an amount between 0-1
	 */
	Tone.DuoSynth.prototype.setVibratoAmount = function(amount){
		this._vibratoAmount = amount;
		this._vibratoGain.gain.setValueAtTime(amount, this.now());
	};

	/**
	 *  the rate of the vibrato
	 *  @param {number} rate
	 */
	Tone.DuoSynth.prototype.setVibratoRate = function(rate){
		this._vibrato.setFrequency(rate);
	};

	/**
	 *  set the volume of the instrument.
	 *  borrowed from {@link Tone.Source}
	 *  @function
	 */
	Tone.DuoSynth.prototype.setVolume = Tone.Source.prototype.setVolume;

	/**
	 *  bulk setter
	 *  @param {Object} param 
	 */
	Tone.DuoSynth.prototype.set = function(params){
		if (!this.isUndef(params.harmonicity)) this.setHarmonicity(params.harmonicity);
		if (!this.isUndef(params.vibratoRate)) this.setVibratoRate(params.vibratoRate);
		if (!this.isUndef(params.vibratoAmount)) this.setVibratoAmount(params.vibratoAmount);
		if (!this.isUndef(params.vibratoDelay)) this.setVibratoDelay(params.vibratoDelay);
		if (!this.isUndef(params.voice0)) this.voice0.set(params.voice0);
		if (!this.isUndef(params.voice1)) this.voice1.set(params.voice1);
		Tone.Monophonic.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.DuoSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this.voice0.dispose();
		this.voice1.dispose();
		this.frequency.dispose();
		this._vibrato.dispose();
		this._vibratoGain.disconnect();
		this._harmonicity.dispose();
		this.voice0 = null;
		this.voice1 = null;
		this.frequency = null;
		this._vibrato = null;
		this._vibratoGain = null;
		this._harmonicity = null;
	};

	return Tone.DuoSynth;
});
define('Tone/instrument/FMSynth',["Tone/core/Tone", "Tone/instrument/MonoSynth", "Tone/signal/Signal", "Tone/signal/Multiply", "Tone/instrument/Monophonic"], 
function(Tone){

	

	/**
	 *  @class  the FMSynth is composed of two MonoSynths where one MonoSynth is the 
	 *          carrier and the second is the modulator.
	 *
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} options the options available for the synth 
	 *                          see defaults below
	 */
	Tone.FMSynth = function(options){

		options = this.defaultArg(options, Tone.FMSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  the first voice
		 *  @type {Tone.MonoSynth}
		 */
		this.carrier = new Tone.MonoSynth(options.carrier);
		this.carrier.setVolume(-10);

		/**
		 *  the second voice
		 *  @type {Tone.MonoSynth}
		 */
		this.modulator = new Tone.MonoSynth(options.modulator);
		this.modulator.setVolume(-10);

		/**
		 *  the frequency control
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(440);

		/**
		 *  the ratio between the two voices
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._harmonicity = new Tone.Multiply(options.harmonicity);

		/**
		 *  which is in essence the depth or amount of the modulation. In other terms it is the 
		 *  ratio of the frequency of the modulating signal (mf) to the amplitude of the 
		 *  modulating signal (ma) -- as in ma/mf. 
		 *
		 *	@type {Tone.Multiply}
		 *	@private
		 */
		this._modulationIndex = new Tone.Multiply(options.modulationIndex);

		/**
		 *  the node where the modulation happens
		 *  @type {GainNode}
		 *  @private
		 */
		this._modulationNode = this.context.createGain();

		//control the two voices frequency
		this.frequency.connect(this.carrier.frequency);
		this.chain(this.frequency, this._harmonicity, this.modulator.frequency);
		this.chain(this.frequency, this._modulationIndex, this._modulationNode);
		this.modulator.connect(this._modulationNode.gain);
		this._modulationNode.gain.value = 0;
		this._modulationNode.connect(this.carrier.frequency);
		this.carrier.connect(this.output);
	};

	Tone.extend(Tone.FMSynth, Tone.Monophonic);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.FMSynth.defaults = {
		"harmonicity" : 3,
		"modulationIndex" : 10,
		"carrier" : {
			"volume" : -10,
			"portamento" : 0,
			"oscType" : "sine",
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5,
				"min" : 20000,
				"max" : 20000
			}
		},
		"modulator" : {
			"volume" : -10,
			"portamento" : 0,
			"oscType" : "triangle",
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5,
				"min" : 20000,
				"max" : 20000
			}
		}
	};

	/**
	 *  trigger the attack portion of the note
	 *  
	 *  @param  {Tone.Time=} [time=now] the time the note will occur
	 *  @param {number=} velocity the velocity of the note
	 */
	Tone.FMSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
		//the port glide
		time = this.toSeconds(time);
		//the envelopes
		this.carrier.envelope.triggerAttack(time, velocity);
		this.modulator.envelope.triggerAttack(time);
		this.carrier.filterEnvelope.triggerAttack(time);
		this.modulator.filterEnvelope.triggerAttack(time);
	};

	/**
	 *  trigger the release portion of the note
	 *  
	 *  @param  {Tone.Time=} [time=now] the time the note will release
	 */
	Tone.FMSynth.prototype.triggerEnvelopeRelease = function(time){
		this.carrier.triggerRelease(time);
		this.modulator.triggerRelease(time);
	};

	/**
	 *  set the ratio between the two carrier and the modulator
	 *  @param {number} ratio
	 */
	Tone.FMSynth.prototype.setHarmonicity = function(ratio){
		this._harmonicity.setValue(ratio);
	};

	/**
	 *  set the modulation index
	 *  @param {number} index
	 */
	Tone.FMSynth.prototype.setModulationIndex = function(index){
		this._modulationIndex.setValue(index);
	};

	/**
	 *  bulk setter
	 *  @param {Object} param 
	 */
	Tone.FMSynth.prototype.set = function(params){
		if (!this.isUndef(params.harmonicity)) this.setHarmonicity(params.harmonicity);
		if (!this.isUndef(params.modulationIndex)) this.setModulationIndex(params.modulationIndex);
		if (!this.isUndef(params.carrier)) this.carrier.set(params.carrier);
		if (!this.isUndef(params.modulator)) this.modulator.set(params.modulator);
		Tone.Monophonic.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.FMSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this.carrier.dispose();
		this.modulator.dispose();
		this.frequency.dispose();
		this._modulationIndex.dispose();
		this._harmonicity.dispose();
		this._modulationNode.disconnect();
		this.carrier = null;
		this.modulator = null;
		this.frequency = null;
		this._modulationIndex = null;
		this._harmonicity = null;
		this._modulationNode = null;
	};

	return Tone.FMSynth;
});
define('Tone/source/Player',["Tone/core/Tone", "Tone/source/Source"], function(Tone){

	
	
	/**
	 *  @class  Audio file player with start, loop, stop.
	 *  
	 *  @constructor
	 *  @extends {Tone.Source} 
	 *  @param {string=} url if a url is passed in, it will be loaded
	 *                       and invoke the callback if it also passed
	 *                       in.
	 *  @param {function(Tone.Player)=} onload callback to be invoked
	 *                                     once the url is loaded
	 */
	Tone.Player = function(url, onload){
		
		Tone.Source.call(this);

		/**
		 *  @private
		 *  @type {AudioBufferSourceNode}
		 */
		this._source = null;
		
		/**
		 *  the buffer
		 *  @private
		 *  @type {AudioBuffer}
		 */
		this._buffer = null;


		/**
		 *  the duration of the buffer once it's been loaded
		 *  @type {number}
		 *  @readOnly
		 */
		this.duration = 0;

		/**
		 *  if the buffer should loop once it's over
		 *  @type {boolean}
		 */
		this.loop = false;

		/**
		 *  if 'loop' is true, the loop will start at this position
		 *  
		 *  @type {number}
		 */
		this.loopStart = 0;

		/**
		 *  if 'loop' is true, the loop will end at this position
		 *  
		 *  @type {number}
		 */
		this.loopEnd = 0;

		/**
		 *  the playback rate
		 *  @private
		 *  @type {number}
		 */
		this._playbackRate = 1;

		/**
		 *  enabling retrigger will allow a player to be restarted
		 *  before the the previous 'start' is done playing
		 *  
		 *  @type {boolean}
		 */
		this.retrigger = false;

		/**
		 *  set a callback function to invoke when the sample is over
		 *  
		 *  @type {function}
		 */
		this.onended = function(){};

		//if there is a url, load it. 
		if (url){
			this.load(url, onload);
		}
	};

	Tone.extend(Tone.Player, Tone.Source);

	/**
	 *  makes an xhr reqest for the selected url
	 *  Load the audio file as an audio buffer.
	 *  Decodes the audio asynchronously and invokes
	 *  the callback once the audio buffer loads.
	 *
	 *  @param {string} url the url of the buffer to load.
	 *                      filetype support depends on the
	 *                      browser.
	 *  @param {function(Tone.Player)=} callback
	 */
	Tone.Player.prototype.load = function(url, callback){
		if (!this._buffer){
			var request = new XMLHttpRequest();
			request.open("GET", url, true);
			request.responseType = "arraybuffer";
			// decode asynchronously
			var self = this;
			request.onload = function() {
				self.context.decodeAudioData(request.response, function(buff) {
					self.setBuffer(buff);
					if (callback){
						callback(self);
					}
				});
			};
			//send the request
			request.send();
		} else {
			if (callback){
				callback(this);
			}
		}
	};

	/**
	 *  set the buffer
	 *
	 *  @param {AudioBuffer} buffer the buffer which the player will play.
	 *                              note: if you switch the buffer after
	 *                              the player is already started, it will not
	 *                              take effect until the next time the player
	 *                              is started.
	 */
	Tone.Player.prototype.setBuffer = function(buffer){
		this._buffer = buffer;
		this.duration = buffer.duration;
	};

	/**
	 *  play the buffer between the desired positions
	 *  	
	 *  @param  {Tone.Time=} startTime 
	 *  @param  {Tone.Time=} offset    
	 *  @param  {Tone.Time=} duration
	 */
	Tone.Player.prototype.start = function(startTime, offset, duration){
		if (this.state === Tone.Source.State.STOPPED || this.retrigger){
			if (this._buffer){
				this.state = Tone.Source.State.STARTED;
				//default args
				offset = this.defaultArg(offset, 0);
				if (this.loop){
					offset = this.loopStart;
				}
				duration = this.defaultArg(duration, this._buffer.duration - offset);
				//make the source
				this._source = this.context.createBufferSource();
				this._source.buffer = this._buffer;
				//set the looping properties
				this._source.loop = this.loop;
				this._source.loopStart = this.loopStart;
				this._source.loopEnd = this.loopEnd;
				//and other properties
				this._source.playbackRate.value = this._playbackRate;
				this._source.onended = this._onended.bind(this);
				this.chain(this._source, this.output);
				//start it
				this._source.start(this.toSeconds(startTime), this.toSeconds(offset), this.toSeconds(duration));
			}
		}
	};

	/**
	 *  Stop playback.
	 * 
	 *  @param  {Tone.Time} time
	 */
	Tone.Player.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED) {
			if (this._buffer && this._source){
				if (!time){
					this.state = Tone.Source.State.STOPPED;
				}
				this._source.stop(this.toSeconds(time));
			}
		}
	};

	/**
	 *  set the rate at which the file plays
	 *  
	 *  @param {number} rate
	 *  @param {Tone.Time=} rampTime (optional) the amount of time it takes to 
	 *                               reach the rate
	 */
	Tone.Player.prototype.setPlaybackRate = function(rate, rampTime){
		this._playbackRate = rate;
		if (this._source) {
			if (rampTime){
				this._source.playbackRate.exponentialRampToValueAtTime(rate, this.toSeconds(rampTime));
			} else {
				this._source.playbackRate.value = rampTime;
			}
		} 
	};

	/**
	 *  internal call when the buffer is done playing
	 *  
	 *  @private
	 */
	Tone.Player.prototype._onended = function(){
		this.state = Tone.Source.State.STOPPED;
		this.onended();
	};

	/**
	 *  dispose and disconnect
	 */
	Tone.Player.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		if (this._source !== null){
			this._source.disconnect();
			this._source = null;
		}
		this._buffer = null;
	};

	return Tone.Player;
});

define('Tone/instrument/Sampler',["Tone/core/Tone", "Tone/source/Player", "Tone/component/AmplitudeEnvelope", "Tone/component/Filter", "Tone/instrument/Instrument"], 
function(Tone){

	

	/**
	 *  @class A simple sampler instrument which plays an audio buffer 
	 *         through an amplitude envelope and optionally a filter
	 *         envelope.
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {string|object} url the url of the audio file
	 *  @param {function} load called when the sample has been loaded
	 */
	Tone.Sampler = function(){

		Tone.Instrument.call(this);

		var options = this.optionsObject(arguments, ["url", "load"], Tone.Sampler.defaults);

		/**
		 *  the sample player
		 *  @type {Tone.Player}
		 */
		this.player = new Tone.Player(options.url, options.load);
		this.player.retrigger = true;

		/**
		 *  the amplitude envelope
		 *  @type {Tone.Envelope}
		 */
		this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

		/**
		 *  the filter envelope
		 *  @type {Tone.Envelope}
		 */
		this.filterEnvelope = new Tone.Envelope(options.filterEnvelope);

		/**
		 *  the filter
		 *  @type {BiquadFilterNode}
		 */
		this.filter = new Tone.Filter(options.filter);

		//connections
		this.chain(this.player, this.filter, this.envelope, this.output);
		this.filterEnvelope.connect(this.filter.frequency);
	};

	Tone.extend(Tone.Sampler, Tone.Instrument);

	/**
	 *  the default parameters
	 *
	 *  @static
	 */
	Tone.Sampler.defaults = {
		"url" : null,
		"load" : function(){},
		"envelope" : {
			"attack" : 0.001,
			"decay" : 0,
			"sustain" : 1,
			"release" : 0.1
		},
		"filterEnvelope" : {
			"attack" : 0.001,
			"decay" : 0.001,
			"sustain" : 1,
			"release" : 0.5,
			"min" : 20,
			"max" : 20000
		},
		"filter" : {
			"type" : "lowpass"
		}
	};

	/**
	 *  set the parameters in bulk
	 *  @param {Object} param
	 */
	 Tone.Sampler.prototype.set = function(params){
	 	if (!this.isUndef(params.filterEnvelope)) this.filterEnvelope.set(params.filterEnvelope);
	 	if (!this.isUndef(params.envelope)) this.envelope.set(params.envelope);
	 	if (!this.isUndef(params.filter)) this.filter.set(params.filter);
	 };

	/**
	 *  start the sample
	 *
	 *  @param {number} [note=0] the interval in the sample should be played at 0 = no change
	 *  @param {Tone.Time} [time=now] the time when the note should start
	 *  @param {number} [velocity=1] the velocity of the note
	 */
	Tone.Sampler.prototype.triggerAttack = function(note, time, velocity){
		time = this.toSeconds(time);
		note = this.defaultArg(note, 0);
		this.player.setPlaybackRate(this.intervalToFrequencyRatio(note), time);
		this.player.start(time);
		this.envelope.triggerAttack(time, velocity);
		this.filterEnvelope.triggerAttack(time);
	};

	/**
	 *  start the release portion of the sample
	 *  
	 *  @param {Tone.Time} [time=now] the time when the note should release
	 */
	Tone.Sampler.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		this.filterEnvelope.triggerRelease(time);
		this.envelope.triggerRelease(time);
	};

	/**
	 *  clean up
	 */
	Tone.Sampler.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		this.player.dispose();
		this.filterEnvelope.dispose();
		this.envelope.dispose();
		this.filter.dispose();
		this.player = null;
		this.filterEnvelope = null;
		this.envelope = null;
		this.filter = null;
	};

	return Tone.Sampler;
});

define('Tone/instrument/MultiSampler',["Tone/core/Tone", "Tone/instrument/Sampler", "Tone/instrument/Instrument"], 
function(Tone){

	

	/**
	 *  @class Aggregates multiple Tone.Samplers into a single instrument.
	 *         Pass in a mapping of names to sample urls and an optional 
	 *         callback to invoke when all of the samples are loaded. 
	 *
	 *  @example
	 *  var sampler = new Tone.MultiSampler({
	 *  	"kick" : "../audio/BD.mp3",
	 *  	"snare" : "../audio/SD.mp3",
	 *  	"hat" : "../audio/hh.mp3"
	 *  }, onload);
	 *  //once loaded...
	 *  sampler.triggerAttack("kick");
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {Object} samples the samples used in this
	 *  @param {function} onload the callback to invoke when all 
	 *                           of the samples have been loaded
	 */
	Tone.MultiSampler = function(samples, onload){

	 	Tone.Instrument.call(this);

	 	/**
	 	 *  the array of voices
	 	 *  @type {Tone.Sampler}
	 	 */
		this.samples = {};

		//make the samples
		this._createSamples(samples, onload);
	};

	Tone.extend(Tone.MultiSampler, Tone.Instrument);

	/**
	 *  creates all of the samples and tracks their loading
	 *  
	 *  @param   {Object} samples the samples
	 *  @param   {function} onload  the onload callback
	 *  @private
	 */
	Tone.MultiSampler.prototype._createSamples = function(samples, onload){
		//object which tracks the number of loaded samples
		var loadCounter = {
			total : 0,
			loaded : 0
		};
		//get the count
		for (var s in samples){
			if (typeof samples[s] === "string"){
				loadCounter.total++;
			}
		}
		//the function to invoke when a sample is loaded
		var onSampleLoad = function(){
			loadCounter.loaded++;
			if (loadCounter.loaded === loadCounter.total){
				if (onload){
					onload();
				}
			}
		};
		for (var samp in samples){
			var url = samples[samp];
			var sampler = new Tone.Sampler(url, onSampleLoad);
			sampler.connect(this.output);
			this.samples[samp] = sampler;
		}
	};

	/**
	 *  start a sample
	 *  
	 *  @param  {string} sample the note name to start
	 *  @param {Tone.Time=} [time=now] the time when the note should start
	 *  @param {number} [velocity=1] the velocity of the note
	 */
	Tone.MultiSampler.prototype.triggerAttack = function(sample, time, velocity){
		if (this.samples.hasOwnProperty(sample)){
			this.samples[sample].triggerAttack(0, time, velocity);
		}
	};

	/**
	 *  start the release portion of the note
	 *  
	 *  @param  {string} sample the note name to release
	 *  @param {Tone.Time=} [time=now] the time when the note should release
	 */
	Tone.MultiSampler.prototype.triggerRelease = function(sample, time){
		if (this.samples.hasOwnProperty(sample)){
			this.samples[sample].triggerRelease(time);
		}
	};

	/**
	  *  start the release portion of the note
	  *  
	  *  @param  {string} sample the note name to release
	  *  @param {Tone.Time} duration the duration of the note
	  *  @param {Tone.Time} [time=now] the time when the note should start
	  *  @param {number} [velocity=1] the velocity of the note
	  */
	Tone.MultiSampler.prototype.triggerAttackRelease = function(sample, duration, time, velocity){
		if (this.samples.hasOwnProperty(sample)){
			time = this.toSeconds(time);
			duration = this.toSeconds(duration);
			var samp = this.samples[sample];
			samp.triggerAttack(0, time, velocity);
			samp.triggerRelease(time + duration);
		}
	};

	/**
	 *  sets all the samplers with these settings
	 *  @param {object} params the parameters to be applied 
	 *                         to all internal samplers
	 */
	Tone.MultiSampler.prototype.set = function(params){
		for (var samp in this.samples){
			this.samples[samp].set(params);
		}
	};

	/**
	 *  set volume method borrowed form {@link Tone.Source}
	 *  @function
	 */
	Tone.MultiSampler.prototype.setVolume = Tone.Source.prototype.setVolume;

	/**
	 *  clean up
	 */
	Tone.MultiSampler.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		for (var samp in this.samples){
			this.samples[samp].dispose();
			this.samples[samp] = null;
		}
		this.samples = null;
	};

	return Tone.MultiSampler;
});

define('Tone/source/Noise',["Tone/core/Tone", "Tone/source/Source"], function(Tone){

	

	/**
	 *  @class  Noise generator. 
	 *          Uses looped noise buffers to save on performance. 
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {string} type the noise type (white|pink|brown)
	 */
	Tone.Noise = function(type){

		Tone.Source.call(this);

		/**
		 *  @private
		 *  @type {AudioBufferSourceNode}
		 */
		this._source = null;
		
		/**
		 *  the buffer
		 *  @private
		 *  @type {AudioBuffer}
		 */
		this._buffer = null;

		/**
		 *  set a callback function to invoke when the sample is over
		 *  
		 *  @type {function}
		 */
		this.onended = function(){};

		this.setType(this.defaultArg(type, "white"));
	};

	Tone.extend(Tone.Noise, Tone.Source);

	/**
	 *  set the noise type
	 *  
	 *  @param {string} type the noise type (white|pink|brown)
	 *  @param {Tone.Time} time (optional) time that the set will occur
	 */
	Tone.Noise.prototype.setType = function(type, time){
		switch (type){
			case "white" : 
				this._buffer = _whiteNoise;
				break;
			case "pink" : 
				this._buffer = _pinkNoise;
				break;
			case "brown" : 
				this._buffer = _brownNoise;
				break;
			default : 
				this._buffer = _whiteNoise;
		}
		//if it's playing, stop and restart it
		if (this.state === Tone.Source.State.STARTED){
			time = this.toSeconds(time);
			//remove the listener
			this._source.onended = undefined;
			this._stop(time);
			this._start(time);
		}
	};

	/**
	 *  internal start method
	 *  
	 *  @param {Tone.Time} time
	 *  @private
	 */
	Tone.Noise.prototype._start = function(time){		
		this._source = this.context.createBufferSource();
		this._source.buffer = this._buffer;
		this._source.loop = true;
		this.chain(this._source, this.output);
		this._source.start(this.toSeconds(time));
		this._source.onended = this._onended.bind(this);
	};

	/**
	 *  start the noise at a specific time
	 *  
	 *  @param {Tone.Time} time
	 */
	Tone.Noise.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
			//make the source
			this._start(time);
		}
	};

	/**
	 *  internal stop method
	 *  
	 *  @param {Tone.Time} time
	 *  @private
	 */
	Tone.Noise.prototype._stop = function(time){
		this._source.stop(this.toSeconds(time));
	};


	/**
	 *  stop the noise at a specific time
	 *  
	 *  @param {Tone.Time} time
	 */
	Tone.Noise.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED) {
			if (this._buffer && this._source){
				if (!time){
					this.state = Tone.Source.State.STOPPED;
				}
				this._stop(time);
			}
		}
	};

	/**
	 *  internal call when the buffer is done playing
	 *  
	 *  @private
	 */
	Tone.Noise.prototype._onended = function(){
		this.state = Tone.Source.State.STOPPED;
		this.onended();
	};

	/**
	 *  dispose all the components
	 */
	Tone.Noise.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		if (this._source !== null){
			this._source.disconnect();
			this._source = null;
		}
		this._buffer = null;
	};


	///////////////////////////////////////////////////////////////////////////
	// THE BUFFERS
	// borred heavily from http://noisehack.com/generate-noise-web-audio-api/
	///////////////////////////////////////////////////////////////////////////

	/**
	 *	static noise buffers
	 *  
	 *  @static
	 *  @private
	 *  @type {AudioBuffer}
	 */
	var _pinkNoise = null, _brownNoise = null, _whiteNoise = null;

	Tone._initAudioContext(function(audioContext){

		var sampleRate = audioContext.sampleRate;
		
		//four seconds per buffer
		var bufferLength = sampleRate * 4;

		//fill the buffers
		_pinkNoise = (function() {
			var buffer = audioContext.createBuffer(2, bufferLength, sampleRate);
			for (var channelNum = 0; channelNum < buffer.numberOfChannels; channelNum++){
				var channel = buffer.getChannelData(channelNum);
				var b0, b1, b2, b3, b4, b5, b6;
				b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
				for (var i = 0; i < bufferLength; i++) {
					var white = Math.random() * 2 - 1;
					b0 = 0.99886 * b0 + white * 0.0555179;
					b1 = 0.99332 * b1 + white * 0.0750759;
					b2 = 0.96900 * b2 + white * 0.1538520;
					b3 = 0.86650 * b3 + white * 0.3104856;
					b4 = 0.55000 * b4 + white * 0.5329522;
					b5 = -0.7616 * b5 - white * 0.0168980;
					channel[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
					channel[i] *= 0.11; // (roughly) compensate for gain
					b6 = white * 0.115926;
				}
			}
			return buffer;
		}());

		_brownNoise = (function() {
			var buffer = audioContext.createBuffer(2, bufferLength, sampleRate);
			for (var channelNum = 0; channelNum < buffer.numberOfChannels; channelNum++){
				var channel = buffer.getChannelData(channelNum);
				var lastOut = 0.0;
				for (var i = 0; i < bufferLength; i++) {
					var white = Math.random() * 2 - 1;
					channel[i] = (lastOut + (0.02 * white)) / 1.02;
					lastOut = channel[i];
					channel[i] *= 3.5; // (roughly) compensate for gain
				}
			}
			return buffer;
		})();

		_whiteNoise = (function(){
			var buffer = audioContext.createBuffer(2, bufferLength, sampleRate);
			for (var channelNum = 0; channelNum < buffer.numberOfChannels; channelNum++){
				var channel = buffer.getChannelData(channelNum);
				for (var i = 0; i < bufferLength; i++){
					channel[i] =  Math.random() * 2 - 1;
				}
			}
			return buffer;
		}());
	});

	return Tone.Noise;
});
define('Tone/instrument/PluckSynth',["Tone/core/Tone", "Tone/instrument/Instrument", "Tone/source/Noise", "Tone/component/LowpassCombFilter"], function(Tone){

	

	/**
	 *  @class Karplus-String string synthesis. 
	 *  
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 */
	Tone.PluckSynth = function(){

		Tone.Instrument.call(this);

		/**
		 *  @type {Tone.Noise}
		 *  @private
		 */
		this._noise = new Tone.Noise("pink");

		/**
		 *  the amount of noise at the attack. 
		 *  nominal range of [0.1, 20]
		 *  @type {number}
		 */
		this.attackNoise = 1;

		/**
		 *  the LFCF
		 *  @type {Tone.LowpassCombFilter}
		 *  @private
		 */
		this._lfcf = new Tone.LowpassCombFilter(1 / 440);

		/**
		 *  the resonance control
		 *  @type {Tone.Signal}
		 */
		this.resonance = this._lfcf.resonance;

		/**
		 *  the dampening control. i.e. the lowpass filter frequency of the comb filter
		 *  @type {Tone.Signal}
		 */
		this.dampening = this._lfcf.dampening;

		//connections
		this._noise.connect(this._lfcf);
		this._lfcf.connect(this.output);
	};

	Tone.extend(Tone.PluckSynth, Tone.Instrument);


	/**
	 *  trigger the attack portion
	 */
	Tone.PluckSynth.prototype.triggerAttack = function(note, time) {
		if (typeof note === "string"){
			note = this.noteToFrequency(note);
		}
		time = this.toSeconds(time);
		var delayAmount = 1 / note;
		this._lfcf.setDelayTime(delayAmount, time);		
		this._noise.start(time);
		this._noise.stop(time + delayAmount * this.attackNoise);
	};

	/**
	 *  clean up
	 */
	Tone.PluckSynth.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		this._noise.dispose();
		this._lfcf.dispose();
		this._noise = null;
		this._lfcf = null;
		this.dampening = null;
		this.resonance = null;
	};

	return Tone.PluckSynth;
});
define('Tone/instrument/PolySynth',["Tone/core/Tone", "Tone/instrument/MonoSynth", "Tone/source/Source"], 
function(Tone){

	

	/**
	 *  @class  Creates a polyphonic synthesizer out of 
	 *          the monophonic voice which is passed in. 
	 *
	 *  @example
	 *  //a polysynth composed of 6 Voices of MonoSynth
	 *  var synth = new Tone.PolySynth(6, Tone.MonoSynth);
	 *  //set the MonoSynth preset
	 *  synth.setPreset("Pianoetta");
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {number|Object} [polyphony=4] the number of voices to create
	 *  @param {function} [voice=Tone.MonoSynth] the constructor of the voices
	 *                                            uses Tone.MonoSynth by default
	 *  @param {Object} voiceOptions the options to pass to the voice                                          
	 */
	Tone.PolySynth = function(){

		Tone.Instrument.call(this);

		var options = this.optionsObject(arguments, ["polyphony", "voice", "voiceOptions"], Tone.PolySynth.defaults);

		/**
		 *  the array of voices
		 *  @private
		 *  @type {Array}
		 */
		this._voices = new Array(options.polyphony);

		/**
		 *  the queue of free voices
		 *  @private
		 *  @type {Array}
		 */
		this._freeVoices = [];

		/**
		 *  keeps track of which notes are down
		 *  @private
		 *  @type {Object}
		 */
		this._activeVoices = {};

		//create the voices
		for (var i = 0; i < options.polyphony; i++){
			var v = new options.voice(options.voiceOptions);
			this._voices[i] = v;
			v.connect(this.output);
		}

		//make a copy of the voices
		this._freeVoices = this._voices.slice(0);
	};

	Tone.extend(Tone.PolySynth, Tone.Instrument);

	/**
	 *  the defaults
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.PolySynth.defaults = {
		"polyphony" : 4,
		"voice" : Tone.MonoSynth,
		"voiceOptions" : {
			"portamento" : 0
		}
	};

	/**
	 *  trigger the attack
	 *  @param  {string|number|Object} value the value of the note to start
	 *  @param  {Tone.Time=} [time=now]  the start time of the note
	 *  @param {number=} velocity the velocity of the note
	 */
	Tone.PolySynth.prototype.triggerAttack = function(value, time, velocity){
		var stringified = JSON.stringify(value);
		if (this._activeVoices[stringified]){
			this._activeVoices[stringified].triggerAttack(value, time, velocity);
		} else if (this._freeVoices.length > 0){
			var voice = this._freeVoices.shift();
			voice.triggerAttack(value, time, velocity);
			this._activeVoices[stringified] = voice;
		}
	};

	/**
	 *  trigger the attack and release after the specified duration
	 *  
	 *  @param  {number|string} note     the note as a number or a string note name
	 *  @param  {Tone.Time} duration the duration of the note
	 *  @param  {Tone.Time=} time     if no time is given, defaults to now
	 *  @param  {number=} velocity the velocity of the attack (0-1)
	 */
	Tone.PolySynth.prototype.triggerAttackRelease = function(value, duration, time, velocity){
		time = this.toSeconds(time);
		this.triggerAttack(value, time, velocity);
		this.triggerRelease(value, time + this.toSeconds(duration));
	};

	/**
	 *  trigger the release of a note
	 *  @param  {string|number|Object} value the value of the note to release
	 *  @param  {Tone.Time=} [time=now]  the release time of the note
	 */
	Tone.PolySynth.prototype.triggerRelease = function(value, time){
		//get the voice
		var stringified = JSON.stringify(value);
		var voice = this._activeVoices[stringified];
		if (voice){
			voice.triggerRelease(time);
			this._freeVoices.push(voice);
			this._activeVoices[stringified] = null;
		}
	};

	/**
	 *  set the options on all of the voices
	 *  @param {Object} params 
	 */
	Tone.PolySynth.prototype.set = function(params){
		for (var i = 0; i < this._voices.length; i++){
			this._voices[i].set(params);
		}
	};

	/**
	 *  @param {string} presetName the preset name
	 */
	Tone.PolySynth.prototype.setPreset = function(presetName){
		for (var i = 0; i < this._voices.length; i++){
			this._voices[i].setPreset(presetName);
		}
	};

	/**
	 *  clean up
	 */
	Tone.PolySynth.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		for (var i = 0; i < this._voices.length; i++){
			this._voices[i].dispose();
			this._voices[i] = null;
		}
		this._voices = null;
		this._activeVoices = null;
		this._freeVoices = null;
	};

	return Tone.PolySynth;
});
define('Tone/signal/Max',["Tone/core/Tone", "Tone/signal/GreaterThan", "Tone/signal/Select", "Tone/signal/Signal"], function(Tone){

	

	/**
	 * 	@class  the output signal is the greater of the incoming signal and max
	 * 	
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} max the 
	 */
	Tone.Max = function(max){
		Tone.call(this);

		/**
		 *  the max signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._maxSignal = new Tone.Signal(max);

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._switch = new Tone.Select(2);

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._gt = new Tone.GreaterThan(max);

		//connections
		this._maxSignal.connect(this._switch, 0, 0);
		this.input.connect(this._switch, 0, 1);
		this.input.connect(this._gt);
		this._gt.connect(this._switch.gate);
		this._switch.connect(this.output);
	};

	Tone.extend(Tone.Max);

	/**
	 *  set the max value
	 *  @param {number} max the maximum to compare to the incoming signal
	 */
	Tone.Max.prototype.setMax = function(max){
		this._maxSignal.setValue(max);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Max.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Max.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._maxSignal.dispose();
		this._switch.dispose();
		this._gt.dispose();
		this._maxSignal = null;
		this._switch = null;
		this._gt = null;
	};

	return Tone.Max;
});
define('Tone/signal/Min',["Tone/core/Tone", "Tone/signal/LessThan", "Tone/signal/Select", "Tone/signal/Signal"], function(Tone){

	

	/**
	 * 	@class  the output signal is the lesser of the incoming signal and min
	 * 	
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} min the minimum to compare to the incoming signal
	 */
	Tone.Min = function(min){
		Tone.call(this);

		/**
		 *  the min signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._minSignal = new Tone.Signal(min);

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._switch = new Tone.Select(2);

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._lt = new Tone.LessThan(min);

		//connections
		this._minSignal.connect(this._switch, 0, 0);
		this.input.connect(this._switch, 0, 1);
		this.input.connect(this._lt);
		this._lt.connect(this._switch.gate);
		this._switch.connect(this.output);
	};

	Tone.extend(Tone.Min);

	/**
	 *  set the min value
	 *  @param {number} min the minimum to compare to the incoming signal
	 */
	Tone.Min.prototype.setMin = function(min){
		this._minSignal.setValue(min);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Min.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Min.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._minSignal.dispose();
		this._switch.dispose();
		this._lt.dispose();
		this._minSignal = null;
		this._switch = null;
		this._lt = null;
	};

	return Tone.Min;
});
define('Tone/signal/Clip',["Tone/core/Tone", "Tone/signal/Max", "Tone/signal/Min", "Tone/signal/Signal"], function(Tone){

	

	/**
	 * 	@class  Clip the incoming signal so that the output is always between min and max
	 * 	
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} min the minimum value of the outgoing signal
	 *  @param {number} max the maximum value of the outgoing signal
	 */
	Tone.Clip = function(min, max){
		Tone.call(this);

		//make sure the args are in the right order
		if (min > max){
			var tmp = min;
			min = max;
			max = tmp;
		}
		
		/**
		 *  the min clipper
		 *  @type {Tone.Min}
		 *  @private
		 */
		this._min = new Tone.Min(max);

		/**
		 *  the max clipper
		 *  @type {Tone.Max}
		 *  @private
		 */
		this._max = new Tone.Max(min);

		//connect it up
		this.chain(this.input, this._min, this._max, this.output);
	};

	Tone.extend(Tone.Clip);

	/**
	 *  set the minimum value
	 *  @param {number} min the new min value
	 */
	Tone.Clip.prototype.setMin = function(min){
		this._min.setMin(min);
	};

	/**
	 *  set the maximum value
	 *  @param {number} max the new max value
	 */
	Tone.Clip.prototype.setMax = function(max){
		this._max.setMax(max);	
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Clip.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Clip.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._min.dispose();
		this._max.dispose();
		this._min = null;
		this._max = null;
	};

	return Tone.Clip;
});
define('Tone/signal/Route',["Tone/core/Tone", "Tone/signal/Equal", "Tone/signal/Signal"], function(Tone){

	

	/**
	 *  @class Route a single input to the specified output
	 *
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [outputCount=2] the number of inputs the switch accepts
	 */
	Tone.Route = function(outputCount){

		outputCount = this.defaultArg(outputCount, 2);

		/**
		 *  the array of outputs
		 *  @type {Array<RouteGate>}
		 */
		this.output = new Array(outputCount);

		/**
		 *  a single input
		 *  @type {GainNode}
		 */
		this.input = this.context.createGain();

		/**
		 *  the control signal
		 *  @type {Tone.Signal}
		 */
		this.gate = new Tone.Signal(0);

		//make all the inputs and connect them
		for (var i = 0; i < outputCount; i++){
			var routeGate = new RouteGate(i);
			this.output[i] = routeGate;
			this.gate.connect(routeGate.selecter);
			this.input.connect(routeGate);
		}
	};

	Tone.extend(Tone.Route);

	/**
	 *  routes the signal to one of the outputs and close the others
	 *  @param {number=} [which=0] open one of the gates (closes the other)
	 *  @param {Tone.Time} time the time when the switch will open
	 */
	Tone.Route.prototype.select = function(which, time){
		//make sure it's an integer
		which = Math.floor(which);
		this.gate.setValueAtTime(which, this.toSeconds(time));
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Route.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.Route.prototype.dispose = function(){
		this.gate.dispose();
		for (var i = 0; i < this.output.length; i++){
			this.output[i].dispose();
			this.output[i] = null;
		}
		Tone.prototype.dispose.call(this);
		this.gate = null;
	}; 

	////////////START HELPER////////////

	/**
	 *  helper class for Tone.Route representing a single gate
	 *  @constructor
	 *  @extends {Tone}
	 *  @internal only used by Tone.Route
	 */
	var RouteGate = function(num){

		/**
		 *  the selector
		 *  @type {Tone.Equal}
		 */
		this.selecter = new Tone.Equal(num);

		/**
		 *  the gate
		 *  @type {GainNode}
		 */
		this.gate = this.input = this.output = this.context.createGain();

		//connect the selecter to the gate gain
		this.selecter.connect(this.gate.gain);
	};

	Tone.extend(RouteGate);

	/**
	 *  clean up
	 *  @private
	 */
	RouteGate.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.selecter.dispose();
		this.gate.disconnect();
		this.selecter = null;
		this.gate = null;
	};

	////////////END HELPER////////////

	//return Tone.Route
	return Tone.Route;
});
define('Tone/signal/Switch',["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Threshold"], function(Tone){

	

	/**
	 *  @class  When the gate is set to 0, the input signal does not pass through to the output. 
	 *          If the gate is set to 1, the input signal passes through.
	 *          the gate is initially closed.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Switch = function(){
		Tone.call(this);

		/**
		 *  the control signal for the switch
		 *  when this value is 0, the input signal will not pass through,
		 *  when it is high (1), the input signal will pass through.
		 *  
		 *  @type {Tone.Signal}
		 */
		this.gate = new Tone.Signal(0);

		/**
		 *  thresh the control signal
		 *  @type {Tone.Threshold}
		 *  @private
		 */
		this._thresh = new Tone.Threshold(0.5);

		this.input.connect(this.output);
		this.chain(this.gate, this._thresh, this.output.gain);
	};

	Tone.extend(Tone.Switch);

	/**
	 *  open the switch at a specific time
	 *
	 *  @param {Tone.Time} time the time when the switch will be open
	 */
	Tone.Switch.prototype.open = function(time){
		this.gate.setValueAtTime(1, this.toSeconds(time));
	}; 

	/**
	 *  close the switch at a specific time
	 *
	 *  @param {Tone.Time} time the time when the switch will be open
	 */
	Tone.Switch.prototype.close = function(time){
		this.gate.setValueAtTime(0, this.toSeconds(time));
	}; 

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Switch.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Switch.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.gate.dispose();
		this._thresh.dispose();
		this.gate = null;
		this._thresh = null;
	}; 

	return Tone.Switch;
});
define('Tone/source/Microphone',["Tone/core/Tone", "Tone/source/Source"], function(Tone){

	

	/**
	 *  @class  WebRTC Microphone. 
	 *          CHROME ONLY (for now) because of the 
	 *          use of the MediaStreamAudioSourceNode
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number=} inputNum 
	 */
	Tone.Microphone = function(inputNum){
		Tone.Source.call(this);

		/**
		 *  @type {MediaStreamAudioSourceNode}
		 *  @private
		 */
		this._mediaStream = null;
		/**
		 *  @type {LocalMediaStream}
		 *  @private
		 */
		this._stream = null;
		/**
		 *  @type {Object}
		 *  @private
		 */
		this.constraints = {"audio" : true};

		//get the option
		var self = this;
		MediaStreamTrack.getSources(function (media_sources) {
			if (inputNum < media_sources.length){
				self.constraints.audio = {
					optional : [{ sourceId: media_sources[inputNum].id}]
				};
			}
		});		
	};

	Tone.extend(Tone.Microphone, Tone.Source);

	/**
	 *  start the stream. 
	 */
	Tone.Microphone.prototype.start = function(){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
				navigator.getUserMedia(this.constraints, 
					this._onStream.bind(this), this._onStreamError.bind(this));
		}
	};

	/**
	 *  stop the stream. 
	 */
	Tone.Microphone.prototype.stop = function(){
		if (this._stream && this.state === Tone.Source.State.STARTED){
			this.state = Tone.Source.State.STOPPED;
			this._stream.stop();
		}
	};

	/**
	 *  called when the stream is successfully setup
	 *  @param   {LocalMediaStream} stream 
	 *  @private
	 */
	Tone.Microphone.prototype._onStream = function(stream) {
		this._stream = stream;
		// Wrap a MediaStreamSourceNode around the live input stream.
		this._mediaStream = this.context.createMediaStreamSource(stream);
		this._mediaStream.connect(this.output);
	};

	/**
	 *  called on error
	 *  @param   {Error} e 
	 *  @private
	 */
	Tone.Microphone.prototype._onStreamError = function(e) {
		console.error(e);
	};

	/**
	 *  clean up
	 */
	Tone.Microphone.prototype.dispose = function() {
		Tone.Source.prototype.dispose.call(this);
		this._stream.disconnect();
		this._mediaStream.disconnect();
		this._stream = null;
		this._mediaStream = null;
	};

	//polyfill
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || 
		navigator.mozGetUserMedia || navigator.msGetUserMedia;

	return Tone.Microphone;
});
define('Tone/source/PulseOscillator',["Tone/core/Tone", "Tone/source/Source", "Tone/source/Oscillator", "Tone/signal/Signal", "Tone/signal/Threshold"],
function(Tone){

	

	/**
	 *  
	 *  @static 
	 *  @private
	 *  @type {Float32Array}
	 */
	var pulseCurve = new Float32Array(256);

	for(var i=0; i < 128; i++) {
		pulseCurve[i] = -1;
		pulseCurve[i+128] = 1;
	}

	/**
	 *  @class Pulse Oscillator with control over width
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number=} frequency the frequency of the oscillator
	 *  @param {number=} [width = 0.5] the width of the pulse
	 */
	Tone.PulseOscillator = function(frequency, width){

		Tone.Source.call(this);

		/**
		 *  the width of the pulse
		 *  @type {Tone.Signal}
		 */
		this.width = new Tone.Signal(this.defaultArg(width, 0.5));

		/**
		 *  the sawtooth oscillator
		 *  @type {Tone.Oscillator}
		 *  @private
		 */
		this._sawtooth = new Tone.Oscillator(frequency, "sawtooth");

		/**
		 *  the oscillators frequency
		 *  @type {Tone.Signal}
		 */
		this.frequency = this._sawtooth.frequency;

		/**
		 *  the oscillators detune
		 *  @type {Tone.Signal}
		 */
		this.detune = this._sawtooth.detune;

		/**
		 *  threshold the signal to turn it into a square
		 *  
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._thresh = this.context.createWaveShaper();
		this._thresh.curve = pulseCurve;

		this.chain(this._sawtooth, this._thresh, this.output);
		this.width.connect(this._thresh);
	};

	Tone.extend(Tone.PulseOscillator, Tone.Source);

	/**
	 *  set the width of the oscillators
	 *  @param {number} width
	 */
	Tone.PulseOscillator.prototype.setWidth = function(width){
		this.width.setValue(width);
	};

	/**
	 *  start the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.PulseOscillator.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			time = this.toSeconds(time);
			this._sawtooth.start(time);
			this.width.output.gain.setValueAtTime(1, time);
			this.state = Tone.Source.State.STARTED;
		}
	};

	/**
	 *  stop the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.PulseOscillator.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED){
			time = this.toSeconds(time);
			this._sawtooth.stop(time);
			//the width is still connected to the output. 
			//that needs to be stopped also
			this.width.output.gain.setValueAtTime(0, time);
			this.state = Tone.Source.State.STOPPED;
		}
	};

	/**
	 *  clean up method
	 */
	Tone.PulseOscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this._sawtooth.dispose();
		this.width.dispose();
		this._thresh.disconnect();
		this._sawtooth = null;
		this.frequency = null;
		this.detune = null;
		this.width = null;
		this._thresh = null;
	};

	return Tone.PulseOscillator;
});