(function (root) {
	"use strict";
	var Tone;
	//constructs the main Tone object
	function mainModule(func){
		Tone = func();
	}
	//invokes each of the modules with the main Tone object as the argument
	function toneModule(func){
		func(Tone);
	}
	
	/**
	 *  Tone.js
	 *
	 *  @author Yotam Mann
	 *
	 *  @license http://opensource.org/licenses/MIT MIT License 2014
	 */
	mainModule(function(){

		

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
					this.connect(B.input, outNum, inNum);
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
		 *  @param {number} [inputs=1] the number of input nodes
		 *  @param {number} [outputs=1] the number of output nodes
		 */
		var Tone = function(inputs, outputs){

			/**
			 *  the input node(s)
			 *  @type {GainNode|Array}
			 */
			if (isUndef(inputs) || inputs === 1){
				this.input = this.context.createGain();
			} else if (inputs > 1){
				this.input = new Array(inputs);
			}

			/**
			 *  the output node(s)
			 *  @type {GainNode|Array}
			 */
			if (isUndef(outputs) || outputs === 1){
				this.output = this.context.createGain();
			} else if (outputs > 1){
				this.output = new Array(inputs);
			}
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

		/**
		 *  the delay time of a single buffer frame
		 *  @type {number}
		 *  @static
		 *  @const
		 */
		Tone.prototype.bufferTime = Tone.prototype.bufferSize / Tone.context.sampleRate;
		
		///////////////////////////////////////////////////////////////////////////
		//	CONNECTIONS
		///////////////////////////////////////////////////////////////////////////

		/**
		 *  connect the output of a ToneNode to an AudioParam, AudioNode, or ToneNode
		 *  @param  {Tone | AudioParam | AudioNode} unit 
		 *  @param {number} [outputNum=0] optionally which output to connect from
		 *  @param {number} [inputNum=0] optionally which input to connect to
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
		Tone.prototype.disconnect = function(outputNum){
			if (Array.isArray(this.output)){
				outputNum = this.defaultArg(outputNum, 0);
				this.output[outputNum].disconnect();
			} else {
				this.output.disconnect();
			}
		};

		/**
		 *  connect together all of the arguments in series
		 *  @param {...AudioParam|Tone|AudioNode}
		 */
		Tone.prototype.connectSeries = function(){
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
		Tone.prototype.connectParallel = function(){
			var connectFrom = arguments[0];
			if (arguments.length > 1){
				for (var i = 1; i < arguments.length; i++){
					var connectTo = arguments[i];
					connectFrom.connect(connectTo);
				}
			}
		};

		/**
		 *  connect the output of this node to the rest of the nodes in series.
		 *  @param {...AudioParam|Tone|AudioNode}
		 */
		Tone.prototype.chain = function(){
			if (arguments.length > 0){
				var currentUnit = this;
				for (var i = 0; i < arguments.length; i++){
					var toUnit = arguments[i];
					currentUnit.connect(toUnit);
					currentUnit = toUnit;
				}
			}
		};

		/**
		 *  connect the output of this node to the rest of the nodes in parallel.
		 *  @param {...AudioParam|Tone|AudioNode}
		 */
		Tone.prototype.fan = function(){
			if (arguments.length > 0){
				for (var i = 1; i < arguments.length; i++){
					this.connect(arguments[i]);
				}
			}
		};

		//give native nodes chain and fan methods
		AudioNode.prototype.chain = Tone.prototype.chain;
		AudioNode.prototype.fan = Tone.prototype.fan;

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
			//set the bufferTime
			Tone.prototype.bufferTime = Tone.prototype.bufferSize / audioContext.sampleRate;
			_silentNode = audioContext.createGain();
			_silentNode.gain.value = 0;
			_silentNode.connect(audioContext.destination);
		});

		console.log("%c * Tone.js r3 * ", "background: #000; color: #fff");

		return Tone;
	});

	toneModule( function(Tone){

		

		/**
		 *  @class  Base class for all Signals
		 *
		 *  @constructor
		 *  @extends {Tone}
		 */
		Tone.SignalBase = function(){

		};

		Tone.extend(Tone.SignalBase);

		/**
		 *  Signals can connect to other Signals
		 *
		 *  @override
		 *  @param {AudioParam|AudioNode|Tone.Signal|Tone} node 
		 *  @param {number} [outputNumber=0] 
		 *  @param {number} [inputNumber=0] 
		 */
		Tone.SignalBase.prototype.connect = function(node, outputNumber, inputNumber){
			//zero it out so that the signal can have full control
			if (node instanceof Tone.Signal){
				node.setValue(0);
			} else if (node instanceof AudioParam){
				node.value = 0;
			} 
			Tone.prototype.connect.call(this, node, outputNumber, inputNumber);
		};

		/**
		 *  internal dispose method to tear down the node
		 */
		Tone.SignalBase.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
		};

		return Tone.SignalBase;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class Wraps the WaveShaperNode
		 *
		 *  ```javascript
		 *  var timesTwo = new Tone.WaveShaper(function(val){
		 *  	return val * 2;
		 *  }, 2048);
		 *  ```
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {function(number, number)|Array|number} mapping the function used to define the values. 
		 *                                    The mapping function should take two arguments: 
		 *                                    the first is the value at the current position 
		 *                                    and the second is the array position. 
		 *                                    If the argument is an array, that array will be
		 *                                    set as the wave shapping function
		 *  @param {number} [bufferLen=1024] the length of the WaveShaperNode buffer.
		 */
		Tone.WaveShaper = function(mapping, bufferLen){

			/**
			 *  the waveshaper
			 *  @type {WaveShaperNode}
			 *  @private
			 */
			this._shaper = this.input = this.output = this.context.createWaveShaper();

			/**
			 *  the waveshapers curve
			 *  @type {Float32Array}
			 *  @private
			 */
			this._curve = null;

			if (Array.isArray(mapping)){
				this.setCurve(mapping);
			} else if (isFinite(mapping) || this.isUndef(mapping)){
				this._curve = new Float32Array(this.defaultArg(mapping, 1024));
			} else if (typeof mapping === "function"){
				this._curve = new Float32Array(this.defaultArg(bufferLen, 1024));
				this.setMap(mapping);
			} 
		};

		Tone.extend(Tone.WaveShaper, Tone.SignalBase);

		/**
		 *  uses a mapping function to set the value of the curve
		 *  @param {function(number, number)} mapping the function used to define the values. 
		 *                                    The mapping function should take two arguments: 
		 *                                    the first is the value at the current position 
		 *                                    and the second is the array position
		 */
		Tone.WaveShaper.prototype.setMap = function(mapping){
			for (var i = 0, len = this._curve.length; i < len; i++){
				var normalized = (i / (len)) * 2 - 1;
				var normOffOne = (i / (len - 1)) * 2 - 1;
				this._curve[i] = mapping(normalized, i, normOffOne);
			}
			this._shaper.curve = this._curve;
		};

		/**
		 *  use an array to set the waveshaper curve
		 *  @param {Array} mapping the array to use as the waveshaper
		 */
		Tone.WaveShaper.prototype.setCurve = function(mapping){
			//fixes safari WaveShaperNode bug
			if (this._isSafari()){
				var first = mapping[0];
				mapping.unshift(first);	
			}
			this._curve = new Float32Array(mapping);
			this._shaper.curve = this._curve;
		};

		/**
		 *  set the oversampling
		 *  @param {string} oversampling can either be "none", "2x" or "4x"
		 */
		Tone.WaveShaper.prototype.setOversample = function(oversampling) {
			this._shaper.oversample = oversampling;
		};

		/**
		 *  returns true if the browser is safari
		 *  @return  {boolean} 
		 *  @private
		 */
		Tone.WaveShaper.prototype._isSafari = function(){
			var ua = navigator.userAgent.toLowerCase(); 
			return ua.indexOf("safari") !== -1 && ua.indexOf("chrome") === -1;
		};

		/**
		 *  clean up
		 */
		Tone.WaveShaper.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._shaper.disconnect();
			this._shaper = null;
			this._curve = null;
		};

		return Tone.WaveShaper;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class  Constant audio-rate signal.
		 *          Tone.Signal is a core component which allows for sample-accurate 
		 *          synchronization of many components. Tone.Signal can be scheduled 
		 *          with all of the functions available to AudioParams
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} [value=0] initial value
		 */
		Tone.Signal = function(value){

			/**
			 *  scales the constant output to the desired output
			 *  @type {GainNode}
			 *  @private
			 */
			this._scalar = this.context.createGain();

			/**
			 *  @type {GainNode}
			 */
			this.input = this.output = this.context.createGain();

			/**
			 *  the ratio of the this value to the control signal value
			 *
			 *  @private
			 *  @type {number}
			 */
			this._syncRatio = 1;

			/**
			 *  the value of the Signal
			 *  @type {number}
			 */
			this.value = this.defaultArg(value, 0);

			//connect the constant 1 output to the node output
			Tone.Signal._constant.chain(this._scalar, this.output);
			
		};

		Tone.extend(Tone.Signal, Tone.SignalBase);

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
			this.connectSeries(signal, this._scalar, this.output);
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
			Tone.Signal._constant.chain(this._scalar, this.output);
		};

		/**
		 *  internal dispose method to tear down the node
		 */
		Tone.Signal.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._scalar.disconnect();
			this._scalar = null;
		};

		//defines getter / setter for value
		Object.defineProperty(Tone.Signal.prototype, "value", {
			get : function(){
				return this.getValue();
			},
			set : function(val){
				this.setValue(val);
			}
		});

		///////////////////////////////////////////////////////////////////////////
		//	STATIC
		///////////////////////////////////////////////////////////////////////////

		/**
		 *  the constant signal generator
		 *  @static
		 *  @private
		 *  @const
		 *  @type {OscillatorNode}
		 */
		Tone.Signal._generator = null;

		/**
		 *  the signal generator waveshaper. makes the incoming signal
		 *  only output 1 for all inputs.
		 *  @static
		 *  @private
		 *  @const
		 *  @type {Tone.WaveShaper}
		 */
		Tone.Signal._constant = null;

		/**
		 *  initializer function
		 */
		Tone._initAudioContext(function(audioContext){
			Tone.Signal._generator = audioContext.createOscillator();
			Tone.Signal._constant = new Tone.WaveShaper([1,1]);
			Tone.Signal._generator.connect(Tone.Signal._constant);
			Tone.Signal._generator.start(0);
			Tone.Signal._generator.noGC();
		});

		return Tone.Signal;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class Pow applies an exponent to the incoming signal. The incoming signal
		 *         must be in the range -1,1
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {number} exp the exponent to apply to the incoming signal, must be at least 2. 
		 */
		Tone.Pow = function(exp){

			exp = this.defaultArg(exp, 1);

			/**
			 *  @type {WaveShaperNode}
			 *  @private
			 */
			this._expScaler = this.input = this.output = new Tone.WaveShaper(this._expFunc(exp), 8192);
		};

		Tone.extend(Tone.Pow, Tone.SignalBase);

		/**
		 *  set the exponential scaling curve
		 *  @param {number} exp the exponent to raise the incoming signal to
		 */
		Tone.Pow.prototype.setExponent = function(exp){
			this._expScaler.setMap(this._expFunc(exp));
		};

		/**
		 *  the function which maps the waveshaper
		 *  @param   {number} exp
		 *  @return {function}
		 *  @private
		 */
		Tone.Pow.prototype._expFunc = function(exp){
			return function(val){
				return Math.pow(Math.abs(val), exp);
			};
		};

		/**
		 *  clean up
		 */
		Tone.Pow.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._expScaler.dispose();
			this._expScaler = null;
		};

		return Tone.Pow;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class  ADSR envelope generator attaches to an AudioParam or Signal. 
		 *          Includes an optional exponent
		 *
		 *  @constructor
		 *  @extends {Tone}
		 *  @param {Tone.Time|Object} [attack=0.01]	the attack time in seconds
		 *  @param {Tone.Time} [decay=0.1]	the decay time in seconds
		 *  @param {number} [sustain=0.5] 	a percentage (0-1) of the full amplitude
		 *  @param {Tone.Time} [release=1]	the release time in seconds
		 */
		Tone.Envelope = function(){

			//get all of the defaults
			var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);

			/** 
			 *  the attack time in seconds
			 *  @type {Tone.Time}
			 */
			this.attack = options.attack;

			/**
			 *  the decay time in seconds
			 *  @type {Tone.Time}
			 */
			this.decay = options.decay;
			
			/**
			 *  the sustain is a value between 0-1
			 *  @type {number}
			 */
			this.sustain = options.sustain;

			/**
			 *  the release time in seconds
			 *  @type {Tone.Time}
			 */
			this.release = options.release;

			/**
			 *  the signal
			 *  @type {Tone.Signal}
			 *  @private
			 */
			this._sig = new Tone.Signal(0);
			
			/** 
			 *  scale the incoming signal by an exponent
			 *  @type {Tone.Pow}
			 *  @private
			 */
			this._exp = this.output = new Tone.Pow(options.exponent);

			//connections
			this._sig.connect(this._exp);
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
			"exponent" : 1
		};

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
			if (!this.isUndef(params.exponent)) this.setExponent(params.exponent);
		};

		/**
		 *  set the attack time
		 *  @param {Tone.Time} time
		 */
		Tone.Envelope.prototype.setAttack = function(time){
			this.attack = time;
		};

		/**
		 *  set the decay time
		 *  @param {Tone.Time} time
		 */
		Tone.Envelope.prototype.setDecay = function(time){
			this.decay = time;
		};

		/**
		 *  set the release time
		 *  @param {Tone.Time} time
		 */
		Tone.Envelope.prototype.setRelease = function(time){
			this.release = time;
		};

		/**
		 *  set the sustain amount
		 *  @param {number} sustain value between 0-1
		 */
		Tone.Envelope.prototype.setSustain = function(sustain){
			this.sustain = sustain;
		};

		/**
		 *  set the exponent which scales the signal
		 *  @param {number} exp
		 */
		Tone.Envelope.prototype.setExponent = function(exp){
			this._exp.setExponent(exp);
		};

		/**
		 *  the envelope time multipler
		 *  @type {number}
		 *  @private
		 */
		Tone.Envelope.prototype._timeMult = 0.25;

		/**
		 * attack->decay->sustain linear ramp
		 * @param  {Tone.Time} [time=now]
		 * @param {number} [velocity=1] the velocity of the envelope scales the vales.
		 *                               number between 0-1
		 */
		Tone.Envelope.prototype.triggerAttack = function(time, velocity){
			velocity = this.defaultArg(velocity, 1);
			var attack = this.toSeconds(this.attack);
			var decay = this.toSeconds(this.decay);
			var scaledMax = velocity;
			var sustainVal = this.sustain;
			time = this.toSeconds(time);
			this._sig.cancelScheduledValues(time);
			this._sig.setTargetAtTime(scaledMax, time, attack * this._timeMult);
			this._sig.setTargetAtTime(sustainVal, time + attack, decay * this._timeMult);	
		};
		
		/**
		 * triggers the release of the envelope with a linear ramp
		 * @param  {Tone.Time} [time=now]
		 */
		Tone.Envelope.prototype.triggerRelease = function(time){
			time = this.toSeconds(time);
			this._sig.cancelScheduledValues(time);
			var release = this.toSeconds(this.release);
			this._sig.setTargetAtTime(0, time, release * this._timeMult);
		};

		/**
		 *  trigger the attack and release after a sustain time
		 *  @param {Tone.Time} duration the duration of the note
		 *  @param {Tone.Time} [time=now] the time of the attack
		 *  @param {number} [velocity=1] the velocity of the note
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
			this._sig.dispose();
			this._sig = null;
			this._exp.dispose();
			this._exp = null;
		};

		return Tone.Envelope;
	});

	toneModule( function(Tone){

		

		/**
		 *  @class  An Envelope connected to a gain node which can be used as an amplitude envelope.
		 *  
		 *  @constructor
		 *  @extends {Tone.Envelope}
		 *  @param {Tone.Time|Object} [attack=0.01]	the attack time in seconds
		 *  @param {Tone.Time} [decay=0.1]	the decay time in seconds
		 *  @param {number} [sustain=0.5] 	a percentage (0-1) of the full amplitude
		 *  @param {Tone.Time} [release=1]	the release time in seconds
		 */
		Tone.AmplitudeEnvelope = function(){

			Tone.Envelope.apply(this, arguments);

			/**
			 *  the input node
			 *  @type {GainNode}
			 */
			this.input = this.output = this.context.createGain();

			this._sig.connect(this.output.gain);
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
	toneModule( function(Tone){

		

		/**
		 *  @class A thin wrapper around the DynamicsCompressorNode
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @param {number} [threshold=-24] threshold in decibels
		 *  @param {number} [ratio=12] gain reduction ratio
		 */
		Tone.Compressor = function(){

			var options = this.optionsObject(arguments, ["threshold", "ratio"], Tone.Compressor.defaults);

			/**
			 *  the compressor node
			 *  @type {DynamicsCompressorNode}
			 *  @private
			 */
			this._compressor = this.context.createDynamicsCompressor();

			/**
			 *  the input
			 */
			this.input = this._compressor;

			/**
			 *  the output
			 */
			this.output = this._compressor;

			/**
			 *  the threshold vaue
			 *  @type {AudioParam}
			 */
			this.threshold = this._compressor.threshold;

			/**
			 *  the attack vaue
			 *  @type {AudioParam}
			 */
			this.attack = this._compressor.attack;

			/**
			 *  the release vaue
			 *  @type {AudioParam}
			 */
			this.release = this._compressor.release;

			/**
			 *  the knee vaue
			 *  @type {AudioParam}
			 */
			this.knee = this._compressor.knee;

			/**
			 *  the ratio vaue
			 *  @type {AudioParam}
			 */
			this.ratio = this._compressor.ratio;

			//set the defaults
			this.set(options);
		};

		Tone.extend(Tone.Compressor);

		/**
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.Compressor.defaults = {
			"ratio" : 12,
			"threshold" : -24,
			"release" : 0.25,
			"attack" : 0.003,
			"knee" : 30
		};

		/**
		 *  bulk setter
		 *  @param {Object} params
		 */
		Tone.Compressor.prototype.set = function(params){
			if (!this.isUndef(params.attack)) this.setAttack(params.attack);
			if (!this.isUndef(params.release)) this.setRelease(params.release);
			if (!this.isUndef(params.threshold)) this.setThreshold(params.threshold);
			if (!this.isUndef(params.knee)) this.setKnee(params.knee);
			if (!this.isUndef(params.ratio)) this.setRatio(params.ratio);
		};

		/**
		 *  set the attack time
		 *  @param {Tone.Time} time the attack time
		 */
		Tone.Compressor.prototype.setAttack = function(time) {
			this._compressor.attack.value = this.toSeconds(time);
		};

		/**
		 *  set the release time
		 *  @param {Tone.Time} time the release time
		 */
		Tone.Compressor.prototype.setRelease = function(time) {
			this._compressor.release.value = this.toSeconds(time);
		};

		/**
		 *  set the threshold value
		 *  @param {number} value the threshold in decibels
		 */
		Tone.Compressor.prototype.setThreshold = function(value) {
			this._compressor.threshold.value = value;
		};

		/**
		 *  set the knee value
		 *  @param {number} knee
		 */
		Tone.Compressor.prototype.setKnee = function(knee) {
			this._compressor.knee.value = knee;
		};

		/**
		 *  set the ratio value
		 *  @param {number} ratio
		 */
		Tone.Compressor.prototype.setRatio = function(ratio) {
			this._compressor.ratio.value = ratio;
		};

		/**
		 *  clean up
		 */
		Tone.Compressor.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._compressor.disconnect();
			this._compressor = null;
			this.attack = null;
			this.release = null;
			this.threshold = null;
			this.ratio = null;
			this.knee = null;
		};

		return Tone.Compressor;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class Add a signal and a number or two signals. 
		 *         input 0: augend. input 1: addend
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number=} value if no value is provided, Tone.Add will sum the first
		 *                         and second inputs. 
		 */
		Tone.Add = function(value){

			Tone.call(this, 2, 0);

			/**
			 *  the summing node
			 *  @type {GainNode}
			 *  @private
			 */
			this._sum = this.input[0] = this.input[1] = this.output = this.context.createGain();

			/**
			 *  @private
			 *  @type {Tone.Signal}
			 */
			this._value = null;

			if (isFinite(value)){
				this._value = new Tone.Signal(value);
				this._value.connect(this._sum);
			}
		};

		Tone.extend(Tone.Add, Tone.SignalBase);

		/**
		 *  set the constant
		 *  
		 *  @param {number} value 
		 */
		Tone.Add.prototype.setValue = function(value){
			if (this._value !== null){
				this._value.setValue(value);
			} else {
				throw new Error("cannot switch from signal to number");
			}
		}; 

		/**
		 *  dispose method
		 */
		Tone.Add.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._sum = null;
			if (this._value){
				this._value.dispose();
				this._value = null;
			}
		}; 

		return Tone.Add;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class  Multiply the incoming signal by a number or Multiply two signals.
		 *          input 0: multiplicand.
		 *          input 1: multiplier.
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number=} value constant value to multiple. if no value is provided
		 *                         it will be multiplied by the value of input 1.
		 */
		Tone.Multiply = function(value){

			Tone.call(this, 2, 0);

			/**
			 *  the input node is the same as the output node
			 *  it is also the GainNode which handles the scaling of incoming signal
			 *  
			 *  @type {GainNode}
			 *  @private
			 */
			this._mult = this.input[0] = this.output = this.context.createGain();

			/**
			 *  the scaling parameter
			 *  @type {AudioParam}
			 *  @private
			 */
			this._factor = this.input[1] = this.output.gain;
			
			this._factor.value = this.defaultArg(value, 0);
		};

		Tone.extend(Tone.Multiply, Tone.SignalBase);

		/**
		 *  set the constant multiple
		 *  	
		 *  @param {number} value 
		 */
		Tone.Multiply.prototype.setValue = function(value){
			this._factor.value = value;
		};

		/**
		 *  clean up
		 */
		Tone.Multiply.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._mult = null;
			this._factor = null;
		}; 

		return Tone.Multiply;
	});

	toneModule( function(Tone){

		

		/**
		 *  @class Negate the incoming signal. i.e. an input signal of 10 will output -10
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 */
		Tone.Negate = function(){
			/**
			 *  negation is done by multiplying by -1
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._multiply = this.input = this.output= new Tone.Multiply(-1);
		};

		Tone.extend(Tone.Negate, Tone.SignalBase);

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
	toneModule( function(Tone){

		

		/**
		 *  @class Subtract a signal and a number or two signals. 
		 *         input 0 : minuend.
		 *         input 1 : subtrahend
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {number=} value value to subtract from the incoming signal. If the value
		 *                         is omitted, it will subtract the second signal from the first
		 */
		Tone.Subtract = function(value){

			Tone.call(this, 2, 0);

			/**
			 *  the adder node
			 *  @type {Tone.Add}
			 *  @private
			 */
			this._adder = this.input[0] = this.output = new Tone.Add(-value);

			/**
			 *  the negate node
			 *  @type {Tone.Negate}
			 *  @private
			 */
			this._neg = this.input[1] = new Tone.Negate();

			//connect it up
			this._neg.connect(this._adder, 0, 1);
		};

		Tone.extend(Tone.Subtract, Tone.SignalBase);

		/**
		 *  set the constant
		 *  
		 *  @param {number} value 
		 */
		Tone.Subtract.prototype.setValue = function(value){
			this._adder.setValue(-value);
		}; 

		/**
		 *  clean up
		 */
		Tone.Subtract.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._neg.dispose();
			this._neg = null;
			this._adder.dispose();
			this._adder = null;
		};

		return Tone.Subtract;
	});
	toneModule( 
	function(Tone){

		

		/**
		 *  @class  GreaterThanZero outputs 1 when the input is strictly greater than zero
		 *  
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 */
		Tone.GreaterThanZero = function(){
			
			/**
			 *  @type {Tone.WaveShaper}
			 *  @private
			 */
			this._thresh = this.output = new Tone.WaveShaper(function(val){
				if (val <= 0){
					return 0;
				} else {
					return 1;
				}
			});

			/**
			 *  scale the first thresholded signal by a large value.
			 *  this will help with values which are very close to 0
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._scale = this.input = new Tone.Multiply(10000);

			//connections
			this._scale.connect(this._thresh);
		};

		Tone.extend(Tone.GreaterThanZero, Tone.SignalBase);

		/**
		 *  dispose method
		 */
		Tone.GreaterThanZero.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._scale.dispose();
			this._scale = null;
			this._thresh.dispose();
			this._thresh = null;
		};

		return Tone.GreaterThanZero;
	});
	toneModule( 
	function(Tone){

		

		/**
		 *  @class  EqualZero outputs 1 when the input is strictly greater than zero
		 *  
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 */
		Tone.EqualZero = function(){

			/**
			 *  scale the incoming signal by a large factor
			 *  @private
			 *  @type {Tone.Multiply}
			 */
			this._scale = this.input = new Tone.Multiply(10000);
			
			/**
			 *  @type {Tone.WaveShaper}
			 *  @private
			 */
			this._thresh = new Tone.WaveShaper(function(val){
				if (val === 0){
					return 1;
				} else {
					return 0;
				}
			}, 128);

			/**
			 *  threshold the output so that it's 0 or 1
			 *  @type {Tone.GreaterThanZero}
			 *  @private
			 */
			this._gtz = this.output = new Tone.GreaterThanZero();

			//connections
			this._scale.chain(this._thresh, this._gtz);
		};

		Tone.extend(Tone.EqualZero, Tone.SignalBase);

		/**
		 *  dispose method
		 */
		Tone.EqualZero.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._gtz.dispose();
			this._gtz = null;
			this._scale.dispose();
			this._scale = null;
			this._thresh.dispose();
			this._thresh = null;
		};

		return Tone.EqualZero;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class  Output 1 if the signal is equal to the value, otherwise outputs 0. 
		 *          Can accept two signals if connected to inputs 0 and 1.
		 *  
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} value the number to compare the incoming signal to
		 */
		Tone.Equal = function(value){

			Tone.call(this, 2, 0);

			/**
			 *  subtract the value from the incoming signal
			 *  
			 *  @type {Tone.Add}
			 *  @private
			 */
			this._sub = this.input[0] = new Tone.Subtract(value);

			/**
			 *  @type {Tone.EqualZero}
			 *  @private
			 */
			this._equals = this.output = new Tone.EqualZero();

			this._sub.connect(this._equals);
			this.input[1] = this._sub.input[1];
		};

		Tone.extend(Tone.Equal, Tone.SignalBase);

		/**
		 * 	@param {number} value set the comparison value
		 */
		Tone.Equal.prototype.setValue = function(value){
			this._sub.setValue(value);
		};

		/**
		 *  dispose method
		 */
		Tone.Equal.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._equals.disconnect();
			this._equals = null;
			this._sub.dispose();
			this._sub = null;
		};

		return Tone.Equal;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class Select between any number of inputs, sending the one 
		 *         selected by the gate signal to the output
		 *
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} [sourceCount=2] the number of inputs the switch accepts
		 */
		Tone.Select = function(sourceCount){

			sourceCount = this.defaultArg(sourceCount, 2);

			Tone.call(this, sourceCount, 1);

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

		Tone.extend(Tone.Select, Tone.SignalBase);

		/**
		 *  open one of the inputs and close the other
		 *  @param {number} [which=0] open one of the gates (closes the other)
		 *  @param {Tone.Time} time the time when the switch will open
		 */
		Tone.Select.prototype.select = function(which, time){
			//make sure it's an integer
			which = Math.floor(which);
			this.gate.setValueAtTime(which, this.toSeconds(time));
		};

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
	toneModule( function(Tone){

		

		/**
		 *  @class IfThenElse has three inputs. When the first input (if) is true (i.e. === 1), 
		 *         then it will pass the second input (then) through to the output, otherwise, 
		 *         if it's not true (i.e. === 0) then it will pass the third input (else) 
		 *         through to the output. 
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 */
		Tone.IfThenElse = function(){

			Tone.call(this, 3, 0);

			/**
			 *  the selector node which is responsible for the routing
			 *  @type {Tone.Select}
			 *  @private
			 */
			this._selector = this.output = new Tone.Select(2);

			//the input mapping
			this.if = this.input[0] = this._selector.gate;
			this.then = this.input[1] = this._selector.input[1];
			this.else = this.input[2] = this._selector.input[0];
		};

		Tone.extend(Tone.IfThenElse, Tone.SignalBase);

		/**
		 *  clean up
		 */
		Tone.IfThenElse.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._selector.dispose();
			this._selector = null;
			this.if = null;
			this.then = null;
			this.else = null;
		};

		return Tone.IfThenElse;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class OR the inputs together. True if at least one of the inputs is true. 
		 *         Simply an alias for Tone.GreaterThanZero
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 */
		Tone.OR = function(inputCount){

			inputCount = this.defaultArg(inputCount, 2);
			Tone.call(this, inputCount, 0);

			/**
			 *  a private summing node
			 *  @type {GainNode}
			 *  @private
			 */
			this._sum = this.context.createGain();

			/**
			 *  @type {Tone.Equal}
			 *  @private
			 */
			this._gtz = new Tone.GreaterThanZero();

			/**
			 *  the output
			 *  @type {Tone.Equal}
			 */
			this.output = this._gtz;

			//make each of the inputs an alias
			for (var i = 0; i < inputCount; i++){
				this.input[i] = this._sum;
			}
			this._sum.connect(this._gtz);
		};

		Tone.extend(Tone.OR, Tone.SignalBase);

		/**
		 *  clean up
		 */
		Tone.OR.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._gtz.dispose();
			this._gtz = null;
			this._sum.disconnect();
			this._sum = null;
		};

		return Tone.OR;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class and returns 1 when all the inputs are equal to 1
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {number} [inputCount=2] the number of inputs. NOTE: all inputs are
		 *                                 connected to the single AND input node
		 */
		Tone.AND = function(inputCount){

			inputCount = this.defaultArg(inputCount, 2);

			Tone.call(this, inputCount, 0);

			/**
			 *  @type {Tone.Equal}
			 *  @private
			 */
			this._equals = this.output = new Tone.Equal(inputCount);

			//make each of the inputs an alias
			for (var i = 0; i < inputCount; i++){
				this.input[i] = this._equals;
			}
		};

		Tone.extend(Tone.AND, Tone.SignalBase);

		/**
		 *  the number of inputs to consider
		 *  @param {number} inputCount
		 */	
		Tone.AND.prototype.setInputCount = function(inputCount){
			this._equals.setValue(inputCount);
		};

		/**
		 *  clean up
		 */
		Tone.AND.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._equals.dispose();
			this._equals = null;
		};

		return Tone.AND;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class  Just an alias for EqualZero. but has the same effect as a NOT operator. 
		 *          Outputs 1 when input equals 0. 
		 *  
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 */
		Tone.NOT = Tone.EqualZero;

		return Tone.NOT;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class  Output 1 if the signal is greater than the value, otherwise outputs 0.
		 *          can compare two signals or a signal and a number. 
		 *  
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} [value=0] the value to compare to the incoming signal
		 */
		Tone.GreaterThan = function(value){

			Tone.call(this, 2, 0);
			
			/**
			 *  subtract the amount from the incoming signal
			 *  @type {Tone.Subtract}
			 *  @private
			 */
			this._sub = this.input[0] = new Tone.Subtract(value);
			this.input[1] = this._sub.input[1];

			/**
			 *  compare that amount to zero
			 *  @type {Tone.GreaterThanZero}
			 *  @private
			 */
			this._gtz = this.output = new Tone.GreaterThanZero();

			//connect
			this._sub.connect(this._gtz);
		};

		Tone.extend(Tone.GreaterThan, Tone.SignalBase);

		/**
		 *  set the value to compare to
		 *  
		 *  @param {number} value
		 */
		Tone.GreaterThan.prototype.setValue = function(value){
			this._sub.setValue(value);
		};

		/**
		 *  dispose method
		 */
		Tone.GreaterThan.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._sub.dispose();
			this._gtz.dispose();
			this._sub = null;
			this._gtz = null;
		};

		return Tone.GreaterThan;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class  Output 1 if the signal is less than the value, otherwise outputs 0.
		 *          can compare two signals or a signal and a number. 
		 *          input 0: left hand side of comparison.
		 *          input 1: right hand side of comparison.
		 *  
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} [value=0] the value to compare to the incoming signal
		 */
		Tone.LessThan = function(value){

			Tone.call(this, 2, 0);

			/**
			 *  negate the incoming signal
			 *  @type {Tone.Negate}
			 *  @private
			 */
			this._neg = this.input[0] = new Tone.Negate();

			/**
			 *  input < value === -input > -value
			 *  @type {Tone.GreaterThan}
			 *  @private
			 */
			this._gt = this.output = new Tone.GreaterThan(-value);

			/**
			 *  negate the signal coming from the second input
			 *  @private
			 *  @type {Tone.Negate}
			 */
			this._lhNeg = this.input[1] = new Tone.Negate();

			//connect
			this._neg.connect(this._gt);
			this._lhNeg.connect(this._gt, 0, 1);
		};

		Tone.extend(Tone.LessThan, Tone.SignalBase);

		/**
		 *  set the value to compare to
		 *  
		 *  @param {number} value
		 */
		Tone.LessThan.prototype.setValue = function(value){
			this._gt.setValue(-value);
		};

		/**
		 *  dispose method
		 */
		Tone.LessThan.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._neg.dispose();
			this._neg = null;
			this._gt.dispose();
			this._gt = null;
			this._lhNeg.dispose();
			this._lhNeg = null;
		};

		return Tone.LessThan;
	});
	toneModule( 
	function(Tone){

		

		/**
		 *  @class return the absolute value of an incoming signal
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 */
		Tone.Abs = function(){
			Tone.call(this, 1, 0);

			/**
			 *  @type {Tone.LessThan}
			 *  @private
			 */
			this._ltz = new Tone.LessThan(0);

			/**
			 *  @type {Tone.Select}
			 *  @private
			 */
			this._switch = this.output = new Tone.Select(2);
			
			/**
			 *  @type {Tone.Negate}
			 *  @private
			 */
			this._negate = new Tone.Negate();

			//two signal paths, positive and negative
			this.input.connect(this._switch, 0, 0);
			this.input.connect(this._negate);
			this._negate.connect(this._switch, 0, 1);
			
			//the control signal
			this.input.chain(this._ltz, this._switch.gate);
		};

		Tone.extend(Tone.Abs, Tone.SignalBase);

		/**
		 *  dispose method
		 */
		Tone.Abs.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._switch.dispose();
			this._switch = null;
			this._ltz.dispose();
			this._ltz = null;
			this._negate.dispose();
			this._negate = null;
		}; 

		return Tone.Abs;
	});
	toneModule( function(Tone){

		

		/**
		 * 	@class  outputs the greater of two signals. If a number is provided in the constructor
		 * 	        it will use that instead of the signal. 
		 * 	
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number=} max max value if provided. if not provided, it will use the
		 *                       signal value from input 1. 
		 */
		Tone.Max = function(max){

			Tone.call(this, 2, 0);
			this.input[0] = this.context.createGain();

			/**
			 *  the max signal
			 *  @type {Tone.Signal}
			 *  @private
			 */
			this._maxSignal = this.input[1] = new Tone.Signal(max);

			/**
			 *  @type {Tone.Select}
			 *  @private
			 */
			this._ifThenElse = this.output = new Tone.IfThenElse();

			/**
			 *  @type {Tone.Select}
			 *  @private
			 */
			this._gt = new Tone.GreaterThan();

			//connections
			this.input[0].chain(this._gt, this._ifThenElse.if);
			this.input[0].connect(this._ifThenElse.then);
			this._maxSignal.connect(this._ifThenElse.else);
			this._maxSignal.connect(this._gt, 0, 1);
		};

		Tone.extend(Tone.Max, Tone.SignalBase);

		/**
		 *  set the max value
		 *  @param {number} max the maximum to compare to the incoming signal
		 */
		Tone.Max.prototype.setMax = function(max){
			this._maxSignal.setValue(max);
		};

		/**
		 *  clean up
		 */
		Tone.Max.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._maxSignal.dispose();
			this._ifThenElse.dispose();
			this._gt.dispose();
			this._maxSignal = null;
			this._ifThenElse = null;
			this._gt = null;
		};

		return Tone.Max;
	});
	toneModule( function(Tone){

		

		/**
		 * 	@class  outputs the lesser of two signals. If a number is given 
		 * 	        in the constructor, it will use a signal and a number. 
		 * 	
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} min the minimum to compare to the incoming signal
		 */
		Tone.Min = function(min){

			Tone.call(this, 2, 0);
			this.input[0] = this.context.createGain();

			/**
			 *  @type {Tone.Select}
			 *  @private
			 */
			this._ifThenElse = this.output = new Tone.IfThenElse();

			/**
			 *  @type {Tone.Select}
			 *  @private
			 */
			this._lt = new Tone.LessThan();

			/**
			 *  the min signal
			 *  @type {Tone.Signal}
			 *  @private
			 */
			this._minSignal = this.input[1] = new Tone.Signal(min);

			//connections
			this.input[0].chain(this._lt, this._ifThenElse.if);
			this.input[0].connect(this._ifThenElse.then);
			this._minSignal.connect(this._ifThenElse.else);
			this._minSignal.connect(this._lt, 0, 1);
		};

		Tone.extend(Tone.Min, Tone.SignalBase);

		/**
		 *  set the min value
		 *  @param {number} min the minimum to compare to the incoming signal
		 */
		Tone.Min.prototype.setMin = function(min){
			this._minSignal.setValue(min);
		};

		/**
		 *  clean up
		 */
		Tone.Min.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._minSignal.dispose();
			this._ifThenElse.dispose();
			this._lt.dispose();
			this._minSignal = null;
			this._ifThenElse = null;
			this._lt = null;
		};

		return Tone.Min;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class Signal-rate modulo operator. Specify the modulus and the 
		 *         number of bits of the incoming signal. Because the operator is composed of many components, 
		 *         fewer bits will improve performance. 
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} modulus the modulus to apply
		 *  @param {number} [bits=8]	optionally set the maximum bits the incoming signal can have. 
		 *                           	defaults to 8 meaning that incoming values must be in the range
		 *                            	[-255,255].
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
			this.connectSeries.apply(this, this._modChain);
			this.input.connect(this._modChain[0]);
			this._modChain[this._modChain.length - 1].connect(this.output);
		};

		Tone.extend(Tone.Modulo, Tone.SignalBase);

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
			var arrayLength = 1024;

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
			 *  the curve that the waveshaper uses
			 *  @type {Float32Array}
			 *  @private
			 */
			this._curve = new Float32Array(1024);

			/**
			 *  apply the equation logic
			 *  @type {WaveShaperNode}
			 *  @private
			 */
			this._operator = new Tone.WaveShaper(function(norm, pos){
				if (pos === arrayLength - 1){
					return -val;
				} else if (pos === 0){
					return val;
				} else {
					return 0;
				}
			}, arrayLength);

			//connect it up
			this.input.chain(this._div, this._operator);
		};

		Tone.extend(ModuloSubroutine);

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
			this._div = null;
			this._operator.disconnect();
			this._operator = null;
			this._curve = null;
		};

		return Tone.Modulo;
	});
	toneModule( 
	function(Tone){

		

		/**
		 *  this is the maximum value that the divide can handle	
		 *  @type {number}
		 *  @const
		 */
		var MAX_VALUE = Math.pow(2, 13);

		/**
		 *  @private
		 *  @static
		 *  @type {Array}
		 */
		var guessCurve = new Array(MAX_VALUE);
		//set the value
		for (var i = 0; i < guessCurve.length; i++){
			var normalized = (i / (guessCurve.length - 1)) * 2 - 1;
			if (normalized === 0){
				guessCurve[i] = 0;
			} else {
				guessCurve[i] = 1 / (normalized * MAX_VALUE);
			}
		}

		/**
		 *  @class Compute the inverse of the input.
		 *         Uses this approximation algorithm: 
		 *         http://en.wikipedia.org/wiki/Multiplicative_inverse#Algorithms
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {number} [precision=3] the precision of the calculation
		 */
		Tone.Inverse = function(precision){

			Tone.call(this);

			precision = this.defaultArg(precision, 3);

			/**
			 *  a constant generator of the value 2
			 *  @private
			 *  @type {Tone.Signal}
			 */
			this._two = new Tone.Signal(2);

			/**
			 *  starting guess is 0.1 times the input
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._guessMult = new Tone.Multiply(1/MAX_VALUE);

			/**
			 *  produces a starting guess based on the input
			 *  @type {WaveShaperNode}
			 *  @private
			 */
			this._guess = new Tone.WaveShaper(guessCurve);
			this.input.chain(this._guessMult, this._guess);

			/**
			 *  the array of inverse helpers
			 *  @type {Array}
			 *  @private
			 */
			this._inverses = new Array(precision);

			//create the helpers
			for (var i = 0; i < precision; i++){
				var guess;
				if (i === 0){
					guess = this._guess;
				} else {
					guess = this._inverses[i-1];
				}
				var inv = new InverseHelper(guess, this._two);
				this.input.connect(inv);
				this._inverses[i] = inv;
			}
			this._inverses[precision-1].connect(this.output);
		};

		Tone.extend(Tone.Inverse, Tone.SignalBase);

		/**
		 *  clean up
		 */
		Tone.Inverse.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			for (var i = 0; i < this._inverses.length; i++){
				this._inverses[i].dispose();
				this._inverses[i] = null;
			}
			this._inverses = null;
			this._two.dispose();
			this._two = null;
			this._guessMult.dispose();
			this._guessMult = null;
			this._guess.disconnect();
			this._guess = null;
		};

		// BEGIN INVERSE HELPER ///////////////////////////////////////////////////

		/**
		 *  internal helper function for computing the inverse of a signal
		 *  @extends {Tone}
		 *  @constructor
		 *  @internal
		 */
		var InverseHelper = function(guess, two){
			this._outerMultiply = new Tone.Multiply();
			this._innerMultiply = new Tone.Multiply();
			this._subtract = new Tone.Subtract();
			//connections
			guess.connect(this._innerMultiply, 0, 1);
			two.connect(this._subtract, 0, 0);
			this._innerMultiply.connect(this._subtract, 0, 1);
			this._subtract.connect(this._outerMultiply, 0, 1);
			guess.connect(this._outerMultiply, 0, 0);
			this.output = this._outerMultiply;
			this.input = this._innerMultiply;
		};

		Tone.extend(InverseHelper);

		InverseHelper.prototype.dispose = function(){
			this._outerMultiply.dispose();
			this._outerMultiply = null;
			this._innerMultiply.dispose();
			this._innerMultiply = null;
			this._subtract.dispose();
			this._subtract = null;
		};
		
		// END INVERSE HELPER /////////////////////////////////////////////////////

		return Tone.Inverse;
	});
	toneModule( 
	function(Tone){

		

		/**
		 *  @class Divide by a value or signal. 
		 *         input 0: numerator. input 1: divisor. 
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {number=} divisor if no value is provided, Tone.Divide will divide the first
		 *                         and second inputs. 
		 *  @param {number} [precision=3] the precision of the calculation
		 */
		Tone.Divide = function(divisor, precision){

			Tone.call(this, 2, 0);

			/**
			 *  the denominator value
			 *  @type {Tone.Signal}
			 *  @private
			 */
			this._value = null;

			/**
			 *  the inverse
			 *  @type {Tone}
			 */
			this._inverse = new Tone.Inverse(precision);

			/**
			 *  multiply input 0 by the inverse
			 *  @type {Tone.Multiply}
			 */
			this._mult = new Tone.Multiply();

			if (isFinite(divisor)){
				this._value = new Tone.Signal(divisor);
				this._value.connect(this._inverse);
			}
			this.input[1] = this._inverse;
			this._inverse.connect(this._mult, 0, 1);
			this.input[0] = this.output = this._mult.input[0];
		};

		Tone.extend(Tone.Divide, Tone.SignalBase);

		/**
		 *  set the divisor value
		 *  NB: if the value is known, use Tone.Multiply with the inverse of the value
		 *  Division is a computationally expensive operation. 
		 *  
		 *  @param {number} value 
		 */
		Tone.Divide.prototype.setValue = function(value){
			if (this._value !== null){
				this._value.setValue(value);
			} else {
				throw new Error("cannot switch from signal to number");
			}
		}; 

		/**
		 *  clean up
		 */
		Tone.Divide.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			if (this._value){
				this._value.dispose();
				this._value = null;
			}
			this._inverse.dispose();
			this._inverse = null;
			this._mult.dispose();
			this._mult = null;
		};

		return Tone.Divide;
	});
	toneModule( 
		function(Tone){

		

		/**
		 *  @class evaluate an expression at audio rate. 
		 *         parsing code modified from https://code.google.com/p/tapdigit/
		 *         Copyright 2011 2012 Ariya Hidayat, New BSD License
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {string} expr the expression to generate
		 */
		Tone.Expr = function(){

			var expr = this._replacements(Array.prototype.slice.call(arguments));
			var inputCount = this._parseInputs(expr);

			/**
			 *  hold onto all of the nodes for disposal
			 *  @type {Array}
			 *  @private
			 */
			this._nodes = [];

			/**
			 *  the inputs
			 *  @type {Array}
			 */
			this.input = new Array(inputCount);

			//create a gain for each input
			for (var i = 0; i < inputCount; i++){
				this.input[i] = this.context.createGain();
			}

			//parse the syntax tree
			var tree = this._parseTree(expr);
			//evaluate the results
			var result;
			try {
				result = this._eval(tree);
			} catch (e){
				this._disposeNodes();
				throw new Error("Could evaluate expression: "+expr);
			}

			/**
			 *  the output node is the result of the expression
			 *  @type {*}
			 */
			this.output = result;
		};

		Tone.extend(Tone.Expr, Tone.SignalBase);

		//some helpers to cut down the amount of code
		function applyBinary(Constructor, args, self){
			var op = new Constructor();
			self._eval(args[0]).connect(op, 0, 0);
			self._eval(args[1]).connect(op, 0, 1);
			return op;
		}
		function applyUnary(Constructor, args, self){
			var op = new Constructor();
			self._eval(args[0]).connect(op, 0, 0);
			return op;
		}
		function getNumber(arg){
			return arg ? parseFloat(arg) : undefined;
		}
		function literalNumber(arg){
			return arg && arg.args ? parseFloat(arg.args) : undefined;
		}

		/*
		 *  the Expressions that Tone.Expr can parse.
		 *
		 *  each expression belongs to a group and contains a regexp 
		 *  for selecting the operator as well as that operators method
		 *  
		 *  @type {Object}
		 *  @private
		 */
		Tone.Expr._Expressions = {
			//values
			"value" : {
				"signal" : {
					regexp : /^\d+\.\d+|^\d+/,
					method : function(arg){
						var sig = new Tone.Signal(getNumber(arg));
						return sig;
					}
				},
				"input" : {
					regexp : /^\$\d/,
					method : function(arg, self){
						return self.input[getNumber(arg.substr(1))];
					}
				}
			},
			//syntactic glue
			"glue" : {
				"(" : {
					regexp : /^\(/,
				},
				")" : {
					regexp : /^\)/,
				},
				"," : {
					regexp : /^,/,
				}
			},
			//functions
			"func" : {
				"abs" :  {
					regexp : /^abs/,
					method : applyUnary.bind(this, Tone.Abs)
				},
				"min" : {
					regexp : /^min/,
					method : applyBinary.bind(this, Tone.Min)
				},
				"max" : {
					regexp : /^max/,
					method : applyBinary.bind(this, Tone.Max)
				},
				"if" :  {
					regexp : /^if/,
					method : function(args, self){
						var op = new Tone.IfThenElse();
						self._eval(args[0]).connect(op.if);
						self._eval(args[1]).connect(op.then);
						self._eval(args[2]).connect(op.else);
						return op;
					}
				},
				"gt0" : {
					regexp : /^gt0/,
					method : applyUnary.bind(this, Tone.GreaterThanZero)
				},
				"eq0" : {
					regexp : /^eq0/,
					method : applyUnary.bind(this, Tone.EqualZero)
				},
				"inv" : {
					regexp : /^inv/,
					method : function(args, self){
						var precision = literalNumber(args[1]);
						var op = new Tone.Inverse(precision);
						self._eval(args[0]).connect(op);
						return op;
					}
				},
				"mod" : {
					regexp : /^mod/,
					method : function(args, self){
						var modulus = literalNumber(args[1]);
						var bits = literalNumber(args[2]);
						var op = new Tone.Modulo(modulus, bits);
						self._eval(args[0]).connect(op);
						return op;
					}
				},
				"pow" : {
					regexp : /^pow/,
					method : function(args, self){
						var exp = literalNumber(args[1]);
						var op = new Tone.Pow(exp);
						self._eval(args[0]).connect(op);
						return op;
					}
				},
			},
			//binary expressions
			"binary" : {
				"+" : {
					regexp : /^\+/,
					precedence : 1,
					method : applyBinary.bind(this, Tone.Add)
				},
				"-" : {
					regexp : /^\-/,
					precedence : 1,
					method : function(args, self){
						//both unary and binary op
						if (args.length === 1){
							return applyUnary(Tone.Negate, args, self);
						} else {
							return applyBinary(Tone.Subtract, args, self);
						}
					}
				},
				"*" : {
					regexp : /^\*/,
					precedence : 0,
					method : applyBinary.bind(this, Tone.Multiply)
				},
				"/" : {
					regexp : /^\//,
					precedence : 0,
					method : applyBinary.bind(this, Tone.Divide)
				},
				">" : {
					regexp : /^\>/,
					precedence : 2,
					method : applyBinary.bind(this, Tone.GreaterThan)
				},
				"<" : {
					regexp : /^</,
					precedence : 2,
					method : applyBinary.bind(this, Tone.LessThan)
				},
				"==" : {
					regexp : /^==/,
					precedence : 3,
					method : applyBinary.bind(this, Tone.Equal)
				},
				"&&" : {
					regexp : /^&&/,
					precedence : 4,
					method : applyBinary.bind(this, Tone.AND)
				},
				"||" : {
					regexp : /^\|\|/,
					precedence : 5,
					method : applyBinary.bind(this, Tone.OR)
				},
			},
			//unary expressions
			"unary" : {
				"-" : {
					regexp : /^\-/,
					method : applyUnary.bind(this, Tone.Negate)
				},
				"!" : {
					regexp : /^\!/,
					method : applyUnary.bind(this, Tone.NOT)
				},
			},
		};
			
		/**
		 *  @param   {string} expr the expression string
		 *  @return  {number}      the input count
		 *  @private
		 */
		Tone.Expr.prototype._parseInputs = function(expr){
			var inputArray = expr.match(/\$\d/g);
			var inputMax = 0;
			if (inputArray !== null){
				for (var i = 0; i < inputArray.length; i++){
					var inputNum = parseInt(inputArray[i].substr(1)) + 1;
					inputMax = Math.max(inputMax, inputNum);
				}
			}
			return inputMax;
		};

		/**
		 *  @param   {Array} args 	an array of arguments
		 *  @return  {string} the results of the replacements being replaced
		 *  @private
		 */
		Tone.Expr.prototype._replacements = function(args){
			var expr = args.shift();
			for (var i = 0; i < args.length; i++){
				expr = expr.replace(/\%/i, args[i]);
			}
			return expr;
		};

		/**
		 *  tokenize the expression based on the Expressions object
		 *  @param   {string} expr 
		 *  @return  {Object}      returns two methods on the tokenized list, next and peek
		 *  @private
		 */
		Tone.Expr.prototype._tokenize = function(expr){
			var position = -1;
			var tokens = [];

			while(expr.length > 0){
				expr = expr.trim();
				var token =  getNextToken(expr);
				tokens.push(token);
				expr = expr.substr(token.value.length);
			}

			function getNextToken(expr){
				for (var type in Tone.Expr._Expressions){
					var group = Tone.Expr._Expressions[type];
					for (var opName in group){
						var op = group[opName];
						var reg = op.regexp;
						var match = expr.match(reg);
						if (match !== null){
							return {
								type : type,
								value : match[0],
								method : op.method
							};
						}
					}
				}
				throw new SyntaxError("Unexpected token "+expr);
			}

			return {
				next : function(){
					return tokens[++position];
				},
				peek : function(){
					return tokens[position + 1];
				}
			};
		};

		/**
		 *  recursively parse the string expression into a syntax tree
		 *  
		 *  @param   {string} expr 
		 *  @return  {Object}
		 *  @private
		 */
		Tone.Expr.prototype._parseTree = function(expr){
			var lexer = this._tokenize(expr);
			var isUndef = this.isUndef.bind(this);

			function matchSyntax(token, syn) {
				return !isUndef(token) && 
					token.type === "glue" &&
					token.value === syn;
			}

			function matchGroup(token, groupName, prec) {
				var ret = false;
				var group = Tone.Expr._Expressions[groupName];
				if (!isUndef(token)){
					for (var opName in group){
						var op = group[opName];
						if (op.regexp.test(token.value)){
							if (!isUndef(prec)){
								if(op.precedence === prec){	
									return true;
								}
							} else {
								return true;
							}
						}
					}
				}
				return ret;
			}

			function parseExpression(precedence) {
				if (isUndef(precedence)){
					precedence = 5;
				}
				var expr;
				if (precedence < 0){
					expr = parseUnary();
				} else {
					expr = parseExpression(precedence-1);
				}
				var token = lexer.peek();
				while (matchGroup(token, "binary", precedence)) {
					token = lexer.next();
					expr = {
						operator: token.value,
						method : token.method,
						args : [
							expr,
							parseExpression(precedence)
						]
					};
					token = lexer.peek();
				}
				return expr;
			}

			function parseUnary() {
				var token, expr;
				token = lexer.peek();
				if (matchGroup(token, "unary")) {
					token = lexer.next();
					expr = parseUnary();
					return {
						operator: token.value,
						method : token.method,
						args : [expr]
					};
				}
				return parsePrimary();
			}

			function parsePrimary() {
				var token, expr;
				token = lexer.peek();
				if (isUndef(token)) {
					throw new SyntaxError("Unexpected termination of expression");
				}
				if (token.type === "func") {
					token = lexer.next();
					return parseFunctionCall(token);
				}
				if (token.type === "value") {
					token = lexer.next();
					return {
						method : token.method,
						args : token.value
					};
				}
				if (matchSyntax(token, "(")) {
					lexer.next();
					expr = parseExpression();
					token = lexer.next();
					if (!matchSyntax(token, ")")) {
						throw new SyntaxError("Expected )");
					}
					return expr;
				}
				throw new SyntaxError("Parse error, cannot process token " + token.value);
			}

			function parseFunctionCall(func) {
				var token, args = [];
				token = lexer.next();
				if (!matchSyntax(token, "(")) {
					throw new SyntaxError("Expected ( in a function call \"" + func.value + "\"");
				}
				token = lexer.peek();
				if (!matchSyntax(token, ")")) {
					args = parseArgumentList();
				}
				token = lexer.next();
				if (!matchSyntax(token, ")")) {
					throw new SyntaxError("Expected ) in a function call \"" + func.value + "\"");
				}
				return {
					method : func.method,
					args : args,
					name : name
				};
			}

			function parseArgumentList() {
				var token, expr, args = [];
				while (true) {
					expr = parseExpression();
					if (isUndef(expr)) {
						// TODO maybe throw exception?
						break;
					}
					args.push(expr);
					token = lexer.peek();
					if (!matchSyntax(token, ",")) {
						break;
					}
					lexer.next();
				}
				return args;
			}

			return parseExpression();
		};

		/**
		 *  recursively evaluate the expression tree
		 *  @param   {Object} tree 
		 *  @return  {AudioNode}      the resulting audio node from the expression
		 *  @private
		 */
		Tone.Expr.prototype._eval = function(tree){
			if (!this.isUndef(tree)){
				var node = tree.method(tree.args, this);
				this._nodes.push(node);
				return node;
			} 
		};

		/**
		 *  dispose all the nodes
		 *  @private
		 */
		Tone.Expr.prototype._disposeNodes = function(){
			for (var i = 0; i < this._nodes.length; i++){
				var node = this._nodes[i];
				if (typeof node.dispose === "function") {
					node.dispose();
				} else if (typeof node.disconnect === "function") {
					node.disconnect();
				}
				node = null;
				this._nodes[i] = null;
			}
			this._nodes = null;
		};

		/**
		 *  clean up
		 */
		Tone.Expr.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._disposeNodes();
		};

		return Tone.Expr;
	});
	toneModule( function(Tone){

		

		/**
		 * @class  dry/wet knob.
		 *         equal power fading control values:
		 * 	       0 = 100% wet  -    0% dry
		 * 	       1 =   0% wet  -  100% dry
		 *
		 * @constructor
		 * @extends {Tone}
		 * @param {number} [initialDry=0.5]
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
			this._invert = new Tone.Expr("1 - $0");

			//connections
			this.dry.connect(this.output);
			this.wet.connect(this.output);
			//wet control
			this.wetness.connect(this.wet.gain);
			//dry control is the inverse of the wet
			this.wetness.chain(this._invert, this.dry.gain);
			this.setDry(this.defaultArg(initialDry, 0.5));
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

	toneModule( function(Tone){

		

		/**
		 *  @class  Filter object which allows for all of the same native methods
		 *          as the BiquadFilter (with AudioParams implemented as Tone.Signals)
		 *          but adds the ability to set the filter rolloff at -12 (default), 
		 *          -24 and -48. 
		 *
		 *  @constructor
		 *  @extends {Tone}
		 *  @param {number|Object} [freq=350] the frequency
		 *  @param {string} [type=lowpass] the type of filter
		 *  @param {number} [rolloff=-12] the rolloff which is the drop per octave. 
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
			this.connectSeries.apply(this, connectionChain);
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
	toneModule( function(Tone){

		

		/**
		 *  @class Split the incoming signal into three bands (low, mid, high)
		 *         with two crossover frequency controls. 
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @param {number} lowFrequency the low/mid crossover frequency
		 *  @param {number} highFrequency the mid/high crossover frequency
		 */
		Tone.MultibandSplit = function(){
			var options = this.optionsObject(arguments, ["lowFrequency", "highFrequency"], Tone.MultibandSplit.defaults);

			/**
			 *  the input
			 *  @type {GainNode}
			 */
			this.input = this.context.createGain();

			/**
			 *  the outputs
			 *  @type {Array}
			 */
			this.output = new Array(3);

			/**
			 *  the low band
			 *  @type {Tone.Filter}
			 */
			this.low = this.output[0] = new Tone.Filter(0, "lowpass");

			/**
			 *  the lower filter of the mid band
			 *  @type {Tone.Filter}
			 *  @private
			 */
			this._lowMidFilter = new Tone.Filter(0, "highpass");

			/**
			 *  the mid band
			 *  @type {Tone.Filter}
			 */
			this.mid = this.output[1] = new Tone.Filter(0, "lowpass");

			/**
			 *  the high band
			 *  @type {Tone.Filter}
			 */
			this.high = this.output[2] = new Tone.Filter(0, "highpass");

			/**
			 *  the low/mid crossover frequency
			 *  @type {Tone.Signal}
			 */
			this.lowFrequency = new Tone.Signal(options.lowFrequency);

			/**
			 *  the mid/high crossover frequency
			 *  @type {Tone.Signal}
			 */
			this.highFrequency = new Tone.Signal(options.highFrequency);

			this.input.fan(this.low, this.high);
			this.input.chain(this._lowMidFilter, this.mid);
			//the frequency control signal
			this.lowFrequency.connect(this.low.frequency);
			this.lowFrequency.connect(this._lowMidFilter.frequency);
			this.highFrequency.connect(this.mid.frequency);
			this.highFrequency.connect(this.high.frequency);
		};

		Tone.extend(Tone.MultibandSplit);

		/**
		 *  @private
		 *  @static
		 *  @type {Object}
		 */
		Tone.MultibandSplit.defaults = {
			"lowFrequency" : 400,
			"highFrequency" : 2500
		};

		/**
		 *  clean up
		 */
		Tone.MultibandSplit.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this.low.dispose();
			this._lowMidFilter.dispose();
			this.mid.dispose();
			this.high.dispose();
			this.lowFrequency.dispose();
			this.highFrequency.dispose();
			this.low = null;
			this._lowMidFilter = null;
			this.mid = null;
			this.high = null;
			this.lowFrequency = null;
			this.highFrequency = null;
		};

		return Tone.MultibandSplit;
	});
	toneModule( function(Tone){

		

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

			var options = this.optionsObject(arguments, ["low", "mid", "high"], Tone.EQ.defaults);

			/**
			 *  the output node
			 *  @type {GainNode}
			 */
			this.output = this.context.createGain();

			/**
			 *  the multiband split
			 *  @type {Tone.MultibandSplit}
			 *  @private
			 */
			this._multibandSplit = new Tone.MultibandSplit({
				"lowFrequency" : options.lowFrequency,
				"highFrequency" : options.highFrequency
			});

			/**
			 *  input node
			 */
			this.input = this._multibandSplit;

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

			/**
			 *  the low/mid crossover frequency
			 *  @type {Tone.Signal}
			 */
			this.lowFrequency = this._multibandSplit.lowFrequency;

			/**
			 *  the mid/high crossover frequency
			 *  @type {Tone.Signal}
			 */
			this.highFrequency = this._multibandSplit.highFrequency;

			//the frequency bands
			this._multibandSplit.low.chain(this.lowGain, this.output);
			this._multibandSplit.mid.chain(this.midGain, this.output);
			this._multibandSplit.high.chain(this.highGain, this.output);
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
			this._multibandSplit.dispose();
			this.lowGain.disconnect();
			this.midGain.disconnect();
			this.highGain.disconnect();
			this._multibandSplit = null;
			this.lowFrequency = null;
			this.highFrequency = null;
			this.lowGain = null;
			this.midGain = null;
			this.highGain = null;
		};

		return Tone.EQ;
	});
	toneModule( function(Tone){

		
		
		/**
		 *  @class  performs a linear scaling on an input signal.
		 *          Scales a normal gain input range [0,1] to between
		 *          outputMin and outputMax
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} [outputMin=0]
		 *  @param {number} [outputMax=1]
		 */
		Tone.Scale = function(outputMin, outputMax){

			/** 
			 *  @private
			 *  @type {number}
			 */
			this._outputMin = this.defaultArg(outputMin, 0);

			/** 
			 *  @private
			 *  @type {number}
			 */
			this._outputMax = this.defaultArg(outputMax, 1);


			/** 
			 *  @private
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._scale = this.input = new Tone.Multiply(1);
			
			/** 
			 *  @private
			 *  @type {Tone.Add}
			 *  @private
			 */
			this._add = this.output = new Tone.Add(0);

			this._scale.connect(this._add);
			this._setRange();
		};

		Tone.extend(Tone.Scale, Tone.SignalBase);

		/**
		 *  set the minimum output value
		 *  @param {number} min the minimum output value
		 */
		Tone.Scale.prototype.setMin = function(min){
			this._outputMin = min;
			this._setRange();
		};

		/**
		 *  set the minimum output value
		 *  @param {number} min the minimum output value
		 */
		Tone.Scale.prototype.setMax = function(max){
			this._outputMax = max;
			this._setRange();
		};

		/**
		 *  set the values
		 *  @private
		 */
		Tone.Scale.prototype._setRange = function() {
			this._add.setValue(this._outputMin);
			this._scale.setValue(this._outputMax - this._outputMin);
		};

		/**
		 *  clean up
		 */
		Tone.Scale.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._add.dispose();
			this._add = null;
			this._scale.dispose();
			this._scale = null;
		}; 


		return Tone.Scale;
	});

	toneModule( 
	function(Tone){
		
		/**
		 *  @class  performs an exponential scaling on an input signal.
		 *          Scales a normal gain range [0,1] exponentially
		 *          to the output range of outputMin to outputMax.
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} [outputMin=0]
		 *  @param {number} [outputMax=1]
		 *  @param {number} [exponent=2] the exponent which scales the incoming signal
		 */
		Tone.ScaleExp = function(outputMin, outputMax, exponent){

			/**
			 *  scale the input to the output range
			 *  @type {Tone.Scale}
			 *  @private
			 */
			this._scale = this.output = new Tone.Scale(outputMin, outputMax);

			/**
			 *  @private
			 *  @type {Tone.Pow}
			 *  @private
			 */
			this._exp = this.input = new Tone.Pow(this.defaultArg(exponent, 2));

			this._exp.connect(this._scale);
		};

		Tone.extend(Tone.ScaleExp, Tone.SignalBase);

		/**
		 *  set the exponential scaling curve
		 *  @param {number} exp the exponent to raise the incoming signal to
		 */
		Tone.ScaleExp.prototype.setExponent = function(exp){
			this._exp.setExponent(exp);
		};

		/**
		 *  set the minimum output value
		 *  @param {number} min the minimum output value
		 */
		Tone.ScaleExp.prototype.setMin = function(min){
			this._scale.setMin(min);
		};

		/**
		 *  set the minimum output value
		 *  @param {number} min the minimum output value
		 */
		Tone.ScaleExp.prototype.setMax = function(max){
			this._scale.setMax(max);
		};

		/**
		 *  clean up
		 */
		Tone.ScaleExp.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._scale.dispose();
			this._scale = null;
			this._exp.dispose();
			this._exp = null;
		}; 


		return Tone.ScaleExp;
	});

	toneModule( function(Tone){

		

		/**
		 *  @class A comb filter with feedback
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @param {number} [minDelay=0.01] the minimum delay time which the filter can have
		 *  @param {number} [maxDelay=1] the maximum delay time which the filter can have
		 */
		Tone.FeedbackCombFilter = function(minDelay, maxDelay){

			Tone.call(this);

			minDelay = this.defaultArg(minDelay, 0.1);
			maxDelay = this.defaultArg(maxDelay, 1);
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
			 *  the resonance control
			 *  @type {Tone.Signal}
			 */
			this.resonance = new Tone.Signal(0.5);

			/**
			 *  scale the resonance value to the normal range
			 *  @type {Tone.Scale}
			 *  @private
			 */
			this._resScale = new Tone.ScaleExp(0.01, 1 / this._delayCount - 0.001, 0.5);

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
				var delay = this.context.createDelay(maxDelay);
				delay.delayTime.value = minDelay;
				delay.connect(this._feedback);
				this._delays[i] = delay;
			}

			//connections
			this.connectSeries.apply(this, this._delays);
			this.input.connect(this._delays[0]);
			//set the delay to the min value initially
			this._feedback.connect(this._delays[0]);
			//resonance control
			this.resonance.chain(this._resScale, this._feedback.gain);
			this._feedback.connect(this.output);
			this.setDelayTime(minDelay);
		};

		Tone.extend(Tone.FeedbackCombFilter);

		/**
		 *  set the delay time of the comb filter
		 *  auto corrects for sample offsets for small delay amounts
		 *  	
		 *  @param {number} delayAmount the delay amount
		 *  @param {Tone.Time} [time=now]        when the change should occur
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
					this._delays[i].delayTime.setValueAtTime(1 / sampleRate + delayAmount, time);
				}
				delayAmount = Math.floor(delaySamples) / sampleRate;
			} else if (this._highFrequencies){
				this._highFrequencies = false;
				for (var j = 0; j < this._delays.length; j++) {
					this._delays[j].delayTime.setValueAtTime(delayAmount, time);
				}
			}
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
			this._delays = null;
			this.resonance.dispose();
			this.resonance = null;
			this._resScale.dispose();
			this._resScale = null;
			this._feedback.disconnect();
			this._feedback = null;
		};

		return Tone.FeedbackCombFilter;
	});
	toneModule( 
	function(Tone){

		

		/**
		 *  @class  Follow the envelope of the incoming signal. 
		 *          Careful with small (< 0.02) attack or decay values. 
		 *          The follower has some ripple which gets exaggerated
		 *          by small values. 
		 *  
		 *  @constructor
		 *  @extends {Tone}
		 *  @param {Tone.Time} [attack = 0.05] 
		 *  @param {Tone.Time} [release = 0.5] 
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
			this._frequencyValues = new Tone.WaveShaper();
			
			/**
			 *  @type {Tone.Subtract}
			 *  @private
			 */
			this._sub = new Tone.Subtract();

			/**
			 *  @type {DelayNode}
			 *  @private
			 */
			this._delay = this.context.createDelay();
			this._delay.delayTime.value = this.bufferTime;

			/**
			 *  this keeps it far from 0, even for very small differences
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._mult = new Tone.Multiply(10000);

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
			this.input.chain(this._abs, this._filter, this.output);
			//the difference path
			this._abs.connect(this._sub, 0, 1);
			this._filter.chain(this._delay, this._sub);
			//threshold the difference and use the thresh to set the frequency
			this._sub.chain(this._mult, this._frequencyValues, this._filter.frequency);
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
			var minTime = this.bufferTime;
			attack = Math.max(attack, minTime);
			release = Math.max(release, minTime);
			this._frequencyValues.setMap(function(val){
				if (val <= 0){
					return attack;
				} else {
					return release;
				} 
			});
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
			this._filter = null;
			this._frequencyValues.disconnect();
			this._frequencyValues = null;
			this._delay.disconnect();
			this._delay = null;
			this._sub.disconnect();
			this._sub = null;
			this._abs.dispose();
			this._abs = null;
			this._mult.dispose();
			this._mult = null;
			this._curve = null;
		};

		return Tone.Follower;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class  Only pass signal through when it's signal exceeds the
		 *          specified threshold.
		 *  
		 *  @constructor
		 *  @extends {Tone}
		 *  @param {number} [thresh = -40] the threshold in Decibels
		 *  @param {number} [attackTime = 0.1] the follower's attacktime
		 *  @param {number} [releaseTime = 0.1] the follower's release time
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
			this.input.connect(this.output);
			//the control signal
			this.input.chain(this._gt, this._follower, this.output.gain);
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
	toneModule( function(Tone){

		
		
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
	toneModule( 
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
		 *  "now" (i.e. the currentTime).
		 *
		 *  [Tone.Time Wiki](https://github.com/TONEnoTONE/Tone.js/wiki/Time)
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
		 *  controls which beat the swing is applied to
		 *  defaults to an 16th note
		 *  @private
		 *  @type {number}
		 */
		var swingTatum = 3;

		/**
		 *  controls which beat the swing is applied to
		 *  @private
		 *  @type {number}
		 */
		var swingAmount = 0;

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
				if (swingAmount > 0 && timelineTicks % tatum !== 0 && timelineTicks % swingTatum === 0){
					//add some swing
					tickTime += Tone.Transport.ticksToSeconds(swingTatum) * swingAmount;
				}
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
		 *  ```javascript
		 *  //triggers a callback every 8th note with the exact time of the event
		 *  Tone.Transport.setInterval(function(time){
		 *  	envelope.triggerAttack(time);
		 *  }, "8n");
		 *  ```
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
		 *  ```javascript
		 *  //trigger an event to happen 1 second from now
		 *  Tone.Transport.setTimeout(function(time){
		 *  	player.start(time);
		 *  }, 1)
		 *  ```
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
		 *  ```javascript
		 *  //trigger the start of a part on the 16th measure
		 *  Tone.Transport.setTimeline(function(time){
		 *  	part.start(time);
		 *  }, "16m");
		 *  ```
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

		/**
		 *  returns the time of the next beat
		 *  @param  {string} [subdivision="4n"]
		 *  @return {number} 	the time in seconds of the next subdivision
		 */
		Tone.Transport.prototype.nextBeat = function(subdivision){
			subdivision = this.defaultArg(subdivision, "4n");
			var tickNum = this.toTicks(subdivision);
			var remainingTicks = (transportTicks % tickNum);
			var nextTick = remainingTicks;
			if (remainingTicks > 0){
				nextTick = tickNum - remainingTicks;
			}
			return this.ticksToSeconds(nextTick);
		};


		///////////////////////////////////////////////////////////////////////////////
		//	START/STOP/PAUSE
		///////////////////////////////////////////////////////////////////////////////

		/**
		 *  start the transport and all sources synced to the transport
		 *  
		 *  @param  {Tone.Time} time
		 *  @param  {Tone.Time=} offset the offset position to start
		 */
		Tone.Transport.prototype.start = function(time, offset){
			if (this.state === TransportState.STOPPED || this.state === TransportState.PAUSED){
				if (!this.isUndef(offset)){
					this._setTicks(this.toTicks(offset));
				}
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
		 *  ```javascript
		 *  this.setTimeSignature(3, 8); // 3/8
		 *  this.setTimeSignature(4); // 4/4
		 *  ```
		 *  
		 *  @param {number} numerator  the numerator of the time signature
		 *  @param {number} [denominator=4] the denominator of the time signature. this should
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

		/**
		 *  set the amount of swing which is applied to the subdivision (defaults to 16th notes)
		 *  @param {number} amount a value between 0-1 where 1 equal to the note + half the subdivision
		 */
		Tone.Transport.prototype.setSwing = function(amount){
			//scale the values to a normal range
			swingAmount = amount * 0.5;
		};

		/**
		 *  set the subdivision which the swing will be applied to. the starting values is a 16th note. 
		 *  
		 *  ```javascript
		 *  Tone.Transport.setSwingSubdivision("8n"); //the eight note will be swing by the "swing amount"
		 *  ```
		 *  
		 *  @param {string} subdivision the subdivision in notation (i.e. 8n, 16n, 8t).
		 *                              value must be less than a quarter note.
		 */
		Tone.Transport.prototype.setSwingSubdivision = function(subdivision){
			swingTatum = this.toTicks(subdivision);
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
		 *  defined in "Tone/core/Transport"
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
		 *  defined in "Tone/core/Transport"
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
		 *  defined in "Tone/core/Transport"
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
		 *  defined in "Tone/core/Transport"
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
		 *  defined in "Tone/core/Transport"
		 *  
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
		 *  defined in "Tone/core/Transport"
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
		 *  defined in "Tone/core/Transport"
		 *  
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
		 *  defined in "Tone/core/Transport"
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
		 *  defined in "Tone/core/Transport"
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
		 *  defined in "Tone/core/Transport"
		 *  
		 *  unlike the method which it overrides, this takes into account 
		 *  transporttime and musical notation
		 *
		 *  Time : 1.40
		 *  Notation: 4n|1m|2t
		 *  TransportTime: 2:4:1 (measure:quarters:sixteens)
		 *  Now Relative: +3n
		 *  Math: 3n+16n or even very complicated expressions ((3n*2)/6 + 1)
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
					var originalTime = time;
					for(var i = 0; i < components.length; i++){
						var symb = components[i].trim();
						if (symb !== ""){
							var val = this.toSeconds(symb);
							time = time.replace(symb, val);
						}
					}
					try {
						//i know eval is evil, but i think it's safe here
						time = eval(time); // jshint ignore:line
					} catch (e){
						throw new EvalError("problem evaluating Tone.Time: "+originalTime);
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

		Tone._initAudioContext(function(){
			if (typeof Tone.Transport === "function"){
				//a single transport object
				Tone.Transport = new Tone.Transport();
				Tone.Transport.setBpm(120);
			} else {
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
			}
		});

		return Tone.Transport;
	});

	toneModule( function(Tone){

		
		
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
			//unlike most ToneNodes, Sources only have an output and no input
			Tone.call(this, 0, 1);

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
		 *  @param {Tone.Time} [delay=0] delay time before starting the source
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
		 *  set the parameters at once
		 *  @param {Object} params
		 */
		Tone.Source.prototype.set = function(params){
			if (!this.isUndef(params.volume)) this.setVolume(params.volume);
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
	toneModule( 
	function(Tone){

		

		/**
		 *  @class Oscilator with start, pause, stop and sync to Transport methods
		 *
		 *  @constructor
		 *  @extends {Tone.Source}
		 *  @param {number|string} [frequency=440] starting frequency
		 *  @param {string} [type="sine"] type of oscillator (sine|square|triangle|sawtooth)
		 */
		Tone.Oscillator = function(){
			
			Tone.Source.call(this);
			var options = this.optionsObject(arguments, ["frequency", "type"], Tone.Oscillator.defaults);

			/**
			 *  the main oscillator
			 *  @type {OscillatorNode}
			 *  @private
			 */
			this._oscillator = null;
			
			/**
			 *  the frequency control signal
			 *  @type {Tone.Signal}
			 */
			this.frequency = new Tone.Signal(this.toFrequency(options.frequency));

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
			
			//setup
			this.setPhase(this._phase);
		};

		Tone.extend(Tone.Oscillator, Tone.Source);

		/**
		 *  the default parameters
		 *
		 *  @static
		 *  @const
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
		 *  @param  {Tone.Time} [time=now] 
		 */
		Tone.Oscillator.prototype.start = function(time){
			if (this.state === Tone.Source.State.STOPPED){
				this.state = Tone.Source.State.STARTED;
				//get previous values
				//new oscillator with previous values
				this._oscillator = this.context.createOscillator();
				this._oscillator.setPeriodicWave(this._wave);
				//connect the control signal to the oscillator frequency & detune
				this._oscillator.connect(this.output);
				this.frequency.connect(this._oscillator.frequency);
				this.detune.connect(this._oscillator.detune);
				//start the oscillator
				this._oscillator.onended = this.onended;
				this._oscillator.start(this.toSeconds(time));
			}
		};

		/**
		 *  stop the oscillator
		 *  @param  {Tone.Time} [time=now] (optional) timing parameter
		 */
		Tone.Oscillator.prototype.stop = function(time){
			if (this.state === Tone.Source.State.STARTED){
				this.state = Tone.Source.State.STOPPED;
				this._oscillator.stop(this.toSeconds(time));
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
			if (this._oscillator !== null){
				this._oscillator.setPeriodicWave(this._wave);
			}
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
			Tone.Source.prototype.set.call(this, params);
		};

		/**
		 *  dispose and disconnect
		 */
		Tone.Oscillator.prototype.dispose = function(){
			Tone.Source.prototype.dispose.call(this);
			this.stop();
			if (this._oscillator !== null){
				this._oscillator.disconnect();
				this._oscillator = null;
			}
			this.frequency.dispose();
			this.detune.dispose();
			this._wave = null;
			this.detune = null;
			this.frequency = null;
		};

		return Tone.Oscillator;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class AudioToGain converts an input range of -1,1 to 0,1
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 */
		Tone.AudioToGain = function(){

			/**
			 *  @type {WaveShaperNode}
			 *  @private
			 */
			this._norm = this.input = this.output = new Tone.WaveShaper([0,1]);
		};

		Tone.extend(Tone.AudioToGain, Tone.SignalBase);

		/**
		 *  clean up
		 */
		Tone.AudioToGain.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._norm.disconnect();
			this._norm = null;
		};

		return Tone.AudioToGain;
	});
	toneModule( 
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
		 *  @param {Tone.Time} [rate="4n"]
		 *  @param {number} [outputMin=0]
		 *  @param {number} [outputMax=1]
		 */
		Tone.LFO = function(){

			var options = this.optionsObject(arguments, ["rate", "min", "max"], Tone.LFO.defaults);

			/** 
			 *  the oscillator
			 *  @type {Tone.Oscillator}
			 */
			this.oscillator = new Tone.Oscillator(options.rate, options.type);

			/**
			 *  pointer to the oscillator's frequency
			 *  @type {Tone.Signal}
			 */
			this.frequency = this.oscillator.frequency;

			/**
			 *  @type {Tone.AudioToGain} 
			 *  @private
			 */
			this._a2g = new Tone.AudioToGain();

			/**
			 *  @type {Tone.Scale} 
			 *  @private
			 */
			this._scaler = this.output = new Tone.Scale(options.min, options.max);

			//connect it up
			this.oscillator.chain(this._a2g, this._scaler);
		};

		Tone.extend(Tone.LFO);

		/**
		 *  the default parameters
		 *
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.LFO.defaults = {
			"type" : "sine",
			"min" : 0,
			"max" : 1,
			"frequency" : "4n",
		};

		/**
		 *  start the LFO
		 *  @param  {Tone.Time} [time=now] the time the LFO will start
		 */
		Tone.LFO.prototype.start = function(time){
			this.oscillator.start(time);
		};

		/**
		 *  stop the LFO
		 *  @param  {Tone.Time} [time=now] the time the LFO will stop
		 */
		Tone.LFO.prototype.stop = function(time){
			this.oscillator.stop(time);
		};

		/**
		 *  Sync the start/stop/pause to the transport 
		 *  and the frequency to the bpm of the transport
		 *
		 *  @param {Tone.Time} [delay=0] the time to delay the start of the
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
		 *  @param {Tone.Time} rate 
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
			this._scaler.setMin(min);
		};

		/**
		 *  Set the maximum output of the LFO
		 *  @param {number} min 
		 */
		Tone.LFO.prototype.setMax = function(max){
			this._scaler.setMax(max);
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
			this.oscillator = null;
			this._scaler.dispose();
			this._scaler = null;
			this._a2g.dispose();
			this._a2g = null;
			this.frequency = null;
		};

		return Tone.LFO;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class A limiter on the incoming signal. Composed of a Tone.Compressor
		 *         with a fast attack and decay value. 
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @param {number} threshold the threshold in decibels
		 */
		Tone.Limiter = function(threshold){

			/**
			 *  the compressor
			 *  @private
			 *  @type {Tone.Compressor}
			 */
			this._compressor = this.input = this.output = new Tone.Compressor({
				"attack" : 0.001,
				"decay" : 0.001,
				"threshold" : threshold
			});
		};

		Tone.extend(Tone.Limiter);

		/**
		 *  set the threshold value
		 *  @param {number} value the threshold in decibels
		 */
		Tone.Limiter.prototype.setThreshold = function(value) {
			this._compressor.setThreshold(value);
		};

		/**
		 *  clean up
		 */
		Tone.Limiter.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._compressor.dispose();
			this._compressor = null;
		};

		return Tone.Limiter;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class A lowpass feedback comb filter. 
		 *         DelayNode -> Lowpass Filter -> feedback
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @param {number} [minDelay=0.1] the minimum delay time which the filter can have
		 *  @param {number} [maxDelay=1] the maximum delay time which the filter can have
		 */
		Tone.LowpassCombFilter = function(minDelay, maxDelay){

			Tone.call(this);

			minDelay = this.defaultArg(minDelay, 0.01);
			maxDelay = this.defaultArg(maxDelay, 1);
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
			this._resScale = new Tone.ScaleExp(0.01, 1 / this._filterDelayCount - 0.001, 0.5);

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
				var filterDelay = new FilterDelay(minDelay, this.dampening);
				filterDelay.connect(this._feedback);
				this._filterDelays[i] = filterDelay;
			}

			//connections
			this.input.connect(this._filterDelays[0]);
			this._feedback.connect(this._filterDelays[0]);
			this.connectSeries.apply(this, this._filterDelays);
			//resonance control
			this.resonance.chain(this._resScale, this._feedback.gain);
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
		 *  @param {Tone.Time} [time=now]        when the change should occur
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
					this._filterDelays[i].setDelay(1 / sampleRate + delayAmount, time);
				}
				delayAmount = Math.floor(delaySamples) / sampleRate;
			} else if (this._highFrequencies){
				this._highFrequencies = false;
				for (var j = 0; j < this._filterDelays.length; j++) {
					this._filterDelays[j].setDelay(delayAmount, time);
				}
			}
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
			this._filterDelays = null;
			this.dampening.dispose();
			this.dampening = null;
			this.resonance.dispose();
			this.resonance = null;
			this._resScale.dispose();
			this._resScale = null;
			this._feedback.disconnect();
			this._feedback = null;
		};

		// BEGIN HELPER CLASS //

		/**
		 *  FilterDelay
		 *  @internal
		 *  @constructor
		 *  @extends {Tone}
		 */
		var FilterDelay = function(maxDelay, filterFreq){
			this.delay = this.input = this.context.createDelay(maxDelay);
			this.delay.delayTime.value = maxDelay;

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
			this.delay = null;
			this.filter.disconnect();
			this.filter = null;
		};

		// END HELPER CLASS //

		return Tone.LowpassCombFilter;
	});
	toneModule( function(Tone){

		

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

	toneModule( function(Tone){

		
		
		/**
		 *  @class  A single master output. 
		 *          adds toMaster to Tone
		 *
		 *  @constructor
		 *  @extends {Tone}
		 */
		Tone.Master = function(){
			Tone.call(this);

			/**
			 *  put a hard limiter on the output so we don't blow any eardrums
			 *  
			 *  @type {DynamicsCompressorNode}
			 */
			this.limiter = this.context.createDynamicsCompressor();
			this.limiter.threshold.value = 0;
			this.attack = 0.001;
			this.release = 0.01;
			this.limiter.ratio.value = 20;
			
			//connect it up
			this.input.chain(this.limiter, this.output, this.context.destination);
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
		 *  @param {Tone.Time=} fadeTime time it takes to reach the value
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
		 *  defined in "Tone/core/Master"
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

		/**
		 *  initialize the module and listen for new audio contexts
		 */
		Tone._initAudioContext(function(){
			//a single master output
			if (!Tone.prototype.isUndef(Tone.Master)){
				Tone.Master = new MasterConstructor();
			} else {
				MasterConstructor.call(Tone.Master);
			}
		});

		return Tone.Master;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class  Get the rms of the input signal with some averaging.
		 *          can also just get the value of the signal
		 *          or the value in dB. inspired by https://github.com/cwilso/volume-meter/blob/master/volume-meter.js
		 *          Note that for signal processing, it's better to use {@link Tone.Follower} which will produce
		 *          an audio-rate envelope follower instead of needing to poll the Meter to get the output.
		 *
		 *  @constructor
		 *  @extends {Tone}
		 *  @param {number} [channels=1] number of channels being metered
		 *  @param {number} [smoothing=0.8] amount of smoothing applied to the volume
		 *  @param {number} [clipMemory=500] number in ms that a "clip" should be remembered
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
		 *  @param  {number} [channel=0] which channel
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
	toneModule( function(Tone){

		

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
	toneModule( function(Tone){

		

		/**
		 *  @class A compressor with seperate controls over low/mid/high dynamics
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @param {Object} options the low/mid/high compressor settings in a single object
		 */
		Tone.MultibandCompressor = function(options){

			options = this.defaultArg(arguments, Tone.MultibandCompressor.defaults);

			/**
			 *  split the incoming signal into high/mid/low
			 *  @type {Tone.MultibandSplit}
			 *  @private
			 */
			this._splitter = new Tone.MultibandSplit({
				"lowFrequency" : options.lowFrequency,
				"highFrequency" : options.highFrequency
			});

			/**
			 *  low/mid crossover frequency
			 *  @type {Tone.Signal}
			 */
			this.lowFrequency = this._splitter.lowFrequency;

			/**
			 *  mid/high crossover frequency
			 *  @type {Tone.Signal}
			 */
			this.highFrequency = this._splitter.highFrequency;

			/**
			 *  the input
			 */
			this.input = this._splitter;

			/**
			 *  the output
			 *  @type {GainNode}
			 */
			this.output = this.context.createGain();

			/**
			 *  the low compressor
			 *  @type {Tone.Compressor}
			 */
			this.low = new Tone.Compressor(options.low);

			/**
			 *  the mid compressor
			 *  @type {Tone.Compressor}
			 */
			this.mid = new Tone.Compressor(options.mid);

			/**
			 *  the high compressor
			 *  @type {Tone.Compressor}
			 */
			this.high = new Tone.Compressor(options.high);

			//connect the compressor
			this._splitter.low.chain(this.low, this.output);
			this._splitter.mid.chain(this.mid, this.output);
			this._splitter.high.chain(this.high, this.output);
		};

		Tone.extend(Tone.MultibandCompressor);

		/**
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.MultibandCompressor.defaults = {
			"low" : Tone.Compressor.defaults,
			"mid" : Tone.Compressor.defaults,
			"high" : Tone.Compressor.defaults,
			"lowFrequency" : 250,
			"highFrequency" : 2000
		};

		/**
		 *  clean up
		 */
		Tone.MultibandCompressor.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._splitter.dispose();
			this.low.dispose();
			this.mid.dispose();
			this.high.dispose();
			this._splitter = null;
			this.low = null;
			this.mid = null;
			this.high = null;
			this.lowFrequency = null;
			this.highFrequency = null;
		};

		return Tone.MultibandCompressor;
	});
	toneModule( function(Tone){

		

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
	toneModule( 
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
		 *  @param {number} [initialPan=0.5] the initail panner value (defaults to 0.5 = center)
		 */
		Tone.Panner = function(initialPan){

			Tone.call(this, 1, 0);
			
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
			this._merger = this.output = new Tone.Merge();
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
		 *  @param {Tone.Time=} rampTime ramp to the pan position
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
	toneModule( function(Tone){

		

		/**
		 *  @class A Panner and volume in one
		 *
		 *  @extends {Tone}
		 *  @constructor
		 */
		Tone.PanVol = function(pan, volume){
			/**
			 *  the panning node
			 *  @type {Tone.Panner}
			 */
			this.pan = this.input = new Tone.Panner(pan);

			/**
			 *  the volume node
			 *  @type {GainNode}
			 */
			this.vol = this.output = this.context.createGain();

			//connections
			this.pan.connect(this.vol);
			this.setVolume(this.defaultArg(volume, 0));
		};

		Tone.extend(Tone.PanVol);

		/**
		 *  borrows the source's set volume
		 *  @function
		 */
		Tone.PanVol.prototype.setVolume = Tone.Source.prototype.setVolume;

		/**
		 *  set the panning
		 *  @param {number} pan 0-1 L-R
		 */
		Tone.PanVol.prototype.setPan = function(pan){
			this.pan.setPan(pan);
		};

		/**
		 *  clean up
		 */
		Tone.PanVol.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this.pan.dispose();
			this.pan = null;
			this.vol.disconnect();
			this.vol = null;
		};

		return Tone.PanVol;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class  Record an input into an array or AudioBuffer. 
		 *          it is limited in that the recording length needs to be known beforehand. 
		 *          Mostly used internally for testing. 
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
	toneModule( 
		function(Tone){

		

		/**
		 *  @class An envelope which can be scaled to any range. 
		 *         Useful for applying an envelope to a filter
		 *
		 *  @extends {Tone.Envelope}
		 *  @constructor
		 *  @param {Tone.Time|Object} [attack=0.01]	the attack time in seconds
		 *  @param {Tone.Time} [decay=0.1]	the decay time in seconds
		 *  @param {number} [sustain=0.5] 	a percentage (0-1) of the full amplitude
		 *  @param {Tone.Time} [release=1]	the release time in seconds
		 */
		Tone.ScaledEnvelope = function(){

			//get all of the defaults
			var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);
			Tone.Envelope.call(this, options);
			options = this.defaultArg(options, Tone.ScaledEnvelope.defaults);

			/**
			 *  scale the signal to the desired range
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._scale = this.output = new Tone.Scale(options.min, options.max);

			this._sig.connect(this._scale);
		};

		Tone.extend(Tone.ScaledEnvelope, Tone.Envelope);

		/**
		 *  the default parameters
		 *  @static
		 */
		Tone.ScaledEnvelope.defaults = {
			"min" : 0,
			"max" : 1,
		};

		/**
		 *  set all of the parameters in bulk
		 *  @param {Object} param the name of member as the key
		 *                        and the value as the value 
		 */
		Tone.ScaledEnvelope.prototype.set = function(params){
			if (!this.isUndef(params.min)) this.setMin(params.min);
			if (!this.isUndef(params.max)) this.setMax(params.max);
			Tone.Envelope.prototype.set.call(this, params);
		};

		/**
		 *  set the envelope max
		 *  @param {number} max
		 */
		Tone.ScaledEnvelope.prototype.setMax = function(max){
			this._scale.setMax(max);
		};

		/**
		 *  set the envelope min
		 *  @param {number} min
		 */
		Tone.ScaledEnvelope.prototype.setMin = function(min){
			this._scale.setMin(min);
		};

		/**
		 *  clean up
		 */
		Tone.ScaledEnvelope.prototype.dispose = function(){
			Tone.Envelope.prototype.dispose.call(this);
			this._scale.dispose();
			this._scale = null;
		};

		return Tone.ScaledEnvelope;
	});
	toneModule( function(Tone){

		
		/**
		 *  @class  Buffer loading and storage. Tone.Buffer will load and store the buffers
		 *          in the same data structure they were given in the argument. If given
		 *          a string, this.buffer will equal an AudioBuffer. If constructed
		 *          with an array, the samples will be placed in an array in the same
		 *          order. 
		 *  
		 *  @constructor 
		 *  @param {Object|Array|string} url the urls to be loaded
		 */
		
		Tone.Buffer = function(){

			var options = this.optionsObject(arguments, ["url", "callback"], Tone.Buffer.defaults);

			/**
			*  stores the loaded AudioBuffers in the same format they were
			*  given in the constructor
			*  @type {Object|Array|AudioBuffer}
			*/
			this.buffers = null;

			var self = this;
			if(typeof options.url !== "object") {
				this._loadBuffer(options.url, options.callback); //it's a string
			} else { //otherwise it's an array of object map
				this._loadBuffers(options.url, function(buffer){
					self.buffer = buffer;
					options.callback(buffer);
				});
			}

		};

		Tone.extend(Tone.Buffer);

		/**
		 *  the default parameters
		 *
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.Buffer.defaults = {
			"url" : "",
			"callback" : function(){}
		};

		/**
		 *  makes an xhr reqest for the selected url
		 *  Load the audio file as an audio buffer.
		 *  Decodes the audio asynchronously and invokes
		 *  the callback once the audio buffer loads.
		 *  @private
		 *  @param {string} url the url of the buffer to load.
		 *                      filetype support depends on the
		 *                      browser.
		 *  @param {function} callback function
		 */
		Tone.Buffer.prototype._loadBuffer = function(url, callback){
		
			var request = new XMLHttpRequest();
			request.open("GET", url, true);
			request.responseType = "arraybuffer";
			// decode asynchronously
			var self = this;
			request.onload = function() {
				self.context.decodeAudioData(request.response, function(buff) {
					if(!buff){
						console.log("error in buffer data");
						return;
					}
					callback(buff);
				});
			};
			request.onerror = function() {
				console.log("error loading buffer");
			};
			//send the request
			request.send();
		};

		/**
		 * Loads multiple buffers given a collection of urls
		 * @private
		 * @param  {Object|Array}   urls     keyVal object of urls or Array
		 * @param  {Function} callback
		 */
		Tone.Buffer.prototype._loadBuffers = function(urls, callback){
			var loadCounter = {
				total : 0,
				loaded : 0
			};
			var incrementCount = function(i, buffers){
				var key = i;
				return function(loadedBuffer){
					buffers[key] = loadedBuffer;
					loadCounter.loaded++;
					if (loadCounter.total === loadCounter.loaded){
						callback(buffers);
					}
				};
			};
			if (Array.isArray(urls)){
				var len = urls.length;
				loadCounter.total = len;
				this.buffer = new Array(len);
				for (var i = 0; i < len; i++){
					this._loadBuffer(urls[i], incrementCount(i, this.buffer));
				}
			} else {
				loadCounter.total = Object.keys(urls).length;
				this.buffer = {};
				for (var key in urls){
					this._loadBuffer(urls[key], incrementCount(key, this.buffer));
				}
			}
		};

		/**
		 *  dispose and disconnect
		 */
		Tone.Buffer.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this.buffer = null;
		};

		return Tone.Buffer;
	});
	toneModule( function(Tone){

		

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
		 *  defined in "Tone/core/Bus"
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
			this.output.chain(sendKnob, Buses[channelName]);
			return sendKnob;		
		};

		/**
		 *  recieve the input from the desired channelName to the input
		 *  defined in "Tone/core/Bus"
		 *
		 *  @param  {string} channelName 
		 *  @param {AudioNode} [input=this.input] if no input is selected, the
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

		return Tone;
	});
	toneModule( function(Tone){

		

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
		 *  The only requirement for the score format is that the time is the first (or only)
		 *  value in the array. All other values are optional and will be passed into the callback
		 *  function registered using ""
		 *
		 *  ```javascript
		 *  var score = { 
		 *  	"synth"  : [["0", "C3"], ["0:1", "D3"], ["0:2", "E3"], ... ],
		 *  	"bass"  : [["0", "C2"], ["1:0", "A2"], ["2:0", "C2"], ["3:0", "A2"], ... ],
		 *  	"kick"  : ["0", "0:2", "1:0", "1:2", "2:0", ... ],
		 *  	//...
		 *  };
		 *  ```
		 *  
		 *  To convert MIDI files to score notation, take a look at utils/MidiToScore.js
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
		 *  defined in "Tone/core/Note"
		 *  
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
		 *  defined in "Tone/core/Note"
		 *  
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
		 *  defined in "Tone/core/Note"
		 *
		 *  ```javascript
		 *  tone.intervalToFrequencyRatio(0); // returns 1
		 *  tone.intervalToFrequencyRatio(12); // returns 2
		 *  ```
		 *  
		 *  @param  {number} interval the number of semitones above the base note
		 *  @return {number}          the frequency ratio
		 */
		Tone.prototype.intervalToFrequencyRatio = function(interval){
			return Math.pow(2,(interval/12));
		};

		/**
		 *  convert a midi note number into a note name
		 *  defined in "Tone/core/Note"
		 *
		 *  ```javascript
		 *  tone.midiToNote(60); // returns "C3"
		 *  ```
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
		 *  defined in "Tone/core/Note"
		 *
		 *  ```javascript
		 *  tone.noteToMidi("C3"); // returns 60
		 *  ```
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
	toneModule( function(Tone){

		
		
		/**
		 * 	@class  Effect is the base class for effects. connect the effect between
		 * 	        the effectSend and effectReturn GainNodes. then control the amount of
		 * 	        effect which goes to the output using the dry/wet control.
		 *
		 *  @constructor
		 *  @extends {Tone}
		 *  @param {number} [initalDry=0] the starting dry value
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
		 *  @internal
		 */
		Tone.Effect.prototype.connectEffect = function(effect){
			this.effectSend.chain(effect, this.effectReturn);
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
			this.dryWet = null;
			this.effectSend.disconnect();
			this.effectSend = null;
			this.effectReturn.disconnect();
			this.effectReturn = null;
		};

		return Tone.Effect;
	});
	toneModule( function(Tone){

		

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
		 * @param {Tone.Time} [time=now] the panner begins.
		 */
		Tone.AutoPanner.prototype.start = function(time){
			this._lfo.start(time);
		};

		/**
		 * Stop the panner
		 * 
		 * @param {Tone.Time} [time=now] the panner stops.
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

	toneModule( 
	function(Tone){

		

		/**
		 *  @class  AutoWah connects an envelope follower to a bandpass filter.
		 *          Some inspiration from Tuna.js https://github.com/Dinahmoe/tuna
		 *
		 *  @constructor
		 *  @extends {Tone.Effect}
		 *  @param {number} [baseFrequency=100] the frequency the filter is set 
		 *                                       to at the low point of the wah
		 *  @param {number} [octaves=5] the number of octaves above the baseFrequency
		 *                               the filter will sweep to when fully open
		 *  @param {number} [sensitivity=0] the decibel threshold sensitivity for 
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
			this._sweepRange = new Tone.ScaleExp(0, 1, 0.5);

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
			this.effectSend.chain(this._follower, this._sweepRange);
			this._sweepRange.connect(this._bandpass.frequency);
			this._sweepRange.connect(this._peaking.frequency);
			//the filtered path
			this.effectSend.chain(this._bandpass, this._peaking, this.effectReturn);
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
			this._sweepRange.setMax(this.dbToGain(sensitivy));
		};

		/**
		 *  sets the sweep range of the scaler
		 *  @private
		 */
		Tone.AutoWah.prototype._setSweepRange = function(){
			this._sweepRange.setMin(this._baseFrequency);
			this._sweepRange.setMax(Math.min(this._baseFrequency * Math.pow(2, this._octaves), this.context.sampleRate / 2));
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
			if (!this.isUndef(params.rolloff)) this._bandpass.setRolloff(params.rolloff);
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
	toneModule( 
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

			var invStepSize = 1 / Math.pow(2, options.bits - 1);
			/**
			 *  floor function
			 *  @type {Tone.Expr}
			 *  @private
			 */
			this._floor = new Tone.Expr("$0 - mod($0, %, %)", invStepSize, options.bits);

			//connect it up
			this.connectEffect(this._floor);
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
		 *  clean up
		 */
		Tone.BitCrusher.prototype.dispose = function(){
			Tone.Effect.prototype.dispose.call(this);
			this._floor.dispose();
			this._floor = null;
		}; 

		return Tone.BitCrusher;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class A Chebyshev waveshaper. Good for making different types of distortion sounds.
		 *         Note that odd orders sound very different from even ones. order = 1 is no change. 
		 *         http://music.columbia.edu/cmc/musicandcomputers/chapter4/04_06.php
		 *
		 *  @extends {Tone.Effect}
		 *  @constructor
		 *  @param {number} order the order of the chebyshev polynomial
		 */
		Tone.Chebyshev = function(){

			var options = this.optionsObject(arguments, ["order"], Tone.Chebyshev.defaults);
			Tone.Effect.call(this);

			/**
			 *  @type {WaveShaperNode}
			 *  @private
			 */
			this._shaper = new Tone.WaveShaper(4096);

			this.connectEffect(this._shaper);
			this.setOrder(options.order);
			this.setOversample(options.oversample);
		};

		Tone.extend(Tone.Chebyshev, Tone.Effect);

		/**
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.Chebyshev.defaults = {
			"order" : 1,
			"oversample" : "none"
		};

		/**
		 *  set the order of the Chebyshev polynomial i.e.
		 *  order = 2 -> 2x^2 + 1
		 *  order = 3 -> 4x^3 + 3x
		 *  @param   {number} order the order of the Chebyshev nominal range of 1 - 100
		 */
		Tone.Chebyshev.prototype.setOrder = function(order) {
			var curve = new Array(4096);
			var len = curve.length;
			for (var i = 0; i < len; ++i) {
				var x = i * 2 / len - 1;
				if (x === 0){
					//should output 0 when input is 0
					curve[i] = 0;
				} else {
					curve[i] = this._getCoefficient(x, order, {});
				}
			}
			this._shaper.setCurve(curve);
		};

		/**
		 *  get the coefficient for that degree
		 *  @param {number} x the x value
		 *  @param   {number} degree 
		 *  @param {Object} memo memoize the computed value. 
		 *                       this speeds up computation greatly. 
		 *  @return  {number}       the coefficient 
		 *  @private
		 */
		Tone.Chebyshev.prototype._getCoefficient = function(x, degree, memo){
			if (memo.hasOwnProperty(degree)){
				return memo[degree];
			} else if (degree === 0){
				memo[degree] = 0;
			} else if (degree === 1){
				memo[degree] = x;
			} else {
				memo[degree] = 2 * x * this._getCoefficient(x, degree - 1, memo) - this._getCoefficient(x, degree - 2, memo);
			}
			return memo[degree];
		};

		/**
		 *  set the oversampling
		 *  @param {string} oversampling can either be "none", "2x" or "4x"
		 */
		Tone.Chebyshev.prototype.setOversample = function(oversampling) {
			this._shaper.setOversample(oversampling);
		};

		/**
		 *  clean up
		 */
		Tone.Chebyshev.prototype.dispose = function(){
			Tone.Effect.prototype.dispose.call(this);
			this._shaper.dispose();
			this._shaper = null;
		};

		return Tone.Chebyshev;
	});
	toneModule( 
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
			this.input.connect(this._split);
			//dry wet connections
			this.input.connect(this.dryWet.dry);
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
			this.dryWet = null;
			this._split.dispose();
			this._split = null;
			this._merge.dispose();
			this._merge = null;
			this.effectSendL = null;
			this.effectSendR = null;
			this.effectReturnL = null;
			this.effectReturnR = null;
		};

		return Tone.StereoEffect;
	});
	toneModule( function(Tone){

		
		
		/**
		 * 	@class  Feedback Effect (a sound loop between an audio source and its own output)
		 *
		 *  @constructor
		 *  @extends {Tone.Effect}
		 *  @param {number|Object} [initialFeedback=0.125] the initial feedback value
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
			 *  the gain which controls the feedback
			 *  @type {GainNode}
			 *  @private
			 */
			this._feedbackGain = this.context.createGain();

			//the feedback loop
			this.effectReturn.chain(this._feedbackGain, this.effectSend);
			this.feedback.connect(this._feedbackGain.gain);
		};

		Tone.extend(Tone.FeedbackEffect, Tone.Effect);

		/**
		 *  @static
		 *  @type {Object}
		 */
		Tone.FeedbackEffect.defaults = {
			"feedback" : 0.125
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
			this.feedback = null;
			this._feedbackGain.disconnect();
			this._feedbackGain = null;
		};

		return Tone.FeedbackEffect;
	});

	toneModule( 
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
			this.effectReturnL.chain(this._feedbackLR, this.effectSendR);
			this.effectReturnR.chain(this._feedbackRL, this.effectSendL);
			this.feedback.fan(this._feedbackLR.gain, this._feedbackRL.gain);
		};

		Tone.extend(Tone.StereoXFeedbackEffect, Tone.FeedbackEffect);

		/**
		 *  clean up
		 */
		Tone.StereoXFeedbackEffect.prototype.dispose = function(){
			Tone.StereoEffect.prototype.dispose.call(this);
			this.feedback.dispose();
			this.feedback = null;
			this._feedbackLR.disconnect();
			this._feedbackLR = null;
			this._feedbackRL.disconnect();
			this._feedbackRL = null;
		};

		return Tone.StereoXFeedbackEffect;
	});
	toneModule( 
	function(Tone){

		

		/**
		 *  @class A Chorus effect with feedback. inspiration from https://github.com/Dinahmoe/tuna/blob/master/tuna.js
		 *
		 *	@constructor
		 *	@extends {Tone.StereoXFeedbackEffect}
		 *	@param {number|Object} [rate=2] the rate of the effect
		 *	@param {number} [delayTime=3.5] the delay of the chorus effect in ms
		 *	@param {number} [depth=0.7] the depth of the chorus
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
			this.connectSeries(this.effectSendL, this._delayNodeL, this.effectReturnL);
			this.connectSeries(this.effectSendR, this._delayNodeR, this.effectReturnR);
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
			"feedback" : 0.1,
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
	toneModule( function(Tone){

		

		/**
		 *  @class  Convolver wrapper for reverb and emulation.
		 *          NB: currently, this class only supports 1 buffer member.
		 *          Future iterations will include a this.buffers collection for multi buffer mode.
		 *  
		 *  @constructor
		 *  @extends {Tone.Effect}
		 *  @param {string|Object=} url
		 *  @param {function=} callback function
		 */
		Tone.Convolver = function(){

			//get all of the defaults
			var options = this.optionsObject(arguments, ["url", "onload"], Tone.Convolver.defaults);
			//connections
			Tone.Effect.call(this, options);

		  	/**
			 *  convolver node
			 *  @type {ConvolverNode}
			 *  @private
			 */
			this._convolver = this.context.createConvolver();

			/**
			 *  the convolution buffer
			 *  
			 *  @type {AudioBuffer}
			 *  @private
			 */
			this._buffer = null;

			this.connectEffect(this._convolver);
			//if there is a url, load it. 
			if (!this.isUndef(options.url)){
				this.load(options.url, options.onload);
			}
		};

		Tone.extend(Tone.Convolver, Tone.Effect);

		/**
		 *  @static
		 *  @type {Object}
		 */
		Tone.Convolver.defaults = {
			"onload": function(){},
		};

		/**
		 *  Load the impulse response url as an audio buffer.
		 *  Decodes the audio asynchronously and invokes
		 *  the callback once the audio buffer loads.
		 *  @param {string} url the url of the buffer to load.
		 *                      filetype support depends on the
		 *                      browser.
		 *  @param  {function(Tone.Convolver)=} callback
		 */
		Tone.Convolver.prototype.load = function(url, callback){
			if (!this._buffer){
				var self = this;
				new Tone.Buffer(url, function (buffer){
					self.setBuffer(buffer);
					if (callback){
						callback(self);
					}
				});
			} else if (callback){
				callback(this);
			}
		};

		/**
		 *  set the buffer
		 *
		 *  @param {AudioBuffer} buffer the impulse response
		 */
		Tone.Convolver.prototype.setBuffer = function(buffer){
			this._buffer = buffer;
			this._convolver.buffer = this._buffer;
		};

		/**
		 *  set multiple parameters at once with an object
		 *  @param {Object} params the parameters as an object
		 */
		Tone.Convolver.prototype.set = function(params){
			if (!this.isUndef(params.buffer)) this.setBuffer(params.buffer);
			Tone.Effect.prototype.set.call(this, params);
		};

		/**
		 *  dispose and disconnect
		 */
		Tone.Convolver.prototype.dispose = function(){
			Tone.Effect.prototype.dispose.call(this);
			this._convolver.disconnect();
			this._convolver = null;
			this._buffer = null;
		}; 

		return Tone.Convolver;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class A simple distortion effect using the waveshaper node
		 *         algorithm from http://stackoverflow.com/a/22313408
		 *
		 *  @extends {Tone.Effect}
		 *  @constructor
		 *  @param {number} distortion the amount of distortion (nominal range of 0-1)
		 */
		Tone.Distortion = function(){

			var options = this.optionsObject(arguments, ["distortion"], Tone.Distortion.defaults);

			Tone.Effect.call(this);

			/**
			 *  @type {Tone.WaveShaper}
			 *  @private
			 */
			this._shaper = new Tone.WaveShaper(4096);

			this.connectEffect(this._shaper);
			this.setDistortion(options.distortion);
			this.setOversample(options.oversample);
		};

		Tone.extend(Tone.Distortion, Tone.Effect);

		/**
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.Distortion.defaults = {
			"distortion" : 0.4,
			"oversample" : "none"
		};

		/**
		 *  set the amount of distortion
		 *  @param   {number} amount amount of distortion, nominal range of 0-1. 
		 */
		Tone.Distortion.prototype.setDistortion = function(amount) {
			var k = amount * 100;
			var deg = Math.PI / 180;
			this._shaper.setMap(function(x){
				if (Math.abs(x) < 0.001){
					//should output 0 when input is 0
					return 0;
				} else {
					return ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
				}
			});
		};

		/**
		 *  set the oversampling
		 *  @param {string} oversampling can either be "none", "2x" or "4x"
		 */
		Tone.Distortion.prototype.setOversample = function(oversampling) {
			this._shaper.oversample = oversampling;
		};

		/**
		 *  clean up
		 */
		Tone.Distortion.prototype.dispose = function(){
			Tone.Effect.prototype.dispose.call(this);
			this._shaper.dispose();
			this._shaper = null;
		};

		return Tone.Distortion;
	});
	toneModule( function(Tone){

		
		
		/**
		 *  @class  A feedback delay
		 *
		 *  @constructor
		 *  @extends {Tone.FeedbackEffect}
		 *  @param {Tone.Time|Object} [delayTime=0.25]
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
	toneModule( 
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
			this._dampeningScale = new Tone.ScaleExp(100, 8000, 0.5);

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
					this.effectSendL.chain(lfpf, this._allpassFiltersL[0]);
				} else {
					this.effectSendR.chain(lfpf, this._allpassFiltersR[0]);
				}
				this.roomSize.connect(lfpf.resonance);
				this._dampeningScale.connect(lfpf.dampening);
				this._combFilters.push(lfpf);
			}

			//chain the allpass filters togetehr
			this.connectSeries.apply(this, this._allpassFiltersL);
			this.connectSeries.apply(this, this._allpassFiltersR);
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
	toneModule( 
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
		 *  @param {number} roomSize coorelates to the decay time
		 */
		Tone.JCReverb = function(){

			var options = this.optionsObject(arguments, ["roomSize"], Tone.JCReverb.defaults);
			Tone.StereoEffect.call(this, options);

			/**
			 *  room size control values between [0,1]
			 *  @type {Tone.Signal}
			 */
			this.roomSize = new Tone.Signal(options.roomSize);

			/**
			 *  scale the room size
			 *  @type {Tone.Scale}
			 *  @private
			 */
			this._scaleRoomSize = new Tone.Scale(-0.733, 0.197);

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
				var fbcf = new Tone.FeedbackCombFilter(combFilterDelayTimes[cf], 0.1);
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
			this.connectSeries.apply(this, this._allpassFilters);
			this.effectSendL.connect(this._allpassFilters[0]);
			this.effectSendR.connect(this._allpassFilters[0]);
		};

		Tone.extend(Tone.JCReverb, Tone.StereoEffect);

		/**
		 *  the default values
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.JCReverb.defaults = {
			"roomSize" : 0.5
		};

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
			this.roomSize = null;
			this._scaleRoomSize.dispose();
			this._scaleRoomSize = null;
		};

		return Tone.JCReverb;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class Applies a Mid/Side seperation and recombination
		 *         http://musicdsp.org/showArchiveComment.php?ArchiveID=173
		 *         http://www.kvraudio.com/forum/viewtopic.php?t=212587
		 *         M = (L+R)/sqrt(2);   // obtain mid-signal from left and right
		 *         S = (L-R)/sqrt(2);   // obtain side-signal from left and righ
		 *         // amplify mid and side signal seperately:
		 *         M/S send/return
		 *         L = (M+S)/sqrt(2);   // obtain left signal from mid and side
		 *         R = (M-S)/sqrt(2);   // obtain right signal from mid and side
		 *
		 *  @extends {Tone.StereoEffect}
		 *  @constructor
		 */
		Tone.MidSideEffect = function(){
			Tone.StereoEffect.call(this);

			/**
			 *  a constant signal equal to 1 / sqrt(2)
			 *  @type {Tone.Signal}
			 *  @private
			 */
			this._sqrtTwo = new Tone.Signal(1 / Math.sqrt(2));

			/**
			 *  the mid send.
			 *  connect to mid processing
			 *  @type {Tone.Expr}
			 */
			this.midSend = new Tone.Expr("($0 + $1) * $2");

			/**
			 *  the side send.
			 *  connect to side processing
			 *  @type {Tone.Expr}
			 */
			this.sideSend = new Tone.Expr("($0 - $1) * $2");

			/**
			 *  recombine the mid/side into Left
			 *  @type {Tone.Expr}
			 *  @private
			 */
			this._left = new Tone.Expr("($0 + $1) * $2");

			/**
			 *  recombine the mid/side into Right
			 *  @type {Tone.Expr}
			 *  @private
			 */
			this._right = new Tone.Expr("($0 - $1) * $2");

			/**
			 *  the mid return connection
			 *  @type {GainNode}
			 */
			this.midReturn = this.context.createGain();

			/**
			 *  the side return connection
			 *  @type {GainNode}
			 */
			this.sideReturn = this.context.createGain();

			//connections
			this.effectSendL.connect(this.midSend, 0, 0);
			this.effectSendR.connect(this.midSend, 0, 1);
			this.effectSendL.connect(this.sideSend, 0, 0);
			this.effectSendR.connect(this.sideSend, 0, 1);
			this._left.connect(this.effectReturnL);
			this._right.connect(this.effectReturnR);
			this.midReturn.connect(this._left, 0, 0);
			this.sideReturn.connect(this._left, 0, 1);
			this.midReturn.connect(this._right, 0, 0);
			this.sideReturn.connect(this._right, 0, 1);
			this._sqrtTwo.connect(this.midSend, 0, 2);
			this._sqrtTwo.connect(this.sideSend, 0, 2);
			this._sqrtTwo.connect(this._left, 0, 2);
			this._sqrtTwo.connect(this._right, 0, 2);
		};

		Tone.extend(Tone.MidSideEffect, Tone.StereoEffect);

		/**
		 *  clean up
		 */
		Tone.MidSideEffect.prototype.dispose = function(){
			Tone.StereoEffect.prototype.dispose.call(this);
			this._sqrtTwo.dispose();
			this._sqrtTwo = null;
			this.midSend.dispose();
			this.midSend = null;
			this.sideSend.dispose();
			this.sideSend = null;
			this._left.dispose();
			this._left = null;
			this._right.dispose();
			this._right = null;
			this.midReturn.disconnect();
			this.midReturn = null;
			this.sideReturn.disconnect();
			this.sideReturn = null;
		};

		return Tone.MidSideEffect;
	});
	toneModule( 
	function(Tone){

		

		/**
		 *  @class A Phaser effect. inspiration from https://github.com/Dinahmoe/tuna/
		 *
		 *	@extends {Tone.StereoEffect}
		 *	@constructor
		 *	@param {number|Object} [rate=0.5] the speed of the phasing
		 *	@param {number} [depth=10] the depth of the effect
		 *	@param {number} [baseFrequency=400] the base frequency of the filters
		 */
		Tone.Phaser = function(){

			//set the defaults
			var options = this.optionsObject(arguments, ["rate", "depth", "baseFrequency"], Tone.Phaser.defaults);
			Tone.StereoEffect.call(this, options);

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

		Tone.extend(Tone.Phaser, Tone.StereoEffect);

		/**
		 *  defaults
		 *  @static
		 *  @type {object}
		 */
		Tone.Phaser.defaults = {
			"rate" : 0.5,
			"depth" : 10,
			"stages" : 4,
			"Q" : 100,
			"baseFrequency" : 400,
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
			this.connectSeries.apply(this, filters);
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
			Tone.StereoEffect.prototype.set.call(this, params);
		};

		/**
		 *  clean up
		 */
		Tone.Phaser.prototype.dispose = function(){
			Tone.StereoEffect.prototype.dispose.call(this);
			this._lfoL.dispose();
			this._lfoL = null;
			this._lfoR.dispose();
			this._lfoR = null;
			for (var i = 0; i < this._filtersL.length; i++){
				this._filtersL[i].disconnect();
				this._filtersL[i] = null;
			}
			this._filtersL = null;
			for (var j = 0; j < this._filtersR.length; j++){
				this._filtersR[j].disconnect();
				this._filtersR[j] = null;
			}
			this._filtersR = null;
		};

		return Tone.Phaser;
	});
	toneModule( 
	function(Tone){

		

		/**
		 *  @class  PingPongDelay is a dual delay effect where the echo is heard
		 *          first in one channel and next in the opposite channel
		 *
		 * 	@constructor
		 * 	@extends {Tone.StereoXFeedbackEffect}
		 *  @param {Tone.Time|Object} [delayTime=0.25] is the interval between consecutive echos
		 */
		Tone.PingPongDelay = function(){
			
			var options = this.optionsObject(arguments, ["delayTime"], Tone.PingPongDelay.defaults);
			Tone.StereoXFeedbackEffect.call(this, options);

			/**
			 *  the delay node on the left side
			 *  @type {DelayNode}
			 *  @private
			 */
			this._leftDelay = this.context.createDelay(options.maxDelayTime);

			/**
			 *  the delay node on the right side
			 *  @type {DelayNode}
			 *  @private
			 */
			this._rightDelay = this.context.createDelay(options.maxDelayTime);

			/**
			 *  the predelay on the left side
			 *  @private
			 *  @type {DelayNode}
			 */
			this._leftPreDelay = this.context.createDelay(options.maxDelayTime);

			/**
			 *  the delay time signal
			 *  @type {Tone.Signal}
			 */
			this.delayTime = new Tone.Signal(0);

			//connect it up
			this.effectSendL.chain(this._leftPreDelay, this._leftDelay, this.effectReturnL);
			this.effectSendR.chain(this._rightDelay, this.effectReturnR);
			this.delayTime.fan(this._leftDelay.delayTime, this._rightDelay.delayTime, this._leftPreDelay.delayTime);
			//rearranged the feedback to be after the leftPreDelay
			this._feedbackRL.disconnect();
			this._feedbackRL.connect(this._leftDelay);

			this.setDelayTime(options.delayTime);
		};

		Tone.extend(Tone.PingPongDelay, Tone.StereoXFeedbackEffect);

		/**
		 *  @static
		 *  @type {Object}
		 */
		Tone.PingPongDelay.defaults = {
			"delayTime" : 0.25,
			"maxDelayTime" : 1
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
			this._leftPreDelay.disconnect();
			this.delayTime.dispose();
			this._leftDelay = null;
			this._rightDelay = null;
			this._leftPreDelay = null;
			this.delayTime = null;
		};

		return Tone.PingPongDelay;
	});
	toneModule( 
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
			this.effectReturnL.chain(this._feedbackL, this.effectSendL);
			this.effectReturnR.chain(this._feedbackR, this.effectSendR);
			this.feedback.fan(this._feedbackL.gain, this._feedbackR.gain);
		};

		Tone.extend(Tone.StereoFeedbackEffect, Tone.FeedbackEffect);

		/**
		 *  clean up
		 */
		Tone.StereoFeedbackEffect.prototype.dispose = function(){
			Tone.StereoEffect.prototype.dispose.call(this);
			this.feedback.dispose();
			this.feedback = null;
			this._feedbackL.disconnect();
			this._feedbackL = null;
			this._feedbackR.disconnect();
			this._feedbackR = null;
		};

		return Tone.StereoFeedbackEffect;
	});
	toneModule( 
		function(Tone){

		

		/**
		 *  @class Applies a width factor (0-1) to the mid/side seperation. 
		 *         0 is all mid and 1 is all side. 
		 *         http://musicdsp.org/showArchiveComment.php?ArchiveID=173
		 *         http://www.kvraudio.com/forum/viewtopic.php?t=212587
		 *         M *= 2*(1-width);
		 *         S *= 2*width
		 *
		 *  @extends {Tone.MidSideEffect}
		 *  @constructor
		 *  @param {number|Object} [width=0.5] the stereo width. A width of 0 is mono and 1 is stereo. 0.5 is no change.
		 */
		Tone.StereoWidener = function(){

			var options = this.optionsObject(arguments, ["width"], Tone.StereoWidener.defaults);
			Tone.MidSideEffect.call(this, options);

			/**
			 *  the width control
			 *  @type {Tone.Signal}
			 */
			this.width = new Tone.Signal(0.5);

			/**
			 *  Mid multiplier
			 *  @type {Tone.Expr}
			 *  @private
			 */
			this._midMult = new Tone.Expr("$0 * ($1 * (1 - $2))");

			/**
			 *  Side multiplier
			 *  @type {Tone.Expr}
			 *  @private
			 */
			this._sideMult = new Tone.Expr("$0 * ($1 * $2)");

			/**
			 *  constant output of 2
			 *  @type {Tone}
			 *  @private
			 */
			this._two = new Tone.Signal(2);

			//the mid chain
			this._two.connect(this._midMult, 0, 1);
			this.width.connect(this._midMult, 0, 2);
			//the side chain
			this._two.connect(this._sideMult, 0, 1);
			this.width.connect(this._sideMult, 0, 2);
			//connect it to the effect send/return
			this.midSend.chain(this._midMult, this.midReturn);
			this.sideSend.chain(this._sideMult, this.sideReturn);
		};

		Tone.extend(Tone.StereoWidener, Tone.MidSideEffect);

		/**
		 *  the default values
		 *  @static
		 *  @type {Object}
		 */
		Tone.StereoWidener.defaults = {
			"width" : 0.5
		};

		/**
		 *  set the stereo width. 0 = 100% mid. 1 = 100% side. 
		 *  @param {number} width
		 */
		Tone.StereoWidener.prototype.setWidth = function(width){
			this.width.setValue(width);
		};

		/**
		 *  set the parameters with JSON
		 *  @param {Object} params 
		 */
		Tone.StereoWidener.prototype.set = function(params){
			if (!this.isUndef(params.width)) this.setWidth(params.width);
			Tone.MidSideEffect.prototype.set.call(this, params);
		};

		/**
		 *  clean up
		 */
		Tone.StereoWidener.prototype.dispose = function(){
			Tone.MidSideEffect.prototype.dispose.call(this);
			this.width.dispose();
			this.width = null;
			this._midMult.dispose();
			this._midMult = null;
			this._sideMult.dispose();
			this._sideMult = null;
			this._two.dispose();
			this._two = null;
		};

		return Tone.StereoWidener;
	});
	toneModule(
	function(Tone){

		

		/**
		 *  @class Pulse Oscillator with control over width
		 *
		 *  @constructor
		 *  @extends {Tone.Oscillator}
		 *  @param {number} [frequency=440] the frequency of the oscillator
		 *  @param {number} [width = 0.5] the width of the pulse
		 */
		Tone.PulseOscillator = function(){

			Tone.Source.call(this);
			var options = this.optionsObject(arguments, ["frequency", "width"], Tone.Oscillator.defaults);

			/**
			 *  the width of the pulse
			 *  @type {Tone.Signal}
			 */
			this.width = new Tone.Signal(options.width);

			/**
			 *  the sawtooth oscillator
			 *  @type {Tone.Oscillator}
			 *  @private
			 */
			this._sawtooth = new Tone.Oscillator({
				frequency : options.frequency,
				detune : options.detune,
				type : "sawtooth",
				phase : options.phase
			});

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
			 *  callback which is invoked when the oscillator is stoped
			 *  @type {function()}
			 */
			this.onended = options.onended;

			/**
			 *  threshold the signal to turn it into a square
			 *  
			 *  @type {Tone.WaveShaper}
			 *  @private
			 */
			this._thresh = new Tone.WaveShaper(function(val){
				if (val < 0){
					return -1;
				} else {
					return 1;
				}
			});

			//connections
			this._sawtooth.chain(this._thresh, this.output);
			this.width.connect(this._thresh);
			this._sawtooth.onended = this._onended.bind(this);
		};

		Tone.extend(Tone.PulseOscillator, Tone.Oscillator);

		/**
		 *  the default parameters
		 *
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.PulseOscillator.defaults = {
			"frequency" : 440,
			"detune" : 0,
			"phase" : 0,
			"width" : 0.2,
			"onended" : function(){},
		};

		/**
		 *  set the width of the oscillators
		 *  @param {number} width
		 */
		Tone.PulseOscillator.prototype.setWidth = function(width){
			this.width.setValue(width);
		};

		/**
		 *  set the phase of the oscillator
		 *  @param {number} phase
		 */
		Tone.PulseOscillator.prototype.setPhase = function(phase){
			this._sawtooth.setPhase(phase);
		};

		/**
		 *  bulk setter
		 *  @param {Object} params 
		 */
		Tone.PulseOscillator.prototype.set = function(params){
			if (!this.isUndef(params.width)) this.setWidth(params.width);
			this._sawtooth.set({
				"phase" : params.phase,
				"frequency" : params.frequency,
				"detune" : params.detune,
				"onended" : params.onended
			});
			Tone.Source.prototype.set.call(this, params);		
		};

		/**
		 *  start the oscillator
		 *  
		 *  @param  {Tone.Time} time 
		 */
		Tone.PulseOscillator.prototype.start = function(time){
			if (this.state === Tone.Source.State.STOPPED){
				this.state = Tone.Source.State.STARTED;
				time = this.toSeconds(time);
				this._sawtooth.start(time);
				this.width.output.gain.setValueAtTime(1, time);
			}
		};

		/**
		 *  stop the oscillator
		 *  
		 *  @param  {Tone.Time} time 
		 */
		Tone.PulseOscillator.prototype.stop = function(time){
			if (this.state === Tone.Source.State.STARTED){
				this.state = Tone.Source.State.STOPPED;
				time = this.toSeconds(time);
				this._sawtooth.stop(time);
				//the width is still connected to the output. 
				//that needs to be stopped also
				this.width.output.gain.setValueAtTime(0, time);
			}
		};

		/**
		 *  internal onended callback
		 *  @private
		 */
		Tone.PulseOscillator.prototype._onended = function(){
			this.onended();
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
	toneModule( 
	function(Tone){

		

		/**
		 *  @class takes an array of Oscillator descriptions and mixes them together
		 *         with the same detune and frequency controls. 
		 *
		 *  @extends {Tone.Oscillator}
		 *  @constructor
		 *  @param {frequency} frequency frequency of the oscillator (meaningless for noise types)
		 *  @param {string} type the type of the oscillator
		 */
		Tone.PWMOscillator = function(){
			var options = this.optionsObject(arguments, ["frequency", "modulationFrequency"], Tone.PWMOscillator.defaults);
			Tone.Source.call(this);

			/**
			 *  the pulse oscillator
			 */
			this._pulse = new Tone.PulseOscillator(options.modulationFrequency);
			//change the pulse oscillator type
			this._pulse._sawtooth.setType("sine");

			/**
			 *  the modulator
			 */
			this._modulator = new Tone.Oscillator({
				"frequency" : options.frequency,
				"detune" : options.detune
			});

			/**
			 *  the frequency control
			 *  @type {Tone.Signal}
			 */
			this.frequency = this._modulator.frequency;

			/**
			 *  the detune control
			 *  @type {Tone.Signal}
			 */
			this.detune = this._modulator.detune;

			/**
			 *  callback which is invoked when the oscillator is stoped
			 *  @type {function()}
			 */
			this.onended = options.onended;

			/**
			 *  the modulation rate of the oscillator
			 *  @type {Tone.Signal}
			 */
			this.modulationFrequency = this._pulse.frequency;	

			//connections
			this._modulator.connect(this._pulse.width);
			this._pulse.connect(this.output);
			this._pulse.onended = this._onended.bind(this);
		};

		Tone.extend(Tone.PWMOscillator, Tone.Oscillator);

		/**
		 *  default values
		 *  @static
		 *  @type {Object}
		 *  @const
		 */
		Tone.PWMOscillator.defaults = {
			"frequency" : 440,
			"detune" : 0,
			"modulationFrequency" : 0.4,
			"onended" : function(){}
		};

		/**
		 *  start the oscillator
		 *  
		 *  @param  {Tone.Time} [time=now]
		 */
		Tone.PWMOscillator.prototype.start = function(time){
			if (this.state === Tone.Source.State.STOPPED){
				this.state = Tone.Source.State.STARTED;
				time = this.toSeconds(time);
				this._modulator.start(time);
				this._pulse.start(time);
			}
		};

		/**
		 *  stop the oscillator
		 *  @param  {Tone.Time} time (optional) timing parameter
		 */
		Tone.PWMOscillator.prototype.stop = function(time){
			if (this.state === Tone.Source.State.STARTED){
				this.state = Tone.Source.State.STOPPED;
				time = this.toSeconds(time);
				this._modulator.stop(time);
				this._pulse.stop(time);
			}
		};

		/**
		 *  internal onended callback
		 *  @private
		 */
		Tone.PWMOscillator.prototype._onended = function(){
			this.onended();
		};

		/**
		 *  set the phase of the oscillator (in degrees)
		 *  @param {number} degrees the phase in degrees
		 */
		Tone.PWMOscillator.prototype.setPhase = function(phase) {
			this._modulator.setPhase(phase);
		};

		/**
		 *  set the modulation rate, with an optional ramp time to that 
		 *  
		 *  @param {number}	freq
		 *  @param {Tone.Time=} rampTime when the oscillator will arrive at the frequency
		 */
		Tone.PWMOscillator.prototype.setModulationFrequency = function(val, rampTime){
			this._pulse.setFrequency(val, rampTime);
		};

		/**
		 *  set the parameters at once
		 *  @param {Object} params
		 */
		Tone.PWMOscillator.prototype.set = function(params){
			if (!this.isUndef(params.modulationFrequency)) this.setModulationFrequency(params.modulationFrequency);
			if (!this.isUndef(params.phase)) this.setPhase(params.phase);
			if (!this.isUndef(params.frequency)) this.setFrequency(params.frequency);
			if (!this.isUndef(params.onended)) this._pulse.onended = params.onended;
			if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
			Tone.Source.prototype.set.call(this, params);
		};

		/**
		 *  clean up
		 */
		Tone.PWMOscillator.prototype.dispose = function(){
			Tone.Source.prototype.dispose.call(this);
			this._pulse.dispose();
			this._modulator.dispose();
			this._pulse = null;
			this._modulator = null;
			this.onended = null;
			this.frequency = null;
			this.detune = null;
			this.modulationFrequency = null;
		};

		return Tone.PWMOscillator;
	});
	toneModule( 
	function(Tone){

		

		/**
		 *  @class OmniOscillator aggregates Tone.Oscillator, Tone.PulseOscillator,
		 *         and Tone.PWMOscillator which allows it to have the types: 
		 *         sine, square, triangle, sawtooth, pulse or pwm. 
		 *
		 *  @extends {Tone.Oscillator}
		 *  @constructor
		 *  @param {frequency} frequency frequency of the oscillator (meaningless for noise types)
		 *  @param {string} type the type of the oscillator
		 */
		Tone.OmniOscillator = function(){
			var options = this.optionsObject(arguments, ["frequency", "type"], Tone.OmniOscillator.defaults);
			Tone.Source.call(this);

			/**
			 *  the frequency control
			 *  @type {Tone.Signal}
			 */
			this.frequency = new Tone.Signal(options.frequency);

			/**
			 *  the detune control
			 *  @type {Tone.Signal}
			 */
			this.detune = new Tone.Signal(options.detune);

			/**
			 *  the type of the oscillator source
			 *  @type {string}
			 *  @private
			 */
			this._sourceType = undefined;

			/**
			 *  the oscillator
			 *  @type {Tone.Oscillator|Tone.PWMOscillator|Tone.PulseOscillator}
			 *  @private
			 */
			this._oscillator = null;

			/**
			 *  callback which is invoked when the oscillator is stoped
			 *  @type {function()}
			 */
			this.onended = options.onended;

			//set the oscillator
			this.setType(options.type);
		};

		Tone.extend(Tone.OmniOscillator, Tone.Oscillator);

		/**
		 *  default values
		 *  @static
		 *  @type {Object}
		 *  @const
		 */
		Tone.OmniOscillator.defaults = {
			"frequency" : 440,
			"detune" : 0,
			"type" : "sine",
			"width" : 0.4, //only applies if the oscillator is set to "pulse",
			"modulationFrequency" : 0.4, //only applies if the oscillator is set to "pwm",
			"onended" : function(){}
		};

		/**
		 *  start the oscillator
		 *  @param {Tone.Time} [time=now] the time to start the oscillator
		 */
		Tone.OmniOscillator.prototype.start = function(time){
			if (this.state === Tone.Source.State.STOPPED){
				this.state = Tone.Source.State.STARTED;
				this._oscillator.start(time);
			}
		};

		/**
		 *  start the oscillator
		 *  @param {Tone.Time} [time=now] the time to start the oscillator
		 */
		Tone.OmniOscillator.prototype.stop = function(time){
			if (this.state === Tone.Source.State.STARTED){
				if (!time){
					this.state = Tone.Source.State.STOPPED;
				}
				this._oscillator.stop(time);
			}
		};

		/**
		 *  set the type of the oscillator
		 *  @param {string} type sine|square|triangle|sawtooth|pulse|pwm
		 */
		Tone.OmniOscillator.prototype.setType = function(type){
			if (type === "sine" || type === "square" || type === "triangle" || type === "sawtooth"){
				if (this._sourceType !== OmniOscType.Oscillator){
					this._sourceType = OmniOscType.Oscillator;
					this._createNewOscillator(Tone.Oscillator);
				}
				this._oscillator.setType(type);
			} else if (type === "pwm"){
				if (this._sourceType !== OmniOscType.PWMOscillator){
					this._sourceType = OmniOscType.PWMOscillator;
					this._createNewOscillator(Tone.PWMOscillator);
				}
			} else if (type === "pulse"){
				if (this._sourceType !== OmniOscType.PulseOscillator){
					this._sourceType = OmniOscType.PulseOscillator;
					this._createNewOscillator(Tone.PulseOscillator);
				}
			} else {
				throw new TypeError("Tone.OmniOscillator does not support type "+type);
			}
		};

		/**
		 *  @returns {string} the type of oscillator
		 */
		Tone.OmniOscillator.prototype.getType = function(){
			if (this._sourceType === OmniOscType.PulseOscillator){
				return "pulse";
			} else if (this._sourceType === OmniOscType.PWMOscillator){
				return "pwm";
			} else if (this._sourceType === OmniOscType.Oscillator){
				return this._oscillator.getType();
			} 
		};

		/**
		 *  connect the oscillator to the frequency and detune signals
		 *  @private
		 */
		Tone.OmniOscillator.prototype._createNewOscillator = function(OscillatorConstructor){
			//short delay to avoid clicks on the change
			var now = this.now() + this.bufferTime;
			if (this._oscillator !== null){
				var oldOsc = this._oscillator;
				oldOsc.stop(now);
				oldOsc.onended = function(){
					oldOsc.dispose();
					oldOsc = null;
				};
			}
			this._oscillator = new OscillatorConstructor();
			this.frequency.connect(this._oscillator.frequency);
			this.detune.connect(this._oscillator.detune);
			this._oscillator.connect(this.output);
			if (this.state === Tone.Source.State.STARTED){
				this._oscillator.start(now);
			}
			this._oscillator.onended = this._onended.bind(this);
		};

		/**
		 *  internal onended callback
		 *  @private
		 */
		Tone.OmniOscillator.prototype._onended = function(){
			this.onended();
		};

		/**
		 *  set the width of the PulseOscillator
		 *  @throws {Error} If the type of oscillator is not "pulse"
		 *  @param {number} width the width of the pulse oscillator
		 */
		Tone.OmniOscillator.prototype.setWidth = function(width){
			if (this._sourceType === OmniOscType.PulseOscillator){
				this._oscillator.setWidth(width);
			} else {
				throw new Error("Invalid call to 'setWidth'. OmniOscillator type must be set to type 'pulse'.");
			}
		};

		/**
		 *  set the modulation frequency of the PWMOscillator
		 *  @throws {Error} If the type of oscillator is not "pwm"
		 *  @param {Tone.Time} freq the modulation frequency of the pwm
		 */
		Tone.OmniOscillator.prototype.setModulationFrequency = function(freq){
			if (this._sourceType === OmniOscType.PWMOscillator){
				this._oscillator.setModulationFrequency(freq);
			} else {
				throw new Error("Invalid call to 'setModulationFrequency'. OmniOscillator type must be set to type 'pwm'.");
			}
		};

		/**
		 *  bulk setter
		 *  @param {Object} params 
		 */
		Tone.OmniOscillator.prototype.set = function(params){
			if (!this.isUndef(params.type)) this.setType(params.type);
			if (!this.isUndef(params.onended)) this.onended = params.onended;
			if (!this.isUndef(params.frequency)) this.setFrequency(params.frequency);
			if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
			if (!this.isUndef(params.width)) this.setWidth(params.width);
			if (!this.isUndef(params.modulationFrequency)) this.setModulationFrequency(params.modulationFrequency);
			Tone.Source.prototype.set.call(this, params);
		};

		/**
		 *  clean up
		 */
		Tone.OmniOscillator.prototype.dispose = function(){
			Tone.Source.prototype.dispose.call(this);
			this.detune.dispose();
			this.detune = null;
			this.frequency.dispose();
			this.frequency = null;
			this._oscillator.dispose();
			this._oscillator = null;
			this._sourceType = null;
		};

		/**
		 *  @enum {string}
		 */
		var OmniOscType = {
			PulseOscillator : "PulseOscillator",
			PWMOscillator : "PWMOscillator",
			Oscillator : "Oscillator"
		};

		return Tone.OmniOscillator;
	});
	toneModule( function(Tone){

		

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
		 *  @param {Tone.Time} [time=now] the time to trigger the ntoe
		 *  @param {number} [velocity=1] the velocity to trigger the note
		 */
		Tone.Instrument.prototype.triggerAttack = function(){};

		/**
		 *  @abstract
		 *  @param {Tone.Time} [time=now] when to trigger the release
		 */
		Tone.Instrument.prototype.triggerRelease = function(){};

		/**
		 *  trigger the attack and then the release
		 *  @param  {string|number} note     the note to trigger
		 *  @param  {Tone.Time} duration the duration of the note
		 *  @param {Tone.Time} [time=now]     the time of the attack
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
	toneModule( function(Tone){

		

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
		 *  @param  {Tone.Time} [time=now]     the time, if not given is now
		 *  @param  {number} [velocity=1] velocity defaults to 1
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
	toneModule( 
	function(Tone){

		

		/**
		 *  @class  the MonoSynth is a single oscillator, monophonic synthesizer
		 *          with a filter, and two envelopes (on the filter and the amplitude). 
		 *
		 * Flow: 
		 * 
		 * <pre>
		 * OmniOscillator+-->AmplitudeEnvelope+-->Filter 
		 *                                          ^    
		 *                                          |    
		 *                         ScaledEnvelope+--+
		 * </pre>
		 *  
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
			 *  @type {Tone.OmniOscillator}
			 */
			this.oscillator = new Tone.OmniOscillator(options.oscillator);

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
			this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

			/**
			 *  the amplitude envelope
			 *  @type {Tone.Envelope}
			 */
			this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

			//connect the oscillators to the output
			this.oscillator.chain(this.filter, this.envelope, this.output);
			//start the oscillators
			this.oscillator.start();
			//connect the filter envelope
			this.filterEnvelope.connect(this.filter.frequency);
		};

		Tone.extend(Tone.MonoSynth, Tone.Monophonic);

		/**
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.MonoSynth.defaults = {
			"oscillator" : {
				"type" : "square"
			},
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
				"max" : 4000,
				"exponent" : 2
			}
		};

		/**
		 *  start the attack portion of the envelope
		 *  @param {Tone.Time} [time=now] the time the attack should start
		 *  @param {number} [velocity=1] the velocity of the note (0-1)
		 */
		Tone.MonoSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
			//the envelopes
			this.envelope.triggerAttack(time, velocity);
			this.filterEnvelope.triggerAttack(time);		
		};

		/**
		 *  start the release portion of the envelope
		 *  @param {Tone.Time} [time=now] the time the release should start
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
			if (!this.isUndef(params.oscillator)) this.oscillator.set(params.oscillator);
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
			this.oscillator = null;
			this.envelope.dispose();
			this.envelope = null;
			this.filterEnvelope.dispose();
			this.filterEnvelope = null;
			this.filter.dispose();
			this.filter = null;
			this.frequency = null;
			this.detune = null;
		};

		return Tone.MonoSynth;
	});
	toneModule( 
	function(Tone){

		

		/**
		 *  @class  the AMSynth is an amplitude modulation synthesizer
		 *          composed of two MonoSynths where one MonoSynth is the 
		 *          carrier and the second is the modulator.
		 *
		 *  @constructor
		 *  @extends {Tone.Monophonic}
		 *  @param {Object} options the options available for the synth 
		 *                          see defaults below
		 */
		Tone.AMSynth = function(options){

			options = this.defaultArg(options, Tone.AMSynth.defaults);
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
			 *  convert the -1,1 output to 0,1
			 *  @type {Tone.Expr}
			 *  @private
			 */
			this._modulationScale = new Tone.Expr("($0 + 1) * 0.5");

			/**
			 *  the node where the modulation happens
			 *  @type {GainNode}
			 *  @private
			 */
			this._modulationNode = this.context.createGain();

			//control the two voices frequency
			this.frequency.connect(this.carrier.frequency);
			this.frequency.chain(this._harmonicity, this.modulator.frequency);
			this.modulator.chain(this._modulationScale, this._modulationNode.gain);
			this.carrier.chain(this._modulationNode, this.output);
		};

		Tone.extend(Tone.AMSynth, Tone.Monophonic);

		/**
		 *  @static
		 *  @type {Object}
		 */
		Tone.AMSynth.defaults = {
			"harmonicity" : 3,
			"carrier" : {
				"volume" : -10,
				"portamento" : 0,
				"oscillator" : {
					"type" : "sine"
				},
				"envelope" : {
					"attack" : 0.01,
					"decay" : 0.01,
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
				"oscillator" : {
					"type" : "square"
				},
				"envelope" : {
					"attack" : 2,
					"decay" : 0.0,
					"sustain" : 1,
					"release" : 0.5
				},
				"filterEnvelope" : {
					"attack" : 4,
					"decay" : 0.2,
					"sustain" : 0.5,
					"release" : 0.5,
					"min" : 20,
					"max" : 1500
				}
			}
		};

		/**
		 *  trigger the attack portion of the note
		 *  
		 *  @param  {Tone.Time} [time=now] the time the note will occur
		 *  @param {number} [velocity=1] the velocity of the note
		 */
		Tone.AMSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
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
		 *  @param  {Tone.Time} [time=now] the time the note will release
		 */
		Tone.AMSynth.prototype.triggerEnvelopeRelease = function(time){
			this.carrier.triggerRelease(time);
			this.modulator.triggerRelease(time);
		};

		/**
		 *  set the ratio between the two carrier and the modulator
		 *  @param {number} ratio
		 */
		Tone.AMSynth.prototype.setHarmonicity = function(ratio){
			this._harmonicity.setValue(ratio);
		};

		/**
		 *  bulk setter
		 *  @param {Object} param 
		 */
		Tone.AMSynth.prototype.set = function(params){
			if (!this.isUndef(params.harmonicity)) this.setHarmonicity(params.harmonicity);
			if (!this.isUndef(params.carrier)) this.carrier.set(params.carrier);
			if (!this.isUndef(params.modulator)) this.modulator.set(params.modulator);
			Tone.Monophonic.prototype.set.call(this, params);
		};

		/**
		 *  clean up
		 */
		Tone.AMSynth.prototype.dispose = function(){
			Tone.Monophonic.prototype.dispose.call(this);
			this.carrier.dispose();
			this.carrier = null;
			this.modulator.dispose();
			this.modulator = null;
			this.frequency.dispose();
			this.frequency = null;
			this._harmonicity.dispose();
			this._harmonicity = null;
			this._modulationScale.dispose();
			this._modulationScale = null;
			this._modulationNode.disconnect();
			this._modulationNode = null;
		};

		return Tone.AMSynth;
	});
	toneModule( 
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
			 *  the amount of vibrato
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
			this.frequency.chain(this._harmonicity, this.voice1.frequency);
			this._vibrato.connect(this._vibratoGain);
			this._vibratoGain.fan(this.voice0.detune, this.voice1.detune);
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
				"oscillator" : {
					"type" : "sine"
				},
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
				"oscillator" : {
					"type" : "sine"
				},
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
		 *  @param {Tone.Time} [time=now] the time the attack should start
		 *  @param {number} [velocity=1] the velocity of the note (0-1)
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
		 *  @param {Tone.Time} [time=now] the time the release should start
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
	toneModule( 
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
			this.frequency.chain(this._harmonicity, this.modulator.frequency);
			this.frequency.chain(this._modulationIndex, this._modulationNode);
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
				"oscillator" : {
					"type" : "sine"
				},
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
				"oscillator" : {
					"type" : "triangle"
				},
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
		 *  @param  {Tone.Time} [time=now] the time the note will occur
		 *  @param {number} [velocity=1] the velocity of the note
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
		 *  @param  {Tone.Time} [time=now] the time the note will release
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
	toneModule( function(Tone){

		
		
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
		Tone.Player = function(){
			
			Tone.Source.call(this);
			var options = this.optionsObject(arguments, ["url", "onload"], Tone.Player.defaults);

			/**
			 *  @private
			 *  @type {AudioBufferSourceNode}
			 */
			this._source = null;
			
			/**
			 *  the buffer
			 *  @private
			 *  @type {Tone.Buffer}
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
			this.loop = options.loop;

			/**
			 *  if 'loop' is true, the loop will start at this position
			 *  
			 *  @type {Tone.Time}
			 */
			this.loopStart = options.loopStart;

			/**
			 *  if 'loop' is true, the loop will end at this position
			 *  
			 *  @type {Tone.Time}
			 */
			this.loopEnd = options.loopEnd;

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
			this.retrigger = options.retrigger;

			/**
			 *  set a callback function to invoke when the sample is over
			 *  
			 *  @type {function}
			 */
			this.onended = options.onended;

			//if there is a url, load it. 
			if (!this.isUndef(options.url)){
				this.load(options.url, options.onload);
			}
		};

		Tone.extend(Tone.Player, Tone.Source);

		
		/**
		 *  the default parameters
		 *
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.Player.defaults = {
			"onended" : function(){},
			"loop" : false,
			"loopStart" : 0,
			"loopEnd" : -1,
			"retrigger" : false
		};

		/**
		 *  Load the audio file as an audio buffer.
		 *  Decodes the audio asynchronously and invokes
		 *  the callback once the audio buffer loads.
		 * @param {string} url the url of the buffer to load.
		 *        filetype support depends on the
		 *        browser.
		 * @param  {function(Tone.Player)=} callback
		 */
		Tone.Player.prototype.load = function(url, callback){
			var self = this;
			if (!self._buffer){
				new Tone.Buffer(url, function (buffer){
					self.setBuffer(buffer);
					if (callback){
						callback(self);
					}
				});
			} else if (callback){
				callback(self);
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
		 *  @param  {Tone.Time} [startTime=now] when the player should start.
		 *  @param  {Tone.Time} [offset=0] the offset from the beginning of the sample
		 *                                 to start at. 
		 *  @param  {Tone.Time=} duration how long the sample should play. If no duration
		 *                                is given, it will default to the full length 
		 *                                of the sample (minus any offset)
		 */
		Tone.Player.prototype.start = function(startTime, offset, duration){
			if (this.state === Tone.Source.State.STOPPED || this.retrigger){
				if (this._buffer){
					this.state = Tone.Source.State.STARTED;
					//if it's a loop the default offset is the loopstart point
					if (this.loop){
						offset = this.defaultArg(offset, this.loopStart);
					} else {
						//otherwise the default offset is 0
						offset = this.defaultArg(offset, 0);
					}
					duration = this.defaultArg(duration, this._buffer.duration - offset);
					//make the source
					this._source = this.context.createBufferSource();
					this._source.buffer = this._buffer;
					//set the looping properties
					if (this.loop){
						this._source.loop = this.loop;
						this._source.loopStart = this.toSeconds(this.loopStart);
						if (this.loopEnd !== -1){
							this._source.loopEnd = this.toSeconds(this.loopEnd);
						}
					}
					//and other properties
					this._source.playbackRate.value = this._playbackRate;
					this._source.onended = this._onended.bind(this);
					this._source.connect(this.output);
					//start it
					this._source.start(this.toSeconds(startTime), this.toSeconds(offset), this.toSeconds(duration));
				}
			}
		};

		/**
		 *  Stop playback.
		 * 
		 *  @param  {Tone.Time} [time=now]
		 */
		Tone.Player.prototype.stop = function(time){
			if (this.state === Tone.Source.State.STARTED) {
				if (this._buffer && this._source){
					this.state = Tone.Source.State.STOPPED;
					this._source.stop(this.toSeconds(time));
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
		 *  set the rate at which the file plays
		 *  
		 *  @param {number} rate
		 *  @param {Tone.Time=} rampTime the amount of time it takes to 
		 *                               reach the rate
		 */
		Tone.Player.prototype.setPlaybackRate = function(rate, rampTime){
			this._playbackRate = rate;
			if (this._source) {
				this._source.playbackRate.exponentialRampToValueAtTime(rate, this.toSeconds(rampTime));
			}
		};

		/**
		 *  set the loop start position
		 *  @param {Tone.Time} loopStart the start time
		 */
		Tone.Player.prototype.setLoopStart = function(loopStart){
			this.loopStart = loopStart;
		};

		/**
		 *  set the loop end position
		 *  @param {Tone.Time} loopEnd the loop end time
		 */
		Tone.Player.prototype.setLoopEnd = function(loopEnd){
			this.loopEnd = loopEnd;
		};

		/**
		 *  set the loop start and end
		 *  @param {Tone.Time} loopStart the loop end time
		 *  @param {Tone.Time} loopEnd the loop end time
		 */
		Tone.Player.prototype.setLoopPoints = function(loopStart, loopEnd){
			this.setLoopStart(loopStart);
			this.setLoopEnd(loopEnd);
		};

		/**
		 *  set the parameters at once
		 *  @param {Object} params
		 */
		Tone.Player.prototype.set = function(params){
			if (!this.isUndef(params.playbackRate)) this.setPlaybackRate(params.playbackRate);
			if (!this.isUndef(params.onended)) this.onended = params.onended;
			if (!this.isUndef(params.loop)) this.loop = params.loop;
			if (!this.isUndef(params.loopStart)) this.setLoopStart(params.loopStart);
			if (!this.isUndef(params.loopEnd)) this.setLoopEnd(params.loopEnd);
			Tone.Source.prototype.set.call(this, params);
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

	toneModule( 
	function(Tone){

		

		/**
		 *  @class A simple sampler instrument which plays an audio buffer 
		 *         through an amplitude envelope and a filter envelope.
		 *
		 *  @constructor
		 *  @extends {Tone.Instrument}
		 *  @param {string|object} url the url of the audio file
		 *  @param {function} onload called when the sample has been loaded
		 */
		Tone.Sampler = function(){

			Tone.Instrument.call(this);
			var options = this.optionsObject(arguments, ["url", "onload"], Tone.Sampler.defaults);

			/**
			 *  the sample player
			 *  @type {Tone.Player}
			 */
			this.player = new Tone.Player({
				url : options.url, 
				onload : options.onload,
				retrigger : true
			});
			this.player.set(options.player);

			/**
			 *  the amplitude envelope
			 *  @type {Tone.Envelope}
			 */
			this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

			/**
			 *  the filter envelope
			 *  @type {Tone.Envelope}
			 */
			this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

			/**
			 *  the filter
			 *  @type {BiquadFilterNode}
			 */
			this.filter = new Tone.Filter(options.filter);

			//connections
			this.player.chain(this.filter, this.envelope, this.output);
			this.filterEnvelope.connect(this.filter.frequency);
		};

		Tone.extend(Tone.Sampler, Tone.Instrument);

		/**
		 *  the default parameters
		 *
		 *  @static
		 */
		Tone.Sampler.defaults = {
			"url" : undefined,
			"onload" : function(){},
			"player" : {
				"loop" : false,
			},
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
				"max" : 20000,
				"exponent" : 2,
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
		 	if (!this.isUndef(params.player)) this.player.set(params.player);
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
			this.player.start(time, 0);
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
			this.player.stop(this.toSeconds(this.envelope.release) + time);
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

	toneModule( 
	function(Tone){

		

		/**
		 *  @class Aggregates multiple Tone.Samplers into a single instrument.
		 *         Pass in a mapping of names to sample urls and an optional 
		 *         callback to invoke when all of the samples are loaded. 
		 *
		 *  ```javascript
		 *  var sampler = new Tone.MultiSampler({
		 *  	"kick" : "../audio/BD.mp3",
		 *  	"snare" : "../audio/SD.mp3",
		 *  	"hat" : "../audio/hh.mp3"
		 *  }, onload);
		 *  //once loaded...
		 *  sampler.triggerAttack("kick");
		 *  ```
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
			for (var s in samples){ //jshint ignore:line
				loadCounter.total++;
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
		 *  @param {Tone.Time} [time=now] the time when the note should start
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
		 *  @param {Tone.Time} [time=now] the time when the note should release
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

	toneModule( function(Tone){

		

		/**
		 *  @class  Noise generator. 
		 *          Uses looped noise buffers to save on performance. 
		 *
		 *  @constructor
		 *  @extends {Tone.Source}
		 *  @param {string} type the noise type (white|pink|brown)
		 */
		Tone.Noise = function(){

			Tone.Source.call(this);
			var options = this.optionsObject(arguments, ["type"], Tone.Noise.defaults);

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
			this.onended = options.onended;

			this.setType(options.type);
		};

		Tone.extend(Tone.Noise, Tone.Source);

		/**
		 *  the default parameters
		 *
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.Noise.defaults = {
			"type" : "white",
			"onended" : function(){}
		};

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
		 *  get the type of noise
		 *  @return {string} the type of noise
		 */
		Tone.Noise.prototype.getType = function(){
			if (this._buffer === _whiteNoise){
				return "white";
			} else if (this._buffer === _brownNoise){
				return "brown";
			} else if (this._buffer === _pinkNoise){
				return "pink";
			}
		};

		/**
		 *  set the parameters at once
		 *  @param {Object} params
		 */
		Tone.Noise.prototype.set = function(params){
			if (!this.isUndef(params.type)) this.setType(params.type);
			if (!this.isUndef(params.onended)) this.onended = params.onended;
			Tone.Source.prototype.set.call(this, params);
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
			this.connectSeries(this._source, this.output);
			this._source.start(this.toSeconds(time));
			this._source.onended = this.onended;
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
		 *  @param {Tone.Time} timetest
		 */
		Tone.Noise.prototype.stop = function(time){
			if (this.state === Tone.Source.State.STARTED) {
				if (this._buffer && this._source){
					this.state = Tone.Source.State.STOPPED;
					this._stop(time);
				}
			}
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
	toneModule( 
	function(Tone){

		

		/**
		 *  @class  the NoiseSynth is a single oscillator, monophonic synthesizer
		 *          with a filter, and two envelopes (on the filter and the amplitude)
		 *
		 *  @constructor
		 *  @extends {Tone.Instrument}
		 *  @param {Object} options the options available for the synth 
		 *                          see defaults below
		 */
		Tone.NoiseSynth = function(options){

			//get the defaults
			options = this.defaultArg(options, Tone.NoiseSynth.defaults);
			Tone.Instrument.call(this);

			/**
			 *  the noise source
			 *  @type {Tone.Noise}
			 */
			this.noise = new Tone.Noise();

			/**
			 *  the filter
			 *  @type {Tone.Filter}
			 */
			this.filter = new Tone.Filter(options.filter);

			/**
			 *  the filter envelope
			 *  @type {Tone.Envelope}
			 */
			this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

			/**
			 *  the amplitude envelope
			 *  @type {Tone.Envelope}
			 */
			this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

			//connect the noise to the output
			this.noise.chain(this.filter, this.envelope, this.output);
			//start the noise
			this.noise.start();
			//connect the filter envelope
			this.filterEnvelope.connect(this.filter.frequency);
		};

		Tone.extend(Tone.NoiseSynth, Tone.Instrument);

		/**
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.NoiseSynth.defaults = {
			"noise" : {
				"type" : "white"
			},
			"filter" : {
				"Q" : 6,
				"type" : "highpass",
				"rolloff" : -24
			},
			"envelope" : {
				"attack" : 0.005,
				"decay" : 0.1,
				"sustain" : 0.0,
			},
			"filterEnvelope" : {
				"attack" : 0.06,
				"decay" : 0.2,
				"sustain" : 0,
				"release" : 2,
				"min" : 20,
				"max" : 4000,
				"exponent" : 2
			}
		};

		/**
		 *  start the attack portion of the envelope
		 *  @param {Tone.Time} [time=now] the time the attack should start
		 *  @param {number} [velocity=1] the velocity of the note (0-1)
		 */
		Tone.NoiseSynth.prototype.triggerAttack = function(time, velocity){
			//the envelopes
			this.envelope.triggerAttack(time, velocity);
			this.filterEnvelope.triggerAttack(time);		
		};

		/**
		 *  start the release portion of the envelope
		 *  @param {Tone.Time} [time=now] the time the release should start
		 */
		Tone.NoiseSynth.prototype.triggerRelease = function(time){
			this.envelope.triggerRelease(time);
			this.filterEnvelope.triggerRelease(time);
		};

		/**
		 *  trigger the attack and then the release
		 *  @param  {Tone.Time} duration the duration of the note
		 *  @param  {Tone.Time} [time=now]     the time of the attack
		 *  @param  {number} [velocity=1] the velocity
		 */
		Tone.NoiseSynth.prototype.triggerAttackRelease = function(duration, time, velocity){
			time = this.toSeconds(time);
			duration = this.toSeconds(duration);
			this.triggerAttack(time, velocity);
			console.log(time + duration);
			this.triggerRelease(time + duration);
		};

		/**
		 *  set the oscillator type
		 *  @param {string} oscType the type of oscillator
		 */
		Tone.NoiseSynth.prototype.setNoiseType = function(type){
			this.noise.setType(type);
		};

		/**
		 *  set the members at once
		 *  @param {Object} params all of the parameters as an object.
		 *                         params for envelope and filterEnvelope 
		 *                         should be nested objects. 
		 */
		Tone.NoiseSynth.prototype.set = function(params){
			if (!this.isUndef(params.noise)) this.noise.set(params.noise);
			if (!this.isUndef(params.filterEnvelope)) this.filterEnvelope.set(params.filterEnvelope);
			if (!this.isUndef(params.envelope)) this.envelope.set(params.envelope);
			if (!this.isUndef(params.filter)) this.filter.set(params.filter);
		};

		/**
		 *  clean up
		 */
		Tone.NoiseSynth.prototype.dispose = function(){
			Tone.Instrument.prototype.dispose.call(this);
			this.noise.dispose();
			this.noise = null;
			this.envelope.dispose();
			this.envelope = null;
			this.filterEnvelope.dispose();
			this.filterEnvelope = null;
			this.filter.dispose();
			this.filter = null;
		};

		return Tone.NoiseSynth;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class Karplus-String string synthesis. 
		 *  
		 *  @constructor
		 *  @extends {Tone.Instrument}
		 *  @param {Object} options see the defaults
		 */
		Tone.PluckSynth = function(options){

			options = this.defaultArg(options, Tone.PluckSynth.defaults);
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
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.PluckSynth.defaults = {
			"attackNoise" : 1,
			"dampening" : 4000,
			"resonance" : 0.5
		};

		/**
		 *  trigger the attack portion
		 *  @param {string|number} note the note name or frequency
		 *  @param {Tone.Time} [time=now] the time of the note
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
		 *  set the resonance of the instrument
		 *  @param {number} resonance the resonance between (0, 1)
		 */
		Tone.PluckSynth.prototype.setResonance = function(resonance) {
			this.resonance.setValue(resonance);
		};

		/**
		 *  set the dampening of the instrument
		 *  @param {number} dampening a frequency value of the lowpass filter
		 *                            nominal range of (1000, 10000)
		 */
		Tone.PluckSynth.prototype.setDampening = function(dampening) {
			this.dampening.setValue(dampening);
		};

		/**
		 *  set the length of the attack noise
		 *  @param {number} attackNoise	the length of the attack nosie. 
		 *                              a value of 1 is normal.
		 */
		Tone.PluckSynth.prototype.setAttackNoise = function(attackNoise) {
			this.attackNoise = attackNoise;
		};

		/**
		 *  bulk setter
		 *  @param {Object} param 
		 */
		Tone.PluckSynth.prototype.set = function(params){
			if (!this.isUndef(params.resonance)) this.setResonance(params.resonance);
			if (!this.isUndef(params.dampening)) this.setDampening(params.dampening);
			if (!this.isUndef(params.attackNoise)) this.setAttackNoise(params.attackNoise);
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
	toneModule( 
	function(Tone){

		

		/**
		 *  @class  Creates a polyphonic synthesizer out of 
		 *          the monophonic voice which is passed in. 
		 *
		 *  ```javascript
		 *  //a polysynth composed of 6 Voices of MonoSynth
		 *  var synth = new Tone.PolySynth(6, Tone.MonoSynth);
		 *  //set a MonoSynth preset
		 *  synth.setPreset("Pianoetta");
		 *  ```
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
		 *  @param  {string|number|Object|Array} value the value of the note(s) to start.
		 *                                             if the value is an array, it will iterate
		 *                                             over the array to play each of the notes
		 *  @param  {Tone.Time} [time=now]  the start time of the note
		 *  @param {number} [velocity=1] the velocity of the note
		 */
		Tone.PolySynth.prototype.triggerAttack = function(value, time, velocity){
			if (!Array.isArray(value)){
				value = [value];
			}
			for (var i = 0; i < value.length; i++){
				var val = value[i];
				var stringified = JSON.stringify(val);
				if (this._activeVoices[stringified]){
					this._activeVoices[stringified].triggerAttack(val, time, velocity);
				} else if (this._freeVoices.length > 0){
					var voice = this._freeVoices.shift();
					voice.triggerAttack(val, time, velocity);
					this._activeVoices[stringified] = voice;
				}
			}
		};

		/**
		 *  trigger the attack and release after the specified duration
		 *  
		 *  @param  {string|number|Object|Array} value the note(s).
		 *                                             if the value is an array, it will iterate
		 *                                             over the array to play each of the notes
		 *  @param  {Tone.Time} duration the duration of the note
		 *  @param  {Tone.Time} [time=now]     if no time is given, defaults to now
		 *  @param  {number} [velocity=1] the velocity of the attack (0-1)
		 */
		Tone.PolySynth.prototype.triggerAttackRelease = function(value, duration, time, velocity){
			time = this.toSeconds(time);
			this.triggerAttack(value, time, velocity);
			this.triggerRelease(value, time + this.toSeconds(duration));
		};

		/**
		 *  trigger the release of a note
		 *  @param  {string|number|Object|Array} value the value of the note(s) to release.
		 *                                             if the value is an array, it will iterate
		 *                                             over the array to play each of the notes
		 *  @param  {Tone.Time} [time=now]  the release time of the note
		 */
		Tone.PolySynth.prototype.triggerRelease = function(value, time){
			if (!Array.isArray(value)){
				value = [value];
			}
			for (var i = 0; i < value.length; i++){
				//get the voice
				var stringified = JSON.stringify(value[i]);
				var voice = this._activeVoices[stringified];
				if (voice){
					voice.triggerRelease(time);
					this._freeVoices.push(voice);
					this._activeVoices[stringified] = null;
				}
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
	toneModule( function(Tone){

		

		/**
		 * 	@class  Clip the incoming signal so that the output is always between min and max
		 * 	
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} min the minimum value of the outgoing signal
		 *  @param {number} max the maximum value of the outgoing signal
		 */
		Tone.Clip = function(min, max){
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
			this._min = this.input = new Tone.Min(max);

			/**
			 *  the max clipper
			 *  @type {Tone.Max}
			 *  @private
			 */
			this._max = this.output = new Tone.Max(min);

			this._min.connect(this._max);
		};

		Tone.extend(Tone.Clip, Tone.SignalBase);

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
		 *  clean up
		 */
		Tone.Clip.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._min.dispose();
			this._min = null;
			this._max.dispose();
			this._max = null;
		};

		return Tone.Clip;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class Convert an incoming signal between 0,1 to an equal power gain scale.
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 */
		Tone.EqualPowerGain = function(){

			/**
			 *  @type {Tone.WaveShaper}
			 *  @private
			 */
			this._eqPower = this.input = this.output = new Tone.WaveShaper(function(val){
				if (Math.abs(val) < 0.001){
					//should output 0 when input is 0
					return 0;
				} else {
					return Tone.prototype.equalPowerScale(val);
				}
			}, 4096);
		};

		Tone.extend(Tone.EqualPowerGain, Tone.SignalBase);

		/**
		 *  clean up
		 */
		Tone.EqualPowerGain.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._eqPower.dispose();
			this._eqPower = null;
		};

		return Tone.EqualPowerGain;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class Normalize takes an input min and max and maps it linearly to [0,1]
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 */
		Tone.Normalize = function(inputMin, inputMax){

			/**
			 *  the min input value
			 *  @type {number}
			 *  @private
			 */
			this._inputMin = this.defaultArg(inputMin, 0);

			/**
			 *  the max input value
			 *  @type {number}
			 *  @private
			 */
			this._inputMax = this.defaultArg(inputMax, 1);

			/**
			 *  subtract the min from the input
			 *  @type {Tone.Add}
			 *  @private
			 */
			this._sub = this.input = new Tone.Add(0);

			/**
			 *  divide by the difference between the input and output
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._div = this.output = new Tone.Multiply(1);

			this._sub.connect(this._div);
			this._setRange();
		};

		Tone.extend(Tone.Normalize, Tone.SignalBase);

		/**
		 *  set the minimum input value
		 *  @param {number} min the minimum input value
		 */
		Tone.Normalize.prototype.setMin = function(min){
			this._inputMin = min;
			this._setRange();
		};

		/**
		 *  set the minimum input value
		 *  @param {number} min the minimum input value
		 */
		Tone.Normalize.prototype.setMax = function(max){
			this._inputMax = max;
			this._setRange();
		};

		/**
		 *  set the values
		 *  @private
		 */
		Tone.Normalize.prototype._setRange = function() {
			this._sub.setValue(-this._inputMin);
			this._div.setValue(1 / (this._inputMax - this._inputMin));
		};

		/**
		 *  clean up
		 */
		Tone.Normalize.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._sub.dispose();
			this._sub = null;
			this._div.dispose();
			this._div = null;
		};

		return Tone.Normalize;
	});
	toneModule( function(Tone){

		

		/**
		 *  @class Route a single input to the specified output
		 *
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} [outputCount=2] the number of inputs the switch accepts
		 */
		Tone.Route = function(outputCount){

			outputCount = this.defaultArg(outputCount, 2);
			Tone.call(this, 1, outputCount);

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

		Tone.extend(Tone.Route, Tone.SignalBase);

		/**
		 *  routes the signal to one of the outputs and close the others
		 *  @param {number} [which=0] open one of the gates (closes the other)
		 *  @param {Tone.Time} time the time when the switch will open
		 */
		Tone.Route.prototype.select = function(which, time){
			//make sure it's an integer
			which = Math.floor(which);
			this.gate.setValueAtTime(which, this.toSeconds(time));
		};

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
	toneModule( function(Tone){

		

		/**
		 *  @class  When the gate is set to 0, the input signal does not pass through to the output. 
		 *          If the gate is set to 1, the input signal passes through.
		 *          the gate is initially closed.
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
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
			 *  thresh the control signal to either 0 or 1
			 *  @type {Tone.GreaterThan}
			 *  @private
			 */
			this._thresh = new Tone.GreaterThan(0.5);

			this.input.connect(this.output);
			this.gate.chain(this._thresh, this.output.gain);
		};

		Tone.extend(Tone.Switch, Tone.SignalBase);

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
	toneModule( function(Tone){

		

		/**
		 *  @class  Threshold an incoming signal. the signal is assumed to be in the normal range (-1 to 1)
		 *          Creates a threshold value such that signal above the value will equal 1, 
		 *          and below will equal 0.
		 *
		 *  @deprecated use Tone.GreaterThan or Tone.GreaterThanZero instead. Threshold will be removed in r4. 
		 *  
		 *  @constructor
		 *  @param {number=} [thresh=0] threshold value above which the output will equal 1 
		 *                          and below which the output will equal 0
		 *  @extends {Tone.SignalBase}
		 */
		Tone.Threshold = function(thresh){

			console.warn("Tone.Threshold has been deprecated. Use Tone.GreaterThan or Tone.GreaterThanZero");
			
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

		Tone.extend(Tone.Threshold, Tone.SignalBase);

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
	toneModule( function(Tone){

		

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

	//requirejs compatibility
	if ( typeof define === "function" && define.amd ) {
		define( "Tone", [], function() {
			return Tone;
		});
	} else {
		root.Tone = Tone;
	}
} (this));
