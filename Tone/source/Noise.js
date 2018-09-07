define(["../core/Tone", "../source/Source", "../core/Buffer",
	"../source/BufferSource"], function(Tone){

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

		var options = Tone.defaults(arguments, ["type"], Tone.Noise);
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
		this._type = options.type;

		/**
		 *  The playback rate of the noise. Affects
		 *  the "frequency" of the noise.
		 *  @type {Positive}
		 *  @signal
		 */
		this._playbackRate = options.playbackRate;
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
			return this._type;
		},
		set : function(type){
			if (this._type !== type){
				if (type in _noiseBuffers){
					this._type = type;
					//if it's playing, stop and restart it
					if (this.state === Tone.State.Started){
						var now = this.now();
						this._stop(now);
						this._start(now);
					}
				} else {
					throw new TypeError("Tone.Noise: invalid type: "+type);
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
			if (this._source){
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
		var buffer = _noiseBuffers[this._type];
		this._source = new Tone.BufferSource(buffer).connect(this.output);
		this._source.loop = true;
		this._source.playbackRate.value = this._playbackRate;
		this._source.start(this.toSeconds(time), Math.random() * (buffer.duration - 0.001));
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
			this._source = null;
		}
	};

	/**
	 * Restarts the noise.
	 * @param  {Time} time When to restart the noise.
	 * @return {Tone.Noise}      this
	 */
	Tone.Noise.prototype.restart = function(time){
		//TODO could be optimized by cancelling the buffer source 'stop'
		//stop and restart
		this._stop(time);
		this._start(time);
		return this;
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
	///////////////////////////////////////////////////////////////////////////

	//Noise buffer stats
	var bufferLength = 44100 * 5;
	var channels = 2;

	/**
	 *	The noise arrays. Generated on initialization.
	 *  borrowed heavily from https://github.com/zacharydenton/noise.js
	 *  (c) 2013 Zach Denton (MIT)
	 *  @static
	 *  @private
	 *  @type {Array}
	 */
	var _noiseBuffers = {};
	var _noiseCache = {};

	Object.defineProperty(_noiseBuffers, "pink", {
		get : function(){
			if (!_noiseCache.pink){
				var buffer = [];
				for (var channelNum = 0; channelNum < channels; channelNum++){
					var channel = new Float32Array(bufferLength);
					buffer[channelNum] = channel;
					var b0, b1, b2, b3, b4, b5, b6;
					b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
					for (var i = 0; i < bufferLength; i++){
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
				_noiseCache.pink = new Tone.Buffer().fromArray(buffer);
			}
			return _noiseCache.pink;
		}
	});

	Object.defineProperty(_noiseBuffers, "brown", {
		get : function(){
			if (!_noiseCache.brown){
				var buffer = [];
				for (var channelNum = 0; channelNum < channels; channelNum++){
					var channel = new Float32Array(bufferLength);
					buffer[channelNum] = channel;
					var lastOut = 0.0;
					for (var i = 0; i < bufferLength; i++){
						var white = Math.random() * 2 - 1;
						channel[i] = (lastOut + (0.02 * white)) / 1.02;
						lastOut = channel[i];
						channel[i] *= 3.5; // (roughly) compensate for gain
					}
				}
				_noiseCache.brown = new Tone.Buffer().fromArray(buffer);
			}
			return _noiseCache.brown;
		}
	});

	Object.defineProperty(_noiseBuffers, "white", {
		get : function(){
			if (!_noiseCache.white){
				var buffer = [];
				for (var channelNum = 0; channelNum < channels; channelNum++){
					var channel = new Float32Array(bufferLength);
					buffer[channelNum] = channel;
					for (var i = 0; i < bufferLength; i++){
						channel[i] = Math.random() * 2 - 1;
					}
				}
				_noiseCache.white = new Tone.Buffer().fromArray(buffer);
			}
			return _noiseCache.white;
		}
	});

	return Tone.Noise;
});
