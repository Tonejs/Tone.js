///////////////////////////////////////////////////////////////////////////////
//
//	TONE
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
	Tone.prototype.bufferSize = 1024; //default buffer size

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
		return typeof(given) !== 'undefined' ? given : fallback;
	}

	//@param {number} percent (0-1)
	//@returns {number} the equal power gain
	//good for cross fades
	Tone.prototype.equalPowerGain = function(percent){
		return Math.sin((percent) * 0.5*Math.PI);
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

	//@param {number} gain
	//@returns {number} gain (decibel scale but betwee 0-1)
	Tone.prototype.gainToLogScale = function(gain) {
		return  Math.max(this.normalize(this.gainToDb(gain), -100, 0), 0);
	}

	//@param {number} gain
	//@returns {number} gain (decibel scale but betwee 0-1)
	Tone.prototype.gainToPowScale = function(gain) {
		return this.dbToGain(this.interpolate(gain, -100, 0));
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
	//	CHANNEL ROUTING
	///////////////////////////////////////////////////////////////////////////

	//@param {AudioNode|Tone=} unit
	Tone.prototype.toMaster = function(node){
		node = this.defaultArg(node, this.output);
		node.connect(Tone.Master);
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
		/** @constructor */
		function tempConstructor() {};
		tempConstructor.prototype = parent.prototype;
		child.prototype = new tempConstructor();
		/** @override */
		child.prototype.constructor = child;
	}

	Tone.context = audioContext;

	///////////////////////////////////////////////////////////////////////////
	//	MASTER OUTPUT
	///////////////////////////////////////////////////////////////////////////

	var Master = function(){
		//extend audio unit
		Tone.call(this);

		//put a hard limiter on the output so we don't blow any eardrums
		this.limiter = this.context.createDynamicsCompressor();
		this.limiter.threshold.value = 0;
		this.limiter.ratio.value = 20;
		this.chain(this.input, this.limiter, this.output, this.context.destination);
	}
	Tone.extend(Master, Tone);
	Tone.Master = new Master();

	//make it global
	global.Tone = Tone;

})(this);
///////////////////////////////////////////////////////////////////////////////
//
//	Envelope
//
//	ADR envelope generator attaches to an AudioParam
///////////////////////////////////////////////////////////////////////////////

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
///////////////////////////////////////////////////////////////////////////////
//
//  LFO
//
///////////////////////////////////////////////////////////////////////////////

Tone.LFO = function(rate, outputMin, outputMax, param){
	//extends Unit
	Tone.call(this);
	//pass audio through
	this.input.connect(this.output);

	this.param = this.defaultArg(param, this.input.gain);
	this.rate = this.defaultArg(rate, 1);
	this.min = this.defaultArg(outputMin, 0);
	this.max = this.defaultArg(outputMax, 1);

	//the components
	this.oscillator = this.context.createOscillator();
	this.offset = this.context.createWaveShaper();

	//connect it up
	this.chain(this.oscillator, this.offset, this.param);

	//setup the values
	this.oscillator.frequency.value = rate;
	this._createCurve();
	this.oscillator.start(0);
	this.setType("sine");
}

Tone.extend(Tone.LFO, Tone);

//generates the values for the waveshaper
Tone.LFO.prototype._createCurve = function(){
	var len = 512;
	var curve = new Float32Array(len);
	for (var i = 0; i < len; i++){
		//values between -1 to 1
		var baseline = (i / (len - 1));
		curve[i] = baseline * (this.max - this.min) + this.min;
	}
	//console.log(curve);
	this.offset.curve = curve;
}


//set the params
Tone.LFO.prototype.setRate = function(rate){
	this.rate = rate;
	this.rampToValue(this.oscillator.frequency, rate, .1);
}

//set the params
Tone.LFO.prototype.setMin = function(min){
	this.min = min;
	this._createCurve();
}

//set the params
Tone.LFO.prototype.setMax = function(max){
	this.max = max;
}

//set the waveform of the LFO
//@param {string | number} type ('sine', 'square', 'sawtooth', 'triangle', 'custom');
Tone.LFO.prototype.setType = function(type){
	this.oscillator.type = type;
}///////////////////////////////////////////////////////////////////////////////
//
//  METER
//
//	get the rms of the input signal with some averaging
//
//	inspired by https://github.com/cwilso/volume-meter/blob/master/volume-meter.js
//	The MIT License (MIT) Copyright (c) 2014 Chris Wilson
///////////////////////////////////////////////////////////////////////////////

//@param {number=} channels
Tone.Meter = function(channels){
	//extends Unit
	Tone.call(this);

	this.channels = this.defaultArg(channels, 1);
	this.volume = new Array(this.channels);
	//zero out the volume array
	for (var i = 0; i < this.channels; i++){
		this.volume[i] = 0;
	}
	this.clipTime = 0;
	
	//components
	this.jsNode = this.context.createScriptProcessor(this.bufferSize, this.channels, this.channels);
	this.jsNode.onaudioprocess = this.onprocess.bind(this);

	//signal just passes
	this.input.connect(this.output);
	this.input.connect(this.jsNode);
	this.toMaster(this.jsNode);
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
		var x;
		var clipped = false;
		for (var i = 0; i < bufferSize; i++){
			x = input[i];
			if (!clipped && x > .95){
				clipped = true;
				this.clipTime = Date.now();
			}
	    	sum += x * x;
		}
		var rms = Math.sqrt(sum / bufferSize);
		this.volume[channel] = Math.max(rms, this.volume[channel] * .8);
	}
}///////////////////////////////////////////////////////////////////////////////
//
//	WEB RTC MICROPHONE
//
///////////////////////////////////////////////////////////////////////////////

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
	|| navigator.mozGetUserMedia || navigator.msGetUserMedia;///////////////////////////////////////////////////////////////////////////////
//
//  NOISE
//
///////////////////////////////////////////////////////////////////////////////

//@param {string} type the noise type
Tone.Noise = function(type){
	//extend Unit
	Tone.call(this);

	//components
	this.jsNode = this.context.createScriptProcessor(this.bufferSize, 1, 1);
	this.shaper = this.context.createWaveShaper();

	//connections
	this.jsNode.connect(this.shaper);
	this.shaper.connect(this.output);

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
}///////////////////////////////////////////////////////////////////////////////
//
//  AUDIO PLAYER
//
///////////////////////////////////////////////////////////////////////////////

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
///////////////////////////////////////////////////////////////////////////////
//
//  STEREO Split
//
//	splits left/right, gives leftSend/Return and rightSend/Return
///////////////////////////////////////////////////////////////////////////////


Tone.StereoSplit = function(){
	//extends Unit
	Tone.call(this);

	this.merger = this.context.createChannelMerger(2);
	this.leftSend = this.context.createGain();
	this.leftReturn = this.context.createGain();
	this.rightSend = this.context.createGain();
	this.rightReturn = this.context.createGain();

	//connect it up
	this.input.connect(this.leftSend);
	this.input.connect(this.rightSend);
	this.leftReturn.connect(this.merger, 0, 0);
	this.rightReturn.connect(this.merger, 0, 1);
	this.merger.connect(this.output);
}

Tone.extend(Tone.StereoSplit, Tone);

Tone.StereoSplit.prototype.connectLeft = function(unit){
	this.chain(this.leftSend, unit, this.leftReturn);
}

Tone.StereoSplit.prototype.connectRight = function(unit){
	this.chain(this.rightSend, unit, this.rightReturn);
}///////////////////////////////////////////////////////////////////////////////
//
//	TRANSPORT
//
//	oscillator-based transport allows for simple musical timing 
//	supports tempo curves and time changes
//	setInterval (repeated events)
//	setTimeout (single timeline event)
//
//	@dependency core/Tone.js
///////////////////////////////////////////////////////////////////////////////

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


///////////////////////////////////////////////////////////////////////////////
//
//  EFFECTS UNIT
//
// 	connect the effect to the effectSend and to the effectReturn
///////////////////////////////////////////////////////////////////////////////


Tone.Effect = function(){
	//extends Unit
	Tone.call(this);

	//components
	this.dry = this.context.createGain();
	this.effectSend = this.context.createGain();
	this.effectReturn = this.context.createGain();

	//connections
	this.input.connect(this.dry);
	this.dry.connect(this.output);
	this.input.connect(this.effectSend);
	this.effectReturn.connect(this.output);
	
	//some initial values
	this.setDry(.5);
}

Tone.extend(Tone.Effect, Tone);

//adjust the dry/wet balance
//dryness 0-1
Tone.Effect.prototype.setDry = function(dryness, duration){
	duration = this.defaultArg(duration, this.fadeTime);
	var dryGain = this.equalPowerGain(dryness);
	var wetGain = this.equalPowerGain(1 - dryness);
	this.rampToValue(this.dry.gain, dryGain, duration);
	this.rampToValue(this.effectSend.gain, wetGain, duration);
}

//adjust the wet/dry balance
Tone.Effect.prototype.setWet = function(wetness, duration){
	this.setDry(1 - wetness);
}

Tone.Effect.prototype.bypass = function(){
	this.setDry(1);
}

Tone.Effect.prototype.connectEffect = function(effect){
	this.chain(this.effectSend, effect, this.effectReturn);
}///////////////////////////////////////////////////////////////////////////////
//
//  FEEDBACK EFFECTS
//
// 	an effect with feedback
///////////////////////////////////////////////////////////////////////////////


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


Tone.Effect.prototype.setFeedback = function(fback){
	this.rampToValue(this.feedback.gain, fback);
}
///////////////////////////////////////////////////////////////////////////////
//
//	FEEDBACK DELAY
//
///////////////////////////////////////////////////////////////////////////////

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
}///////////////////////////////////////////////////////////////////////////////
//
//	PING PONG DELAY
//
///////////////////////////////////////////////////////////////////////////////

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