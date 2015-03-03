(function (root) {
	"use strict";
	var Tone;
	//constructs the main Tone object
	function MainModule(func){
		Tone = func();
	}
	//invokes each of the modules with the main Tone object as the argument
	function ToneModule(func){
		func(Tone);
	}

	/**
	 *  Tone.js
	 *  @author Yotam Mann
	 *  @license http://opensource.org/licenses/MIT MIT License
	 *  @copyright 2014-2015 Yotam Mann
	 */
	MainModule(function(){

		

		//////////////////////////////////////////////////////////////////////////
		//	WEB AUDIO CONTEXT
		///////////////////////////////////////////////////////////////////////////

		//borrowed from underscore.js
		function isUndef(val){
			return val === void 0;
		}

		//borrowed from underscore.js
		function isFunction(val){
			return typeof val === "function";
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

		if (!isFunction(AudioContext.prototype.createGain)){
			AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
		}
		if (!isFunction(AudioContext.prototype.createDelay)){
			AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
		}
		if (!isFunction(AudioContext.prototype.createPeriodicWave)){
			AudioContext.prototype.createPeriodicWave = AudioContext.prototype.createWaveTable;
		}
		if (!isFunction(AudioBufferSourceNode.prototype.start)){
			AudioBufferSourceNode.prototype.start = AudioBufferSourceNode.prototype.noteGrainOn;
		}
		if (!isFunction(AudioBufferSourceNode.prototype.stop)){
			AudioBufferSourceNode.prototype.stop = AudioBufferSourceNode.prototype.noteOff;
		}
		if (!isFunction(OscillatorNode.prototype.start)){
			OscillatorNode.prototype.start = OscillatorNode.prototype.noteOn;
		}
		if (!isFunction(OscillatorNode.prototype.stop)){
			OscillatorNode.prototype.stop = OscillatorNode.prototype.noteOff;	
		}
		if (!isFunction(OscillatorNode.prototype.setPeriodicWave)){
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
		 *  @class  Tone is the base class of all other classes.  
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

		/**
		 *  Set the parameters at once. Either pass in an
		 *  object mapping parameters to values, or to set a
		 *  single parameter, by passing in a string and value.
		 *  @example
		 *  //set values using an object
		 *  filter.set({
		 *  	"frequency" : 300,
		 *  	"type" : highpass
		 *  });
		 *  //or
		 *  filter.set("type", "highpass");
		 *  //ramp to the value 220 over 3 seconds. 
		 *  oscillator.set({
		 *  	"frequency" : 220
		 *  }, 3);
		 *  @param {Object|string} params
		 *  @param {number=} value
		 *  @param {Tone.Time=} rampTime
		 *  @returns {Tone} `this`
		 */
		Tone.prototype.set = function(params, value, rampTime){
			if (typeof params === "object"){
				rampTime = value;
			} else if (typeof params === "string"){
				var tmpObj = {};
				tmpObj[params] = value;
				params = tmpObj;
			}
			for (var attr in params){
				var param = this[attr];
				if (isUndef(param)){
					continue;
				}
				value = params[attr];
				if (param instanceof Tone.Signal){
					if (param.value !== value){
						if (isUndef(rampTime)){
							param.value = value;
						} else {
							param.rampTo(value, rampTime);
						}
					}
				} else if (param instanceof AudioParam){
					if (param.value !== value){
						param.value = value;
					}				
				} else if (param instanceof Tone){
					param.set(value);
				} else if (param !== value){
					this[attr] = value;
				}
			}
			return this;
		};

		/**
		 *  Get the object's attributes. 
		 *  @example
		 *  osc.get();
		 *  //returns {"type" : "sine", "frequency" : 440, ...etc}
		 *  osc.get("type"); //returns { "type" : "sine"}
		 *  @param {Array=} params the parameters to get, otherwise will return 
		 *  					   all available.r
		 */
		Tone.prototype.get = function(params){
			if (isUndef(params)){
				params = this._collectDefaults(this.constructor);
			}
			var ret = {};
			for (var i = 0; i < params.length; i++){
				var attr = params[i];
				var param = this[attr];
				if (param instanceof Tone.Signal){
					ret[attr] = param.value;
				} else if (param instanceof AudioParam){
					ret[attr] = param.value;
				} else if (param instanceof Tone){
					ret[attr] = param.get();
				} else if (!isFunction(param) && !isUndef(param)){
					ret[attr] = param;
				} 
			}
			return ret;
		};

		/**
		 *  collect all of the default attributes in one
		 *  @private
		 *  @param {function} constr the constructor to find the defaults from
		 *  @return {Array} all of the attributes which belong to the class
		 */
		Tone.prototype._collectDefaults = function(constr){
			var ret = [];
			if (!isUndef(constr.defaults)){
				ret = Object.keys(constr.defaults);
			}
			if (!isUndef(constr._super)){
				ret = ret.concat(this._collectDefaults(constr._super));
			}
			return ret;
		};

		/**
		 *  Set the preset if it exists. 
		 *  @param {string} presetName the name of the preset
		 *  @returns {Tone} `this`
		 */
		Tone.prototype.setPreset = function(presetName){
			if (!this.isUndef(this.preset) && this.preset.hasOwnProperty(presetName)){
				this.set(this.preset[presetName]);
			}
			return this;
		};

		///////////////////////////////////////////////////////////////////////////
		//	CLASS VARS
		///////////////////////////////////////////////////////////////////////////

		/**
		 *  A static pointer to the audio context accessible as `Tone.context`. 
		 *  @type {AudioContext}
		 */
		Tone.context = audioContext;

		/**
		 *  The audio context.
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
		 *  disconnect and dispose
		 *  @returns {Tone} `this`
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
			return this;
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
		 *  @returns {Tone} `this`
		 */
		Tone.prototype.noGC = function(){
			this.output.connect(_silentNode);
			return this;
		};

		AudioNode.prototype.noGC = function(){
			this.connect(_silentNode);
			return this;
		};

		/**
		 *  connect the output of a ToneNode to an AudioParam, AudioNode, or ToneNode
		 *  @param  {Tone | AudioParam | AudioNode} unit 
		 *  @param {number} [outputNum=0] optionally which output to connect from
		 *  @param {number} [inputNum=0] optionally which input to connect to
		 *  @returns {Tone} `this`
		 */
		Tone.prototype.connect = function(unit, outputNum, inputNum){
			if (Array.isArray(this.output)){
				outputNum = this.defaultArg(outputNum, 0);
				this.output[outputNum].connect(unit, 0, inputNum);
			} else {
				this.output.connect(unit, outputNum, inputNum);
			}
			return this;
		};

		/**
		 *  disconnect the output
		 *  @returns {Tone} `this`
		 */
		Tone.prototype.disconnect = function(outputNum){
			if (Array.isArray(this.output)){
				outputNum = this.defaultArg(outputNum, 0);
				this.output[outputNum].disconnect();
			} else {
				this.output.disconnect();
			}
			return this;
		};

		/**
		 *  connect together all of the arguments in series
		 *  @param {...AudioParam|Tone|AudioNode}
		 *  @returns {Tone} `this`
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
			return this;
		};

		/**
		 *  fan out the connection from the first argument to the rest of the arguments
		 *  @param {...AudioParam|Tone|AudioNode}
		 *  @returns {Tone} `this`
		 */
		Tone.prototype.connectParallel = function(){
			var connectFrom = arguments[0];
			if (arguments.length > 1){
				for (var i = 1; i < arguments.length; i++){
					var connectTo = arguments[i];
					connectFrom.connect(connectTo);
				}
			}
			return this;
		};

		/**
		 *  Connect the output of this node to the rest of the nodes in series.
		 *  @example
		 *  //connect a node to an effect, panVol and then to the master output
		 *  node.chain(effect, panVol, Tone.Master);
		 *  @param {...AudioParam|Tone|AudioNode} nodes
		 *  @returns {Tone} `this`
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
			return this;
		};

		/**
		 *  connect the output of this node to the rest of the nodes in parallel.
		 *  @param {...AudioParam|Tone|AudioNode}
		 *  @returns {Tone} `this`
		 */
		Tone.prototype.fan = function(){
			if (arguments.length > 0){
				for (var i = 0; i < arguments.length; i++){
					this.connect(arguments[i]);
				}
			}
			return this;
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
		 *  test if the arg is a function
		 *  @param {*} arg the argument to test
		 *  @returns {boolean} true if the arg is a function
		 *  @function
		 */
		Tone.prototype.isFunction = isFunction;

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

		///////////////////////////////////////////////////////////////////////////
		// GAIN CONVERSIONS
		///////////////////////////////////////////////////////////////////////////

		/**
		 *  equal power gain scale
		 *  good for cross-fading
		 *  @param  {number} percent (0-1)
		 *  @return {number}         output gain (0-1)
		 */
		Tone.prototype.equalPowerScale = function(percent){
			var piFactor = 0.5 * Math.PI;
			return Math.sin(percent * piFactor);
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

		///////////////////////////////////////////////////////////////////////////
		// FREQUENCY CONVERSION
		///////////////////////////////////////////////////////////////////////////

		/**
		 *  true if the input is in the format number+hz
		 *  i.e.: 10hz
		 *
		 *  @param {number} freq 
		 *  @return {boolean} 
		 *  @function
		 */
		Tone.prototype.isFrequency = (function(){
			var freqFormat = new RegExp(/\d*\.?\d+hz$/i);
			return function(freq){
				return freqFormat.test(freq);
			};
		})();

		/**
		 *  Convert a frequency into seconds.
		 *  Accepts numbers and strings: i.e. `"10hz"` or 
		 *  `10` both return `0.1`. 
		 *  
		 *  @param  {number|string} freq 
		 *  @return {number}      
		 */
		Tone.prototype.frequencyToSeconds = function(freq){
			return 1 / parseFloat(freq);
		};

		/**
		 *  Convert a number in seconds to a frequency.
		 *  @param  {number} seconds 
		 *  @return {number}         
		 */
		Tone.prototype.secondsToFrequency = function(seconds){
			return 1/seconds;
		};

		///////////////////////////////////////////////////////////////////////////
		//	INHERITANCE
		///////////////////////////////////////////////////////////////////////////

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
			child._super = parent;
		};

		///////////////////////////////////////////////////////////////////////////
		//	CONTEXT
		///////////////////////////////////////////////////////////////////////////

		/**
		 *  array of callbacks to be invoked when a new context is added
		 *  @private 
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
		 *  Tone.js automatically creates a context on init, but if you are working
		 *  with other libraries which also create an AudioContext, it can be
		 *  useful to set your own. If you are going to set your own context, 
		 *  be sure to do it at the start of your code, before creating any objects.
		 *  @static
		 *  @param {AudioContext} ctx The new audio context to set
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
		 *  Bind this to a touchstart event to start the audio on mobile devices. 
		 *  <br>
		 *  http://stackoverflow.com/questions/12517000/no-sound-on-ios-6-web-audio-api/12569290#12569290
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

		console.log("%c * Tone.js r4 * ", "background: #000; color: #fff");

		return Tone;
	});

	ToneModule( function(Tone){

		

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
		 *  When signals connect to other signals or AudioParams, 
		 *  they take over the output value of that signal or AudioParam. 
		 *  For all other nodes, the behavior is the same as a normal `connect`. 
		 *
		 *  @override
		 *  @param {AudioParam|AudioNode|Tone.Signal|Tone} node 
		 *  @param {number} [outputNumber=0] 
		 *  @param {number} [inputNumber=0] 
		 *  @returns {Tone.SignalBase} `this`
		 */
		Tone.SignalBase.prototype.connect = function(node, outputNumber, inputNumber){
			//zero it out so that the signal can have full control
			if (node.constructor === Tone.Signal){
				//cancel changes
				node._value.cancelScheduledValues(0);
				//reset the value
				node._value.value = 0;
			} else if (node instanceof AudioParam){
				node.cancelScheduledValues(0);
				node.value = 0;
			} 
			Tone.prototype.connect.call(this, node, outputNumber, inputNumber);
			return this;
		};

		return Tone.SignalBase;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class Wraps the WaveShaperNode
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
		 *  @example
		 *  var timesTwo = new Tone.WaveShaper(function(val){
		 *  	return val * 2;
		 *  }, 2048);
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
				this.curve = mapping;
			} else if (isFinite(mapping) || this.isUndef(mapping)){
				this._curve = new Float32Array(this.defaultArg(mapping, 1024));
			} else if (this.isFunction(mapping)){
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
		 *  @returns {Tone.WaveShaper} `this`
		 */
		Tone.WaveShaper.prototype.setMap = function(mapping){
			for (var i = 0, len = this._curve.length; i < len; i++){
				var normalized = (i / (len)) * 2 - 1;
				this._curve[i] = mapping(normalized, i);
			}
			this._shaper.curve = this._curve;
			return this;
		};

		/**
		 * The array to set as the waveshaper curve
		 * @memberOf Tone.WaveShaper#
		 * @type {Array}
		 * @name curve
		 */
		Object.defineProperty(Tone.WaveShaper.prototype, "curve", {
			get : function(){
				return this._shaper.curve;
			},
			set : function(mapping){
				//fixes safari WaveShaperNode bug
				if (this._isSafari()){
					var first = mapping[0];
					mapping.unshift(first);	
				}
				this._curve = new Float32Array(mapping);
				this._shaper.curve = this._curve;
			}
		});

		/**
		 * The oversampling. Can either be "none", "2x" or "4x"
		 * @memberOf Tone.WaveShaper#
		 * @type {string}
		 * @name curve
		 */
		Object.defineProperty(Tone.WaveShaper.prototype, "oversample", {
			get : function(){
				return this._shaper.oversample;
			},
			set : function(oversampling){
				this._shaper.oversample = oversampling;
			}
		});

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
		 *  @returns {Tone.WaveShaper} `this`
		 */
		Tone.WaveShaper.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._shaper.disconnect();
			this._shaper = null;
			this._curve = null;
			return this;
		};

		return Tone.WaveShaper;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class  Constant audio-rate signal.
		 *          Tone.Signal is a core component which allows for sample-accurate 
		 *          synchronization of many components. Tone.Signal can be scheduled 
		 *          with all of the functions available to AudioParams
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number|AudioParam} [value=0] initial value or the AudioParam to control
		 *                                       note that the signal has no output
		 *                                       if an AudioParam is passed in.
		 *  @param {Tone.Signal.Unit} [units=Number] unit the units the signal is in
		 *  @example
		 *  var signal = new Tone.Signal(10);
		 */
		Tone.Signal = function(value, units){

			/**
			 * the units the signal is in
			 * @type {Tone.Signal.Type}
			 */
			this.units = this.defaultArg(units, Tone.Signal.Units.Number);

			/**
			 * The node where the constant signal value is scaled.
			 * @type {AudioParam}
			 * @private
			 */
			this.output = this._scaler = this.context.createGain();

			/**
			 * The node where the value is set.
			 * @type {AudioParam}
			 * @private
			 */
			this.input = this._value = this._scaler.gain;

			if (value instanceof AudioParam){
				this._scaler.connect(value);
				//zero out the value
				value.value = 0;
			} else {
				this.value = this.defaultArg(value, Tone.Signal.defaults.value);
			}

			//connect the constant 1 output to the node output
			Tone.Signal._constant.chain(this._scaler);
		};

		Tone.extend(Tone.Signal, Tone.SignalBase);

		/**
		 *  The default values
		 *  @type  {Object}
		 *  @static
		 *  @const
		 */
		Tone.Signal.defaults = {
			"value" : 0
		};

		/**
		 * The value of the signal. 
		 * @memberOf Tone.Signal#
		 * @type {Tone.Time|Tone.Frequency|number}
		 * @name value
		 */
		Object.defineProperty(Tone.Signal.prototype, "value", {
			get : function(){
				return this._toUnits(this._value.value);
			},
			set : function(value){
				var convertedVal = this._fromUnits(value);
				//is this what you want?
				this.cancelScheduledValues(0);
				this._value.value = convertedVal;
			}
		});

		/**
		 * @private
		 * @param  {Tone.Time|Tone.Volume|Tone.Frequency|number|undefined} val the value to convert
		 * @return {number}     the number which the value should be set to
		 */
		Tone.Signal.prototype._fromUnits = function(val){
			switch(this.units){
				case Tone.Signal.Units.Time: 
					return this.toSeconds(val);
				case Tone.Signal.Units.Frequency: 
					return this.toFrequency(val);
				case Tone.Signal.Units.Decibels: 
					return this.dbToGain(val);
				case Tone.Signal.Units.Normal: 
					return Math.min(Math.max(val, 0), 1);
				case Tone.Signal.Units.Audio: 
					return Math.min(Math.max(val, -1), 1);
				default:
					return val;
			}
		};

		/**
		 * convert to the desired units
		 * @private
		 * @param  {number} val the value to convert
		 * @return {number}
		 */
		Tone.Signal.prototype._toUnits = function(val){
			switch(this.units){
				case Tone.Signal.Units.Decibels: 
					return this.gainToDb(val);
				default:
					return val;
			}
		};

		/**
		 *  Schedules a parameter value change at the given time.
		 *  @param {number}		value 
		 *  @param {Tone.Time}  time 
		 *  @returns {Tone.Signal} `this`
		 */
		Tone.Signal.prototype.setValueAtTime = function(value, time){
			value = this._fromUnits(value);
			this._value.setValueAtTime(value, this.toSeconds(time));
			return this;
		};

		/**
		 *  Creates a schedule point with the current value at the current time.
		 *
		 *  @param {number=} now (optionally) pass the now value in
		 *  @returns {Tone.Signal} `this`
		 */
		Tone.Signal.prototype.setCurrentValueNow = function(now){
			now = this.defaultArg(now, this.now());
			var currentVal = this._value.value;
			this.cancelScheduledValues(now);
			this._value.setValueAtTime(currentVal, now);
			return this;
		};

		/**
		 *  Schedules a linear continuous change in parameter value from the 
		 *  previous scheduled parameter value to the given value.
		 *  
		 *  @param  {number} value   
		 *  @param  {Tone.Time} endTime 
		 *  @returns {Tone.Signal} `this`
		 */
		Tone.Signal.prototype.linearRampToValueAtTime = function(value, endTime){
			value = this._fromUnits(value);
			this._value.linearRampToValueAtTime(value, this.toSeconds(endTime));
			return this;
		};

		/**
		 *  Schedules an exponential continuous change in parameter value from 
		 *  the previous scheduled parameter value to the given value.
		 *  
		 *  @param  {number} value   
		 *  @param  {Tone.Time} endTime 
		 *  @returns {Tone.Signal} `this`
		 */
		Tone.Signal.prototype.exponentialRampToValueAtTime = function(value, endTime){
			value = this._fromUnits(value);
			//can't go below a certain value
			value = Math.max(0.00001, value);
			this._value.exponentialRampToValueAtTime(value, this.toSeconds(endTime));
			return this;
		};

		/**
		 *  Schedules an exponential continuous change in parameter value from 
		 *  the current time and current value to the given value.
		 *  
		 *  @param  {number} value   
		 *  @param  {Tone.Time} rampTime the time that it takes the 
		 *                               value to ramp from it's current value
		 *  @returns {Tone.Signal} `this`
		 *  @example
		 *  //exponentially ramp to the value 2 over 4 seconds. 
		 *  signal.exponentialRampToValueNow(2, 4);
		 */
		Tone.Signal.prototype.exponentialRampToValueNow = function(value, rampTime ){
			var now = this.now();
			this.setCurrentValueNow(now);
			this.exponentialRampToValueAtTime(value, now + this.toSeconds(rampTime ));
			return this;
		};

		/**
		 *  Schedules an linear continuous change in parameter value from 
		 *  the current time and current value to the given value at the given time.
		 *  
		 *  @param  {number} value   
		 *  @param  {Tone.Time} rampTime the time that it takes the 
		 *                               value to ramp from it's current value
		 *  @returns {Tone.Signal} `this`
		 *  @example
		 *  //linearly ramp to the value 4 over 3 seconds. 
		 *  signal.linearRampToValueNow(4, 3);
		 */
		Tone.Signal.prototype.linearRampToValueNow = function(value, rampTime){
			var now = this.now();
			this.setCurrentValueNow(now);
			this.linearRampToValueAtTime(value, now + this.toSeconds(rampTime));
			return this;
		};

		/**
		 *  Start exponentially approaching the target value at the given time with
		 *  a rate having the given time constant.
		 *  @param {number} value        
		 *  @param {Tone.Time} startTime    
		 *  @param {number} timeConstant 
		 *  @returns {Tone.Signal} `this`
		 */
		Tone.Signal.prototype.setTargetAtTime = function(value, startTime, timeConstant){
			value = this._fromUnits(value);
			this._value.setTargetAtTime(value, this.toSeconds(startTime), timeConstant);
			return this;
		};

		/**
		 *  Sets an array of arbitrary parameter values starting at the given time
		 *  for the given duration.
		 *  	
		 *  @param {Array<number>} values    
		 *  @param {Tone.Time} startTime 
		 *  @param {Tone.Time} duration  
		 *  @returns {Tone.Signal} `this`
		 */
		Tone.Signal.prototype.setValueCurveAtTime = function(values, startTime, duration){
			for (var i = 0; i < values.length; i++){
				values[i] = this._fromUnits(values[i]);
			}
			this._value.setValueCurveAtTime(values, this.toSeconds(startTime), this.toSeconds(duration));
			return this;
		};

		/**
		 *  Cancels all scheduled parameter changes with times greater than or 
		 *  equal to startTime.
		 *  
		 *  @param  {Tone.Time} startTime
		 *  @returns {Tone.Signal} `this`
		 */
		Tone.Signal.prototype.cancelScheduledValues = function(startTime){
			this._value.cancelScheduledValues(this.toSeconds(startTime));
			return this;
		};

		/**
		 *  Ramps to the given value over the duration of the rampTime. 
		 *  Automatically selects the best ramp type (exponential or linear)
		 *  depending on the `units` of the signal
		 *  
		 *  @param  {number} value   
		 *  @param  {Tone.Time} rampTime the time that it takes the 
		 *                               value to ramp from it's current value
		 *  @returns {Tone.Signal} `this`
		 *  @example
		 *  //ramp to the value either linearly or exponentially 
		 *  //depending on the "units" value of the signal
		 *  signal.rampTo(0, 10);
		 */
		Tone.Signal.prototype.rampTo = function(value, rampTime){
			rampTime = this.defaultArg(rampTime, 0);
			if (this.units === Tone.Signal.Units.Frequency || this.units === Tone.Signal.Units.BPM){
				this.exponentialRampToValueNow(value, rampTime);
			} else {
				this.linearRampToValueNow(value, rampTime);
			}
			return this;
		};

		/**
		 *  dispose and disconnect
		 *  @returns {Tone.Signal} `this`
		 */
		Tone.Signal.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._value = null;
			this._scaler = null;
			return this;
		};

		/**
		 * The units the Signal is in
		 * @enum {string}
		 */
		Tone.Signal.Units = {
			/** The default type. */
			Number : "number",
			/** Tone.Time will be converted into seconds. */
			Time : "time",
			/** Tone.Frequency will be converted into hertz. */
			Frequency : "frequency",
			/** A Gain value. */
			Gain : "gain",
			/** Within normal range [0,1]. */
			Normal : "normal",
			/** Within normal range [-1,1]. */
			Audio : "audio",
			/** In decibels. */
			Decibels : "db",
			/** In half-step increments, i.e. 12 is an octave above the root. */
			Interval : "interval",
			/** Beats per minute. */
			BPM : "bpm"
		};

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
	ToneModule( function(Tone){

		

		/**
		 *  @class Pow applies an exponent to the incoming signal. The incoming signal
		 *         must be in the range -1,1
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {number} exp the exponent to apply to the incoming signal, must be at least 2. 
		 *  @example
		 *  var pow = new Tone.Pow(2);
		 *  var sig = new Tone.Signal(0.5).connect(pow);
		 *  //output of pow is 0.25. 
		 */
		Tone.Pow = function(exp){

			/**
			 * the exponent
			 * @private
			 * @type {number}
			 */
			this._exp = this.defaultArg(exp, 1);

			/**
			 *  @type {WaveShaperNode}
			 *  @private
			 */
			this._expScaler = this.input = this.output = new Tone.WaveShaper(this._expFunc(this._exp), 8192);
		};

		Tone.extend(Tone.Pow, Tone.SignalBase);

		/**
		 * The value of the exponent
		 * @memberOf Tone.Pow#
		 * @type {number}
		 * @name value
		 */
		Object.defineProperty(Tone.Pow.prototype, "value", {
			get : function(){
				return this._exp;
			},
			set : function(exp){
				this._exp = exp;
				this._expScaler.setMap(this._expFunc(this._exp));
			}
		});


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
		 *  @returns {Tone.Pow} `this`
		 */
		Tone.Pow.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._expScaler.dispose();
			this._expScaler = null;
			return this;
		};

		return Tone.Pow;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class  ADSR envelope generator attaches to an AudioParam or Signal. 
		 *
		 *  @constructor
		 *  @extends {Tone}
		 *  @param {Tone.Time|Object} [attack=0.01]	the attack time in seconds
		 *  @param {Tone.Time} [decay=0.1]	the decay time in seconds
		 *  @param {number} [sustain=0.5] 	a percentage (0-1) of the full amplitude
		 *  @param {Tone.Time} [release=1]	the release time in seconds
		 *  @example
		 *  var gainNode = Tone.context.createGain();
		 *  var env = new Tone.Envelope({
		 *  	"attack" : 0.1,
		 *  	"decay" : 0.2,
		 *  	"sustain" : 1,
		 *  	"release" : 0.8,
		 *  });
		 *  env.connect(gainNode.gain);
		 */
		Tone.Envelope = function(){

			//get all of the defaults
			var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);

			/** 
			 *  The attack time
			 *  @type {Tone.Time}
			 */
			this.attack = options.attack;

			/**
			 *  The decay time
			 *  @type {Tone.Time}
			 */
			this.decay = options.decay;
			
			/**
			 *  the sustain is a value between 0-1
			 *  @type {number}
			 */
			this.sustain = options.sustain;

			/**
			 *  The release time
			 *  @type {Tone.Time}
			 */
			this.release = options.release;

			/**
			 *  the signal
			 *  @type {Tone.Signal}
			 *  @private
			 */
			this._sig = this.output = new Tone.Signal(0);
		};

		Tone.extend(Tone.Envelope);

		/**
		 *  the default parameters
		 *  @static
		 *  @const
		 */
		Tone.Envelope.defaults = {
			"attack" : 0.01,
			"decay" : 0.1,
			"sustain" : 0.5,
			"release" : 1,
		};

		/**
		 *  the envelope time multipler
		 *  @type {number}
		 *  @private
		 */
		Tone.Envelope.prototype._timeMult = 0.25;

		/**
		 *  Trigger the attack/decay portion of the ADSR envelope. 
		 *  @param  {Tone.Time} [time=now]
		 *  @param {number} [velocity=1] the velocity of the envelope scales the vales.
		 *                               number between 0-1
		 *  @returns {Tone.Envelope} `this`
		 *  @example
		 *  //trigger the attack 0.5 seconds from now with a velocity of 0.2
		 *  env.triggerAttack("+0.5", 0.2);
		 */
		Tone.Envelope.prototype.triggerAttack = function(time, velocity){
			velocity = this.defaultArg(velocity, 1);
			var attack = this.toSeconds(this.attack);
			var decay = this.toSeconds(this.decay);
			var scaledMax = velocity;
			var sustainVal = this.sustain * scaledMax;
			time = this.toSeconds(time);
			this._sig.cancelScheduledValues(time);
			this._sig.setTargetAtTime(scaledMax, time, attack * this._timeMult);
			this._sig.setTargetAtTime(sustainVal, time + attack, decay * this._timeMult);	
			return this;
		};
		
		/**
		 *  Triggers the release of the envelope.
		 *  @param  {Tone.Time} [time=now]
		 *  @returns {Tone.Envelope} `this`
		 *  @example
		 *  //trigger release immediately
		 *  env.triggerRelease();
		 */
		Tone.Envelope.prototype.triggerRelease = function(time){
			time = this.toSeconds(time);
			this._sig.cancelScheduledValues(time);
			var release = this.toSeconds(this.release);
			this._sig.setTargetAtTime(0, time, release * this._timeMult);
			return this;
		};

		/**
		 *  Trigger the attack and release after a sustain time
		 *  @param {Tone.Time} duration the duration of the note
		 *  @param {Tone.Time} [time=now] the time of the attack
		 *  @param {number} [velocity=1] the velocity of the note
		 *  @returns {Tone.Envelope} `this`
		 *  @example
		 *  //trigger the attack and then the release after 0.6 seconds.
		 *  env.triggerAttackRelease(0.6);
		 */
		Tone.Envelope.prototype.triggerAttackRelease = function(duration, time, velocity) {
			time = this.toSeconds(time);
			this.triggerAttack(time, velocity);
			this.triggerRelease(time + this.toSeconds(duration));
			return this;
		};

		/**
		 *  Borrows the connect method from {@link Tone.Signal}
		 *  @function
		 */
		Tone.Envelope.prototype.connect = Tone.Signal.prototype.connect;

		/**
		 *  disconnect and dispose
		 *  @returns {Tone.Envelope} `this`
		 */
		Tone.Envelope.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._sig.dispose();
			this._sig = null;
			return this;
		};

		return Tone.Envelope;
	});

	ToneModule( function(Tone){

		

		/**
		 *  @class  An Envelope connected to a gain node which can be used as an amplitude envelope.
		 *  
		 *  @constructor
		 *  @extends {Tone.Envelope}
		 *  @param {Tone.Time|Object} [attack=0.01]	the attack time in seconds
		 *  @param {Tone.Time} [decay=0.1]	the decay time in seconds
		 *  @param {number} [sustain=0.5] 	a percentage (0-1) of the full amplitude
		 *  @param {Tone.Time} [release=1]	the release time in seconds
		 *  @example
		 *  
		 *  var ampEnv = new Tone.AmplitudeEnvelope(0.1, 0.2, 1, 0.8);
		 *  var osc = new Tone.Oscillator();
		 *  //or with an object
		 *  osc.chain(ampEnv, Tone.Master);
		 */
		Tone.AmplitudeEnvelope = function(){

			Tone.Envelope.apply(this, arguments);

			/**
			 *  the input node
			 *  @type {GainNode}
			 *  @private
			 */
			this.input = this.output = this.context.createGain();

			this._sig.connect(this.output.gain);
		};

		Tone.extend(Tone.AmplitudeEnvelope, Tone.Envelope);

		return Tone.AmplitudeEnvelope;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class A thin wrapper around the DynamicsCompressorNode
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @param {number} [threshold=-24] threshold in decibels
		 *  @param {number} [ratio=12] gain reduction ratio
		 *  @example
		 *  var comp = new Tone.Compressor(-30, 3);
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
			 *  the input and output
			 */
			this.input = this.output = this._compressor;

			/**
			 *  the threshold vaue
			 *  @type {AudioParam}
			 */
			this.threshold = this._compressor.threshold;

			/**
			 *  The attack parameter
			 *  @type {Tone.Signal}
			 */
			this.attack = new Tone.Signal(this._compressor.attack, Tone.Signal.Units.Time);

			/**
			 *  The release parameter
			 *  @type {Tone.Signal}
			 */
			this.release = new Tone.Signal(this._compressor.release, Tone.Signal.Units.Time);

			/**
			 *  The knee parameter
			 *  @type {AudioParam}
			 */
			this.knee = this._compressor.knee;

			/**
			 *  The ratio value
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
		 *  clean up
		 *  @returns {Tone.Compressor} `this`
		 */
		Tone.Compressor.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._compressor.disconnect();
			this._compressor = null;
			this.attack.dispose();
			this.attack = null;
			this.release.dispose();
			this.release = null;
			this.threshold = null;
			this.ratio = null;
			this.knee = null;
			return this;
		};

		return Tone.Compressor;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class Add a signal and a number or two signals. <br><br>
		 *         input 0: augend. input 1: addend. <br><br>
		 *         Add can be used in two ways, either constructed with a value,
		 *         or constructed with no initial value and with signals connected
		 *         to each of its two inputs. 
		 *
		 *  @constructor
		 *  @extends {Tone.Signal}
		 *  @param {number=} value if no value is provided, Tone.Add will sum the first
		 *                         and second inputs. 
		 *  @example
		 *  var signal = new Tone.Signal(2);
		 *  var add = new Tone.Add(2);
		 *  signal.connect(add);
		 *  //the output of add equals 4
		 *
		 *  //if constructed with no arguments
		 *  //it will add the first and second inputs
		 *  var add = new Tone.Add();
		 *  var sig0 = new Tone.Signal(3).connect(add, 0, 0);
		 *  var sig1 = new Tone.Signal(4).connect(add, 0, 1);
		 *  //the output of add equals 7. 
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
			this._value = this.input[1] = new Tone.Signal(value);

			this._value.connect(this._sum);
		};

		Tone.extend(Tone.Add, Tone.Signal);
		
		/**
		 *  dispose method
		 *  @returns {Tone.Add} `this`
		 */
		Tone.Add.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._sum.disconnect();
			this._sum = null;
			this._value.dispose();
			this._value = null;
			return this;
		}; 

		return Tone.Add;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class  Multiply the incoming signal by a number or Multiply two signals.
		 *          input 0: multiplicand.
		 *          input 1: multiplier.
		 *
		 *  @constructor
		 *  @extends {Tone.Signal}
		 *  @param {number=} value constant value to multiple. if no value is provided
		 *                         it will be multiplied by the value of input 1.
		 *  @example
		 *  var mult = new Tone.Multiply(3);
		 *  var sig = new Tone.Signal(2).connect(mult);
		 *  //output of mult is 6. 
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
			this._value = this.input[1] = this.output.gain;
			
			this._value.value = this.defaultArg(value, 0);
		};

		Tone.extend(Tone.Multiply, Tone.Signal);

		/**
		 *  clean up
		 *  @returns {Tone.Multiply} `this`
		 */
		Tone.Multiply.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._mult = null;
			this._value = null;
			return this;
		}; 

		return Tone.Multiply;
	});

	ToneModule( function(Tone){

		

		/**
		 *  @class Negate the incoming signal. i.e. an input signal of 10 will output -10
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @example
		 *  var neg = new Tone.Negate();
		 *  var sig = new Tone.Signal(-2).connect(neg);
		 *  //output of neg is positive 2. 
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
		 *  @returns {Tone.Negate} `this`
		 */
		Tone.Negate.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._multiply.dispose();
			this._multiply = null;
			return this;
		}; 

		return Tone.Negate;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class Subtract a signal and a number or two signals. 
		 *         input 0 : minuend.
		 *         input 1 : subtrahend
		 *
		 *  @extends {Tone.Signal}
		 *  @constructor
		 *  @param {number=} value value to subtract from the incoming signal. If the value
		 *                         is omitted, it will subtract the second signal from the first
		 *  @example
		 *  var sub = new Tone.Subtract(1);
		 *  var sig = new Tone.Signal(4).connect(sub);
		 *  //the output of sub is 3. 
		 */
		Tone.Subtract = function(value){

			Tone.call(this, 2, 0);

			/**
			 *  the summing node
			 *  @type {GainNode}
			 *  @private
			 */
			this._sum = this.input[0] = this.output = this.context.createGain();

			/**
			 *  negate the input of the second input before connecting it
			 *  to the summing node.
			 *  @type {Tone.Negate}
			 *  @private
			 */
			this._neg = new Tone.Negate();

			/**
			 *  the node where the value is set
			 *  @private
			 *  @type {Tone.Signal}
			 */
			this._value = this.input[1] = new Tone.Signal(value);

			this._value.chain(this._neg, this._sum);
		};

		Tone.extend(Tone.Subtract, Tone.Signal);

		/**
		 *  clean up
		 *  @returns {Tone.SignalBase} `this`
		 */
		Tone.Subtract.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._neg.dispose();
			this._neg = null;
			this._sum.disconnect();
			this._sum = null;
			this._value.dispose();
			this._value = null;
			return this;
		};

		return Tone.Subtract;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class  GreaterThanZero outputs 1 when the input is strictly greater than zero
		 *  
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @example
		 *  var gt0 = new Tone.GreaterThanZero();
		 *  var sig = new Tone.Signal(0.01).connect(gt0);
		 *  //the output of gt0 is 1. 
		 *  sig.value = 0;
		 *  //the output of gt0 is 0. 
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
		 *  @returns {Tone.GreaterThanZero} `this`
		 */
		Tone.GreaterThanZero.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._scale.dispose();
			this._scale = null;
			this._thresh.dispose();
			this._thresh = null;
			return this;
		};

		return Tone.GreaterThanZero;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class  EqualZero outputs 1 when the input is strictly greater than zero
		 *  
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @example
		 *  var eq0 = new Tone.EqualZero();
		 *  var sig = new Tone.Signal(0).connect(eq0);
		 *  //the output of eq0 is 1. 
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
		 *  @returns {Tone.EqualZero} `this`
		 */
		Tone.EqualZero.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._gtz.dispose();
			this._gtz = null;
			this._scale.dispose();
			this._scale = null;
			this._thresh.dispose();
			this._thresh = null;
			return this;
		};

		return Tone.EqualZero;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class  Output 1 if the signal is equal to the value, otherwise outputs 0. 
		 *          Can accept two signals if connected to inputs 0 and 1.
		 *  
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} value the number to compare the incoming signal to
		 *  @example
		 *  var eq = new Tone.Equal(3);
		 *  var sig = new Tone.Signal(3).connect(eq);
		 *  //the output of eq is 1. 
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
		 * The value to compare to the incoming signal.
		 * @memberOf Tone.Equal#
		 * @type {number}
		 * @name value
		 */
		Object.defineProperty(Tone.Equal.prototype, "value", {
			get : function(){
				return this._sub.value;
			},
			set : function(value){
				this._sub.value = value;
			}
		});

		/**
		 *  dispose method
		 *  @returns {Tone.Equal} `this`
		 */
		Tone.Equal.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._equals.disconnect();
			this._equals = null;
			this._sub.dispose();
			this._sub = null;
			return this;
		};

		return Tone.Equal;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class Select between any number of inputs, sending the one 
		 *         selected by the gate signal to the output
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} [sourceCount=2] the number of inputs the switch accepts
		 *  @example
		 *  var sel = new Tone.Select(2);
		 *  var sigA = new Tone.Signal(10).connect(sel, 0, 0);
		 *  var sigB = new Tone.Signal(20).connect(sel, 0, 1);
		 *  sel.gate.value = 0;
		 *  //sel outputs 10 (the value of sigA);
		 *  sel.gate.value = 1;
		 *  //sel outputs 20 (the value of sigB);
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
		 *  @param {number} which open one of the gates (closes the other)
		 *  @param {Tone.Time=} time the time when the switch will open
		 *  @returns {Tone.Select} `this`
		 *  @example
		 *  //open input 1 in a half second from now
		 *  sel.select(1, "+0.5");
		 */
		Tone.Select.prototype.select = function(which, time){
			//make sure it's an integer
			which = Math.floor(which);
			this.gate.setValueAtTime(which, this.toSeconds(time));
			return this;
		};

		/**
		 *  dispose method
		 *  @returns {Tone.Select} `this`
		 */
		Tone.Select.prototype.dispose = function(){
			this.gate.dispose();
			for (var i = 0; i < this.input.length; i++){
				this.input[i].dispose();
				this.input[i] = null;
			}
			Tone.prototype.dispose.call(this);
			this.gate = null;
			return this;
		}; 

		////////////START HELPER////////////

		/**
		 *  helper class for Tone.Select representing a single gate
		 *  @constructor
		 *  @extends {Tone}
		 *  @private
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
	ToneModule( function(Tone){

		

		/**
		 *  @class IfThenElse has three inputs. When the first input (if) is true (i.e. === 1), 
		 *         then it will pass the second input (then) through to the output, otherwise, 
		 *         if it's not true (i.e. === 0) then it will pass the third input (else) 
		 *         through to the output. 
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @example
		 *  var ifThenElse = new Tone.IfThenElse();
		 *  var ifSignal = new Tone.Signal(1).connect(ifThenElse, 0, 0);
		 *  var thenSignal = new Tone.PWMOscillator().connect(ifThenElse, 0, 1);
		 *  var elseSignal = new Tone.PulseOscillator().connect(ifThenElse, 0, 2);
		 *  //ifThenElse outputs thenSignal
		 *  signal.value = 0;
		 *  //now ifThenElse outputs elseSignal
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
		 *  @returns {Tone.IfThenElse} `this`
		 */
		Tone.IfThenElse.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._selector.dispose();
			this._selector = null;
			this.if = null;
			this.then = null;
			this.else = null;
			return this;
		};

		return Tone.IfThenElse;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class OR the inputs together. True if at least one of the inputs is true. 
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @example
		 *  var or = new Tone.OR(2);
		 *  var sigA = new Tone.Signal(0)connect(or, 0, 0);
		 *  var sigB = new Tone.Signal(1)connect(or, 0, 1);
		 *  //output of or is 1 because at least
		 *  //one of the inputs is equal to 1. 
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
			 *  @private
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
		 *  @returns {Tone.OR} `this`
		 */
		Tone.OR.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._gtz.dispose();
			this._gtz = null;
			this._sum.disconnect();
			this._sum = null;
			return this;
		};

		return Tone.OR;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class and returns 1 when all the inputs are equal to 1
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {number} [inputCount=2] the number of inputs. NOTE: all inputs are
		 *                                 connected to the single AND input node
		 *  @example
		 *  var and = new Tone.AND(2);
		 *  var sigA = new Tone.Signal(0).connect(and, 0, 0);
		 *  var sigB = new Tone.Signal(1).connect(and, 0, 1);
		 *  //the output of and is 0. 
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
		 *  clean up
		 *  @returns {Tone.AND} `this`
		 */
		Tone.AND.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._equals.dispose();
			this._equals = null;
			return this;
		};

		return Tone.AND;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class  Just an alias for EqualZero. but has the same effect as a NOT operator. 
		 *          Outputs 1 when input equals 0. 
		 *  
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @example
		 *  var not = new Tone.NOT();
		 *  var sig = new Tone.Signal(1).connect(not);
		 *  //output of not equals 0. 
		 *  sig.value = 0;
		 *  //output of not equals 1.
		 */
		Tone.NOT = Tone.EqualZero;

		return Tone.NOT;
	});
	ToneModule( 
		function(Tone){

		

		/**
		 *  @class  Output 1 if the signal is greater than the value, otherwise outputs 0.
		 *          can compare two signals or a signal and a number. 
		 *  
		 *  @constructor
		 *  @extends {Tone.Signal}
		 *  @param {number} [value=0] the value to compare to the incoming signal
		 *  @example
		 *  var gt = new Tone.GreaterThan(2);
		 *  var sig = new Tone.Signal(4).connect(gt);
		 *  //output of gt is equal 1. 
		 */
		Tone.GreaterThan = function(value){

			Tone.call(this, 2, 0);
			
			/**
			 *  subtract the amount from the incoming signal
			 *  @type {Tone.Subtract}
			 *  @private
			 */
			this._value = this.input[0] = new Tone.Subtract(value);
			this.input[1] = this._value.input[1];

			/**
			 *  compare that amount to zero
			 *  @type {Tone.GreaterThanZero}
			 *  @private
			 */
			this._gtz = this.output = new Tone.GreaterThanZero();

			//connect
			this._value.connect(this._gtz);
		};

		Tone.extend(Tone.GreaterThan, Tone.Signal);

		/**
		 *  dispose method
		 *  @returns {Tone.GreaterThan} `this`
		 */
		Tone.GreaterThan.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._value.dispose();
			this._value = null;
			this._gtz.dispose();
			this._gtz = null;
			return this;
		};

		return Tone.GreaterThan;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class  Output 1 if the signal is less than the value, otherwise outputs 0.
		 *          Can compare two signals or a signal and a number. <br><br>
		 *          input 0: left hand side of comparison.<br><br>
		 *          input 1: right hand side of comparison.
		 *  
		 *  @constructor
		 *  @extends {Tone.Signal}
		 *  @param {number} [value=0] the value to compare to the incoming signal
		 *  @example
		 *  var lt = new Tone.LessThan(2);
		 *  var sig = new Tone.Signal(-1).connect(lt);
		 *  //lt outputs 1 because sig < 2
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
			this._gt = this.output = new Tone.GreaterThan();

			/**
			 *  negate the signal coming from the second input
			 *  @private
			 *  @type {Tone.Negate}
			 */
			this._rhNeg = new Tone.Negate();

			/**
			 *  the node where the value is set
			 *  @private
			 *  @type {Tone.Signal}
			 */
			this._value = this.input[1] = new Tone.Signal(value);

			//connect
			this._neg.connect(this._gt);
			this._value.connect(this._rhNeg);	
			this._rhNeg.connect(this._gt, 0, 1);
		};

		Tone.extend(Tone.LessThan, Tone.Signal);

		/**
		 *  dispose method
		 *  @returns {Tone.LessThan} `this`
		 */
		Tone.LessThan.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._neg.dispose();
			this._neg = null;
			this._gt.dispose();
			this._gt = null;
			this._rhNeg.dispose();
			this._rhNeg = null;
			this._value.dispose();
			this._value = null;
			return this;
		};

		return Tone.LessThan;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class return the absolute value of an incoming signal
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @example
		 *  var signal = new Tone.Signal(-1);
		 *  var abs = new Tone.Abs();
		 *  signal.connect(abs);
		 *  //the output of abs is 1. 
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
		 *  @returns {Tone.Abs} `this`
		 */
		Tone.Abs.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._switch.dispose();
			this._switch = null;
			this._ltz.dispose();
			this._ltz = null;
			this._negate.dispose();
			this._negate = null;
			return this;
		}; 

		return Tone.Abs;
	});
	ToneModule( function(Tone){

		

		/**
		 * 	@class  outputs the greater of two signals. If a number is provided in the constructor
		 * 	        it will use that instead of the signal. 
		 * 	
		 *  @constructor
		 *  @extends {Tone.Signal}
		 *  @param {number=} max max value if provided. if not provided, it will use the
		 *                       signal value from input 1. 
		 *  @example
		 *  var max = new Tone.Max(2);
		 *  var sig = new Tone.Signal(3).connect(max);
		 *  //max outputs 3
		 *  sig.value = 1;
		 *  //max outputs 2
		 */
		Tone.Max = function(max){

			Tone.call(this, 2, 0);
			this.input[0] = this.context.createGain();

			/**
			 *  the max signal
			 *  @type {Tone.Signal}
			 *  @private
			 */
			this._value = this.input[1] = new Tone.Signal(max);

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
			this._value.connect(this._ifThenElse.else);
			this._value.connect(this._gt, 0, 1);
		};

		Tone.extend(Tone.Max, Tone.Signal);

		/**
		 *  clean up
		 *  @returns {Tone.Max} `this`
		 */
		Tone.Max.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._value.dispose();
			this._ifThenElse.dispose();
			this._gt.dispose();
			this._value = null;
			this._ifThenElse = null;
			this._gt = null;
			return this;
		};

		return Tone.Max;
	});
	ToneModule( function(Tone){

		

		/**
		 * 	@class  Outputs the lesser of two signals. If a number is given 
		 * 	        in the constructor, it will use a signal and a number. 
		 * 	
		 *  @constructor
		 *  @extends {Tone.Signal}
		 *  @param {number} min the minimum to compare to the incoming signal
		 *  @example
		 *  var min = new Tone.Min(2);
		 *  var sig = new Tone.Signal(3).connect(min);
		 *  //min outputs 2
		 *  sig.value = 1;
		 *  //min outputs 1
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
			this._value = this.input[1] = new Tone.Signal(min);

			//connections
			this.input[0].chain(this._lt, this._ifThenElse.if);
			this.input[0].connect(this._ifThenElse.then);
			this._value.connect(this._ifThenElse.else);
			this._value.connect(this._lt, 0, 1);
		};

		Tone.extend(Tone.Min, Tone.Signal);

		/**
		 *  clean up
		 *  @returns {Tone.Min} `this`
		 */
		Tone.Min.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._value.dispose();
			this._ifThenElse.dispose();
			this._lt.dispose();
			this._value = null;
			this._ifThenElse = null;
			this._lt = null;
			return this;
		};

		return Tone.Min;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class Signal-rate modulo operator. Only works in audio range [-1, 1] and for modulus
		 *         values less than 1. 
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} modulus the modulus to apply
		 *  @example
		 *  var mod = new Tone.Modulo(0.2)
		 *  var sig = new Tone.Signal(0.5).connect(mod);
		 *  //mod outputs 0.1
		 */
		Tone.Modulo = function(modulus){

			Tone.call(this, 1, 1);

			/**
			 *  A waveshaper gets the integer multiple of 
			 *  the input signal and the modulus.
			 *  @private
			 *  @type {Tone.WaveShaper}
			 */
			this._shaper = new Tone.WaveShaper(Math.pow(2, 16));

			/**
			 *  the integer multiple is multiplied by the modulus
			 *  @type  {Tone.Multiply}
			 *  @private
			 */
			this._multiply = new Tone.Multiply();

			/**
			 *  and subtracted from the input signal
			 *  @type  {Tone.Subtract}
			 *  @private
			 */
			this._subtract = this.output = new Tone.Subtract();

			/**
			 *  the modulus signal
			 *  @type  {Tone.Signal}
			 *  @private
			 */
			this._modSignal = new Tone.Signal(modulus);

			//connections
			this.input.fan(this._shaper, this._subtract);
			this._modSignal.connect(this._multiply, 0, 0);
			this._shaper.connect(this._multiply, 0, 1);
			this._multiply.connect(this._subtract, 0, 1);
			this._setWaveShaper(modulus);
		};

		Tone.extend(Tone.Modulo, Tone.SignalBase);

		/**
		 *  @param  {number}  mod  the modulus to apply
		 *  @private
		 */
		Tone.Modulo.prototype._setWaveShaper = function(mod){
			this._shaper.setMap(function(val){
				var multiple = Math.floor((val + 0.0001) / mod);
				return multiple;
			});
		};

		/**
		 * The modulus value.
		 * @memberOf Tone.Modulo#
		 * @type {number}
		 * @name value
		 */
		Object.defineProperty(Tone.Modulo.prototype, "value", {
			get : function(){
				return this._modSignal.value;
			},
			set : function(mod){
				this._modSignal.value = mod;
				this._setWaveShaper(mod);
			}
		});

		/**
		 * clean up
		 *  @returns {Tone.Modulo} `this`
		 */
		Tone.Modulo.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._shaper.dispose();
			this._shaper = null;
			this._multiply.dispose();
			this._multiply = null;
			this._subtract.dispose();
			this._subtract = null;
			this._modSignal.dispose();
			this._modSignal = null;
			return this;
		};

		return Tone.Modulo;
	});
	ToneModule( 
		function(Tone){

		

		/**
		 *  @class evaluate an expression at audio rate. 
		 *         parsing code modified from https://code.google.com/p/tapdigit/
		 *         Copyright 2011 2012 Ariya Hidayat, New BSD License
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {string} expr the expression to generate
		 *  @example
		 *  //adds the signals from input 0 and input 1.
		 *  var expr = new Tone.Expr("$0 + $1");
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
			 *  The inputs. The length is determined by the expression. 
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
			 *  The output node is the result of the expression
			 *  @type {Tone}
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
				"mod" : {
					regexp : /^mod/,
					method : function(args, self){
						var modulus = literalNumber(args[1]);
						var op = new Tone.Modulo(modulus);
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
				if (this.isFunction(node.dispose)) {
					node.dispose();
				} else if (this.isFunction(node.disconnect)) {
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
	ToneModule( function(Tone){

		

		/**
		 *  @class Convert an incoming signal between 0, 1 to an equal power gain scale.
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @example
		 *  var eqPowGain = new Tone.EqualPowerGain();
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
					return this.equalPowerScale(val);
				}
			}.bind(this), 4096);
		};

		Tone.extend(Tone.EqualPowerGain, Tone.SignalBase);

		/**
		 *  clean up
		 *  @returns {Tone.EqualPowerGain} `this`
		 */
		Tone.EqualPowerGain.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._eqPower.dispose();
			this._eqPower = null;
			return this;
		};

		return Tone.EqualPowerGain;
	});
	ToneModule( function(Tone){

		

		/**
		 * @class  Equal power fading control values:<br>
		 * 	       0 = 100% input 0<br>
		 * 	       1 = 100% input 1<br>
		 *
		 * @constructor
		 * @extends {Tone}
		 * @param {number} [initialFade=0.5]
		 * @example
		 * var crossFade = new Tone.CrossFade(0.5);
		 * effectA.connect(crossFade, 0, 0);
		 * effectB.connect(crossFade, 0, 1);
		 * crossFade.fade.value = 0;
		 * // ^ only effectA is output
		 * crossFade.fade.value = 1;
		 * // ^ only effectB is output
		 * crossFade.fade.value = 0.5;
		 * // ^ the two signals are mixed equally. 
		 */		
		Tone.CrossFade = function(initialFade){

			Tone.call(this, 2, 1);

			/**
			 *  the first input. input "a".
			 *  @type {GainNode}
			 */
			this.a = this.input[0] = this.context.createGain();

			/**
			 *  the second input. input "b"
			 *  @type {GainNode}
			 */
			this.b = this.input[1] = this.context.createGain();

			/**
			 *  0 is 100% signal `a` (input 0) and 1 is 100% signal `b` (input 1).
			 *  Values between 0-1.
			 *  
			 *  @type {Tone.Signal}
			 */
			this.fade = new Tone.Signal(this.defaultArg(initialFade, 0.5), Tone.Signal.Units.Normal);

			/**
			 *  equal power gain cross fade
			 *  @private
			 *  @type {Tone.EqualPowerGain}
			 */
			this._equalPowerA = new Tone.EqualPowerGain();

			/**
			 *  equal power gain cross fade
			 *  @private
			 *  @type {Tone.EqualPowerGain}
			 */
			this._equalPowerB = new Tone.EqualPowerGain();
			
			/**
			 *  invert the incoming signal
			 *  @private
			 *  @type {Tone}
			 */
			this._invert = new Tone.Expr("1 - $0");

			//connections
			this.a.connect(this.output);
			this.b.connect(this.output);
			this.fade.chain(this._equalPowerB, this.b.gain);
			this.fade.chain(this._invert, this._equalPowerA, this.a.gain);
		};

		Tone.extend(Tone.CrossFade);

		/**
		 *  clean up
		 *  @returns {Tone.CrossFade} `this`
		 */
		Tone.CrossFade.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._equalPowerA.dispose();
			this._equalPowerA = null;
			this._equalPowerB.dispose();
			this._equalPowerB = null;
			this.fade.dispose();
			this.fade = null;
			this._invert.dispose();
			this._invert = null;
			this.a.disconnect();
			this.a = null;
			this.b.disconnect();
			this.b = null;
			return this;
		};

		return Tone.CrossFade;
	});

	ToneModule( function(Tone){

		

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
		 *  @example
		 *  var filter = new Tone.Filter(200, "highpass");
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
			this.frequency = new Tone.Signal(options.frequency, Tone.Signal.Units.Frequency);

			/**
			 *  the detune parameter
			 *  @type {Tone.Signal}
			 */
			this.detune = new Tone.Signal(0);

			/**
			 *  the gain of the filter, only used in certain filter types
			 *  @type {AudioParam}
			 */
			this.gain = new Tone.Signal(options.gain, Tone.Signal.Units.Decibels);

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

			/**
			 *  the rolloff value of the filter
			 *  @type {number}
			 *  @private
			 */
			this._rolloff = options.rolloff;

			//set the rolloff;
			this.rolloff = options.rolloff;
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
		 * The type of the filter. Types: "lowpass", "highpass", 
		 * "bandpass", "lowshelf", "highshelf", "notch", "allpass", or "peaking". 
		 * @memberOf Tone.Filter#
		 * @type {string}
		 * @name type
		 */
		Object.defineProperty(Tone.Filter.prototype, "type", {
			get : function(){
				return this._type;
			},
			set : function(type){
				var types = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
				if (types.indexOf(type)=== -1){
					throw new TypeError("Tone.Filter does not have filter type "+type);
				}
				this._type = type;
				for (var i = 0; i < this._filters.length; i++){
					this._filters[i].type = type;
				}
			}
		});

		/**
		 * The rolloff of the filter which is the drop in db
		 * per octave. Implemented internally by cascading filters.
		 * Only accepts the values -12, -24, and -48.
		 * @memberOf Tone.Filter#
		 * @type {number}
		 * @name rolloff
		 */
		Object.defineProperty(Tone.Filter.prototype, "rolloff", {
			get : function(){
				return this._rolloff;
			},
			set : function(rolloff){
				var cascadingCount = Math.log(rolloff / -12) / Math.LN2 + 1;
				//check the rolloff is valid
				if (cascadingCount % 1 !== 0){
					throw new RangeError("Filter rolloff can only be -12, -24, or -48");
				}
				this._rolloff = rolloff;
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
			}
		});

		/**
		 *  clean up
		 *  @return {Tone.Filter} `this`
		 */
		Tone.Filter.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			for (var i = 0; i < this._filters.length; i++) {
				this._filters[i].disconnect();
				this._filters[i] = null;
			}
			this._filters = null;
			this.frequency.dispose();
			this.Q.dispose();
			this.frequency = null;
			this.Q = null;
			this.detune.dispose();
			this.detune = null;
			this.gain.dispose();
			this.gain = null;
			return this;
		};

		return Tone.Filter;
	});
	ToneModule( function(Tone){

		

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
			 *  @private
			 */
			this.input = this.context.createGain();

			/**
			 *  the outputs
			 *  @type {Array}
			 *  @private
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
		 *  @returns {Tone.MultibandSplit} `this`
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
			return this;
		};

		return Tone.MultibandSplit;
	});
	ToneModule( function(Tone){

		

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
		 *  @example
		 *  var eq = new Tone.EQ(-10, 3, -20);
		 */
		Tone.EQ = function(){

			var options = this.optionsObject(arguments, ["low", "mid", "high"], Tone.EQ.defaults);

			/**
			 *  the output node
			 *  @type {GainNode}
			 *  @private
			 */
			this.output = this.context.createGain();

			/**
			 *  the multiband split
			 *  @type {Tone.MultibandSplit}
			 *  @private
			 */
			this._multibandSplit = this.input = new Tone.MultibandSplit({
				"lowFrequency" : options.lowFrequency,
				"highFrequency" : options.highFrequency
			});

			/**
			 *  the low gain
			 *  @type {GainNode}
			 *  @private
			 */
			this._lowGain = this.context.createGain();

			/**
			 *  the mid gain
			 *  @type {GainNode}
			 *  @private
			 */
			this._midGain = this.context.createGain();

			/**
			 *  the high gain
			 *  @type {GainNode}
			 *  @private
			 */
			this._highGain = this.context.createGain();

			/**
			 * The gain in decibels of the low part
			 * @type {Tone.Signal}
			 */
			this.low = new Tone.Signal(this._lowGain.gain, Tone.Signal.Units.Decibels);

			/**
			 * The gain in decibels of the mid part
			 * @type {Tone.Signal}
			 */
			this.mid = new Tone.Signal(this._midGain.gain, Tone.Signal.Units.Decibels);

			/**
			 * The gain in decibels of the high part
			 * @type {Tone.Signal}
			 */
			this.high = new Tone.Signal(this._highGain.gain, Tone.Signal.Units.Decibels);

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
			this._multibandSplit.low.chain(this._lowGain, this.output);
			this._multibandSplit.mid.chain(this._midGain, this.output);
			this._multibandSplit.high.chain(this._highGain, this.output);
			//set the gains
			this.high.value = options.low;
			this.mid.value = options.mid;
			this.low.value = options.high;
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
		 *  clean up
		 *  @returns {Tone.EQ} `this`
		 */
		Tone.EQ.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._multibandSplit.dispose();
			this._multibandSplit = null;
			this.lowFrequency = null;
			this.highFrequency = null;
			this._lowGain.disconnect();
			this._lowGain = null;
			this._midGain.disconnect();
			this._midGain = null;
			this._highGain.disconnect();
			this._highGain = null;
			this.low.dispose();
			this.low = null;
			this.mid.dispose();
			this.mid = null;
			this.high.dispose();
			this.high = null;
			return this;
		};

		return Tone.EQ;
	});
	ToneModule( function(Tone){

		
		
		/**
		 *  @class  Performs a linear scaling on an input signal.
		 *          Scales a normal gain input range [0,1] to between
		 *          outputMin and outputMax
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} [outputMin=0]
		 *  @param {number} [outputMax=1]
		 *  @example
		 *  var scale = new Tone.Scale(50, 100);
		 *  var signal = new Tone.Signal(0.5).connect(scale);
		 *  //the output of scale equals 75
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
		 * The minimum output value.
		 * @memberOf Tone.Scale#
		 * @type {number}
		 * @name min
		 */
		Object.defineProperty(Tone.Scale.prototype, "min", {
			get : function(){
				return this._outputMin;
			},
			set : function(min){
				this._outputMin = min;
				this._setRange();
			}
		});

		/**
		 * The maximum output value.
		 * @memberOf Tone.Scale#
		 * @type {number}
		 * @name max
		 */
		Object.defineProperty(Tone.Scale.prototype, "max", {
			get : function(){
				return this._outputMax;
			},
			set : function(max){
				this._outputMax = max;
				this._setRange();
			}
		});

		/**
		 *  set the values
		 *  @private
		 */
		Tone.Scale.prototype._setRange = function() {
			this._add.value = this._outputMin;
			this._scale.value = this._outputMax - this._outputMin;
		};

		/**
		 *  clean up
		 *  @returns {Tone.Scale} `this`
		 */
		Tone.Scale.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._add.dispose();
			this._add = null;
			this._scale.dispose();
			this._scale = null;
			return this;
		}; 

		return Tone.Scale;
	});

	ToneModule( 
	function(Tone){
		
		/**
		 *  @class  Performs an exponential scaling on an input signal.
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
		 * The minimum output value.
		 * @memberOf Tone.ScaleExp#
		 * @type {number}
		 * @name exponent
		 */
		Object.defineProperty(Tone.ScaleExp.prototype, "exponent", {
			get : function(){
				return this._exp.value;
			},
			set : function(exp){
				this._exp.value = exp;
			}
		});

		/**
		 * The minimum output value.
		 * @memberOf Tone.ScaleExp#
		 * @type {number}
		 * @name min
		 */
		Object.defineProperty(Tone.ScaleExp.prototype, "min", {
			get : function(){
				return this._scale.min;
			},
			set : function(min){
				this._scale.min = min;
			}
		});

		/**
		 * The maximum output value.
		 * @memberOf Tone.ScaleExp#
		 * @type {number}
		 * @name max
		 */
		Object.defineProperty(Tone.ScaleExp.prototype, "max", {
			get : function(){
				return this._scale.max;
			},
			set : function(max){
				this._scale.max = max;
			}
		});

		/**
		 *  clean up
		 *  @returns {Tone.ScaleExp} `this`
		 */
		Tone.ScaleExp.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._scale.dispose();
			this._scale = null;
			this._exp.dispose();
			this._exp = null;
			return this;
		}; 


		return Tone.ScaleExp;
	});

	ToneModule( function(Tone){

		

		/**
		 *  @class A comb filter with feedback.
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @param {number} [minDelay=0.01] the minimum delay time which the filter can have
		 *  @param {number} [maxDelay=1] the maximum delay time which the filter can have
		 */
		Tone.FeedbackCombFilter = function(){

			Tone.call(this);
			var options = this.optionsObject(arguments, ["minDelay", "maxDelay"], Tone.FeedbackCombFilter.defaults);

			var minDelay = options.minDelay;
			var maxDelay = options.maxDelay;
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
			this.resonance = new Tone.Signal(options.resonance, Tone.Signal.Units.Normal);

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
			 *  internal counter of delayTime
			 *  @type {Tone.TIme}
			 *  @private
			 */
			this._delayTime = options.delayTime;

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
			this.delayTime = options.delayTime;
		};

		Tone.extend(Tone.FeedbackCombFilter);

		/**
		 *  the default parameters
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.FeedbackCombFilter.defaults = {
			"resonance" : 0.5,
			"minDelay" : 0.1,
			"maxDelay" : 1,
			"delayTime" : 0.1
		};

		/**
		 * the delay time of the FeedbackCombFilter
		 * @memberOf Tone.FeedbackCombFilter#
		 * @type {Tone.Time}
		 * @name delayTime
		 */
		Object.defineProperty(Tone.FeedbackCombFilter.prototype, "delayTime", {
			get : function(){
				return this._delayTime;
			},
			set : function(delayAmount){
				this._delayTime = delayAmount;
				delayAmount = this.toSeconds(delayAmount);
				//the number of samples to delay by
				var sampleRate = this.context.sampleRate;
				var delaySamples = sampleRate * delayAmount;
				// delayTime corection when frequencies get high
				var now = this.now() + this.bufferTime;
				var cutoff = 100;
				if (delaySamples < cutoff){
					this._highFrequencies = true;
					var changeNumber = Math.round((delaySamples / cutoff) * this._delayCount);
					for (var i = 0; i < changeNumber; i++) {
						this._delays[i].delayTime.setValueAtTime(1 / sampleRate + delayAmount, now);
					}
					delayAmount = Math.floor(delaySamples) / sampleRate;
				} else if (this._highFrequencies){
					this._highFrequencies = false;
					for (var j = 0; j < this._delays.length; j++) {
						this._delays[j].delayTime.setValueAtTime(delayAmount, now);
					}
				}
			}
		});

		/**
		 *  clean up
		 *  @returns {Tone.FeedbackCombFilter} `this`
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
			return this;
		};

		return Tone.FeedbackCombFilter;
	});
	ToneModule( 
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
		 *  @example
		 *  var follower = new Tone.Follower(0.2, 0.4);
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
			this._attack = options.attack;

			/**
			 *  @private
			 *  @type {number}
			 */
			this._release = options.release;

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
		 *  @param   {Tone.Time} attack  
		 *  @param   {Tone.Time} release 
		 *  @private
		 */
		Tone.Follower.prototype._setAttackRelease = function(attack, release){
			var minTime = this.bufferTime;
			attack = this.secondsToFrequency(this.toSeconds(attack));
			release = this.secondsToFrequency(this.toSeconds(release));
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
		 * The attack time.
		 * @memberOf Tone.Follower#
		 * @type {Tone.Time}
		 * @name attack
		 */
		Object.defineProperty(Tone.Follower.prototype, "attack", {
			get : function(){
				return this._attack;
			},
			set : function(attack){
				this._attack = attack;
				this._setAttackRelease(this._attack, this._release);	
			}
		});

		/**
		 * The release time.
		 * @memberOf Tone.Follower#
		 * @type {Tone.Time}
		 * @name release
		 */
		Object.defineProperty(Tone.Follower.prototype, "release", {
			get : function(){
				return this._release;
			},
			set : function(release){
				this._release = release;
				this._setAttackRelease(this._attack, this._release);	
			}
		});

		/**
		 *  borrows the connect method from Signal so that the output can be used
		 *  as a control signal {@link Tone.Signal}
		 *  @function
		 */
		Tone.Follower.prototype.connect = Tone.Signal.prototype.connect;

		/**
		 *  dispose
		 *  @returns {Tone.Follower} `this`
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
			return this;
		};

		return Tone.Follower;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class  Only pass signal through when it's signal exceeds the
		 *          specified threshold.
		 *  
		 *  @constructor
		 *  @extends {Tone}
		 *  @param {number} [threshold = -40] the threshold in Decibels
		 *  @param {Tone.Time} [attack = 0.1] the follower's attack time
		 *  @param {Tone.Time} [release = 0.1] the follower's release time
		 *  @example
		 *  var gate = new Tone.Gate(-30, 0.2, 0.3);
		 */
		Tone.Gate = function(){
			
			Tone.call(this);
			var options = this.optionsObject(arguments, ["threshold", "attack", "release"], Tone.Gate.defaults);

			/**
			 *  @type {Tone.Follower}
			 *  @private
			 */
			this._follower = new Tone.Follower(options.attack, options.release);

			/**
			 *  @type {Tone.GreaterThan}
			 *  @private
			 */
			this._gt = new Tone.GreaterThan(this.dbToGain(options.threshold));

			//the connections
			this.input.connect(this.output);
			//the control signal
			this.input.chain(this._gt, this._follower, this.output.gain);
		};

		Tone.extend(Tone.Gate);

		/**
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.Gate.defaults = {
			"attack" : 0.1, 
			"release" : 0.1,
			"threshold" : -40
		};

		/**
		 * The threshold of the gate in decibels
		 * @memberOf Tone.Gate#
		 * @type {number}
		 * @name threshold
		 */
		Object.defineProperty(Tone.Gate.prototype, "threshold", {
			get : function(){
				return this.gainToDb(this._gt.value);
			}, 
			set : function(thresh){
				this._gt.value = this.dbToGain(thresh);
			}
		});

		/**
		 * The attack speed of the gate
		 * @memberOf Tone.Gate#
		 * @type {Tone.Time}
		 * @name attack
		 */
		Object.defineProperty(Tone.Gate.prototype, "attack", {
			get : function(){
				return this._follower.attack;
			}, 
			set : function(attackTime){
				this._follower.attack = attackTime;
			}
		});

		/**
		 * The release speed of the gate
		 * @memberOf Tone.Gate#
		 * @type {Tone.Time}
		 * @name release
		 */
		Object.defineProperty(Tone.Gate.prototype, "release", {
			get : function(){
				return this._follower.release;
			}, 
			set : function(releaseTime){
				this._follower.release = releaseTime;
			}
		});

		/**
		 *  dispose
		 *  @returns {Tone.Gate} `this`
		 */
		Tone.Gate.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._follower.dispose();
			this._gt.dispose();
			this._follower = null;
			this._gt = null;
			return this;
		};

		return Tone.Gate;
	});
	ToneModule( function(Tone){

		
		
		/**
		 *  @class  a sample accurate clock built on an oscillator.
		 *          Invokes the tick method at the set rate
		 *
		 * 	@private
		 * 	@constructor
		 * 	@extends {Tone}
		 * 	@param {Tone.Frequency} frequency the rate of the callback
		 * 	@param {function} callback the callback to be invoked with the time of the audio event
		 */
		Tone.Clock = function(frequency, callback){

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
			 */
			this.frequency = new Tone.Signal(frequency);

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
			this.tick = callback;

			//setup
			this._jsNode.noGC();
		};

		Tone.extend(Tone.Clock);

		/**
		 *  start the clock
		 *  @param {Tone.Time} time the time when the clock should start
		 *  @returns {Tone.Clock} `this`
		 */
		Tone.Clock.prototype.start = function(time){
			if (!this._oscillator){
				this._oscillator = this.context.createOscillator();
				this._oscillator.type = "square";
				this._oscillator.connect(this._jsNode);
				//connect it up
				this.frequency.connect(this._oscillator.frequency);
				this._upTick = false;
				var startTime = this.toSeconds(time);
				this._oscillator.start(startTime);
			}
			return this;
		};

		/**
		 *  stop the clock
		 *  @param {Tone.Time} time the time when the clock should stop
		 *  @param {function} onend called when the oscilator stops
		 *  @returns {Tone.Clock} `this`
		 */
		Tone.Clock.prototype.stop = function(time, onend){
			if (this._oscillator){
				var now = this.now();
				var stopTime = this.toSeconds(time, now);
				this._oscillator.stop(stopTime);
				this._oscillator = null;
				//set a timeout for when it stops
				if (time){
					setTimeout(onend, (stopTime - now) * 1000);
				} else {
					onend();
				}
			}
			return this;
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
							if (self.tick){
								self.tick(tickTime);
							}
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
		 *  @returns {Tone.Clock} `this`
		 */
		Tone.Clock.prototype.dispose = function(){
			this._jsNode.disconnect();
			this.frequency.dispose();
			this.frequency = null;
			if (this._oscillator){
				this._oscillator.disconnect();
				this._oscillator = null;
			}
			this._jsNode.onaudioprocess = function(){};
			this._jsNode = null;
			this.tick = null;
			return this;
		};

		return Tone.Clock;
	});
	ToneModule( 
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
		 *  @class  Oscillator-based transport allows for simple musical timing
		 *          supports tempo curves and time changes. Do not construct
		 *          an instance of the transport. One is automatically created 
		 *          on init and additional transports cannot be created. <br><br>
		 *          If you need to schedule highly independent callback functions,
		 *          check out {@link Tone.Clock}.
		 *
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
			this._clock = new Tone.Clock(0, this._processTick.bind(this));

			/** 
			 * 	If the transport loops or not.
			 *  @type {boolean}
			 */
			this.loop = false;

			/**
			 *  the bpm value
			 *  @type {Tone.Signal}
			 */
			this.bpm = new Tone.Signal(120, Tone.Signal.Units.BPM);

			/**
			 *  the signal scalar
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._bpmMult = new Tone.Multiply(1/60 * tatum);

			/**
			 * 	The state of the transport. 
			 *  @type {TransportState}
			 */
			this.state = TransportState.STOPPED;

			//connect it all up
			this.bpm.chain(this._bpmMult, this._clock.frequency);
		};

		Tone.extend(Tone.Transport);

		/**
		 *  the defaults
		 *  @type {Object}
		 *  @const
		 *  @static
		 */
		Tone.Transport.defaults = {
			"bpm" : 120,
			"swing" : 0,
			"swingSubdivision" : "16n",
			"timeSignature" : 4,
			"loopStart" : 0,
			"loopEnd" : "4m"
		};

		/** 
		 * @private
		 * @type {number}
		 */
		var tatum = 12;

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
		 *  Which subdivision the swing is applied to.
		 *  defaults to an 16th note
		 *  @private
		 *  @type {number}
		 */
		var swingSubdivision = "16n";

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
		 *  All of the synced Signals
		 *  @private 
		 *  @type {Array<Tone.Signal>}
		 */
		var SyncedSignals = [];

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
				if (swingAmount > 0 && 
					timelineTicks % tatum !== 0 && //not on a downbeat
					timelineTicks % swingTatum === 0){
					//add some swing
					tickTime += this._ticksToSeconds(swingTatum) * swingAmount;
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
		 *  Set a callback for a recurring event.
		 *
		 *  @param {function} callback
		 *  @param {Tone.Time}   interval 
		 *  @return {number} the id of the interval
		 *  @example
		 *  //triggers a callback every 8th note with the exact time of the event
		 *  Tone.Transport.setInterval(function(time){
		 *  	envelope.triggerAttack(time);
		 *  }, "8n");
		 */
		Tone.Transport.prototype.setInterval = function(callback, interval, ctx){
			var tickTime = this._toTicks(interval);
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
		 *  @return {boolean}            	true if the event was removed
		 */
		Tone.Transport.prototype.clearIntervals = function(){
			var willRemove = intervals.length > 0;
			intervals = [];
			return willRemove;
		};

		///////////////////////////////////////////////////////////////////////////////
		//	TIMEOUT
		///////////////////////////////////////////////////////////////////////////////

		/**
		 *  Set a timeout to occur after time from now. NB: the transport must be 
		 *  running for this to be triggered. All timeout events are cleared when the 
		 *  transport is stopped. 
		 *
		 *  @param {function} callback 
		 *  @param {Tone.Time}   time     
		 *  @return {number} the id of the timeout for clearing timeouts
		 *  @example
		 *  //trigger an event to happen 1 second from now
		 *  Tone.Transport.setTimeout(function(time){
		 *  	player.start(time);
		 *  }, 1)
		 */
		Tone.Transport.prototype.setTimeout = function(callback, time, ctx){
			var ticks = this._toTicks(time);
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
		 *  @return {boolean}            	true if the event was removed
		 */
		Tone.Transport.prototype.clearTimeouts = function(){
			var willRemove = timeouts.length > 0;
			timeouts = [];
			return willRemove;
		};

		///////////////////////////////////////////////////////////////////////////////
		//	TIMELINE
		///////////////////////////////////////////////////////////////////////////////

		/**
		 *  Timeline events are synced to the transportTimeline of the Tone.Transport
		 *  Unlike Timeout, Timeline events will restart after the 
		 *  Tone.Transport has been stopped and restarted. 
		 *
		 *  @param {function} 	callback 	
		 *  @param {Tome.Time}  timeout  
		 *  @return {number} 				the id for clearing the transportTimeline event
		 *  @example
		 *  //trigger the start of a part on the 16th measure
		 *  Tone.Transport.setTimeline(function(time){
		 *  	part.start(time);
		 *  }, "16m");
		 */
		Tone.Transport.prototype.setTimeline = function(callback, timeout, ctx){
			var ticks = this._toTicks(timeout);
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
		 *  @returns {boolean} true if the events were removed
		 */
		Tone.Transport.prototype.clearTimelines = function(){
			timelineProgress = 0;
			var willRemove = transportTimeline.length > 0;
			transportTimeline = [];
			return willRemove;
		};

		///////////////////////////////////////////////////////////////////////////////
		//	TIME CONVERSIONS
		///////////////////////////////////////////////////////////////////////////////

		/**
		 *  turns the time into
		 *  @param  {Tone.Time} time
		 *  @return {number}   
		 *  @private   
		 */
		Tone.Transport.prototype._toTicks = function(time){
			//get the seconds
			var seconds = this.toSeconds(time);
			var quarter = this.notationToSeconds("4n");
			var quarters = seconds / quarter;
			var tickNum = quarters * tatum;
			//quantize to tick value
			return Math.round(tickNum);
		};

		/**
		 *  convert ticks into seconds
		 *  
		 *  @param  {number} ticks 
		 *  @param {number=} bpm 
		 *  @param {number=} timeSignature
		 *  @return {number}               seconds
		 *  @private
		 */
		Tone.Transport.prototype._ticksToSeconds = function(ticks, bpm, timeSignature){
			ticks = Math.floor(ticks);
			var quater = this.notationToSeconds("4n", bpm, timeSignature);
			return (quater * ticks) / (tatum);
		};

		/**
		 *  returns the time of the next beat
		 *  @param  {string} [subdivision="4n"]
		 *  @return {number} 	the time in seconds of the next subdivision
		 */
		Tone.Transport.prototype.nextBeat = function(subdivision){
			subdivision = this.defaultArg(subdivision, "4n");
			var tickNum = this._toTicks(subdivision);
			var remainingTicks = (transportTicks % tickNum);
			var nextTick = remainingTicks;
			if (remainingTicks > 0){
				nextTick = tickNum - remainingTicks;
			}
			return this._ticksToSeconds(nextTick);
		};


		///////////////////////////////////////////////////////////////////////////////
		//	START/STOP/PAUSE
		///////////////////////////////////////////////////////////////////////////////

		/**
		 *  start the transport and all sources synced to the transport
		 *  
		 *  @param  {Tone.Time} time
		 *  @param  {Tone.Time=} offset the offset position to start
		 *  @returns {Tone.Transport} `this`
		 */
		Tone.Transport.prototype.start = function(time, offset){
			if (this.state === TransportState.STOPPED || this.state === TransportState.PAUSED){
				if (!this.isUndef(offset)){
					this._setTicks(this._toTicks(offset));
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
			return this;
		};


		/**
		 *  stop the transport and all sources synced to the transport
		 *  
		 *  @param  {Tone.Time} time
		 *  @returns {Tone.Transport} `this`
		 */
		Tone.Transport.prototype.stop = function(time){
			if (this.state === TransportState.STARTED || this.state === TransportState.PAUSED){
				var stopTime = this.toSeconds(time);
				this._clock.stop(stopTime, this._onended.bind(this));
				//call start on each of the synced sources
				for (var i = 0; i < SyncedSources.length; i++){
					var source = SyncedSources[i].source;
					source.stop(stopTime);
				}
			} else {
				this._onended();
			}
			return this;
		};

		/**
		 *  invoked when the transport is stopped
		 *  @private
		 */
		Tone.Transport.prototype._onended = function(){
			transportTicks = 0;
			this._setTicks(0);
			this.clearTimeouts();
			this.state = TransportState.STOPPED;
		};

		/**
		 *  pause the transport and all sources synced to the transport
		 *  
		 *  @param  {Tone.Time} time
		 *  @returns {Tone.Transport} `this`
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
			return this;
		};

		///////////////////////////////////////////////////////////////////////////////
		//	SETTERS/GETTERS
		///////////////////////////////////////////////////////////////////////////////

		/**
		 *  Time signature as just the numerator over 4. 
		 *  For example 4/4 would be just 4 and 6/8 would be 3.
		 *  @memberOf Tone.Transport#
		 *  @type {number}
		 *  @name timeSignature
		 */
		Object.defineProperty(Tone.Transport.prototype, "timeSignature", {
			get : function(){
				return transportTimeSignature;
			},
			set : function(numerator){
				transportTimeSignature = numerator;
			}
		});


		/**
		 * The loop start point
		 * @memberOf Tone.Transport#
		 * @type {Tone.Time}
		 * @name loopStart
		 */
		Object.defineProperty(Tone.Transport.prototype, "loopStart", {
			get : function(){
				return this._ticksToSeconds(loopStart);
			},
			set : function(startPosition){
				loopStart = this._toTicks(startPosition);
			}
		});

		/**
		 * The loop end point
		 * @memberOf Tone.Transport#
		 * @type {Tone.Time}
		 * @name loopEnd
		 */
		Object.defineProperty(Tone.Transport.prototype, "loopEnd", {
			get : function(){
				return this._ticksToSeconds(loopEnd);
			},
			set : function(endPosition){
				loopEnd = this._toTicks(endPosition);
			}
		});

		/**
		 *  shorthand loop setting
		 *  @param {Tone.Time} startPosition 
		 *  @param {Tone.Time} endPosition   
		 *  @returns {Tone.Transport} `this`
		 */
		Tone.Transport.prototype.setLoopPoints = function(startPosition, endPosition){
			this.loopStart = startPosition;
			this.loopEnd = endPosition;
			return this;
		};

		/**
		 *  The swing value. Between 0-1 where 1 equal to 
		 *  the note + half the subdivision.
		 *  @memberOf Tone.Transport#
		 *  @type {number}
		 *  @name swing
		 */
		Object.defineProperty(Tone.Transport.prototype, "swing", {
			get : function(){
				return swingAmount * 2;
			},
			set : function(amount){
				//scale the values to a normal range
				swingAmount = amount * 0.5;
			}
		});

		/**
		 *  Set the subdivision which the swing will be applied to. 
		 *  The default values is a 16th note. Value must be less 
		 *  than a quarter note.
		 *  
		 *  
		 *  @memberOf Tone.Transport#
		 *  @type {Tone.Time}
		 *  @name swingSubdivision
		 */
		Object.defineProperty(Tone.Transport.prototype, "swingSubdivision", {
			get : function(){
				return swingSubdivision;
			},
			set : function(subdivision){
				//scale the values to a normal range
				swingSubdivision = subdivision;
				swingTatum = this._toTicks(subdivision);
			}
		});

		/**
		 *  The Transport's position in MEASURES:BEATS:SIXTEENTHS.
		 *  Setting the value will jump to that position right away. 
		 *  
		 *  @memberOf Tone.Transport#
		 *  @type {string}
		 *  @name position
		 */
		Object.defineProperty(Tone.Transport.prototype, "position", {
			get : function(){
				var quarters = timelineTicks / tatum;
				var measures = Math.floor(quarters / transportTimeSignature);
				var sixteenths = Math.floor((quarters % 1) * 4);
				quarters = Math.floor(quarters) % transportTimeSignature;
				var progress = [measures, quarters, sixteenths];
				return progress.join(":");
			},
			set : function(progress){
				var ticks = this._toTicks(progress);
				this._setTicks(ticks);
			}
		});

		///////////////////////////////////////////////////////////////////////////////
		//	SYNCING
		///////////////////////////////////////////////////////////////////////////////

		/**
		 *  Sync a source to the transport so that 
		 *  @param  {Tone.Source} source the source to sync to the transport
		 *  @param {Tone.Time} delay (optionally) start the source with a delay from the transport
		 *  @returns {Tone.Transport} `this`
		 */
		Tone.Transport.prototype.syncSource = function(source, startDelay){
			SyncedSources.push({
				source : source,
				delay : this.toSeconds(this.defaultArg(startDelay, 0))
			});
			return this;
		};

		/**
		 *  remove the source from the list of Synced Sources
		 *  
		 *  @param  {Tone.Source} source [description]
		 *  @returns {Tone.Transport} `this`
		 */
		Tone.Transport.prototype.unsyncSource = function(source){
			for (var i = 0; i < SyncedSources.length; i++){
				if (SyncedSources[i].source === source){
					SyncedSources.splice(i, 1);
				}
			}
			return this;
		};

		/**
		 *  attaches the signal to the tempo control signal so that 
		 *  any changes in the tempo will change the signal in the same
		 *  ratio. 
		 *  
		 *  @param  {Tone.Signal} signal 
		 *  @param {number=} ratio Optionally pass in the ratio between
		 *                         the two signals. Otherwise it will be computed
		 *                         based on their current values. 
		 *  @returns {Tone.Transport} `this`
		 */
		Tone.Transport.prototype.syncSignal = function(signal, ratio){
			if (!ratio){
				//get the sync ratio
				if (signal._value.value !== 0){
					ratio = signal._value.value / this.bpm.value;
				} else {
					ratio = 0;
				}
			}
			var ratioSignal = this.context.createGain();
			ratioSignal.gain.value = ratio;
			this.bpm.chain(ratioSignal, signal._value);
			SyncedSignals.push({
				"ratio" : ratioSignal,
				"signal" : signal,
				"initial" : signal._value.value
			});
			signal._value.value = 0;
			return this;
		};

		/**
		 *  Unsyncs a previously synced signal from the transport's control
		 *  @param  {Tone.Signal} signal 
		 *  @returns {Tone.Transport} `this`
		 */
		Tone.Transport.prototype.unsyncSignal = function(signal){
			for (var i = 0; i < SyncedSignals.length; i++){
				var syncedSignal = SyncedSignals[i];
				if (syncedSignal.signal === signal){
					syncedSignal.ratio.disconnect();
					syncedSignal.signal._value.value = syncedSignal.initial;
					SyncedSignals.splice(i, 1);
				}
			}
			return this;
		};

		/**
		 *  clean up
		 *  @returns {Tone.Transport} `this`
		 */
		Tone.Transport.prototype.dispose = function(){
			this._clock.dispose();
			this._clock = null;
			this.bpm.dispose();
			this.bpm = null;
			this._bpmMult.dispose();
			this._bpmMult = null;
			return this;
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
		 *  @private
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
			var transportTimeFormat = new RegExp(/^\d+(\.\d+)?:\d+(\.\d+)?(:\d+(\.\d+)?)?$/i);
			return function(transportTime){
				return transportTimeFormat.test(transportTime);
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
			bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
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
			bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
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
			bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
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
		 *  Convert a frequency representation into a number.
		 *  Defined in "Tone/core/Transport".
		 *  	
		 *  @param  {Tone.Frequency} freq 
		 *  @param {number=} 	now 	if passed in, this number will be 
		 *                        		used for all 'now' relative timings
		 *  @return {number}      the frequency in hertz
		 */
		Tone.prototype.toFrequency = function(freq, now){
			if (this.isFrequency(freq)){
				return parseFloat(freq);
			} else if (this.isNotation(freq) || this.isTransportTime(freq)) {
				return this.secondsToFrequency(this.toSeconds(freq, now));
			} else {
				return freq;
			}
		};

		/**
		 *  Convert Tone.Time into seconds.
		 *  Defined in "Tone/core/Transport".
		 *  
		 *  Unlike the method which it overrides, this takes into account 
		 *  transporttime and musical notation.
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
			} else {
				//stop the clock
				Tone.Transport.stop();
				//get the previous bpm
				var bpm = Tone.Transport.bpm.value;
				//destory the old clock
				Tone.Transport._clock.dispose();
				//make new Transport insides
				TransportConstructor.call(Tone.Transport);
				//set the bpm
				Tone.Transport.bpm.value = bpm;
			}
		});

		return Tone.Transport;
	});

	ToneModule( function(Tone){

		
		
		/**
		 *  @class  A single master output which is connected to the
		 *          AudioDestinationNode. It provides useful conveniences
		 *          such as the ability to set the global volume and mute
		 *          the entire application. Additionally, it accepts
		 *          a master send/receive for adding final compression, 
		 *          limiting or effects to your application. <br><br>
		 *          Like the Transport, the Master output is created for you
		 *          on initialization. It does not need to be created.
		 *
		 *  @constructor
		 *  @extends {Tone}
		 */
		Tone.Master = function(){
			Tone.call(this);

			/**
			 * the unmuted volume
			 * @type {number}
			 * @private
			 */
			this._unmutedVolume = 1;

			/**
			 * the volume of the output in decibels
			 * @type {Tone.Signal}
			 */
			this.volume = new Tone.Signal(this.output.gain, Tone.Signal.Units.Decibels);
			
			//connections
			this.input.chain(this.output, this.context.destination);
		};

		Tone.extend(Tone.Master);

		/**
		 *  Mutethe output
		 *  @returns {Tone.Master} `this`
		 */
		Tone.Master.prototype.mute = function(){
			this._unmutedVolume = this.volume.value;
			//maybe it should ramp here?
			this.volume.value = -Infinity;
			return this;
		};

		/**
		 *  Unmute the output. Will return the volume to it's value before 
		 *  the output was muted. 
		 *  @returns {Tone.Master} `this`
		 */
		Tone.Master.prototype.mute = function(){
			this.volume.value = this._unmutedVolume;
			return this;
		};

		/**
		 *  route the master signal to the node's input. 
		 *  NOTE: this will disconnect the previously connected node
		 *  @param {AudioNode|Tone} node the node to use as the entry
		 *                               point to the master chain
		 *  @returns {Tone.Master} `this`
		 */
		Tone.Master.prototype.send = function(node){
			//disconnect the previous node
			this.input.disconnect();
			this.input.connect(node);
			return this;
		};

		/**
		 *  the master effects chain return point
		 *  @param {AudioNode|Tone} node the node to connect 
		 *  @returns {Tone.Master} `this`
		 */
		Tone.Master.prototype.receive = function(node){
			node.connect(this.output);
			return this;
		};

		///////////////////////////////////////////////////////////////////////////
		//	AUGMENT TONE's PROTOTYPE
		///////////////////////////////////////////////////////////////////////////

		/**
		 *  connect 'this' to the master output
		 *  defined in "Tone/core/Master"
		 *  @returns {Tone} `this`
		 */
		Tone.prototype.toMaster = function(){
			this.connect(Tone.Master);
			return this;
		};

		/**
		 *  Also augment AudioNode's prototype to include toMaster
		 *  as a convenience
		 *  @returns {AudioNode} `this`
		 */
		AudioNode.prototype.toMaster = function(){
			this.connect(Tone.Master);
			return this;
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
				MasterConstructor.prototype.dispose.call(Tone.Master);
				MasterConstructor.call(Tone.Master);
			}
		});

		return Tone.Master;
	});
	ToneModule( function(Tone){

		
		
		/**
		 *  @class  Base class for sources.
		 *          Sources have start/stop/pause and 
		 *          the ability to be synced to the 
		 *          start/stop/pause of Tone.Transport.
		 *
		 *  @constructor
		 *  @extends {Tone}
		 */	
		Tone.Source = function(options){
			//unlike most ToneNodes, Sources only have an output and no input
			Tone.call(this, 0, 1);
			options = this.defaultArg(options, Tone.Source.defaults);

			/**
			 * The onended callback when the source is done playing.
			 * @type {function}
			 * @example
			 *  source.onended = function(){
			 *  	console.log("the source is done playing");
			 *  }
			 */
			this.onended = options.onended;

			/**
			 *  the next time the source is started
			 *  @type {number}
			 *  @private
			 */
			this._nextStart = Infinity;

			/**
			 *  the next time the source is stopped
			 *  @type {number}
			 *  @private
			 */
			this._nextStop = Infinity;

			/**
			 * The volume of the output in decibels.
			 * @type {Tone.Signal}
			 * @example
			 * source.volume.value = -6;
			 */
			this.volume = new Tone.Signal(this.output.gain, Tone.Signal.Units.Decibels);

			/**
			 * 	keeps track of the timeout for chaning the state
			 * 	and calling the onended
			 *  @type {number}
			 *  @private
			 */
			this._timeout = -1;
		};

		Tone.extend(Tone.Source);

		/**
		 *  The default parameters
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.Source.defaults = {
			"onended" : function(){},
			"volume" : 0,
		};

		/**
		 *  @enum {string}
		 */
		Tone.Source.State = {
			STARTED : "started",
			PAUSED : "paused",
			STOPPED : "stopped",
	 	};

		/**
		 *  Returns the playback state of the source, either "started" or "stopped".
		 *  @type {Tone.Source.State}
		 *  @readOnly
		 *  @memberOf Tone.Source#
		 *  @name state
		 */
		Object.defineProperty(Tone.Source.prototype, "state", {
			get : function(){
				return this._stateAtTime(this.now());
			}
		});

		/**
		 *  Get the state of the source at the specified time.
		 *  @param  {Tone.Time}  time
		 *  @return  {Tone.Source.State} 
		 *  @private
		 */
		Tone.Source.prototype._stateAtTime = function(time){
			time = this.toSeconds(time);
			if (this._nextStart <= time && this._nextStop > time){
				return Tone.Source.State.STARTED;
			} else if (this._nextStop <= time){
				return Tone.Source.State.STOPPED;
			} else {
				return Tone.Source.State.STOPPED;
			}
		};

		/**
		 *  Start the source at the time.
		 *  @param  {Tone.Time} [time=now]
		 *  @returns {Tone.Source} `this`
		 *  @example
		 *  source.start("+0.5"); //starts the source 0.5 seconds from now
		 */
		Tone.Source.prototype.start = function(time){
			time = this.toSeconds(time);
			if (this._stateAtTime(time) !== Tone.Source.State.STARTED || this.retrigger){
				this._nextStart = time;
				this._nextStop = Infinity;
				this._start.apply(this, arguments);
			}
			return this;
		};

		/**
		 * 	stop the source
		 *  @param  {Tone.Time} [time=now]
		 *  @returns {Tone.Source} `this`
		 *  @example
		 *  source.stop(); // stops the source immediately
		 */
		Tone.Source.prototype.stop = function(time){
			var now = this.now();
			time = this.toSeconds(time, now);
			if (this._stateAtTime(time) === Tone.Source.State.STARTED){
				this._nextStop = this.toSeconds(time);
				clearTimeout(this._timeout);
				var diff = time - now;
				if (diff > 0){
					//add a small buffer before invoking the callback
					this._timeout = setTimeout(this.onended, diff * 1000 + 20);
				} else {
					this.onended();
				}
				this._stop.apply(this, arguments);
			}
			return this;
		};

		/**
		 *  Not ready yet. 
	 	 *  @private
	 	 *  @abstract
		 *  @param  {Tone.Time} time 
		 *  @returns {Tone.Source} `this`
		 */
		Tone.Source.prototype.pause = function(time){
			//if there is no pause, just stop it
			this.stop(time);
			return this;
		};

		/**
		 *  Sync the source to the Transport so that when the transport
		 *  is started, this source is started and when the transport is stopped
		 *  or paused, so is the source. 
		 *
		 *  @param {Tone.Time} [delay=0] Delay time before starting the source after the
		 *                               Transport has started. 
		 *  @returns {Tone.Source} `this`
		 */
		Tone.Source.prototype.sync = function(delay){
			Tone.Transport.syncSource(this, delay);
			return this;
		};

		/**
		 *  Unsync the source to the Transport. See {@link Tone.Source#sync}
		 *  @returns {Tone.Source} `this`
		 */
		Tone.Source.prototype.unsync = function(){
			Tone.Transport.unsyncSource(this);
			return this;
		};

		/**
		 *	clean up
		 *  @return {Tone.Source} `this`
		 */
		Tone.Source.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this.stop();
			clearTimeout(this._timeout);
			this.onended = function(){};
			this.volume.dispose();
			this.volume = null;
		};

		return Tone.Source;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class Oscilator with start, pause, stop and sync to Transport methods
		 *
		 *  @constructor
		 *  @extends {Tone.Source}
		 *  @param {number|string} [frequency=440] starting frequency
		 *  @param {string} [type="sine"] type of oscillator (sine|square|triangle|sawtooth)
		 *  @example
		 *  var osc = new Tone.Oscillator(440, "sine");
		 */
		Tone.Oscillator = function(){
			
			var options = this.optionsObject(arguments, ["frequency", "type"], Tone.Oscillator.defaults);
			Tone.Source.call(this, options);

			/**
			 *  the main oscillator
			 *  @type {OscillatorNode}
			 *  @private
			 */
			this._oscillator = null;
			
			/**
			 *  The frequency control signal in hertz.
			 *  @type {Tone.Signal}
			 */
			this.frequency = new Tone.Signal(options.frequency, Tone.Signal.Units.Frequency);

			/**
			 *  The detune control signal in cents. 
			 *  @type {Tone.Signal}
			 */
			this.detune = new Tone.Signal(options.detune);

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
			this._type = null;
			
			//setup
			this.type = options.type;
			this.phase = this._phase;
		};

		Tone.extend(Tone.Oscillator, Tone.Source);

		/**
		 *  the default parameters
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.Oscillator.defaults = {
			"type" : "sine",
			"frequency" : 440,
			"detune" : 0,
			"phase" : 0
		};

		/**
		 *  start the oscillator
		 *  @param  {Tone.Time} [time=now] 
		 *  @private
		 */
		Tone.Oscillator.prototype._start = function(time){
			//new oscillator with previous values
			this._oscillator = this.context.createOscillator();
			this._oscillator.setPeriodicWave(this._wave);
			//connect the control signal to the oscillator frequency & detune
			this._oscillator.connect(this.output);
			this.frequency.connect(this._oscillator.frequency);
			this.detune.connect(this._oscillator.detune);
			//start the oscillator
			this._oscillator.start(this.toSeconds(time));
		};

		/**
		 *  stop the oscillator
		 *  @private
		 *  @param  {Tone.Time} [time=now] (optional) timing parameter
		 *  @returns {Tone.Oscillator} `this`
		 */
		Tone.Oscillator.prototype._stop = function(time){
			if (this._oscillator){
				this._oscillator.stop(this.toSeconds(time));
				this._oscillator = null;
			}
			return this;
		};

		/**
		 *  Sync the signal to the Transport's bpm. Any changes to the transports bpm,
		 *  will also affect the oscillators frequency. 
		 *  @returns {Tone.Oscillator} `this`
		 *  @example
		 *  Tone.Transport.bpm.value = 120;
		 *  osc.frequency.value = 440;
		 *  osc.syncFrequency();
		 *  Tone.Transport.bpm.value = 240; 
		 *  // the frequency of the oscillator is doubled to 880
		 */
		Tone.Oscillator.prototype.syncFrequency = function(){
			Tone.Transport.syncSignal(this.frequency);
			return this;
		};

		/**
		 *  Unsync the oscillator's frequency from the Transport. 
		 *  See {@link Tone.Oscillator#syncFrequency}.
		 *  @returns {Tone.Oscillator} `this`
		 */
		Tone.Oscillator.prototype.unsyncFrequency = function(){
			Tone.Transport.unsyncSignal(this.frequency);
			return this;
		};

		/**
		 * The type of the oscillator: either sine, square, triangle, or sawtooth.
		 *
		 * Uses PeriodicWave internally even for native types so that it can set the phase.
		 *
		 * PeriodicWave equations are from the Web Audio Source code:
		 * https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/modules/webaudio/PeriodicWave.cpp&sq=package:chromium
		 *  
		 * @memberOf Tone.Oscillator#
		 * @type {string}
		 * @name type
		 * @example
		 * osc.type = "square";
		 * osc.type; //returns "square"
		 */
		Object.defineProperty(Tone.Oscillator.prototype, "type", {
			get : function(){
				return this._type;
			},
			set : function(type){
				if (this.type !== type){

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
				}
			}
		});

		/**
		 * The phase of the oscillator in degrees. 
		 * @memberOf Tone.Oscillator#
		 * @type {number}
		 * @name phase
		 * @example
		 * osc.phase = 180; //flips the phase of the oscillator
		 */
		Object.defineProperty(Tone.Oscillator.prototype, "phase", {
			get : function(){
				return this._phase * (180 / Math.PI);
			}, 
			set : function(phase){
				this._phase = phase * Math.PI / 180;
				//reset the type
				this.type = this._type;
			}
		});

		/**
		 *  dispose and disconnect
		 *  @return {Tone.Oscillator} `this`
		 */
		Tone.Oscillator.prototype.dispose = function(){
			Tone.Source.prototype.dispose.call(this);
			if (this._oscillator !== null){
				this._oscillator.disconnect();
				this._oscillator = null;
			}
			this.frequency.dispose();
			this.frequency = null;
			this.detune.dispose();
			this.detune = null;
			this._wave = null;
			return this;
		};

		return Tone.Oscillator;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class AudioToGain converts an input range of -1,1 to 0,1
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @example
		 *  var a2g = new Tone.AudioToGain();
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
		 *  @returns {Tone.AND} `this`
		 */
		Tone.AudioToGain.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._norm.disconnect();
			this._norm = null;
			return this;
		};

		return Tone.AudioToGain;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class  The Low Frequency Oscillator produces an output signal 
		 *          which can be attached to an AudioParam or Tone.Signal 
		 *          for constant control over that parameter. the LFO can 
		 *          also be synced to the transport to start/stop/pause
		 *          and change when the tempo changes.
		 *
		 *  @constructor
		 *  @extends {Tone.Oscillator}
		 *  @param {Tone.Time} [frequency="4n"]
		 *  @param {number} [outputMin=0]
		 *  @param {number} [outputMax=1]
		 *  @example
		 *  var lfo = new Tone.LFO("4n", 400, 4000);
		 *  lfo.connect(filter.frequency);
		 */
		Tone.LFO = function(){

			var options = this.optionsObject(arguments, ["frequency", "min", "max"], Tone.LFO.defaults);

			/** 
			 *  the oscillator
			 *  @type {Tone.Oscillator}
			 */
			this.oscillator = new Tone.Oscillator({
				"frequency" : options.frequency, 
				"type" : options.type, 
				"phase" : options.phase
			});

			/**
			 *  the lfo's frequency
			 *  @type {Tone.Signal}
			 */
			this.frequency = this.oscillator.frequency;

			/**
			 * The amplitude of the LFO, which controls the output range between
			 * the min and max output. For example if the min is -10 and the max 
			 * is 10, setting the amplitude to 0.5 would make the LFO modulate
			 * between -5 and 5. 
			 * @type {Tone.Signal}
			 */
			this.amplitude = this.oscillator.volume;
			this.amplitude.units = Tone.Signal.Units.Normal;
			this.amplitude.value = options.amplitude;

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

		Tone.extend(Tone.LFO, Tone.Oscillator);

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
			"phase" : 0,
			"frequency" : "4n",
			"amplitude" : 1
		};

		/**
		 *  Start the LFO. 
		 *  @param  {Tone.Time} [time=now] the time the LFO will start
		 *  @returns {Tone.LFO} `this`
		 */
		Tone.LFO.prototype.start = function(time){
			this.oscillator.start(time);
			return this;
		};

		/**
		 *  Stop the LFO. 
		 *  @param  {Tone.Time} [time=now] the time the LFO will stop
		 *  @returns {Tone.LFO} `this`
		 */
		Tone.LFO.prototype.stop = function(time){
			this.oscillator.stop(time);
			return this;
		};

		/**
		 *  Sync the start/stop/pause to the transport 
		 *  and the frequency to the bpm of the transport
		 *
		 *  @param {Tone.Time} [delay=0] the time to delay the start of the
		 *                                LFO from the start of the transport
		 *  @returns {Tone.LFO} `this`
		 *  @example
		 *  lfo.frequency.value = "8n";
		 *  lfo.sync();
		 *  // the rate of the LFO will always be an eighth note, 
		 *  // even as the tempo changes
		 */
		Tone.LFO.prototype.sync = function(delay){
			this.oscillator.sync(delay);
			this.oscillator.syncFrequency();
			return this;
		};

		/**
		 *  unsync the LFO from transport control
		 *  @returns {Tone.LFO} `this`
		 */
		Tone.LFO.prototype.unsync = function(){
			this.oscillator.unsync();
			this.oscillator.unsyncFrequency();
			return this;
		};

		/**
		 * The miniumum output of the LFO.
		 * @memberOf Tone.LFO#
		 * @type {number}
		 * @name min
		 */
		Object.defineProperty(Tone.LFO.prototype, "min", {
			get : function(){
				return this._scaler.min;
			},
			set : function(min){
				this._scaler.min = min;
			}
		});

		/**
		 * The maximum output of the LFO.
		 * @memberOf Tone.LFO#
		 * @type {number}
		 * @name max
		 */
		Object.defineProperty(Tone.LFO.prototype, "max", {
			get : function(){
				return this._scaler.max;
			},
			set : function(max){
				this._scaler.max = max;
			}
		});

		/**
		 * The type of the oscillator: sine, square, sawtooth, triangle. 
		 * @memberOf Tone.LFO#
		 * @type {string}
		 * @name type
		 */
		 Object.defineProperty(Tone.LFO.prototype, "type", {
			get : function(){
				return this.oscillator.type;
			},
			set : function(type){
				this.oscillator.type = type;
			}
		});

		/**
		 * The phase of the LFO
		 * @memberOf Tone.LFO#
		 * @type {string}
		 * @name phase
		 */
		 Object.defineProperty(Tone.LFO.prototype, "phase", {
			get : function(){
				return this.oscillator.phase;
			},
			set : function(phase){
				this.oscillator.phase = phase;
			}
		});

		/**
		 *	Override the connect method so that it 0's out the value 
		 *	if attached to an AudioParam or Tone.Signal. Borrowed from {@link Tone.Signal}
		 *  @function
		 */
		Tone.LFO.prototype.connect = Tone.Signal.prototype.connect;

		/**
		 *  disconnect and dispose
		 *  @returns {Tone.LFO} `this`
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
			this.amplitude = null;
			return this;
		};

		return Tone.LFO;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class A limiter on the incoming signal. Composed of a Tone.Compressor
		 *         with a fast attack and decay value. 
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @param {number} threshold the threshold in decibels
		 *  @example
		 *  var limiter = new Tone.Limiter(-6);
		 */
		Tone.Limiter = function(threshold){

			/**
			 *  the compressor
			 *  @private
			 *  @type {Tone.Compressor}
			 */
			this._compressor = this.input = this.output = new Tone.Compressor({
				"attack" : 0.0001,
				"decay" : 0.0001,
				"threshold" : threshold
			});

			/**
			 * The threshold of of the limiter
			 * @type {AudioParam}
			 */
			this.threshold = this._compressor.threshold;
		};

		Tone.extend(Tone.Limiter);

		/**
		 *  clean up
		 *  @returns {Tone.Limiter} `this`
		 */
		Tone.Limiter.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._compressor.dispose();
			this._compressor = null;
			this.threshold = null;
			return this;
		};

		return Tone.Limiter;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class A lowpass feedback comb filter. 
		 *         DelayNode -> Lowpass Filter -> feedback
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @param {number} [minDelay=0.1] the minimum delay time which the filter can have
		 *  @param {number} [maxDelay=1] the maximum delay time which the filter can have
		 */
		Tone.LowpassCombFilter = function(){

			Tone.call(this);

			var options = this.optionsObject(arguments, ["minDelay", "maxDelay"], Tone.LowpassCombFilter.defaults);

			//the delay * samplerate = number of samples. 
			// buffersize / number of samples = number of delays needed per buffer frame
			var delayCount = Math.ceil(this.bufferSize / (options.minDelay * this.context.sampleRate));
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
			this.dampening = new Tone.Signal(options.dampening, Tone.Signal.Units.Frequency);

			/**
			 *  the resonance control
			 *  @type {Tone.Signal}
			 */
			this.resonance = new Tone.Signal(options.resonance, Tone.Signal.Units.Normal);

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
			 *  internal counter of delayTime
			 *  @type {Tone.Time}
			 *  @private
			 */
			this._delayTime = options.delayTime;

			/**
			 *  the feedback node
			 *  @type {GainNode}
			 *  @private
			 */
			this._feedback = this.context.createGain();

			//make the filters
			for (var i = 0; i < this._filterDelayCount; i++) {
				var filterDelay = new FilterDelay(options.minDelay, this.dampening);
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
			this.delayTime = options.delayTime;
		};

		Tone.extend(Tone.LowpassCombFilter);

		/**
		 *  the default parameters
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.LowpassCombFilter.defaults = {
			"resonance" : 0.5,
			"dampening" : 3000,
			"minDelay" : 0.1,
			"maxDelay" : 1,
			"delayTime" : 0.1
		};

		/**
		 * The delay time of the LowpassCombFilter. Auto corrects
		 * for sample offsets for small delay amounts.
		 * @memberOf Tone.LowpassCombFilter#
		 * @type {Tone.Time}
		 * @name delayTime
		 */
		Object.defineProperty(Tone.LowpassCombFilter.prototype, "delayTime", {
			get : function(){
				return this._delayTime;
			},
			set : function(delayAmount){
				this.setDelayTimeAtTime(delayAmount);
			}
		});

		/**
		 * set the delay time for the comb filter at a specific time. 
		 * @param {Tone.Time} delayAmount the amount of delay time
		 * @param {Tone.Time} [time=now] when the delay time should be set
		 */
		Tone.LowpassCombFilter.prototype.setDelayTimeAtTime = function(delayAmount, time){
			this._delayTime = this.toSeconds(delayAmount);
			//the number of samples to delay by
			var sampleRate = this.context.sampleRate;
			var delaySamples = sampleRate * this._delayTime;
			// delayTime corection when frequencies get high
			time = this.toSeconds(time);
			var cutoff = 100;
			if (delaySamples < cutoff){
				this._highFrequencies = true;
				var changeNumber = Math.round((delaySamples / cutoff) * this._filterDelayCount);
				for (var i = 0; i < changeNumber; i++) {
					this._filterDelays[i].setDelay(1 / sampleRate + this._delayTime, time);
				}
				this._delayTime = Math.floor(delaySamples) / sampleRate;
			} else if (this._highFrequencies){
				this._highFrequencies = false;
				for (var j = 0; j < this._filterDelays.length; j++) {
					this._filterDelays[j].setDelay(this._delayTime, time);
				}
			}
		};

		/**
		 *  clean up
		 *  @returns {Tone.LowpassCombFilter} `this`
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
			return this;
		};

		// BEGIN HELPER CLASS //

		/**
		 *  FilterDelay
		 *  @private
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
	ToneModule( function(Tone){

		

		/**
		 *  @class  Merge a left and a right channel into a single stereo channel.
		 *
		 *  @constructor
		 *  @extends {Tone}
		 *  @example
		 *  var merge = new Tone.Merge();
		 *  sigLeft.connect(merge.left);
		 *  sigRight.connect(merge.right);
		 */
		Tone.Merge = function(){

			Tone.call(this, 2, 0);

			/**
			 *  The left input channel.
			 *  Alias for input 0
			 *  @type {GainNode}
			 */
			this.left = this.input[0] = this.context.createGain();

			/**
			 *  The right input channel.
			 *  Alias for input 1.
			 *  @type {GainNode}
			 */
			this.right = this.input[1] = this.context.createGain();

			/**
			 *  the merger node for the two channels
			 *  @type {ChannelMergerNode}
			 *  @private
			 */
			this._merger = this.output = this.context.createChannelMerger(2);

			//connections
			this.left.connect(this._merger, 0, 0);
			this.right.connect(this._merger, 0, 1);
		};

		Tone.extend(Tone.Merge);

		/**
		 *  clean up
		 *  @returns {Tone.Merge} `this`
		 */
		Tone.Merge.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this.left.disconnect();
			this.left = null;
			this.right.disconnect();
			this.right = null;
			this._merger.disconnect();
			this._merger = null;
			return this;
		}; 

		return Tone.Merge;
	});

	ToneModule( function(Tone){

		

		/**
		 *  @class  Get the rms of the input signal with some averaging.
		 *          Can also just get the value of the signal
		 *          or the value in dB. inspired by https://github.com/cwilso/volume-meter/blob/master/volume-meter.js<br><br>
		 *          Note that for signal processing, it's better to use {@link Tone.Follower} which will produce
		 *          an audio-rate envelope follower instead of needing to poll the Meter to get the output.
		 *
		 *  @constructor
		 *  @extends {Tone}
		 *  @param {number} [channels=1] number of channels being metered
		 *  @param {number} [smoothing=0.8] amount of smoothing applied to the volume
		 *  @param {number} [clipMemory=0.5] number in seconds that a "clip" should be remembered
		 */
		Tone.Meter = function(channels, smoothing, clipMemory){
			//extends Unit
			Tone.call(this);

			/** 
			 *  The channel count
			 *  @type  {number}
			 *  @private
			 */
			this._channels = this.defaultArg(channels, 1);

			/** 
			 *  the smoothing value
			 *  @type  {number}
			 *  @private
			 */
			this._smoothing = this.defaultArg(smoothing, 0.8);

			/** 
			 *  the amount of time a clip is remember for. 
			 *  @type  {number}
			 *  @private
			 */
			this._clipMemory = this.defaultArg(clipMemory, 0.5) * 1000;

			/** 
			 *  the rms for each of the channels
			 *  @private
			 *  @type {Array<number>}
			 */
			this._volume = new Array(this._channels);

			/** 
			 *  the raw values for each of the channels
			 *  @private
			 *  @type {Array<number>}
			 */
			this._values = new Array(this._channels);

			//zero out the volume array
			for (var i = 0; i < this._channels; i++){
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
			this._jsNode = this.context.createScriptProcessor(this.bufferSize, this._channels, 1);
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
			var smoothing = this._smoothing;
			for (var channel = 0; channel < this._channels; channel++){
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

		/**
		 * @returns {boolean} if the audio has clipped in the last 500ms
		 */
		Tone.Meter.prototype.isClipped = function(){
			return Date.now() - this._lastClip < this._clipMemory;
		};

		/**
		 *  clean up
		 *  @returns {Tone.Meter} `this`
		 */
		Tone.Meter.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._jsNode.disconnect();
			this._jsNode.onaudioprocess = null;
			this._volume = null;
			this._values = null;
			return this;
		};

		return Tone.Meter;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class Coerces the incoming mono or stereo signal into a stereo signal
		 *         where both left and right channels have the same value. 
		 *
		 *  @extends {Tone}
		 *  @constructor
		 */
		Tone.Mono = function(){
			Tone.call(this, 1, 0);

			/**
			 *  merge the signal
			 *  @type {Tone.Merge}
			 *  @private
			 */
			this._merge = this.output = new Tone.Merge();

			this.input.connect(this._merge, 0, 0);
			this.input.connect(this._merge, 0, 1);
			this.input.gain.value = this.dbToGain(-10);
		};

		Tone.extend(Tone.Mono);

		/**
		 *  clean up
		 *  @returns {Tone.Mono} `this`
		 */
		Tone.Mono.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._merge.dispose();
			this._merge = null;
			return this;
		};

		return Tone.Mono;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class A compressor with seperate controls over low/mid/high dynamics
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @param {Object} options the low/mid/high compressor settings in a single object
		 *  @example
		 *  var multiband = new Tone.MultibandCompressor({
		 *  	"lowFrequency" : 200,
		 *  	"highFrequency" : 1300
		 *  	"low" : {
		 *  		"threshold" : -12
		 *  	}
		 *  })
		 */
		Tone.MultibandCompressor = function(options){

			options = this.defaultArg(arguments, Tone.MultibandCompressor.defaults);

			/**
			 *  split the incoming signal into high/mid/low
			 *  @type {Tone.MultibandSplit}
			 *  @private
			 */
			this._splitter = this.input = new Tone.MultibandSplit({
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
			 *  the output
			 *  @type {GainNode}
			 *  @private
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
		 *  @returns {Tone.MultibandCompressor} `this`
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
			return this;
		};

		return Tone.MultibandCompressor;
	});
	ToneModule( function(Tone){

		

		/**
		 *	@class  Split the incoming signal into left and right channels
		 *	
		 *  @constructor
		 *  @extends {Tone}
		 *  @example
		 *  var split = new Tone.Split();
		 *  stereoSignal.connect(split);
		 */
		Tone.Split = function(){

			Tone.call(this, 1, 2);

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
		 *  @returns {Tone.Split} `this`
		 */
		Tone.Split.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._splitter.disconnect();
			this.left.disconnect();
			this.right.disconnect();
			this.left = null;
			this.right = null;
			this._splitter = null;
			return this;
		}; 

		return Tone.Split;
	});
	ToneModule( 
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
		 *  @example
		 *  var panner = new Tone.Panner(1);
		 *  // ^ pan the input signal hard right. 
		 */
		Tone.Panner = function(initialPan){

			Tone.call(this, 1, 0);
			
			/**
			 *  the dry/wet knob
			 *  @type {Tone.CrossFade}
			 *  @private
			 */
			this._crossFade = new Tone.CrossFade();
			
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
			this.pan = this._crossFade.fade;

			//CONNECTIONS:
			this.input.connect(this._splitter.left);
			this.input.connect(this._splitter.right);
			//left channel is dry, right channel is wet
			this._splitter.connect(this._crossFade, 0, 0);
			this._splitter.connect(this._crossFade, 1, 1);
			//merge it back together
			this._crossFade.a.connect(this._merger.left);
			this._crossFade.b.connect(this._merger.right);

			//initial value
			this.pan.value = this.defaultArg(initialPan, 0.5);
		};

		Tone.extend(Tone.Panner);

		/**
		 *  clean up
		 *  @returns {Tone.Panner} `this`
		 */
		Tone.Panner.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._crossFade.dispose();
			this._crossFade = null;
			this._splitter.dispose();
			this._splitter = null;
			this._merger.dispose();
			this._merger = null;
			this.pan = null;
			return this;
		};

		return Tone.Panner;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class A Panner and volume in one.
		 *
		 *  @extends {Tone}
		 *  @constructor
		 *  @example
		 *  var panVol = new Tone.PanVol(0.25, -12);
		 */
		Tone.PanVol = function(pan, volume){
			/**
			 *  the panning node
			 *  @type {Tone.Panner}
			 *  @private
			 */
			this._panner = this.input = new Tone.Panner(pan);

			/**
			 * the output node
			 * @type {GainNode}
			 */
			this.output = this.context.createGain();

			/**
			 *  The volume control in decibels. 
			 *  @type {Tone.Signal}
			 */
			this.volume = new Tone.Signal(this.output.gain, Tone.Signal.Units.Decibels);
			this.volume.value = this.defaultArg(volume, 0);

			/**
			 *  the panning control
			 *  @type {Tone.Panner}
			 *  @private
			 */
			this.pan = this._panner.pan;

			//connections
			this._panner.connect(this.output);
		};

		Tone.extend(Tone.PanVol);

		/**
		 *  clean up
		 *  @returns {Tone.PanVol} `this`
		 */
		Tone.PanVol.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._panner.dispose();
			this._panner = null;
			this.volume.dispose();
			this.volume = null;
			this.pan = null;
			return this;
		};

		return Tone.PanVol;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @deprecated
		 *  @class  Record an input into an array or AudioBuffer. 
		 *          it is limited in that the recording length needs to be known beforehand. 
		 *          Mostly used internally for testing. 
		 *
		 *  @constructor
		 *  @extends {Tone}
		 *  @param {number} channels 
		 */
		Tone.Recorder = function(channels){

			console.warn("Tone.Recorder is deprecated. It will be removed in next version");

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
		 *  @returns {Tone.Recorder} `this`
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
			return this;
		};

		/**
		 *  clears the recording buffer
		 *  @returns {Tone.PanVol} `this`
		 */
		Tone.Recorder.prototype.clear = function(){
			for (var i = 0; i < this.channels; i++){
				this._recordBuffers[i] = null;
			}
			this._recordBufferOffset = 0;
			return this;
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
		 *  @returns {Tone.PanVol} `this`
		 */
		Tone.Recorder.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._jsNode.disconnect();
			this._jsNode.onaudioprocess = undefined;
			this._jsNode = null;
			this._recordBuffers = null;
			return this;
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
	ToneModule( 
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
		 *  @example
		 *  var scaledEnv = new Tone.ScaledEnvelope({
		 *  	"attack" : 0.2,
		 *  	"min" : 200,
		 *  	"max" : 2000
		 *  });
		 *  scaledEnv.connect(oscillator.frequency);
		 */
		Tone.ScaledEnvelope = function(){

			//get all of the defaults
			var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);
			Tone.Envelope.call(this, options);
			options = this.defaultArg(options, Tone.ScaledEnvelope.defaults);

			/** 
			 *  scale the incoming signal by an exponent
			 *  @type {Tone.Pow}
			 *  @private
			 */
			this._exp = this.output = new Tone.Pow(options.exponent);

			/**
			 *  scale the signal to the desired range
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._scale = this.output = new Tone.Scale(options.min, options.max);

			this._sig.chain(this._exp, this._scale);
		};

		Tone.extend(Tone.ScaledEnvelope, Tone.Envelope);

		/**
		 *  the default parameters
		 *  @static
		 */
		Tone.ScaledEnvelope.defaults = {
			"min" : 0,
			"max" : 1,
			"exponent" : 1
		};

		/**
		 * The envelope's min output value. This is the value which it
		 * starts at. 
		 * @memberOf Tone.ScaledEnvelope#
		 * @type {number}
		 * @name min
		 */
		Object.defineProperty(Tone.ScaledEnvelope.prototype, "min", {
			get : function(){
				return this._scale.min;
			},
			set : function(min){
				this._scale.min = min;
			}
		});

		/**
		 * The envelope's max output value. In other words, the value
		 * at the peak of the attack portion of the envelope. 
		 * @memberOf Tone.ScaledEnvelope#
		 * @type {number}
		 * @name max
		 */
		Object.defineProperty(Tone.ScaledEnvelope.prototype, "max", {
			get : function(){
				return this._scale.max;
			},
			set : function(max){
				this._scale.max = max;
			}
		});

		/**
		 * The envelope's exponent value. 
		 * @memberOf Tone.ScaledEnvelope#
		 * @type {number}
		 * @name exponent
		 */
		Object.defineProperty(Tone.ScaledEnvelope.prototype, "exponent", {
			get : function(){
				return this._exp.value;
			},
			set : function(exp){
				this._exp.value = exp;
			}
		});
		
		/**
		 *  clean up
		 *  @returns {Tone.ScaledEnvelope} `this`
		 */
		Tone.ScaledEnvelope.prototype.dispose = function(){
			Tone.Envelope.prototype.dispose.call(this);
			this._scale.dispose();
			this._scale = null;
			this._exp.dispose();
			this._exp = null;
			return this;
		};

		return Tone.ScaledEnvelope;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class  Buffer loading and storage. Tone.Buffer is used internally by all 
		 *          classes that make requests for audio files such as {@link Tone.Player},
		 *          {@link Tone.Sampler} and {@link Tone.Convolver} .
		 *          <br><br>Aside from load callbacks from individual buffers, Tone.Buffer 
		 *  		provides static methods which keep track of the loading progress 
		 *  		of all of the buffers. These methods are `onload`, `onprogress`,
		 *  		and `onerror`. 
		 *
		 *  @constructor 
		 *  @param {AudioBuffer|string} url the url to load, or the audio buffer to set
		 */
		Tone.Buffer = function(){

			var options = this.optionsObject(arguments, ["url", "onload"], Tone.Buffer.defaults);

			/**
			 *  stores the loaded AudioBuffer
			 *  @type {AudioBuffer}
			 *  @private
			 */
			this._buffer = null;

			/**
			 *  the url of the buffer. `undefined` if it was 
			 *  constructed with a buffer
			 *  @type {string}
			 *  @readOnly
			 */
			this.url = undefined;

			/**
			 *  indicates if the buffer is loaded or not
			 *  @type {boolean}
			 *  @readOnly
			 */
			this.loaded = false;

			/**
			 *  the callback to invoke when everything is loaded
			 *  @type {function}
			 */
			this.onload = options.onload.bind(this, this);

			if (options.url instanceof AudioBuffer){
				this._buffer.set(options.url);
				this.onload(this);
			} else if (typeof options.url === "string"){
				this.url = options.url;
				Tone.Buffer._addToQueue(options.url, this);
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
			"url" : undefined,
			"onload" : function(){},
		};

		/**
		 *  set the buffer
		 *  @param {AudioBuffer|Tone.Buffer} buffer the buffer
		 *  @returns {Tone.Buffer} `this`
		 */
		Tone.Buffer.prototype.set = function(buffer){
			if (buffer instanceof Tone.Buffer){
				this._buffer = buffer.get();
			} else {
				this._buffer = buffer;
			}
			this.loaded = true;
			return this;
		};

		/**
		 *  @return {AudioBuffer} the audio buffer
		 */
		Tone.Buffer.prototype.get = function(){
			return this._buffer;
		};

		/**
		 *  @param {string} url the url to load
		 *  @param {function=} callback the callback to invoke on load. 
		 *                              don't need to set if `onload` is
		 *                              already set.
		 *  @returns {Tone.Buffer} `this`
		 */
		Tone.Buffer.prototype.load = function(url, callback){
			this.url = url;
			this.onload = this.defaultArg(callback, this.onload);
			Tone.Buffer._addToQueue(url, this);
			return this;
		};

		/**
		 *  dispose and disconnect
		 *  @returns {Tone.Buffer} `this`
		 */
		Tone.Buffer.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			Tone.Buffer._removeFromQueue(this);
			this._buffer = null;
			this.onload = null;
			return this;
		};

		/**
		 * the duration of the buffer
		 * @memberOf Tone.Buffer#
		 * @type {number}
		 * @name duration
		 * @readOnly
		 */
		Object.defineProperty(Tone.Buffer.prototype, "duration", {
			get : function(){
				if (this._buffer){
					return this._buffer.duration;
				} else {
					return 0;
				}
			},
		});

		///////////////////////////////////////////////////////////////////////////
		// STATIC METHODS
		///////////////////////////////////////////////////////////////////////////
		 
		/**
		 *  the static queue for all of the xhr requests
		 *  @type {Array}
		 *  @private
		 */
		Tone.Buffer._queue = [];

		/**
		 *  the array of current downloads
		 *  @type {Array}
		 *  @private
		 */
		Tone.Buffer._currentDownloads = [];

		/**
		 *  the total number of downloads
		 *  @type {number}
		 *  @private
		 */
		Tone.Buffer._totalDownloads = 0;

		/**
		 *  the maximum number of simultaneous downloads
		 *  @static
		 *  @type {number}
		 */
		Tone.Buffer.MAX_SIMULTANEOUS_DOWNLOADS = 6;
		
		/**
		 *  Adds a file to be loaded to the loading queue
		 *  @param   {string}   url      the url to load
		 *  @param   {function} callback the callback to invoke once it's loaded
		 *  @private
		 */
		Tone.Buffer._addToQueue = function(url, buffer){
			Tone.Buffer._queue.push({
				url : url,
				Buffer : buffer,
				progress : 0,
				xhr : null
			});
			this._totalDownloads++;
			Tone.Buffer._next();
		};

		/**
		 *  Remove an object from the queue's (if it's still there)
		 *  Abort the XHR if it's in progress
		 *  @param {Tone.Buffer} buffer the buffer to remove
		 *  @private
		 */
		Tone.Buffer._removeFromQueue = function(buffer){
			var i;
			for (i = 0; i < Tone.Buffer._queue.length; i++){
				var q = Tone.Buffer._queue[i];
				if (q.Buffer === buffer){
					Tone.Buffer._queue.splice(i, 1);
				}
			}
			for (i = 0; i < Tone.Buffer._currentDownloads.length; i++){
				var dl = Tone.Buffer._currentDownloads[i];
				if (dl.Buffer === buffer){
					Tone.Buffer._currentDownloads.splice(i, 1);
					dl.xhr.abort();
					dl.xhr.onprogress = null;
					dl.xhr.onload = null;
					dl.xhr.onerror = null;
				}
			}
		};

		/**
		 *  load the next buffer in the queue
		 *  @private
		 */
		Tone.Buffer._next = function(){
			if (Tone.Buffer._queue.length > 0){
				if (Tone.Buffer._currentDownloads.length < Tone.Buffer.MAX_SIMULTANEOUS_DOWNLOADS){
					var next = Tone.Buffer._queue.shift();
					Tone.Buffer._currentDownloads.push(next);
					next.xhr = Tone.Buffer.load(next.url, function(buffer){
						//remove this one from the queue
						var index = Tone.Buffer._currentDownloads.indexOf(next);
						Tone.Buffer._currentDownloads.splice(index, 1);
						next.Buffer.set(buffer);
						next.Buffer.onload(next.Buffer);
						Tone.Buffer._onprogress();
						Tone.Buffer._next();
					});
					next.xhr.onprogress = function(event){
						next.progress = event.loaded / event.total;
						Tone.Buffer._onprogress();
					};
					next.xhr.onerror = Tone.Buffer.onerror;
				} 
			} else if (Tone.Buffer._currentDownloads.length === 0){
				Tone.Buffer.onload();
				//reset the downloads
				Tone.Buffer._totalDownloads = 0;
			}
		};

		/**
		 *  internal progress event handler
		 *  @private
		 */
		Tone.Buffer._onprogress = function(){
			var curretDownloadsProgress = 0;
			var currentDLLen = Tone.Buffer._currentDownloads.length;
			var inprogress = 0;
			if (currentDLLen > 0){
				for (var i = 0; i < currentDLLen; i++){
					var dl = Tone.Buffer._currentDownloads[i];
					curretDownloadsProgress += dl.progress;
				}
				inprogress = curretDownloadsProgress;
			}
			var currentDownloadProgress = currentDLLen - inprogress;
			var completed = Tone.Buffer._totalDownloads - Tone.Buffer._queue.length - currentDownloadProgress;
			Tone.Buffer.onprogress(completed / Tone.Buffer._totalDownloads);
		};

		/**
		 *  makes an xhr reqest for the selected url
		 *  Load the audio file as an audio buffer.
		 *  Decodes the audio asynchronously and invokes
		 *  the callback once the audio buffer loads.
		 *  @param {string} url the url of the buffer to load.
		 *                      filetype support depends on the
		 *                      browser.
		 *  @param {function} callback function
		 *  @returns {XMLHttpRequest} returns the XHR
		 */
		Tone.Buffer.load = function(url, callback){
			var request = new XMLHttpRequest();
			request.open("GET", url, true);
			request.responseType = "arraybuffer";
			// decode asynchronously
			request.onload = function() {
				Tone.context.decodeAudioData(request.response, function(buff) {
					if(!buff){
						throw new Error("could not decode audio data:" + url);
					}
					callback(buff);
				});
			};
			//send the request
			request.send();
			return request;
		};

		/**
		 *  callback when all of the buffers in the queue have loaded
		 *  @static
		 *  @type {function}
		 *  @example
		 * //invoked when all of the queued samples are done loading
		 * Tone.Buffer.onload = function(){
		 * 	console.log("everything is loaded");
		 * };
		 */
		Tone.Buffer.onload = function(){};

		/**
		 *  Callback function is invoked with the progress of all of the loads in the queue. 
		 *  The value passed to the callback is between 0-1.
		 *  @static
		 *  @type {function}
		 *  @example
		 * Tone.Buffer.onprogress = function(percent){
		 * 	console.log("progress:" + (percent * 100).toFixed(1) + "%");
		 * };
		 */
		Tone.Buffer.onprogress = function(){};

		/**
		 *  Callback if one of the buffers in the queue encounters an error. The error
		 *  is passed in as the argument. 
		 *  @static
		 *  @type {function}
		 *  @example
		 * Tone.Buffer.onerror = function(e){
		 * 	console.log("there was an error while loading the buffers: "+e);
		 * }
		 */
		Tone.Buffer.onerror = function(){};

		return Tone.Buffer;
	});
	ToneModule( function(Tone){

		

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
		 *  @returns {Tone} `this`
		 */
		Tone.prototype.receive = function(channelName, input){
			if (!Buses.hasOwnProperty(channelName)){
				Buses[channelName] = this.context.createGain();	
			}
			if (this.isUndef(input)){
				input = this.input;
			}
			Buses[channelName].connect(input);
			return this;
		};

		return Tone;
	});
	ToneModule( function(Tone){

		

		/**
		 *  Frequency can be described similar to time, except ultimately the
		 *  values are converted to frequency instead of seconds. A number
		 *  is taken literally as the value in hertz. Additionally any of the 
		 *  {@link Tone.Time} encodings can be used. Note names in the form
		 *  of NOTE OCTAVE (i.e. `C4`) are also accepted and converted to their
		 *  frequency value. 
		 *  
		 *  @typedef {number|string|Tone.Time} Tone.Frequency
		 */

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
		 *  @returns {Tone.Note} `this`
		 */
		Tone.Note.prototype.dispose = function(){ 
			Tone.Tranport.clearTimeline(this._timelineID);
			this.value = null;
			return this;
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
		 *  Remove a previously routed callback from a channel. 
		 *  @static
		 *  @param {string|number} channel The channel to unroute note events from
		 *  @param {function(*)} callback Callback which was registered to the channel.
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
		 *  function registered using `Note.route(channelName, callback)`.
		 *
		 *  To convert MIDI files to score notation, take a look at utils/MidiToScore.js
		 *
		 *  @example
		 *  //an example JSON score which sets up events on channels
		 *  var score = { 
		 *  	"synth"  : [["0", "C3"], ["0:1", "D3"], ["0:2", "E3"], ... ],
		 *  	"bass"  : [["0", "C2"], ["1:0", "A2"], ["2:0", "C2"], ["3:0", "A2"], ... ],
		 *  	"kick"  : ["0", "0:2", "1:0", "1:2", "2:0", ... ],
		 *  	//...
		 *  };
		 *  //parse the score into Notes
		 *  Tone.Note.parseScore(score);
		 *  //route all notes on the "synth" channel
		 *  Tone.Note.route("synth", function(time, note){
		 *  	//trigger synth
		 *  });
		 *  @static
		 *  @param {Object} score
		 *  @return {Array<Tone.Note>} an array of all of the notes that were created
		 */
		Tone.Note.parseScore = function(score){
			var notes = [];
			for (var inst in score){
				var part = score[inst];
				if (inst === "tempo"){
					Tone.Transport.bpm.value = part;
				} else if (inst === "timeSignature"){
					Tone.Transport.timeSignature = part[0] / (part[1] / 4);
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
		 *  test if a string is in note format: i.e. "C4"
		 *  @param  {string|number}  note the note to test
		 *  @return {boolean}      true if it's in the form of a note
		 *  @method isNotation
		 *  @lends Tone.prototype.isNotation
		 */
		Tone.prototype.isNote = ( function(){
			var noteFormat = new RegExp(/[a-g]{1}([b#]{1}|[b#]{0})[0-9]+$/i);
			return function(note){
				if (typeof note === "string"){
					note = note.toLowerCase();
				} 
				return noteFormat.test(note);
			};
		})();

		/**
		 *  a pointer to the previous toFrequency method
		 *  @private
		 *  @function
		 */
		Tone.prototype._overwrittenToFrequency = Tone.prototype.toFrequency;

		/**
		 *  A method which accepts frequencies in the form
		 *  of notes (`"C#4"`), frequencies as strings ("49hz"), frequency numbers,
		 *  or Tone.Time and converts them to their frequency as a number in hertz.
		 *  @param  {Tone.Frequency} note the note name or notation
		 *  @param {number=} 	now 	if passed in, this number will be 
		 *                        		used for all 'now' relative timings
		 *  @return {number}      the frequency as a number
		 */
		Tone.prototype.toFrequency = function(note, now){
			if (this.isNote(note)){
				note = this.noteToFrequency(note);
			} 
			return this._overwrittenToFrequency(note, now);
		};

		/**
		 *  Convert a note name (i.e. A4, C#5, etc to a frequency).
		 *  Defined in "Tone/core/Note"
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
		 *  Convert an interval (in semitones) to a frequency ratio.
		 *
		 *  @param  {number} interval the number of semitones above the base note
		 *  @return {number}          the frequency ratio
		 *  @example
		 *  tone.intervalToFrequencyRatio(0); // returns 1
		 *  tone.intervalToFrequencyRatio(12); // returns 2
		 */
		Tone.prototype.intervalToFrequencyRatio = function(interval){
			return Math.pow(2,(interval/12));
		};

		/**
		 *  Convert a midi note number into a note name/
		 *
		 *  @param  {number} midiNumber the midi note number
		 *  @return {string}            the note's name and octave
		 *  @example
		 *  tone.midiToNote(60); // returns "C3"
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
		 *  @param  {string} note the note name (i.e. "C3")
		 *  @return {number} the midi value of that note
		 *  @example
		 *  tone.noteToMidi("C3"); // returns 60
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
	ToneModule( function(Tone){

		
		
		/**
		 * 	@class  Effect is the base class for effects. connect the effect between
		 * 	        the effectSend and effectReturn GainNodes. then control the amount of
		 * 	        effect which goes to the output using the dry/wet control.
		 *
		 *  @constructor
		 *  @extends {Tone}
		 *  @param {number} [initialWet=0] the starting wet value
		 *                                 defaults to 100% wet
		 */
		Tone.Effect = function(){

			Tone.call(this);

			//get all of the defaults
			var options = this.optionsObject(arguments, ["wet"], Tone.Effect.defaults);

			/**
			 *  the drywet knob to control the amount of effect
			 *  @type {Tone.CrossFade}
			 *  @private
			 */
			this._dryWet = new Tone.CrossFade(options.wet);

			/**
			 *  The wet control, i.e. how much of the effected
			 *  will pass through to the output. 
			 *  @type {Tone.Signal}
			 */
			this.wet = this._dryWet.fade;

			/**
			 *  connect the effectSend to the input of hte effect
			 *  
			 *  @type {GainNode}
			 *  @private
			 */
			this.effectSend = this.context.createGain();

			/**
			 *  connect the output of the effect to the effectReturn
			 *  
			 *  @type {GainNode}
			 *  @private
			 */
			this.effectReturn = this.context.createGain();

			//connections
			this.input.connect(this._dryWet.a);
			this.input.connect(this.effectSend);
			this.effectReturn.connect(this._dryWet.b);
			this._dryWet.connect(this.output);
		};

		Tone.extend(Tone.Effect);

		/**
		 *  @static
		 *  @type {Object}
		 */
		Tone.Effect.defaults = {
			"wet" : 1
		};

		/**
		 *  bypass the effect
		 *  @returns {Tone.Effect} `this`
		 */
		Tone.Effect.prototype.bypass = function(){
			this.wet.value = 0;
			return this;
		};

		/**
		 *  chains the effect in between the effectSend and effectReturn
		 *  @param  {Tone} effect
		 *  @private
		 *  @returns {Tone.Effect} `this`
		 */
		Tone.Effect.prototype.connectEffect = function(effect){
			this.effectSend.chain(effect, this.effectReturn);
			return this;
		};

		/**
		 *  tear down
		 *  @returns {Tone.Effect} `this`
		 */
		Tone.Effect.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._dryWet.dispose();
			this._dryWet = null;
			this.effectSend.disconnect();
			this.effectSend = null;
			this.effectReturn.disconnect();
			this.effectReturn = null;
			this.wet = null;
			return this;
		};

		return Tone.Effect;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class AutoPanner is a Tone.Panner with an LFO connected to the pan amount
		 *
		 *  @constructor
		 *  @extends {Tone.Effect}
		 *  @param {number} [frequency=1] (optional) rate in HZ of the left-right pan
		 *  @example
		 *  var autoPanner = new Tone.AutoPanner("4n");
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
			 * The amount of panning between left and right. 
			 * 0 = always center. 1 = full range between left and right. 
			 * @type {Tone.Signal}
			 */
			this.amount = this._lfo.amplitude;

			/**
			 *  the panner node which does the panning
			 *  @type {Tone.Panner}
			 *  @private
			 */
			this._panner = new Tone.Panner();

			/**
			 * How fast the panner modulates
			 * @type {Tone.Signal}
			 */
			this.frequency = this._lfo.frequency;

			//connections
			this.connectEffect(this._panner);
			this._lfo.connect(this._panner.pan);
			this.type = options.type;
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
			"type" : "sine",
			"amount" : 1
		};
		
		/**
		 * Start the panner.
		 * @param {Tone.Time} [time=now] the panner begins.
		 * @returns {Tone.AutoPanner} `this`
		 */
		Tone.AutoPanner.prototype.start = function(time){
			this._lfo.start(time);
			return this;
		};

		/**
		 * Stop the panner.
		 * @param {Tone.Time} [time=now] the panner stops.
		 * @returns {Tone.AutoPanner} `this`
		 */
		Tone.AutoPanner.prototype.stop = function(time){
			this._lfo.stop(time);
			return this;
		};

		/**
		 * Sync the panner to the transport.
		 * @returns {Tone.AutoPanner} `this`
		 */
		Tone.AutoPanner.prototype.sync = function(){
			this._lfo.sync();
			return this;
		};

		/**
		 * Unsync the panner from the transport
		 * @returns {Tone.AutoPanner} `this`
		 */
		Tone.AutoPanner.prototype.unsync = function(){
			this._lfo.unsync();
			return this;
		};

		/**
		 * Type of oscillator attached to the AutoPanner.
		 * @memberOf Tone.AutoPanner#
		 * @type {string}
		 * @name type
		 */
		Object.defineProperty(Tone.AutoPanner.prototype, "type", {
			get : function(){
				return this._lfo.type;
			},
			set : function(type){
				this._lfo.type = type;
			}
		});

		/**
		 *  clean up
		 *  @returns {Tone.AutoPanner} `this`
		 */
		Tone.AutoPanner.prototype.dispose = function(){
			Tone.Effect.prototype.dispose.call(this);
			this._lfo.dispose();
			this._lfo = null;
			this._panner.dispose();
			this._panner = null;
			this.frequency = null;
			this.amount = null;
			return this;
		};

		return Tone.AutoPanner;
	});

	ToneModule( 
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
		 *  @example
		 *  var autoWah = new Tone.AutoWah(100, 6, -20);
		 */
		Tone.AutoWah = function(){

			var options = this.optionsObject(arguments, ["baseFrequency", "octaves", "sensitivity"], Tone.AutoWah.defaults);
			Tone.Effect.call(this, options);

			/**
			 *  the envelope follower
			 *  @type {Tone.Follower}
			 *  @private
			 */
			this.follower = new Tone.Follower(options.follower);

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
			 *  the input gain to adjust the senstivity
			 *  @type {GainNode}
			 *  @private
			 */
			this._inputBoost = this.context.createGain();

			/**
			 *  @type {BiquadFilterNode}
			 *  @private
			 */
			this._bandpass = new Tone.Filter({
				"rolloff" : -48,
				"frequency" : 0,
				"Q" : options.Q,
			});
		
			/**
			 *  @type {Tone.Filter}
			 *  @private
			 */
			this._peaking = new Tone.Filter(0, "peaking");
			this._peaking.gain.value = options.gain;

			/**
			 * the gain of the filter.
			 * @type {Tone.Signal}
			 */
			this.gain = this._peaking.gain;

			/**
			 * The quality of the filter.
			 * @type {Tone.Signal}
			 */
			this.Q = this._bandpass.Q;

			//the control signal path
			this.effectSend.chain(this._inputBoost, this.follower, this._sweepRange);
			this._sweepRange.connect(this._bandpass.frequency);
			this._sweepRange.connect(this._peaking.frequency);
			//the filtered path
			this.effectSend.chain(this._bandpass, this._peaking, this.effectReturn);
			//set the initial value
			this._setSweepRange();
			this.sensitivity = options.sensitivity;
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
			"follower" : {
				"attack" : 0.3,
				"release" : 0.5
			}
		};

		/**
		 * The number of octaves that the filter will sweep.
		 * @memberOf Tone.AutoWah#
		 * @type {number}
		 * @name octaves
		 */
		Object.defineProperty(Tone.AutoWah.prototype, "octaves", {
			get : function(){
				return this._octaves;
			}, 
			set : function(octaves){
				this._octaves = octaves;
				this._setSweepRange();
			}
		});

		/**
		 * The base frequency from which the sweep will start from.
		 * @memberOf Tone.AutoWah#
		 * @type {Tone.Frequency}
		 * @name baseFrequency
		 */
		Object.defineProperty(Tone.AutoWah.prototype, "baseFrequency", {
			get : function(){
				return this._baseFrequency;
			}, 
			set : function(baseFreq){
				this._baseFrequency = baseFreq;
				this._setSweepRange();
			}
		});

		/**
		 * The sensitivity to control how responsive to the input signal the filter is. 
		 * in Decibels. 
		 * @memberOf Tone.AutoWah#
		 * @type {number}
		 * @name sensitivity
		 */
		Object.defineProperty(Tone.AutoWah.prototype, "sensitivity", {
			get : function(){
				return this.gainToDb(1 / this._inputBoost.gain.value);
			}, 
			set : function(sensitivy){
				this._inputBoost.gain.value = 1 / this.dbToGain(sensitivy);
			}
		});

		/**
		 *  sets the sweep range of the scaler
		 *  @private
		 */
		Tone.AutoWah.prototype._setSweepRange = function(){
			this._sweepRange.min = this._baseFrequency;
			this._sweepRange.max = Math.min(this._baseFrequency * Math.pow(2, this._octaves), this.context.sampleRate / 2);
		};

		/**
		 *  clean up
		 *  @returns {Tone.AutoWah} `this`
		 */
		Tone.AutoWah.prototype.dispose = function(){
			Tone.Effect.prototype.dispose.call(this);
			this.follower.dispose();
			this.follower = null;
			this._sweepRange.dispose();
			this._sweepRange = null;
			this._bandpass.dispose();
			this._bandpass = null;
			this._peaking.dispose();
			this._peaking = null;
			this._inputBoost.disconnect();
			this._inputBoost = null;
			this.gain = null;
			this.Q = null;
			return this;
		};

		return Tone.AutoWah;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class Downsample incoming signal to a different bitdepth. 
		 *
		 *  @constructor
		 *  @extends {Tone.Effect}
		 *  @param {number} bits 1-8. 
		 *  @example
		 *  var crusher = new Tone.BitCrusher(4);
		 */
		Tone.BitCrusher = function(){

			var options = this.optionsObject(arguments, ["bits"], Tone.BitCrusher.defaults);
			Tone.Effect.call(this, options);

			var invStepSize = 1 / Math.pow(2, options.bits - 1);

			/**
			 *  Subtract the input signal and the modulus of the input signal
			 *  @type {Tone.Subtract}
			 *  @private
			 */
			this._subtract = new Tone.Subtract();

			/**
			 *  The mod function
			 *  @type  {Tone.Modulo}
			 *  @private
			 */
			this._modulo = new Tone.Modulo(invStepSize);

			/**
			 *  keeps track of the bits
			 *  @type {number}
			 *  @private
			 */
			this._bits = options.bits;

			//connect it up
			this.effectSend.fan(this._subtract, this._modulo);
			this._modulo.connect(this._subtract, 0, 1);
			this._subtract.connect(this.effectReturn);
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
		 * The bit depth of the BitCrusher
		 * @memberOf Tone.BitCrusher#
		 * @type {number}
		 * @name bits
		 */
		Object.defineProperty(Tone.BitCrusher.prototype, "bits", {
			get : function(){
				return this._bits;
			},
			set : function(bits){
				this._bits = bits;
				var invStepSize = 1 / Math.pow(2, bits - 1);
				this._modulo.value = invStepSize;
			}
		});

		/**
		 *  clean up
		 *  @returns {Tone.BitCrusher} `this`
		 */
		Tone.BitCrusher.prototype.dispose = function(){
			Tone.Effect.prototype.dispose.call(this);
			this._subtract.dispose();
			this._subtract = null;
			this._modulo.dispose();
			this._modulo = null;
			return this;
		}; 

		return Tone.BitCrusher;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class A Chebyshev waveshaper. Good for making different types of distortion sounds.
		 *         Note that odd orders sound very different from even ones. order = 1 is no change. 
		 *         http://music.columbia.edu/cmc/musicandcomputers/chapter4/04_06.php
		 *
		 *  @extends {Tone.Effect}
		 *  @constructor
		 *  @param {number} order The order of the chebyshev polynomial. Normal range between 1-100. 
		 *  @example
		 *  var cheby = new Tone.Chebyshev(50);
		 */
		Tone.Chebyshev = function(){

			var options = this.optionsObject(arguments, ["order"], Tone.Chebyshev.defaults);
			Tone.Effect.call(this);

			/**
			 *  @type {WaveShaperNode}
			 *  @private
			 */
			this._shaper = new Tone.WaveShaper(4096);

			/**
			 * holds onto the order of the filter
			 * @type {number}
			 * @private
			 */
			this._order = options.order;

			this.connectEffect(this._shaper);
			this.order = options.order;
			this.oversample = options.oversample;
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
		 * The order of the Chebyshev polynomial i.e.
		 * order = 2 -> 2x^2 + 1. order = 3 -> 4x^3 + 3x. 
		 * @memberOf Tone.Chebyshev#
		 * @type {number}
		 * @name order
		 */
		Object.defineProperty(Tone.Chebyshev.prototype, "order", {
			get : function(){
				return this._order;
			},
			set : function(order){
				this._order = order;
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
				this._shaper.curve = curve;
			} 
		});

		/**
		 * The oversampling of the effect. Can either be "none", "2x" or "4x".
		 * @memberOf Tone.Chebyshev#
		 * @type {string}
		 * @name oversample
		 */
		Object.defineProperty(Tone.Chebyshev.prototype, "oversample", {
			get : function(){
				return this._shaper.oversample;
			},
			set : function(oversampling){
				this._shaper.oversample = oversampling;
			} 
		});


		/**
		 *  clean up
		 *  @returns {Tone.Chebyshev} `this`
		 */
		Tone.Chebyshev.prototype.dispose = function(){
			Tone.Effect.prototype.dispose.call(this);
			this._shaper.dispose();
			this._shaper = null;
			return this;
		};

		return Tone.Chebyshev;
	});
	ToneModule( 
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
			var options = this.optionsObject(arguments, ["wet"], Tone.Effect.defaults);

			/**
			 *  the drywet knob to control the amount of effect
			 *  @type {Tone.CrossFade}
			 *  @private
			 */
			this._dryWet = new Tone.CrossFade(options.wet);

			/**
			 *  The wet control, i.e. how much of the effected
			 *  will pass through to the output. 
			 *  @type {Tone.Signal}
			 */
			this.wet = this._dryWet.fade;

			/**
			 *  then split it
			 *  @type {Tone.Split}
			 *  @private
			 */
			this._split = new Tone.Split();

			/**
			 *  the effects send LEFT
			 *  @type {GainNode}
			 *  @private
			 */
			this.effectSendL = this._split.left;

			/**
			 *  the effects send RIGHT
			 *  @type {GainNode}
			 *  @private
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
			this.input.connect(this._dryWet, 0, 0);
			this._merge.connect(this._dryWet, 0, 1);
			this._dryWet.connect(this.output);
		};

		Tone.extend(Tone.StereoEffect, Tone.Effect);

		/**
		 *  clean up
		 *  @returns {Tone.StereoEffect} `this`
		 */
		Tone.StereoEffect.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._dryWet.dispose();
			this._dryWet = null;
			this._split.dispose();
			this._split = null;
			this._merge.dispose();
			this._merge = null;
			this.effectSendL = null;
			this.effectSendR = null;
			this.effectReturnL = null;
			this.effectReturnR = null;
			this.wet = null;
			return this;
		};

		return Tone.StereoEffect;
	});
	ToneModule( function(Tone){

		
		
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
			this.feedback = new Tone.Signal(options.feedback, Tone.Signal.Units.Normal);
			
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
		 *  clean up
		 *  @returns {Tone.FeedbackEffect} `this`
		 */
		Tone.FeedbackEffect.prototype.dispose = function(){
			Tone.Effect.prototype.dispose.call(this);
			this.feedback.dispose();
			this.feedback = null;
			this._feedbackGain.disconnect();
			this._feedbackGain = null;
			return this;
		};

		return Tone.FeedbackEffect;
	});

	ToneModule( 
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
		 *  @returns {Tone.StereoXFeedbackEffect} `this`
		 */
		Tone.StereoXFeedbackEffect.prototype.dispose = function(){
			Tone.StereoEffect.prototype.dispose.call(this);
			this.feedback.dispose();
			this.feedback = null;
			this._feedbackLR.disconnect();
			this._feedbackLR = null;
			this._feedbackRL.disconnect();
			this._feedbackRL = null;
			return this;
		};

		return Tone.StereoXFeedbackEffect;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class A Chorus effect with feedback. inspiration from https://github.com/Dinahmoe/tuna/blob/master/tuna.js
		 *
		 *	@constructor
		 *	@extends {Tone.StereoXFeedbackEffect}
		 *	@param {number|Object} [frequency=2] the frequency of the effect
		 *	@param {number} [delayTime=3.5] the delay of the chorus effect in ms
		 *	@param {number} [depth=0.7] the depth of the chorus
		 *	@example
		 * 	var chorus = new Tone.Chorus(4, 2.5, 0.5);
		 */
		Tone.Chorus = function(){

			var options = this.optionsObject(arguments, ["frequency", "delayTime", "depth"], Tone.Chorus.defaults);
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
			this._lfoR.phase = 180;

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

			/**
			 * The frequency the chorus will modulate at. 
			 * @type {Tone.Signal}
			 */
			this.frequency = this._lfoL.frequency;

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
			this.depth = this._depth;
			this.frequency.value = options.frequency;
			this.type = options.type;
		};

		Tone.extend(Tone.Chorus, Tone.StereoXFeedbackEffect);

		/**
		 *  @static
		 *  @type {Object}
		 */
		Tone.Chorus.defaults = {
			"frequency" : 1.5, 
			"delayTime" : 3.5,
			"depth" : 0.7,
			"feedback" : 0.1,
			"type" : "sine"
		};

		/**
		 * The depth of the effect. 
		 * @memberOf Tone.Chorus#
		 * @type {number}
		 * @name depth
		 */
		Object.defineProperty(Tone.Chorus.prototype, "depth", {
			get : function(){
				return this._depth;
			},
			set : function(depth){
				this._depth = depth;
				var deviation = this._delayTime * depth;
				this._lfoL.min = this._delayTime - deviation;
				this._lfoL.max = this._delayTime + deviation;
				this._lfoR.min = this._delayTime - deviation;
				this._lfoR.max = this._delayTime + deviation;
			}
		});

		/**
		 * The delayTime in milliseconds
		 * @memberOf Tone.Chorus#
		 * @type {number}
		 * @name delayTime
		 */
		Object.defineProperty(Tone.Chorus.prototype, "delayTime", {
			get : function(){
				return this._delayTime * 1000;
			},
			set : function(delayTime){
				this._delayTime = delayTime / 1000;
				this.depth = this._depth;
			}
		});

		/**
		 * The lfo type for the chorus. 
		 * @memberOf Tone.Chorus#
		 * @type {string}
		 * @name type
		 */
		Object.defineProperty(Tone.Chorus.prototype, "type", {
			get : function(){
				return this._lfoL.type;
			},
			set : function(type){
				this._lfoL.type = type;
				this._lfoR.type = type;
			}
		});

		/**
		 *  clean up
		 *  @returns {Tone.Chorus} `this`
		 */
		Tone.Chorus.prototype.dispose = function(){
			Tone.StereoXFeedbackEffect.prototype.dispose.call(this);
			this._lfoL.dispose();
			this._lfoL = null;
			this._lfoR.dispose();
			this._lfoR = null;
			this._delayNodeL.disconnect();
			this._delayNodeL = null;
			this._delayNodeR.disconnect();
			this._delayNodeR = null;
			this.frequency = null;
			return this;
		};

		return Tone.Chorus;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class  Convolver wrapper for reverb and emulation.
		 *  
		 *  @constructor
		 *  @extends {Tone.Effect}
		 *  @param {string|AudioBuffer=} url
		 *  @example
		 *  var convolver = new Tone.Convolver("./path/to/ir.wav");
		 */
		Tone.Convolver = function(url){

			Tone.Effect.apply(this, arguments);

		  	/**
			 *  convolver node
			 *  @type {ConvolverNode}
			 *  @private
			 */
			this._convolver = this.context.createConvolver();

			/**
			 *  the convolution buffer
			 *  @type {Tone.Buffer}
			 *  @private
			 */
			this._buffer = new Tone.Buffer(url, function(buffer){
				this.buffer = buffer;
			}.bind(this));

			this.connectEffect(this._convolver);
		};

		Tone.extend(Tone.Convolver, Tone.Effect);

		/**
		 *  The convolver's buffer
		 *  @memberOf Tone.Convolver#
		 *  @type {AudioBuffer}
		 *  @name buffer
		 */
		Object.defineProperty(Tone.Convolver.prototype, "buffer", {
			get : function(){
				return this._buffer.get();
			},
			set : function(buffer){
				this._buffer.set(buffer);
				this._convolver.buffer = buffer;
			}
		});

		/**
		 *  Load an impulse response url as an audio buffer.
		 *  Decodes the audio asynchronously and invokes
		 *  the callback once the audio buffer loads.
		 *  @param {string} url the url of the buffer to load.
		 *                      filetype support depends on the
		 *                      browser.
		 *  @param  {function=} callback
		 *  @returns {Tone.Convolver} `this`
		 */
		Tone.Convolver.prototype.load = function(url, callback){
			this._buffer.load(url, function(buff){
				this.buffer = buff;
				if (callback){
					callback();
				}
			}.bind(this));
			return this;
		};

		/**
		 *  dispose and disconnect
		 *  @returns {Tone.Convolver} `this`
		 */
		Tone.Convolver.prototype.dispose = function(){
			Tone.Effect.prototype.dispose.call(this);
			this._convolver.disconnect();
			this._convolver = null;
			this._buffer.dispose();
			this._buffer = null;
			return this;
		}; 

		return Tone.Convolver;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class A simple distortion effect using the waveshaper node
		 *         algorithm from http://stackoverflow.com/a/22313408
		 *
		 *  @extends {Tone.Effect}
		 *  @constructor
		 *  @param {number} distortion the amount of distortion (nominal range of 0-1)
		 *  @example
		 *  var dist = new Tone.Distortion(0.8);
		 */
		Tone.Distortion = function(){

			var options = this.optionsObject(arguments, ["distortion"], Tone.Distortion.defaults);

			Tone.Effect.call(this);

			/**
			 *  @type {Tone.WaveShaper}
			 *  @private
			 */
			this._shaper = new Tone.WaveShaper(4096);

			/**
			 * holds the distortion amount
			 * @type {number}
			 * @private
			 */
			this._distortion = options.distortion;

			this.connectEffect(this._shaper);
			this.distortion = options.distortion;
			this.oversample = options.oversample;
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
		 * The amount of distortion. Range between 0-1. 
		 * @memberOf Tone.Distortion#
		 * @type {number}
		 * @name distortion
		 */
		Object.defineProperty(Tone.Distortion.prototype, "distortion", {
			get : function(){
				return this._distortion;
			},
			set : function(amount){
				this._distortion = amount;
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
			} 
		});

		/**
		 * The oversampling of the effect. Can either be "none", "2x" or "4x".
		 * @memberOf Tone.Distortion#
		 * @type {string}
		 * @name oversample
		 */
		Object.defineProperty(Tone.Distortion.prototype, "oversample", {
			get : function(){
				return this._shaper.oversample;
			},
			set : function(oversampling){
				this._shaper.oversample = oversampling;
			} 
		});

		/**
		 *  clean up
		 *  @returns {Tone.Distortion} `this`
		 */
		Tone.Distortion.prototype.dispose = function(){
			Tone.Effect.prototype.dispose.call(this);
			this._shaper.dispose();
			this._shaper = null;
			return this;
		};

		return Tone.Distortion;
	});
	ToneModule( function(Tone){

		
		
		/**
		 *  @class  A feedback delay
		 *
		 *  @constructor
		 *  @extends {Tone.FeedbackEffect}
		 *  @param {Tone.Time} [delayTime=0.25] The delay time in seconds. 
		 *  @param {number=} feedback The amount of the effected signal which 
		 *                            is fed back through the delay.
		 *  @example
		 *  var feedbackDelay = new Tone.FeedbackDelay("8n", 0.25);
		 */
		Tone.FeedbackDelay = function(){
			
			var options = this.optionsObject(arguments, ["delayTime", "feedback"], Tone.FeedbackDelay.defaults);
			Tone.FeedbackEffect.call(this, options);

			/**
			 *  Tone.Signal to control the delay amount
			 *  @type {Tone.Signal}
			 */
			this.delayTime = new Tone.Signal(options.delayTime, Tone.Signal.Units.Time);

			/**
			 *  the delay node
			 *  @type {DelayNode}
			 *  @private
			 */
			this._delayNode = this.context.createDelay(4);

			// connect it up
			this.connectEffect(this._delayNode);
			this.delayTime.connect(this._delayNode.delayTime);
		};

		Tone.extend(Tone.FeedbackDelay, Tone.FeedbackEffect);

		/**
		 *  The default values. 
		 *  @const
		 *  @static
		 *  @type {Object}
		 */
		Tone.FeedbackDelay.defaults = {
			"delayTime" : 0.25,
		};
		
		/**
		 *  clean up
		 *  @returns {Tone.FeedbackDelay} `this`
		 */
		Tone.FeedbackDelay.prototype.dispose = function(){
			Tone.FeedbackEffect.prototype.dispose.call(this);
			this.delayTime.dispose();
			this._delayNode.disconnect();
			this._delayNode = null;
			this.delayTime = null;
			return this;
		};

		return Tone.FeedbackDelay;
	});
	ToneModule( 
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
		 *  @example
		 *  var freeverb = new Tone.Freeverb(0.4, 0.2);
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
		 *  clean up
		 *  @returns {Tone.Freeverb} `this`
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
			return this;
		};

		return Tone.Freeverb;
	});
	ToneModule( 
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
		 *  @param {number} roomSize Coorelates to the decay time. Value between 0,1
		 *  @example
		 *  var freeverb = new Tone.Freeverb(0.4);
		 */
		Tone.JCReverb = function(){

			var options = this.optionsObject(arguments, ["roomSize"], Tone.JCReverb.defaults);
			Tone.StereoEffect.call(this, options);

			/**
			 *  room size control values between [0,1]
			 *  @type {Tone.Signal}
			 */
			this.roomSize = new Tone.Signal(options.roomSize, Tone.Signal.Units.Normal);

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
				fbcf.resonance.value = combFilterResonances[cf];
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
		 *  clean up
		 *  @returns {Tone.JCReverb} `this`
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
			return this;
		};

		return Tone.JCReverb;
	});
	ToneModule( function(Tone){

		

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
		 *  @returns {Tone.MidSideEffect} `this`
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
			return this;
		};

		return Tone.MidSideEffect;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class A Phaser effect. inspiration from https://github.com/Dinahmoe/tuna/
		 *
		 *	@extends {Tone.StereoEffect}
		 *	@constructor
		 *	@param {number|Object} [frequency=0.5] the speed of the phasing
		 *	@param {number} [depth=10] the depth of the effect
		 *	@param {number} [baseFrequency=400] the base frequency of the filters
		 *	@example
		 * 	var phaser = new Tone.Phaser(0.4, 12, 550);
		 */
		Tone.Phaser = function(){

			//set the defaults
			var options = this.optionsObject(arguments, ["frequency", "depth", "baseFrequency"], Tone.Phaser.defaults);
			Tone.StereoEffect.call(this, options);

			/**
			 *  the lfo which controls the frequency on the left side
			 *  @type {Tone.LFO}
			 *  @private
			 */
			this._lfoL = new Tone.LFO(options.frequency, 0, 1);

			/**
			 *  the lfo which controls the frequency on the right side
			 *  @type {Tone.LFO}
			 *  @private
			 */
			this._lfoR = new Tone.LFO(options.frequency, 0, 1);
			this._lfoR.phase = 180;

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

			/**
			 * the frequency of the effect
			 * @type {Tone.Signal}
			 */
			this.frequency = this._lfoL.frequency;
			this.frequency.value = options.frequency;
			
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
			this.baseFrequency = options.baseFrequency;
			this.depth = options.depth;
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
			"frequency" : 0.5,
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
		 * The depth of the effect. 
		 * @memberOf Tone.Phaser#
		 * @type {number}
		 * @name depth
		 */
		Object.defineProperty(Tone.Phaser.prototype, "depth", {
			get : function(){
				return this._depth;
			},
			set : function(depth){
				this._depth = depth;
				var max = this._baseFrequency + this._baseFrequency * depth;
				this._lfoL.max = max;
				this._lfoR.max = max;
			}
		});

		/**
		 * The the base frequency of the filters. 
		 * @memberOf Tone.Phaser#
		 * @type {string}
		 * @name baseFrequency
		 */
		Object.defineProperty(Tone.Phaser.prototype, "baseFrequency", {
			get : function(){
				return this._baseFrequency;
			},
			set : function(freq){
				this._baseFrequency = freq;	
				this._lfoL.min = freq;
				this._lfoR.min = freq;
				this.depth = this._depth;
			}
		});

		/**
		 *  clean up
		 *  @returns {Tone.Phaser} `this`
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
			this.frequency = null;
			return this;
		};

		return Tone.Phaser;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class  PingPongDelay is a dual delay effect where the echo is heard
		 *          first in one channel and next in the opposite channel
		 *
		 * 	@constructor
		 * 	@extends {Tone.StereoXFeedbackEffect}
		 *  @param {Tone.Time|Object} [delayTime=0.25] is the interval between consecutive echos
		 *  @param {number=} feedback The amount of the effected signal which 
		 *                            is fed back through the delay.
		 *  @example
		 *  var pingPong = new Tone.PingPongDelay("4n", 0.2);
		 */
		Tone.PingPongDelay = function(){
			
			var options = this.optionsObject(arguments, ["delayTime", "feedback"], Tone.PingPongDelay.defaults);
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
			 *  the predelay on the right side
			 *  @type {DelayNode}
			 *  @private
			 */
			this._rightPreDelay = this.context.createDelay(options.maxDelayTime);

			/**
			 *  the delay time signal
			 *  @type {Tone.Signal}
			 */
			this.delayTime = new Tone.Signal(options.delayTime, Tone.Signal.Units.Time);

			//connect it up
			this.effectSendL.chain(this._leftDelay, this.effectReturnL);
			this.effectSendR.chain(this._rightPreDelay, this._rightDelay, this.effectReturnR);
			this.delayTime.fan(this._leftDelay.delayTime, this._rightDelay.delayTime, this._rightPreDelay.delayTime);
			//rearranged the feedback to be after the rightPreDelay
			this._feedbackLR.disconnect();
			this._feedbackLR.connect(this._rightDelay);
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
		 *  clean up
		 *  @returns {Tone.PingPongDelay} `this`
		 */
		Tone.PingPongDelay.prototype.dispose = function(){
			Tone.StereoXFeedbackEffect.prototype.dispose.call(this);
			this._leftDelay.disconnect();
			this._leftDelay = null;
			this._rightDelay.disconnect();
			this._rightDelay = null;
			this._rightPreDelay.disconnect();
			this._rightPreDelay = null;
			this.delayTime.dispose();
			this.delayTime = null;
			return this;
		};

		return Tone.PingPongDelay;
	});
	ToneModule( 
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
		 *  @returns {Tone.StereoFeedbackEffect} `this`
		 */
		Tone.StereoFeedbackEffect.prototype.dispose = function(){
			Tone.StereoEffect.prototype.dispose.call(this);
			this.feedback.dispose();
			this.feedback = null;
			this._feedbackL.disconnect();
			this._feedbackL = null;
			this._feedbackR.disconnect();
			this._feedbackR = null;
			return this;
		};

		return Tone.StereoFeedbackEffect;
	});
	ToneModule( 
		function(Tone){

		

		/**
		 *  @class Applies a width factor (0-1) to the mid/side seperation. 
		 *         0 is all mid and 1 is all side. <br><br>
		 *         http://musicdsp.org/showArchiveComment.php?ArchiveID=173<br><br>
		 *         http://www.kvraudio.com/forum/viewtopic.php?t=212587<br><br>
		 *         M *= 2*(1-width)<br><br>
		 *         S *= 2*width<br><br>
		 *
		 *  @extends {Tone.MidSideEffect}
		 *  @constructor
		 *  @param {number|Object} [width=0.5] the stereo width. A width of 0 is mono and 1 is stereo. 0.5 is no change.
		 */
		Tone.StereoWidener = function(){

			var options = this.optionsObject(arguments, ["width"], Tone.StereoWidener.defaults);
			Tone.MidSideEffect.call(this, options);

			/**
			 *  The width control. 0 = 100% mid. 1 = 100% side. 
			 *  @type {Tone.Signal}
			 */
			this.width = new Tone.Signal(0.5, Tone.Signal.Units.Normal);

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
		 *  clean up
		 *  @returns {Tone.StereoWidener} `this`
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
			return this;
		};

		return Tone.StereoWidener;
	});
	ToneModule(
	function(Tone){

		

		/**
		 *  @class Pulse Oscillator with control over width
		 *
		 *  @constructor
		 *  @extends {Tone.Oscillator}
		 *  @param {number} [frequency=440] the frequency of the oscillator
		 *  @param {number} [width = 0.2] the width of the pulse
		 *  @example
		 *  var pulse = new Tone.PulseOscillator("E5", 0.4);
		 */
		Tone.PulseOscillator = function(){

			var options = this.optionsObject(arguments, ["frequency", "width"], Tone.Oscillator.defaults);
			Tone.Source.call(this, options);

			/**
			 *  the width of the pulse
			 *  @type {Tone.Signal}
			 */
			this.width = new Tone.Signal(options.width, Tone.Signal.Units.Normal);

			/**
			 *  gate the width amount
			 *  @type {GainNode}
			 *  @private
			 */
			this._widthGate = this.context.createGain();

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
			 *  The frequency in hertz
			 *  @type {Tone.Signal}
			 */
			this.frequency = this._sawtooth.frequency;

			/**
			 *  The detune in cents. 
			 *  @type {Tone.Signal}
			 */
			this.detune = this._sawtooth.detune;

			/**
			 *  Threshold the signal to turn it into a square
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
			this.width.chain(this._widthGate, this._thresh);
		};

		Tone.extend(Tone.PulseOscillator, Tone.Oscillator);

		/**
		 *  The default parameters.
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.PulseOscillator.defaults = {
			"frequency" : 440,
			"detune" : 0,
			"phase" : 0,
			"width" : 0.2,
		};

		/**
		 *  start the oscillator
		 *  @param  {Tone.Time} time 
		 *  @private
		 */
		Tone.PulseOscillator.prototype._start = function(time){
			time = this.toSeconds(time);
			this._sawtooth.start(time);
			this._widthGate.gain.setValueAtTime(1, time);
		};

		/**
		 *  stop the oscillator
		 *  @param  {Tone.Time} time 
		 *  @private
		 */
		Tone.PulseOscillator.prototype._stop = function(time){
			time = this.toSeconds(time);
			this._sawtooth.stop(time);
			//the width is still connected to the output. 
			//that needs to be stopped also
			this._widthGate.gain.setValueAtTime(0, time);
		};

		/**
		 * The phase of the oscillator in degrees.
		 * @memberOf Tone.PulseOscillator#
		 * @type {number}
		 * @name phase
		 */
		Object.defineProperty(Tone.PulseOscillator.prototype, "phase", {
			get : function(){
				return this._sawtooth.phase;
			}, 
			set : function(phase){
				this._sawtooth.phase = phase;
			}
		});

		/**
		 * The type of the oscillator. Always returns "pulse".
		 * @readOnly
		 * @memberOf Tone.PulseOscillator#
		 * @type {string}
		 * @name type
		 */
		Object.defineProperty(Tone.PulseOscillator.prototype, "type", {
			get : function(){
				return "pulse";
			}
		});

		/**
		 *  Clean up method
		 *  @return {Tone.PulseOscillator} `this`
		 */
		Tone.PulseOscillator.prototype.dispose = function(){
			Tone.Source.prototype.dispose.call(this);
			this._sawtooth.dispose();
			this._sawtooth = null;
			this.width.dispose();
			this.width = null;
			this._widthGate.disconnect();
			this._widthGate = null;
			this._thresh.disconnect();
			this._thresh = null;
			this.frequency = null;
			this.detune = null;
			return this;
		};

		return Tone.PulseOscillator;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class takes an array of Oscillator descriptions and mixes them together
		 *         with the same detune and frequency controls. 
		 *
		 *  @extends {Tone.Oscillator}
		 *  @constructor
		 *  @param {frequency} frequency frequency of the oscillator (meaningless for noise types)
		 *  @param {number} modulationFrequency the modulation frequency of the oscillator
		 *  @example
		 *  var pwm = new Tone.PWMOscillator("Ab3", 0.3);
		 */
		Tone.PWMOscillator = function(){
			var options = this.optionsObject(arguments, ["frequency", "modulationFrequency"], Tone.PWMOscillator.defaults);
			Tone.Source.call(this, options);

			/**
			 *  the pulse oscillator
			 */
			this._pulse = new Tone.PulseOscillator(options.modulationFrequency);
			//change the pulse oscillator type
			this._pulse._sawtooth.type = "sine";

			/**
			 *  the modulator
			 *  @type {Tone.Oscillator}
			 *  @private
			 */
			this._modulator = new Tone.Oscillator({
				"frequency" : options.frequency,
				"detune" : options.detune
			});

			/**
			 *  Scale the oscillator so it doesn't go silent 
			 *  at the extreme values.
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._scale = new Tone.Multiply(1.01);

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
			 *  the modulation rate of the oscillator
			 *  @type {Tone.Signal}
			 */
			this.modulationFrequency = this._pulse.frequency;	

			//connections
			this._modulator.chain(this._scale, this._pulse.width);
			this._pulse.connect(this.output);
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
		};

		/**
		 *  start the oscillator
		 *  @param  {Tone.Time} [time=now]
		 *  @private
		 */
		Tone.PWMOscillator.prototype._start = function(time){
			time = this.toSeconds(time);
			this._modulator.start(time);
			this._pulse.start(time);
		};

		/**
		 *  stop the oscillator
		 *  @param  {Tone.Time} time (optional) timing parameter
		 *  @private
		 */
		Tone.PWMOscillator.prototype._stop = function(time){
			time = this.toSeconds(time);
			this._modulator.stop(time);
			this._pulse.stop(time);
		};

		/**
		 * The type of the oscillator. Always returns "pwm".
		 * @readOnly
		 * @memberOf Tone.PWMOscillator#
		 * @type {string}
		 * @name type
		 */
		Object.defineProperty(Tone.PWMOscillator.prototype, "type", {
			get : function(){
				return "pwm";
			}
		});

		/**
		 * The phase of the oscillator in degrees.
		 * @memberOf Tone.PWMOscillator#
		 * @type {number}
		 * @name phase
		 */
		Object.defineProperty(Tone.PWMOscillator.prototype, "phase", {
			get : function(){
				return this._modulator.phase;
			}, 
			set : function(phase){
				this._modulator.phase = phase;
			}
		});

		/**
		 *  clean up
		 *  @return {Tone.PWMOscillator} `this`
		 */
		Tone.PWMOscillator.prototype.dispose = function(){
			Tone.Source.prototype.dispose.call(this);
			this._pulse.dispose();
			this._pulse = null;
			this._scale.dispose();
			this._scale = null;
			this._modulator.dispose();
			this._modulator = null;
			this.frequency = null;
			this.detune = null;
			this.modulationFrequency = null;
			return this;
		};

		return Tone.PWMOscillator;
	});
	ToneModule( 
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
		 *  @example
		 *  var omniOsc = new Tone.OmniOscillator("C#4", "pwm");
		 */
		Tone.OmniOscillator = function(){
			var options = this.optionsObject(arguments, ["frequency", "type"], Tone.OmniOscillator.defaults);
			Tone.Source.call(this, options);

			/**
			 *  the frequency control
			 *  @type {Tone.Signal}
			 */
			this.frequency = new Tone.Signal(options.frequency, Tone.Signal.Units.Frequency);

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

			//set the oscillator
			this.type = options.type;
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
		};

		/**
		 *  @enum {string}
		 *  @private
		 */
		var OmniOscType = {
			PulseOscillator : "PulseOscillator",
			PWMOscillator : "PWMOscillator",
			Oscillator : "Oscillator"
		};

		/**
		 *  start the oscillator
		 *  @param {Tone.Time} [time=now] the time to start the oscillator
		 *  @private
		 */
		Tone.OmniOscillator.prototype._start = function(time){
			this._oscillator.start(time);
		};

		/**
		 *  start the oscillator
		 *  @param {Tone.Time} [time=now] the time to start the oscillator
		 *  @private
		 */
		Tone.OmniOscillator.prototype._stop = function(time){
			this._oscillator.stop(time);
		};

		/**
		 * The type of the oscillator. sine, square, triangle, sawtooth, pwm, or pulse. 
		 *  
		 * @memberOf Tone.OmniOscillator#
		 * @type {string}
		 * @name type
		 */
		Object.defineProperty(Tone.OmniOscillator.prototype, "type", {
			get : function(){
				return this._oscillator.type;
			}, 
			set : function(type){
				if (type === "sine" || type === "square" || type === "triangle" || type === "sawtooth"){
					if (this._sourceType !== OmniOscType.Oscillator){
						this._sourceType = OmniOscType.Oscillator;
						this._createNewOscillator(Tone.Oscillator);
					}
					this._oscillator.type = type;
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
			}
		});

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
		};

		/**
		 * The phase of the oscillator in degrees
		 * @memberOf Tone.OmniOscillator#
		 * @type {number}
		 * @name phase
		 */
		Object.defineProperty(Tone.OmniOscillator.prototype, "phase", {
			get : function(){
				return this._oscillator.phase;
			}, 
			set : function(phase){
				this._oscillator.phase = phase;
			}
		});

		/**
		 * The width of the oscillator (only if the oscillator is set to pulse)
		 * @memberOf Tone.OmniOscillator#
		 * @type {Tone.Signal}
		 * @name width
		 * @example
		 * var omniOsc = new Tone.OmniOscillator(440, "pulse");
		 * //can access the width attribute only if type === "pulse"
		 * omniOsc.width.value = 0.2; 
		 */
		Object.defineProperty(Tone.OmniOscillator.prototype, "width", {
			get : function(){
				if (this._sourceType === OmniOscType.PulseOscillator){
					return this._oscillator.width;
				} 
			}
		});

		/**
		 * The modulationFrequency Signal of the oscillator 
		 * (only if the oscillator type is set to pwm).
		 * @memberOf Tone.OmniOscillator#
		 * @type {Tone.Signal}
		 * @name modulationFrequency
		 * @example
		 * var omniOsc = new Tone.OmniOscillator(440, "pwm");
		 * //can access the modulationFrequency attribute only if type === "pwm"
		 * omniOsc.modulationFrequency.value = 0.2; 
		 */
		Object.defineProperty(Tone.OmniOscillator.prototype, "modulationFrequency", {
			get : function(){
				if (this._sourceType === OmniOscType.PWMOscillator){
					return this._oscillator.modulationFrequency;
				} 
			}
		});

		/**
		 *  clean up
		 *  @return {Tone.OmniOscillator} `this`
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
			return this;
		};

		return Tone.OmniOscillator;
	});
	ToneModule( function(Tone){

		

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
			 *  @private
			 */
			this.output = this.context.createGain();

			/**
			 * the volume of the output in decibels
			 * @type {Tone.Signal}
			 */
			this.volume = new Tone.Signal(this.output.gain, Tone.Signal.Units.Decibels);
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
		 *  @returns {Tone.Instrument} `this`
		 */
		Tone.Instrument.prototype.triggerAttackRelease = function(note, duration, time, velocity){
			time = this.toSeconds(time);
			duration = this.toSeconds(duration);
			this.triggerAttack(note, time, velocity);
			this.triggerRelease(time + duration);
			return this;
		};

		/**
		 *  clean up
		 *  @returns {Tone.Instrument} `this`
		 */
		Tone.Instrument.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this.volume.dispose();
			this.volume = null;
			return this;
		};

		return Tone.Instrument;
	});
	ToneModule( function(Tone){

		

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
			 *  The glide time between notes. 
			 *  @type {Tone.Time}
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
		 *  @returns {Tone.Monophonic} `this`
		 */
		Tone.Monophonic.prototype.triggerAttack = function(note, time, velocity) {
			time = this.toSeconds(time);
			this.triggerEnvelopeAttack(time, velocity);
			this.setNote(note, time);
			return this;
		};

		/**
		 *  trigger the release portion of the envelope
		 *  @param  {Tone.Time} [time=now] if no time is given, the release happens immediatly
		 *  @returns {Tone.Monophonic} `this`
		 */
		Tone.Monophonic.prototype.triggerRelease = function(time){
			this.triggerEnvelopeRelease(time);
			return this;
		};

		/**
		 *  override this method with the actual method
		 *  @abstract
		 *  @param {Tone.Time} [time=now] the time the attack should happen
		 *  @param {number} [velocity=1] the velocity of the envelope
		 *  @returns {Tone.Monophonic} `this`
		 */	
		Tone.Monophonic.prototype.triggerEnvelopeAttack = function() {};

		/**
		 *  override this method with the actual method
		 *  @abstract
		 *  @param {Tone.Time} [time=now] the time the attack should happen
		 *  @param {number} [velocity=1] the velocity of the envelope
		 *  @returns {Tone.Monophonic} `this`
		 */	
		Tone.Monophonic.prototype.triggerEnvelopeRelease = function() {};

		/**
		 *  set the note to happen at a specific time
		 *  @param {number|string} note if the note is a string, it will be 
		 *                              parsed as (NoteName)(Octave) i.e. A4, C#3, etc
		 *                              otherwise it will be considered as the frequency
		 *  @returns {Tone.Monophonic} `this`
		 */
		Tone.Monophonic.prototype.setNote = function(note, time){
			time = this.toSeconds(time);
			if (this.portamento > 0){
				var currentNote = this.frequency.value;
				this.frequency.setValueAtTime(currentNote, time);
				var portTime = this.toSeconds(this.portamento);
				this.frequency.exponentialRampToValueAtTime(note, time + portTime);
			} else {
				this.frequency.setValueAtTime(note, time);
			}
			return this;
		};

		return Tone.Monophonic;
	});
	ToneModule( 
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
		 *  @returns {Tone.MonoSynth} `this`
		 */
		Tone.MonoSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
			//the envelopes
			this.envelope.triggerAttack(time, velocity);
			this.filterEnvelope.triggerAttack(time);	
			return this;	
		};

		/**
		 *  start the release portion of the envelope
		 *  @param {Tone.Time} [time=now] the time the release should start
		 *  @returns {Tone.MonoSynth} `this`
		 */
		Tone.MonoSynth.prototype.triggerEnvelopeRelease = function(time){
			this.envelope.triggerRelease(time);
			this.filterEnvelope.triggerRelease(time);
			return this;
		};


		/**
		 *  clean up
		 *  @returns {Tone.MonoSynth} `this`
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
			return this;
		};

		return Tone.MonoSynth;
	});
	ToneModule( 
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
		 *  @example
		 *  var synth = new Tone.AMSynth();
		 */
		Tone.AMSynth = function(options){

			options = this.defaultArg(options, Tone.AMSynth.defaults);
			Tone.Monophonic.call(this, options);

			/**
			 *  the first voice
			 *  @type {Tone.MonoSynth}
			 */
			this.carrier = new Tone.MonoSynth(options.carrier);
			this.carrier.volume.value = -10;

			/**
			 *  the second voice
			 *  @type {Tone.MonoSynth}
			 */
			this.modulator = new Tone.MonoSynth(options.modulator);
			this.modulator.volume.value = -10;

			/**
			 *  the frequency control
			 *  @type {Tone.Signal}
			 */
			this.frequency = new Tone.Signal(440, Tone.Signal.Units.Frequency);

			/**
			 *  the ratio between the two voices
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._harmonicity = new Tone.Multiply(options.harmonicity);

			/**
			 *  convert the -1,1 output to 0,1
			 *  @type {Tone.AudioToGain}
			 *  @private
			 */
			this._modulationScale = new Tone.AudioToGain();

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
		 *  @returns {Tone.AMSynth} `this`
		 */
		Tone.AMSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
			//the port glide
			time = this.toSeconds(time);
			//the envelopes
			this.carrier.envelope.triggerAttack(time, velocity);
			this.modulator.envelope.triggerAttack(time);
			this.carrier.filterEnvelope.triggerAttack(time);
			this.modulator.filterEnvelope.triggerAttack(time);
			return this;
		};

		/**
		 *  trigger the release portion of the note
		 *  
		 *  @param  {Tone.Time} [time=now] the time the note will release
		 *  @returns {Tone.AMSynth} `this`
		 */
		Tone.AMSynth.prototype.triggerEnvelopeRelease = function(time){
			this.carrier.triggerRelease(time);
			this.modulator.triggerRelease(time);
			return this;
		};

		/**
		 * The ratio between the two carrier and the modulator. 
		 * @memberOf Tone.AMSynth#
		 * @type {number}
		 * @name harmonicity
		 */
		Object.defineProperty(Tone.AMSynth.prototype, "harmonicity", {
			get : function(){
				return this._harmonicity.value;
			},
			set : function(harm){
				this._harmonicity.value = harm;
			}
		});

		/**
		 *  clean up
		 *  @returns {Tone.AMSynth} `this`
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
			return this;
		};

		return Tone.AMSynth;
	});
	ToneModule( 
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
		 *  @example
		 *  var duoSynth = new Tone.DuoSynth();
		 */
		Tone.DuoSynth = function(options){

			options = this.defaultArg(options, Tone.DuoSynth.defaults);
			Tone.Monophonic.call(this, options);

			/**
			 *  the first voice
			 *  @type {Tone.MonoSynth}
			 */
			this.voice0 = new Tone.MonoSynth(options.voice0);
			this.voice0.volume.value = -10;

			/**
			 *  the second voice
			 *  @type {Tone.MonoSynth}
			 */
			this.voice1 = new Tone.MonoSynth(options.voice1);
			this.voice1.volume.value = -10;

			/**
			 *  The vibrato LFO. 
			 *  @type {Tone.LFO}
			 *  @private
			 */
			this._vibrato = new Tone.LFO(options.vibratoRate, -50, 50);
			this._vibrato.start();

			/**
			 * the vibrato frequency
			 * @type {Tone.Signal}
			 */
			this.vibratoRate = this._vibrato.frequency;

			/**
			 *  the vibrato gain
			 *  @type {GainNode}
			 *  @private
			 */
			this._vibratoGain = this.context.createGain();

			/**
			 * The amount of vibrato
			 * @type {Tone.Signal}
			 */
			this.vibratoAmount = new Tone.Signal(this._vibratoGain.gain, Tone.Signal.Units.Gain);
			this.vibratoAmount.value = options.vibratoAmount;

			/**
			 *  the delay before the vibrato starts
			 *  @type {number}
			 *  @private
			 */
			this._vibratoDelay = this.toSeconds(options.vibratoDelay);

			/**
			 *  the frequency control
			 *  @type {Tone.Signal}
			 */
			this.frequency = new Tone.Signal(440, Tone.Signal.Units.Frequency);

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
		 *  @returns {Tone.DuoSynth} `this`
		 */
		Tone.DuoSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
			time = this.toSeconds(time);
			this.voice0.envelope.triggerAttack(time, velocity);
			this.voice1.envelope.triggerAttack(time, velocity);
			this.voice0.filterEnvelope.triggerAttack(time);
			this.voice1.filterEnvelope.triggerAttack(time);
			return this;
		};

		/**
		 *  start the release portion of the envelopes
		 *  
		 *  @param {Tone.Time} [time=now] the time the release should start
		 *  @returns {Tone.DuoSynth} `this`
		 */
		Tone.DuoSynth.prototype.triggerEnvelopeRelease = function(time){
			this.voice0.triggerRelease(time);
			this.voice1.triggerRelease(time);
			return this;
		};

		/**
		 * The ratio between the two carrier and the modulator. 
		 * @memberOf Tone.DuoSynth#
		 * @type {number}
		 * @name harmonicity
		 */
		Object.defineProperty(Tone.DuoSynth.prototype, "harmonicity", {
			get : function(){
				return this._harmonicity.value;
			},
			set : function(harm){
				this._harmonicity.value = harm;
			}
		});

		/**
		 *  clean up
		 *  @returns {Tone.DuoSynth} `this`
		 */
		Tone.DuoSynth.prototype.dispose = function(){
			Tone.Monophonic.prototype.dispose.call(this);
			this.voice0.dispose();
			this.voice0 = null;
			this.voice1.dispose();
			this.voice1 = null;
			this.frequency.dispose();
			this.frequency = null;
			this._vibrato.dispose();
			this._vibrato = null;
			this._vibratoGain.disconnect();
			this._vibratoGain = null;
			this._harmonicity.dispose();
			this._harmonicity = null;
			this.vibratoAmount.dispose();
			this.vibratoAmount = null;
			this.vibratoRate = null;
			return this;
		};

		return Tone.DuoSynth;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class  the FMSynth is composed of two MonoSynths where one MonoSynth is the 
		 *          carrier and the second is the modulator.
		 *
		 *  @constructor
		 *  @extends {Tone.Monophonic}
		 *  @param {Object} options the options available for the synth 
		 *                          see defaults below
		 *  @example
		 *  var fmSynth = new Tone.FMSynth();
		 */
		Tone.FMSynth = function(options){

			options = this.defaultArg(options, Tone.FMSynth.defaults);
			Tone.Monophonic.call(this, options);

			/**
			 *  the first voice
			 *  @type {Tone.MonoSynth}
			 */
			this.carrier = new Tone.MonoSynth(options.carrier);
			this.carrier.volume.value = -10;

			/**
			 *  the second voice
			 *  @type {Tone.MonoSynth}
			 */
			this.modulator = new Tone.MonoSynth(options.modulator);
			this.modulator.volume.value = -10;

			/**
			 *  the frequency control
			 *  @type {Tone.Signal}
			 */
			this.frequency = new Tone.Signal(440, Tone.Signal.Units.Frequency);

			/**
			 *  the ratio between the two voices
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._harmonicity = new Tone.Multiply(options.harmonicity);

			/**
			 *  
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
		 *  @returns {Tone.FMSynth} `this`
		 */
		Tone.FMSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
			//the port glide
			time = this.toSeconds(time);
			//the envelopes
			this.carrier.envelope.triggerAttack(time, velocity);
			this.modulator.envelope.triggerAttack(time);
			this.carrier.filterEnvelope.triggerAttack(time);
			this.modulator.filterEnvelope.triggerAttack(time);
			return this;
		};

		/**
		 *  trigger the release portion of the note
		 *  
		 *  @param  {Tone.Time} [time=now] the time the note will release
		 *  @returns {Tone.FMSynth} `this`
		 */
		Tone.FMSynth.prototype.triggerEnvelopeRelease = function(time){
			this.carrier.triggerRelease(time);
			this.modulator.triggerRelease(time);
			return this;
		};

		/**
		 * The ratio between the two carrier and the modulator. 
		 * @memberOf Tone.FMSynth#
		 * @type {number}
		 * @name harmonicity
		 */
		Object.defineProperty(Tone.FMSynth.prototype, "harmonicity", {
			get : function(){
				return this._harmonicity.value;
			},
			set : function(harm){
				this._harmonicity.value = harm;
			}
		});

		/**
		 * The modulation index which is in essence the depth or amount of the modulation. In other terms it is the 
		 *  ratio of the frequency of the modulating signal (mf) to the amplitude of the 
		 *  modulating signal (ma) -- as in ma/mf. 
		 * @memberOf Tone.FMSynth#
		 * @type {number}
		 * @name modulationIndex
		 */
		Object.defineProperty(Tone.FMSynth.prototype, "modulationIndex", {
			get : function(){
				return this._modulationIndex.value;
			},
			set : function(mod){
				this._modulationIndex.value = mod;
			}
		});

		/**
		 *  clean up
		 *  @returns {Tone.FMSynth} `this`
		 */
		Tone.FMSynth.prototype.dispose = function(){
			Tone.Monophonic.prototype.dispose.call(this);
			this.carrier.dispose();
			this.carrier = null;
			this.modulator.dispose();
			this.modulator = null;
			this.frequency.dispose();
			this.frequency = null;
			this._modulationIndex.dispose();
			this._modulationIndex = null;
			this._harmonicity.dispose();
			this._harmonicity = null;
			this._modulationNode.disconnect();
			this._modulationNode = null;
			return this;
		};

		return Tone.FMSynth;
	});
	ToneModule( function(Tone){

		
		
		/**
		 *  @class  Audio file player with start, loop, stop.
		 *  
		 *  @constructor
		 *  @extends {Tone.Source} 
		 *  @param {string|AudioBuffer} url Either the AudioBuffer or the url from
		 *                                  which to load the AudioBuffer
		 *  @param {function=} onload The function to invoke when the buffer is loaded. 
		 *                            Recommended to use {@link Tone.Buffer#onload} instead.
		 *  @example
		 *  var player = new Tone.Player("./path/to/sample.mp3");
		 */
		Tone.Player = function(){
			
			var options = this.optionsObject(arguments, ["url", "onload"], Tone.Player.defaults);
			Tone.Source.call(this, options);

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
			this._buffer = new Tone.Buffer(options.url, options.onload.bind(null, this));

			/**
			 *  if the buffer should loop once it's over
			 *  @type {boolean}
			 *  @private
			 */
			this._loop = options.loop;

			/**
			 *  if 'loop' is true, the loop will start at this position
			 *  @type {Tone.Time}
			 *  @private
			 */
			this._loopStart = options.loopStart;

			/**
			 *  if 'loop' is true, the loop will end at this position
			 *  @type {Tone.Time}
			 *  @private
			 */
			this._loopEnd = options.loopEnd;

			/**
			 *  the playback rate
			 *  @private
			 *  @type {number}
			 */
			this._playbackRate = options.playbackRate;

			/**
			 *  Enabling retrigger will allow a player to be restarted
			 *  before the the previous 'start' is done playing.
			 *  @type {boolean}
			 */
			this.retrigger = options.retrigger;
		};

		Tone.extend(Tone.Player, Tone.Source);
		
		/**
		 *  the default parameters
		 *  @static
		 *  @const
		 *  @type {Object}
		 */
		Tone.Player.defaults = {
			"onload" : function(){},
			"playbackRate" : 1,
			"loop" : false,
			"loopStart" : 0,
			"loopEnd" : 0,
			"retrigger" : false,
		};

		/**
		 *  Load the audio file as an audio buffer.
		 *  Decodes the audio asynchronously and invokes
		 *  the callback once the audio buffer loads. 
		 *  Note: this does not need to be called, if a url
		 *  was passed in to the constructor. Only use this
		 *  if you want to manually load a new url. 
		 * @param {string} url The url of the buffer to load.
		 *                     filetype support depends on the
		 *                     browser.
		 *  @param  {function(Tone.Player)=} callback
		 *  @returns {Tone.Player} `this`
		 */
		Tone.Player.prototype.load = function(url, callback){
			this._buffer.load(url, callback.bind(this, this));
			return this;
		};

		/**
		 *  play the buffer between the desired positions
		 *  
		 *  @private
		 *  @param  {Tone.Time} [startTime=now] when the player should start.
		 *  @param  {Tone.Time} [offset=0] the offset from the beginning of the sample
		 *                                 to start at. 
		 *  @param  {Tone.Time=} duration how long the sample should play. If no duration
		 *                                is given, it will default to the full length 
		 *                                of the sample (minus any offset)
		 *  @returns {Tone.Player} `this`
		 */
		Tone.Player.prototype._start = function(startTime, offset, duration){
			if (this._buffer.loaded){
				//if it's a loop the default offset is the loopstart point
				if (this._loop){
					offset = this.defaultArg(offset, this._loopStart);
					offset = this.toSeconds(offset);
				} else {
					//otherwise the default offset is 0
					offset = this.defaultArg(offset, 0);
				}
				duration = this.defaultArg(duration, this._buffer.duration - offset);
				//the values in seconds
				startTime = this.toSeconds(startTime);
				duration = this.toSeconds(duration);
				//make the source
				this._source = this.context.createBufferSource();
				this._source.buffer = this._buffer.get();
				//set the looping properties
				if (this._loop){
					this._source.loop = this._loop;
					this._source.loopStart = this.toSeconds(this._loopStart);
					this._source.loopEnd = this.toSeconds(this._loopEnd);
				} else {
					this._nextStop = startTime + duration;
				}
				//and other properties
				this._source.playbackRate.value = this._playbackRate;
				this._source.onended = this.onended;
				this._source.connect(this.output);
				//start it
				this._source.start(startTime, offset, duration);
			} else {
				throw Error("tried to start Player before the buffer was loaded");
			}
			return this;
		};

		/**
		 *  Stop playback.
		 *  @private
		 *  @param  {Tone.Time} [time=now]
		 *  @returns {Tone.Player} `this`
		 */
		Tone.Player.prototype._stop = function(time){
			if (this._source){
				this._source.stop(this.toSeconds(time));
				this._source = null;
			}
			return this;
		};

		/**
		 *  Set the loop start and end. Will only loop if `loop` is 
		 *  set to `true`. 
		 *  @param {Tone.Time} loopStart The loop end time
		 *  @param {Tone.Time} loopEnd The loop end time
		 *  @returns {Tone.Player} `this`
		 *  @example
		 *  player.setLoopPoints(0.2, 0.3);
		 *  player.loop = true;
		 */
		Tone.Player.prototype.setLoopPoints = function(loopStart, loopEnd){
			this.loopStart = loopStart;
			this.loopEnd = loopEnd;
			return this;
		};

		/**
		 * If `loop` is true, the loop will start at this position. 
		 * @memberOf Tone.Player#
		 * @type {Tone.Time}
		 * @name loopStart
		 */
		Object.defineProperty(Tone.Player.prototype, "loopStart", {
			get : function(){
				return this._loopStart;
			}, 
			set : function(loopStart){
				this._loopStart = loopStart;
				if (this._source){
					this._source.loopStart = this.toSeconds(loopStart);
				}
			}
		});

		/**
		 * If `loop` is true, the loop will end at this position.
		 * @memberOf Tone.Player#
		 * @type {Tone.Time}
		 * @name loopEnd
		 */
		Object.defineProperty(Tone.Player.prototype, "loopEnd", {
			get : function(){
				return this._loopEnd;
			}, 
			set : function(loopEnd){
				this._loopEnd = loopEnd;
				if (this._source){
					this._source.loopEnd = this.toSeconds(loopEnd);
				}
			}
		});

		/**
		 * The audio buffer belonging to the player. 
		 * @memberOf Tone.Player#
		 * @type {AudioBuffer}
		 * @name buffer
		 */
		Object.defineProperty(Tone.Player.prototype, "buffer", {
			get : function(){
				return this._buffer;
			}, 
			set : function(buffer){
				this._buffer.set(buffer);
			}
		});

		/**
		 * If the buffer should loop once it's over. 
		 * @memberOf Tone.Player#
		 * @type {boolean}
		 * @name loop
		 */
		Object.defineProperty(Tone.Player.prototype, "loop", {
			get : function(){
				return this._loop;
			}, 
			set : function(loop){
				this._loop = loop;
				if (this._source){
					this._source.loop = loop;
				}
			}
		});

		/**
		 * The playback speed. 1 is normal speed. 
		 * Note that this is not a Tone.Signal because of a bug in Blink. 
		 * Please star this issue if this an important thing to you: 
		 * https://code.google.com/p/chromium/issues/detail?id=311284
		 * 
		 * @memberOf Tone.Player#
		 * @type {number}
		 * @name playbackRate
		 */
		Object.defineProperty(Tone.Player.prototype, "playbackRate", {
			get : function(){
				return this._playbackRate;
			}, 
			set : function(rate){
				this._playbackRate = rate;
				if (this._source) {
					this._source.playbackRate.value = rate;
				}
			}
		});

		/**
		 *  dispose and disconnect
		 *  @return {Tone.Player} `this`
		 */
		Tone.Player.prototype.dispose = function(){
			Tone.Source.prototype.dispose.call(this);
			if (this._source !== null){
				this._source.disconnect();
				this._source = null;
			}
			this._buffer.dispose();
			this._buffer = null;
			return this;
		};

		return Tone.Player;
	});

	ToneModule( 
	function(Tone){

		

		/**
		 *  @class A simple sampler instrument which plays an audio buffer 
		 *         through an amplitude envelope and a filter envelope. Nested
		 *         lists will be flattened.
		 *
		 *  @constructor
		 *  @extends {Tone.Instrument}
		 *  @param {Object|string} urls the urls of the audio file
		 *  @param {Object} options the options object for the synth
		 *  @example
		 *  var sampler = new Sampler({
		 *  	A : {
		 *  		1 : {"./audio/casio/A1.mp3",
		 *  		2 : "./audio/casio/A2.mp3",
		 *  	},
		 *  	"B.1" : "./audio/casio/B1.mp3",
		 *  });
		 *  //...once samples have loaded
		 *  sampler.triggerAttack("A.1", time, velocity);
		 */
		Tone.Sampler = function(urls, options){

			Tone.Instrument.call(this);
			options = this.defaultArg(options, Tone.Sampler.defaults);

			/**
			 *  the sample player
			 *  @type {Tone.Player}
			 */
			this.player = new Tone.Player(options.player);
			this.player.retrigger = true;

			/**
			 *  the buffers
			 *  @type {Object<Tone.Buffer>}
			 *  @private
			 */
			this._buffers = {};

			/**
			 *  The amplitude envelope. 
			 *  @type {Tone.Envelope}
			 */
			this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

			/**
			 *  The filter envelope. 
			 *  @type {Tone.Envelope}
			 */
			this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

			/**
			 *  The name of the current sample. 
			 *  @type {string}
			 */
			this._sample = options.sample;

			/**
			 * the private reference to the pitch
			 * @type {number}
			 * @private
			 */
			this._pitch = options.pitch;

			/**
			 *  The filter.
			 *  @type {BiquadFilterNode}
			 */
			this.filter = new Tone.Filter(options.filter);

			//connections / setup
			this._loadBuffers(urls);
			this.pitch = options.pitch;
			this.player.chain(this.filter, this.envelope, this.output);
			this.filterEnvelope.connect(this.filter.frequency);
		};

		Tone.extend(Tone.Sampler, Tone.Instrument);

		/**
		 *  the default parameters
		 *  @static
		 */
		Tone.Sampler.defaults = {
			"sample" : 0,
			"pitch" : 0,
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
		 *  load the buffers
		 *  @param   {Object} urls   the urls
		 *  @private
		 */
		Tone.Sampler.prototype._loadBuffers = function(urls){
			if (typeof urls === "string"){
				this._buffers["0"] = new Tone.Buffer(urls, function(){
					this.sample = "0";
				}.bind(this));
			} else {
				urls = this._flattenUrls(urls);
				for (var buffName in urls){
					this._sample = buffName;
					var urlString = urls[buffName];
					this._buffers[buffName] = new Tone.Buffer(urlString);
				}
			}
		};

		/**
		 *  flatten an object into a single depth object
		 *  https://gist.github.com/penguinboy/762197
		 *  @param   {Object} ob 	
		 *  @return  {Object}    
		 *  @private
		 */
		Tone.Sampler.prototype._flattenUrls = function(ob) {
			var toReturn = {};
			for (var i in ob) {
				if (!ob.hasOwnProperty(i)) continue;
				if ((typeof ob[i]) == "object") {
					var flatObject = this._flattenUrls(ob[i]);
					for (var x in flatObject) {
						if (!flatObject.hasOwnProperty(x)) continue;
						toReturn[i + "." + x] = flatObject[x];
					}
				} else {
					toReturn[i] = ob[i];
				}
			}
			return toReturn;
		};

		/**
		 *  start the sample.
		 *  @param {string=} sample the name of the samle to trigger, defaults to
		 *                          the last sample used
		 *  @param {Tone.Time} [time=now] the time when the note should start
		 *  @param {number} [velocity=1] the velocity of the note
		 *  @returns {Tone.Sampler} `this`
		 */
		Tone.Sampler.prototype.triggerAttack = function(name, time, velocity){
			time = this.toSeconds(time);
			if (name){
				this.sample = name;
			}
			this.player.start(time, 0);
			this.envelope.triggerAttack(time, velocity);
			this.filterEnvelope.triggerAttack(time);
			return this;
		};

		/**
		 *  start the release portion of the sample
		 *  
		 *  @param {Tone.Time} [time=now] the time when the note should release
		 *  @returns {Tone.Sampler} `this`
		 */
		Tone.Sampler.prototype.triggerRelease = function(time){
			time = this.toSeconds(time);
			this.filterEnvelope.triggerRelease(time);
			this.envelope.triggerRelease(time);
			this.player.stop(this.toSeconds(this.envelope.release) + time);
			return this;
		};

		/**
		 * The name of the sample to trigger.
		 * @memberOf Tone.Sampler#
		 * @type {number|string}
		 * @name sample
		 */
		Object.defineProperty(Tone.Sampler.prototype, "sample", {
			get : function(){
				return this._sample;
			},
			set : function(name){
				if (this._buffers.hasOwnProperty(name)){
					this._sample = name;
					this.player.buffer = this._buffers[name];
				} else {
					throw new Error("Sampler does not have a sample named "+name);
				}
			}
		});

		/**
		 * Repitch the sampled note by some interval (measured
		 * in semi-tones). 
		 * @memberOf Tone.Sampler#
		 * @type {number}
		 * @name pitch
		 * @example
		 * sampler.pitch = -12; //down one octave
		 * sampler.pitch = 7; //up a fifth
		 */
		Object.defineProperty(Tone.Sampler.prototype, "pitch", {
			get : function(){
				return this._pitch;
			},
			set : function(interval){
				this._pitch = interval;
				this.player.playbackRate = this.intervalToFrequencyRatio(interval);
			}
		});

		/**
		 *  clean up
		 *  @returns {Tone.Sampler} `this`
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
			for (var sample in this._buffers){
				this._buffers[sample].dispose();
				this._buffers[sample] = null;
			}
			this._buffers = null;
			return this;
		};

		return Tone.Sampler;
	});

	ToneModule( 
	function(Tone){

		

		/**
		 *  @class Deprecated.
		 *
		 *  @constructor
		 *  @deprecated Use Tone.PolySynth with Tone.Sampler as the voice.
		 *  @extends {Tone.Instrument}
		 *  @param {Object} samples the samples used in this
		 *  @param {function} onload the callback to invoke when all 
		 *                           of the samples have been loaded
		 */
		Tone.MultiSampler = function(samples, onload){

			console.warn("Tone.MultiSampler is deprecated - use Tone.PolySynth with Tone.Sampler as the voice");
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

	ToneModule( function(Tone){

		

		/**
		 *  @class  Noise generator. 
		 *          Uses looped noise buffers to save on performance. 
		 *
		 *  @constructor
		 *  @extends {Tone.Source}
		 *  @param {string} type the noise type (white|pink|brown)
		 *  @example
		 *  var noise = new Tone.Noise("pink");
		 */
		Tone.Noise = function(){

			var options = this.optionsObject(arguments, ["type"], Tone.Noise.defaults);
			Tone.Source.call(this, options);

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

			this.type = options.type;
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
		};

		/**
		 * The type of the noise. Can be "white", "brown", or "pink". 
		 * @memberOf Tone.Noise#
		 * @type {string}
		 * @name type
		 * @example
		 * noise.type = "white";
		 */
		Object.defineProperty(Tone.Noise.prototype, "type", {
			get : function(){
				if (this._buffer === _whiteNoise){
					return "white";
				} else if (this._buffer === _brownNoise){
					return "brown";
				} else if (this._buffer === _pinkNoise){
					return "pink";
				}
			}, 
			set : function(type){
				if (this.type !== type){
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
						var now = this.now() + this.bufferTime;
						//remove the listener
						this._source.onended = undefined;
						this._stop(now);
						this._start(now);
					}
				}
			}
		});

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
		 *  internal stop method
		 *  
		 *  @param {Tone.Time} time
		 *  @private
		 */
		Tone.Noise.prototype._stop = function(time){
			if (this._source){
				this._source.stop(this.toSeconds(time));
			}
		};

		/**
		 *  dispose all the components
		 *  @returns {Tone.Noise} `this`
		 */
		Tone.Noise.prototype.dispose = function(){
			Tone.Source.prototype.dispose.call(this);
			if (this._source !== null){
				this._source.disconnect();
				this._source = null;
			}
			this._buffer = null;
			return this;
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
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class  the NoiseSynth is a single oscillator, monophonic synthesizer
		 *          with a filter, and two envelopes (on the filter and the amplitude)
		 *
		 *  @constructor
		 *  @extends {Tone.Instrument}
		 *  @param {Object} options the options available for the synth 
		 *                          see defaults below
		 * @example
		 * var noiseSynth = new Tone.NoiseSynth();
		 */
		Tone.NoiseSynth = function(options){

			//get the defaults
			options = this.defaultArg(options, Tone.NoiseSynth.defaults);
			Tone.Instrument.call(this);

			/**
			 *  The noise source. Set the type by setting
			 *  `noiseSynth.noise.type`. 
			 *  @type {Tone.Noise}
			 */
			this.noise = new Tone.Noise();

			/**
			 *  The filter .
			 *  @type {Tone.Filter}
			 */
			this.filter = new Tone.Filter(options.filter);

			/**
			 *  The filter envelope. 
			 *  @type {Tone.Envelope}
			 */
			this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

			/**
			 *  The amplitude envelope. 
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
		 *  @returns {Tone.NoiseSynth} `this`
		 */
		Tone.NoiseSynth.prototype.triggerAttack = function(time, velocity){
			//the envelopes
			this.envelope.triggerAttack(time, velocity);
			this.filterEnvelope.triggerAttack(time);	
			return this;	
		};

		/**
		 *  start the release portion of the envelope
		 *  @param {Tone.Time} [time=now] the time the release should start
		 *  @returns {Tone.NoiseSynth} `this`
		 */
		Tone.NoiseSynth.prototype.triggerRelease = function(time){
			this.envelope.triggerRelease(time);
			this.filterEnvelope.triggerRelease(time);
			return this;
		};

		/**
		 *  trigger the attack and then the release
		 *  @param  {Tone.Time} duration the duration of the note
		 *  @param  {Tone.Time} [time=now]     the time of the attack
		 *  @param  {number} [velocity=1] the velocity
		 *  @returns {Tone.NoiseSynth} `this`
		 */
		Tone.NoiseSynth.prototype.triggerAttackRelease = function(duration, time, velocity){
			time = this.toSeconds(time);
			duration = this.toSeconds(duration);
			this.triggerAttack(time, velocity);
			console.log(time + duration);
			this.triggerRelease(time + duration);
			return this;
		};

		/**
		 *  clean up
		 *  @returns {Tone.NoiseSynth} `this`
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
			return this;
		};

		return Tone.NoiseSynth;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class Karplus-String string synthesis. 
		 *  
		 *  @constructor
		 *  @extends {Tone.Instrument}
		 *  @param {Object} options see the defaults
		 *  @example
		 *  var plucky = new Tone.PluckSynth();
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
			 *  The amount of noise at the attack. 
			 *  Nominal range of [0.1, 20]
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
		 *  @returns {Tone.PluckSynth} `this`
		 */
		Tone.PluckSynth.prototype.triggerAttack = function(note, time) {
			note = this.toFrequency(note);
			time = this.toSeconds(time);
			var delayAmount = 1 / note;
			this._lfcf.setDelayTimeAtTime(delayAmount, time);		
			this._noise.start(time);
			this._noise.stop(time + delayAmount * this.attackNoise);
			return this;
		};

		/**
		 *  clean up
		 *  @returns {Tone.PluckSynth} `this`
		 */
		Tone.PluckSynth.prototype.dispose = function(){
			Tone.Instrument.prototype.dispose.call(this);
			this._noise.dispose();
			this._lfcf.dispose();
			this._noise = null;
			this._lfcf = null;
			this.dampening = null;
			this.resonance = null;
			return this;
		};

		return Tone.PluckSynth;
	});
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class  Creates a polyphonic synthesizer out of 
		 *          the monophonic voice which is passed in. 
		 *
		 *  @constructor
		 *  @extends {Tone.Instrument}
		 *  @param {number|Object} [polyphony=4] the number of voices to create
		 *  @param {function} [voice=Tone.MonoSynth] the constructor of the voices
		 *                                            uses Tone.MonoSynth by default
		 *  @example
		 *  //a polysynth composed of 6 Voices of MonoSynth
		 *  var synth = new Tone.PolySynth(6, Tone.MonoSynth);
		 *  //set a MonoSynth preset
		 *  synth.setPreset("Pianoetta");
		 */
		Tone.PolySynth = function(){

			Tone.Instrument.call(this);

			var options = this.optionsObject(arguments, ["polyphony", "voice"], Tone.PolySynth.defaults);

			/**
			 *  the array of voices
			 *  @type {Array}
			 */
			this.voices = new Array(options.polyphony);

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
				var v = new options.voice(arguments[2], arguments[3]);
				this.voices[i] = v;
				v.connect(this.output);
			}

			//make a copy of the voices
			this._freeVoices = this.voices.slice(0);
			//get the prototypes and properties
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
			"voice" : Tone.MonoSynth
		};

		/**
		 * Pull properties from the 
		 */

		/**
		 *  trigger the attack
		 *  @param  {string|number|Object|Array} value the value of the note(s) to start.
		 *                                             if the value is an array, it will iterate
		 *                                             over the array to play each of the notes
		 *  @param  {Tone.Time} [time=now]  the start time of the note
		 *  @param {number} [velocity=1] the velocity of the note
		 *  @returns {Tone.PolySynth} `this`
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
			return this;
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
		 *  @returns {Tone.PolySynth} `this`
		 */
		Tone.PolySynth.prototype.triggerAttackRelease = function(value, duration, time, velocity){
			time = this.toSeconds(time);
			this.triggerAttack(value, time, velocity);
			this.triggerRelease(value, time + this.toSeconds(duration));
			return this;
		};

		/**
		 *  trigger the release of a note
		 *  @param  {string|number|Object|Array} value the value of the note(s) to release.
		 *                                             if the value is an array, it will iterate
		 *                                             over the array to play each of the notes
		 *  @param  {Tone.Time} [time=now]  the release time of the note
		 *  @returns {Tone.PolySynth} `this`
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
			return this;
		};

		/**
		 *  set the options on all of the voices
		 *  @param {Object} params 
		 *  @returns {Tone.PolySynth} `this`
		 */
		Tone.PolySynth.prototype.set = function(params){
			for (var i = 0; i < this.voices.length; i++){
				this.voices[i].set(params);
			}
			return this;
		};

		/**
		 *  get a group of parameters
		 *  @param {Array=} params the parameters to get, otherwise will return 
		 *  					   all available.
		 */
		Tone.PolySynth.prototype.get = function(params){
			return this.voices[0].get(params);
		};

		/**
		 *  @param {string} presetName the preset name
		 *  @returns {Tone.PolySynth} `this`
		 */
		Tone.PolySynth.prototype.setPreset = function(presetName){
			for (var i = 0; i < this.voices.length; i++){
				this.voices[i].setPreset(presetName);
			}
			return this;
		};

		/**
		 *  clean up
		 *  @returns {Tone.PolySynth} `this`
		 */
		Tone.PolySynth.prototype.dispose = function(){
			Tone.Instrument.prototype.dispose.call(this);
			for (var i = 0; i < this.voices.length; i++){
				this.voices[i].dispose();
				this.voices[i] = null;
			}
			this.voices = null;
			this._activeVoices = null;
			this._freeVoices = null;
			return this;
		};

		return Tone.PolySynth;
	});
	ToneModule( function(Tone){

		

		/**
		 * 	@class  Clip the incoming signal so that the output is always between min and max
		 * 	
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} min the minimum value of the outgoing signal
		 *  @param {number} max the maximum value of the outgoing signal
		 *  @example
		 *  var clip = new Tone.Clip(0.5, 1);
		 *  var osc = new Tone.Oscillator().connect(clip);
		 *  //clips the output of the oscillator to between 0.5 and 1.
		 */
		Tone.Clip = function(min, max){
			//make sure the args are in the right order
			if (min > max){
				var tmp = min;
				min = max;
				max = tmp;
			}
			
			/**
			 *  The min clip value
			 *  @type {Tone.Signal}
			 */
			this.min = this.input = new Tone.Min(max);

			/**
			 *  The max clip value
			 *  @type {Tone.Signal}
			 */
			this.max = this.output = new Tone.Max(min);

			this.min.connect(this.max);
		};

		Tone.extend(Tone.Clip, Tone.SignalBase);

		/**
		 *  clean up
		 *  @returns {Tone.Clip} `this`
		 */
		Tone.Clip.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this.min.dispose();
			this.min = null;
			this.max.dispose();
			this.max = null;
			return this;
		};

		return Tone.Clip;
	});
	ToneModule( 
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
		 *  @deprecated
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {number} [precision=3] the precision of the calculation
		 */
		Tone.Inverse = function(precision){

			console.warn("Tone.Inverse has been deprecated. Multiply is always more efficient than dividing.");

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
		 *  @returns {Tone.Inverse} `this`
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
			return this;
		};

		// BEGIN INVERSE HELPER ///////////////////////////////////////////////////

		/**
		 *  internal helper function for computing the inverse of a signal
		 *  @extends {Tone}
		 *  @constructor
		 *  @private
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
	ToneModule( 
	function(Tone){

		

		/**
		 *  @class Divide by a value or signal. 
		 *         input 0: numerator. input 1: divisor. 
		 *
		 *  @deprecated
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @param {number=} divisor if no value is provided, Tone.Divide will divide the first
		 *                         and second inputs. 
		 *  @param {number} [precision=3] the precision of the calculation
		 */
		Tone.Divide = function(divisor, precision){

			console.warn("Tone.Divide has been deprecated. If possible, it's much more efficient to multiply by the inverse value.");

			Tone.call(this, 2, 0);

			/**
			 *  the denominator value
			 *  @type {Tone.Signal}
			 *  @private
			 */
			this._denominator = null;

			/**
			 *  the inverse
			 *  @type {Tone}
			 *  @private
			 */
			this._inverse = new Tone.Inverse(precision);

			/**
			 *  multiply input 0 by the inverse
			 *  @type {Tone.Multiply}
			 *  @private
			 */
			this._mult = new Tone.Multiply();

			if (isFinite(divisor)){
				this._denominator = new Tone.Signal(divisor);
				this._denominator.connect(this._inverse);
			}
			this.input[1] = this._inverse;
			this._inverse.connect(this._mult, 0, 1);
			this.input[0] = this.output = this._mult.input[0];
		};

		Tone.extend(Tone.Divide, Tone.SignalBase);

		/**
		 * The value being divided from the incoming signal. Note, that
		 * if Divide was constructed without a divisor, it expects
		 * that the signals to numberator will be connected to input 0 and 
		 * the denominator to input 1 and therefore will throw an error when 
		 * trying to set/get the value. 
		 * 
		 * @memberOf Tone.Divide#
		 * @type {number}
		 * @name value
		 */
		Object.defineProperty(Tone.Divide.prototype, "value", {
			get : function(){
				if (this._denominator !== null){
					return this._denominator.value;
				} else {
					throw new Error("cannot switch from signal to number");
				}
			},
			set : function(value){
				if (this._denominator !== null){
					this._denominator.value = value;
				} else {
					throw new Error("cannot switch from signal to number");
				}
			}
		});

		/**
		 *  clean up
		 *  @returns {Tone.Divide} `this`
		 */
		Tone.Divide.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			if (this._denominator){
				this._denominator.dispose();
				this._denominator = null;
			}
			this._inverse.dispose();
			this._inverse = null;
			this._mult.dispose();
			this._mult = null;
			return this;
		};

		return Tone.Divide;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class Normalize takes an input min and max and maps it linearly to [0,1]
		 *
		 *  @extends {Tone.SignalBase}
		 *  @constructor
		 *  @example
		 *  var norm = new Tone.Normalize(2, 4);
		 *  var sig = new Tone.Signal(3).connect(norm);
		 *  //output of norm is 0.5. 
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
		 * The minimum value the input signal will reach.
		 * @memberOf Tone.Normalize#
		 * @type {number}
		 * @name min
		 */
		Object.defineProperty(Tone.Normalize.prototype, "min", {
			get : function(){
				return this._inputMin;
			},
			set : function(min){
				this._inputMin = min;
				this._setRange();
			}
		});

		/**
		 * The maximum value the input signal will reach.
		 * @memberOf Tone.Normalize#
		 * @type {number}
		 * @name max
		 */
		Object.defineProperty(Tone.Normalize.prototype, "max", {
			get : function(){
				return this._inputMax;
			},
			set : function(max){
				this._inputMax = max;
				this._setRange();
			}
		});

		/**
		 *  set the values
		 *  @private
		 */
		Tone.Normalize.prototype._setRange = function() {
			this._sub.value = -this._inputMin;
			this._div.value = 1 / (this._inputMax - this._inputMin);
		};

		/**
		 *  clean up
		 *  @returns {Tone.Normalize} `this`
		 */
		Tone.Normalize.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this._sub.dispose();
			this._sub = null;
			this._div.dispose();
			this._div = null;
			return this;
		};

		return Tone.Normalize;
	});
	ToneModule( function(Tone){

		

		/**
		 *  @class Route a single input to the specified output
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @param {number} [outputCount=2] the number of inputs the switch accepts
		 *  @example
		 *  var route = new Tone.Route(4);
		 *  var signal = new Tone.Signal(3).connect(route);
		 *  route.gate.value = 0;
		 *  //signal is routed through output 0
		 *  route.gate.value = 3;
		 *  //signal is now routed through output 3
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
		 *  @returns {Tone.Route} `this`
		 */
		Tone.Route.prototype.select = function(which, time){
			//make sure it's an integer
			which = Math.floor(which);
			this.gate.setValueAtTime(which, this.toSeconds(time));
			return this;
		};

		/**
		 *  dispose method
		 *  @returns {Tone.Route} `this`
		 */
		Tone.Route.prototype.dispose = function(){
			this.gate.dispose();
			for (var i = 0; i < this.output.length; i++){
				this.output[i].dispose();
				this.output[i] = null;
			}
			Tone.prototype.dispose.call(this);
			this.gate = null;
			return this;
		}; 

		////////////START HELPER////////////

		/**
		 *  helper class for Tone.Route representing a single gate
		 *  @constructor
		 *  @extends {Tone}
		 *  @private
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
	ToneModule( function(Tone){

		

		/**
		 *  @class  When the gate is set to 0, the input signal does not pass through to the output. 
		 *          If the gate is set to 1, the input signal passes through.
		 *          the gate is initially closed.
		 *
		 *  @constructor
		 *  @extends {Tone.SignalBase}
		 *  @example
		 *  var sigSwitch = new Tone.Switch();
		 *  var signal = new Tone.Signal(2).connect(sigSwitch);
		 *  //initially no output from sigSwitch
		 *  sigSwitch.gate.value = 1;
		 *  //open the switch and allow the signal through
		 *  //the output of sigSwitch is now 2. 
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
		 *  @param {Tone.Time=} time the time when the switch will be open
		 *  @returns {Tone.Switch} `this`
		 *  @example
		 *  //open the switch to let the signal through
		 *  sigSwitch.open();
		 */
		Tone.Switch.prototype.open = function(time){
			this.gate.setValueAtTime(1, this.toSeconds(time));
			return this;
		}; 

		/**
		 *  close the switch at a specific time
		 *
		 *  @param {Tone.Time} time the time when the switch will be open
		 *  @returns {Tone.Switch} `this`
		 *  @example
		 *  //close the switch a half second from now
		 *  sigSwitch.close("+0.5");
		 */
		Tone.Switch.prototype.close = function(time){
			this.gate.setValueAtTime(0, this.toSeconds(time));
			return this;
		}; 

		/**
		 *  clean up
		 *  @returns {Tone.Switch} `this`
		 */
		Tone.Switch.prototype.dispose = function(){
			Tone.prototype.dispose.call(this);
			this.gate.dispose();
			this._thresh.dispose();
			this.gate = null;
			this._thresh = null;
			return this;
		}; 

		return Tone.Switch;
	});
	ToneModule( function(Tone){

		

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
			this._constraints = {"audio" : true};

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
		 *  @private
		 */
		Tone.Microphone.prototype._start = function(){
			navigator.getUserMedia(this._constraints, 
				this._onStream.bind(this), this._onStreamError.bind(this));
		};

		/**
		 *  stop the stream. 
		 *  @private
		 */
		Tone.Microphone.prototype._stop = function(){
			this._stream.stop();
			return this;
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
		 *  @return {Tone.Microphone} `this`
		 */
		Tone.Microphone.prototype.dispose = function() {
			Tone.Source.prototype.dispose.call(this);
			if (this._mediaStream){
				this._mediaStream.disconnect();
				this._mediaStream = null;
			}
			this._stream = null;
			this._constraints = null;
			return this;
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