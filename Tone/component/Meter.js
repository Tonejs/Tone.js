define(["Tone/core/Tone"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Meter gets the [RMS](https://en.wikipedia.org/wiki/Root_mean_square)
	 *          of an input signal with some averaging applied. 
	 *          It can also get the raw value of the signal or the value in dB. For signal 
	 *          processing, it's better to use Tone.Follower which will produce an audio-rate 
	 *          envelope follower instead of needing to poll the Meter to get the output.
	 *          <br><br>
	 *          Meter was inspired by [Chris Wilsons Volume Meter](https://github.com/cwilso/volume-meter/blob/master/volume-meter.js).
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} [channels=1] number of channels being metered
	 *  @param {number} [smoothing=0.8] amount of smoothing applied to the volume
	 *  @param {number} [clipMemory=0.5] number in seconds that a "clip" should be remembered
	 *  @example
	 * var meter = new Tone.Meter();
	 * var mic = new Tone.Microphone().start();
	 * //connect mic to the meter
	 * mic.connect(meter);
	 * //use getLevel or getDb 
	 * //to access meter level
	 * meter.getLevel();
	 */
	Tone.Meter = function(){

		var options = this.optionsObject(arguments, ["channels", "smoothing"], Tone.Meter.defaults);
		//extends Unit
		Tone.call(this);

		/** 
		 *  The channel count
		 *  @type  {number}
		 *  @private
		 */
		this._channels = options.channels;

		/**
		 * The amount which the decays of the meter are smoothed. Small values
		 * will follow the contours of the incoming envelope more closely than large values.
		 * @type {NormalRange}
		 */
		this.smoothing = options.smoothing;

		/** 
		 *  The amount of time a clip is remember for. 
		 *  @type  {Time}
		 */
		this.clipMemory = options.clipMemory;

		/** 
		 *  The value above which the signal is considered clipped.
		 *  @type  {Number}
		 */
		this.clipLevel = options.clipLevel;

		/** 
		 *  the rms for each of the channels
		 *  @private
		 *  @type {Array}
		 */
		this._volume = new Array(this._channels);

		/** 
		 *  the raw values for each of the channels
		 *  @private
		 *  @type {Array}
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
		 *  @type {Array}
		 */
		this._lastClip = new Array(this._channels);

		//zero out the clip array
		for (var j = 0; j < this._lastClip.length; j++){
			this._lastClip[j] = 0;
		}
		
		/** 
		 *  @private
		 *  @type {ScriptProcessorNode}
		 */
		this._jsNode = this.context.createScriptProcessor(options.bufferSize, this._channels, 1);
		this._jsNode.onaudioprocess = this._onprocess.bind(this);
		//so it doesn't get garbage collected
		this._jsNode.noGC();

		//signal just passes
		this.input.connect(this.output);
		this.input.connect(this._jsNode);
	};

	Tone.extend(Tone.Meter);

	/**
	 *  The defaults
	 *  @type {Object}
	 *  @static
	 *  @const
	 */
	Tone.Meter.defaults = {
		"smoothing" : 0.8,
		"bufferSize" : 1024,
		"clipMemory" : 0.5,
		"clipLevel" : 0.9,
		"channels" : 1
	};

	/**
	 *  called on each processing frame
	 *  @private
	 *  @param  {AudioProcessingEvent} event 
	 */
	Tone.Meter.prototype._onprocess = function(event){
		var bufferSize = this._jsNode.bufferSize;
		var smoothing = this.smoothing;
		for (var channel = 0; channel < this._channels; channel++){
			var input = event.inputBuffer.getChannelData(channel);
			var sum = 0;
			var total = 0;
			var x;
			for (var i = 0; i < bufferSize; i++){
				x = input[i];
				total += x;
		    	sum += x * x;
			}
			var average = total / bufferSize;
			var rms = Math.sqrt(sum / bufferSize);
			if (rms > 0.9){
				this._lastClip[channel] = Date.now();
			}
			this._volume[channel] = Math.max(rms, this._volume[channel] * smoothing);
			this._values[channel] = average;
		}
	};

	/**
	 *  Get the rms of the signal.
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
	 *  Get the raw value of the signal. 
	 *  @param  {number=} channel 
	 *  @return {number}         
	 */
	Tone.Meter.prototype.getValue = function(channel){
		channel = this.defaultArg(channel, 0);
		return this._values[channel];
	};

	/**
	 *  Get the volume of the signal in dB
	 *  @param  {number=} channel 
	 *  @return {Decibels}         
	 */
	Tone.Meter.prototype.getDb = function(channel){
		return this.gainToDb(this.getLevel(channel));
	};

	/**
	 * @returns {boolean} if the audio has clipped. The value resets
	 *                       based on the clipMemory defined. 
	 */
	Tone.Meter.prototype.isClipped = function(channel){
		channel = this.defaultArg(channel, 0);
		return Date.now() - this._lastClip[channel] < this._clipMemory * 1000;
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.Meter} this
	 */
	Tone.Meter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._jsNode.disconnect();
		this._jsNode.onaudioprocess = null;
		this._jsNode = null;
		this._volume = null;
		this._values = null;
		this._lastClip = null;
		return this;
	};

	return Tone.Meter;
});