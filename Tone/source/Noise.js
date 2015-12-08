define(["Tone/core/Tone", "Tone/source/Source"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Noise is a noise generator. It uses looped noise buffers to save on performance.
	 *          Tone.Noise supports the noise types: "pink", "white", and "brown". Read more about
	 *          colors of noise on [Wikipedia](https://en.wikipedia.org/wiki/Colors_of_noise).
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {string} type the noise type (white|pink|brown)
	 *  @example
	 * //initialize the noise and start
	 * var noise = new Tone.Noise("pink").start();
	 * 
	 * //make an autofilter to shape the noise
	 * var autoFilter = new Tone.AutoFilter({
	 * 	"frequency" : "8m", 
	 * 	"min" : 800, 
	 * 	"max" : 15000
	 * }).connect(Tone.Master);
	 * 
	 * //connect the noise
	 * noise.connect(autoFilter);
	 * //start the autofilter LFO
	 * autoFilter.start()
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

		/**
		 *  The playback rate of the noise. Affects
		 *  the "frequency" of the noise.
		 *  @type {Positive}
		 *  @signal
		 */
		this._playbackRate = options.playbackRate;

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
		"playbackRate" : 1
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
						throw new Error("invalid noise type: "+type)
				}
				//if it's playing, stop and restart it
				if (this.state === Tone.State.Started){
					var now = this.now() + this.blockTime;
					//remove the listener
					this._stop(now);
					this._start(now);
				}
			}
		}
	});

	/**
	 *  The playback rate of the noise. Affects
	 *  the "frequency" of the noise.
	 *  @type {Positive}
	 *  @signal
	 */
	Object.defineProperty(Tone.Noise.prototype, "playbackRate", {
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
	 *  internal start method
	 *
	 *  @param {Time} time
	 *  @private
	 */
	Tone.Noise.prototype._start = function(time){
		this._source = this.context.createBufferSource();
		this._source.buffer = this._buffer;
		this._source.loop = true;
		this._source.playbackRate.value = this._playbackRate;
		this._source.connect(this.output);
		this._source.start(this.toSeconds(time));
	};

	/**
	 *  internal stop method
	 *
	 *  @param {Time} time
	 *  @private
	 */
	Tone.Noise.prototype._stop = function(time){
		if (this._source){
			this._source.stop(this.toSeconds(time));
		}
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.Noise} this
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
	// borrowed heavily from http://noisehack.com/generate-noise-web-audio-api/
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