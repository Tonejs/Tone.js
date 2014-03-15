///////////////////////////////////////////////////////////////////////////////
//
//	AUDIO UNIT
//
///////////////////////////////////////////////////////////////////////////////

(function(global){
	
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

	///////////////////////////////////////////////////////////////////////////
	//	AUDIO UNIT
	//	@constructor
	///////////////////////////////////////////////////////////////////////////

	var AudioUnit = function(){
		this.input = audioContext.createGain();
		this.output = audioContext.createGain();
	}

	///////////////////////////////////////////////////////////////////////////
	//	CLASS VARS
	///////////////////////////////////////////////////////////////////////////

	AudioUnit.prototype.context = audioContext;
	AudioUnit.prototype.fadeTime = .005; //5ms
	AudioUnit.prototype.bufferSize = 1024; //default buffer size

	///////////////////////////////////////////////////////////////////////////
	//	CLASS METHODS
	///////////////////////////////////////////////////////////////////////////

	//@returns {number} the currentTime from the AudioContext
	AudioUnit.prototype.now = function(){
		return audioContext.currentTime;
	}

	//@param {AudioParam | AudioUnit} unit
	AudioUnit.prototype.connect = function(unit){
		this._connect(this, unit);
	}

	//disconnect the output
	AudioUnit.prototype.disconnect = function(){
		this.output.disconnect();
	}

	//@private internal connect
	//@param {AudioNode|AudioUnit} A
	//@param {AudioNode|AudioUnit} B
	AudioUnit.prototype._connect = function(A, B){
		var compA = A;
		if (A.output && A.output instanceof GainNode){
			compA = A.output;
		}
		var compB = B;
		if (B.input && B.input instanceof GainNode){
			compB = B.input;
		} 
		compA.connect(compB);
	}
	
	//connect together an array of units in series
	//@param {...AudioParam | AudioUnit} units
	AudioUnit.prototype.chain = function(){
		if (arguments.length > 1){
			var currentUnit = arguments[0];
			for (var i = 1; i < arguments.length; i++){
				var toUnit = arguments[i];
				this._connect(currentUnit, toUnit);
				currentUnit = toUnit;
			}
		}
	}

	//set the output volume
	//@param {number} vol
	AudioUnit.prototype.setVolume = function(vol){
		this.output.gain.value = vol;
	}

	//fade the output volume
	//@param {number} value
	//@param {number=} duration (in seconds)
	AudioUnit.prototype.fadeTo = function(value, duration){
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
	AudioUnit.prototype.rampToValue = function(audioParam, value, duration){
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
	AudioUnit.prototype.exponentialRampToValue = function(audioParam, value, duration){
		var currentValue = audioParam.value;
		var now = this.now();
		audioParam.setValueAtTime(currentValue, now);
		audioParam.exponentialRampToValueAtTime(value, now + duration);
	}

	//if the given argument is undefined, go with the default
	//@param {*} given
	//@param {*} fallback
	//@returns {*}
	AudioUnit.prototype.defaultArg = function(given, fallback){
		return typeof(given) !== 'undefined' ? given : fallback;
	}

	//@param {number} percent (0-1)
	//@returns {number} the equal power gain
	//good for cross fades
	AudioUnit.prototype.equalPowerGain = function(percent){
		return Math.sin((percent) * 0.5*Math.PI);
	}

	//@param {number} db
	//@returns {number} gain
	AudioUnit.prototype.dbToGain = function(db) {
		return Math.pow(2, db / 6);
	}

	//@param {number} gain
	//@returns {number} db
	AudioUnit.prototype.gainToDb = function(gain) {
		return  20 * (Math.log(gain) / Math.LN10);
	}

	//@param {number} gain
	//@returns {number} gain (decibel scale but betwee 0-1)
	AudioUnit.prototype.gainToLogScale = function(gain) {
		return  Math.max(this.normalize(this.gainToDb(gain), -100, 0), 0);
	}

	//@param {number} gain
	//@returns {number} gain (decibel scale but betwee 0-1)
	AudioUnit.prototype.gainToPowScale = function(gain) {
		return this.dbToGain(this.interpolate(gain, -100, 0));
	}

	//@param {number} input 0-1
	AudioUnit.prototype.interpolate = function(input, outputMin, outputMax){
		return input*(outputMax - outputMin) + outputMin;
	}

	//@returns {number} 0-1
	AudioUnit.prototype.normalize = function(input, inputMin, inputMax){
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

	//@param {AudioParam|AudioUnit=} unit
	AudioUnit.prototype.toMaster = function(unit){
		unit = this.defaultArg(unit, this.output);
		this._connect(unit, AudioUnit.Master);
	}


	///////////////////////////////////////////////////////////////////////////
	//	STATIC METHODS
	///////////////////////////////////////////////////////////////////////////
	
	//based on closure library 'inherit' function
	AudioUnit.extend = function(child, parent){
		/** @constructor */
		function tempConstructor() {};
		tempConstructor.prototype = parent.prototype;
		child.prototype = new tempConstructor();
		/** @override */
		child.prototype.constructor = child;
	}

	///////////////////////////////////////////////////////////////////////////
	//	MASTER OUTPUT
	///////////////////////////////////////////////////////////////////////////

	var Master = function(){
		//extend audio unit
		AudioUnit.call(this);

		//put a hard limiter on the output so we don't blow any eardrums
		this.limiter = this.context.createDynamicsCompressor();
		this.limiter.threshold.value = 0;
		this.limiter.ratio.value = 20;
		this.chain(this.input, this.limiter, this.output, this.context.destination);
	}
	AudioUnit.extend(Master, AudioUnit);
	AudioUnit.Master = new Master();

	//make it global
	global.AudioUnit = AudioUnit;

})(window);
