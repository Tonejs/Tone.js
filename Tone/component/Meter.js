define(["../core/Tone", "../component/Analyser", "../core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Meter gets the [RMS](https://en.wikipedia.org/wiki/Root_mean_square)
	 *          of an input signal. It can also get the raw
	 *          value of the input signal.
	 *
	 *  @constructor
	 *  @param {Number} smoothing The amount of smoothing applied between frames.
	 *  @extends {Tone.AudioNode}
	 *  @example
	 * var meter = new Tone.Meter();
	 * var mic = new Tone.UserMedia().open();
	 * //connect mic to the meter
	 * mic.connect(meter);
	 * //the current level of the mic input in decibels
	 * var level = meter.getLevel();
	 */
	Tone.Meter = function(){

		var options = Tone.defaults(arguments, ["smoothing"], Tone.Meter);
		Tone.AudioNode.call(this);

		/**
		 * A value from 0 -> 1 where 0 represents no time averaging with the last analysis frame.
		 * @type {Number}
		 */
		this.smoothing = options.smoothing;

		/**
		 * The previous frame's value
		 * @type {Number}
		 * @private
		 */
		this._rms = 0;

		/**
		 *  The analyser node which computes the levels.
		 *  @private
		 *  @type  {Tone.Analyser}
		 */
		this.input = this.output = this._analyser = new Tone.Analyser("waveform", 256);
	};

	Tone.extend(Tone.Meter, Tone.AudioNode);

	/**
	 *  The defaults
	 *  @type {Object}
	 *  @static
	 *  @const
	 */
	Tone.Meter.defaults = {
		"smoothing" : 0.8,
	};

	/**
	 *  Get the current decibel value of the incoming signal
	 *  @returns {Decibels}
	 */
	Tone.Meter.prototype.getLevel = function(){
		var values = this._analyser.getValue();
		var totalSquared = 0;
		for (var i = 0; i < values.length; i++){
			var value = values[i];
			totalSquared += value * value;
		}
		var rms = Math.sqrt(totalSquared / values.length);

		//the rms can only fall at the rate of the smoothing
		//but can jump up instantly
		this._rms = Math.max(rms, this._rms * this.smoothing);

		return Tone.gainToDb(this._rms);
	};

	/**
	 *  Get the signal value of the incoming signal
	 *  @returns {Number}
	 */
	Tone.Meter.prototype.getValue = function(){
		var value = this._analyser.getValue();
		return value[0];
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.Meter} this
	 */
	Tone.Meter.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._analyser.dispose();
		this._analyser = null;
		return this;
	};

	return Tone.Meter;
});
