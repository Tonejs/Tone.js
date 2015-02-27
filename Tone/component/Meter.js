define(["Tone/core/Tone", "Tone/core/Master"], function(Tone){

	"use strict";

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