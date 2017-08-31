define(["Tone/core/Tone", "Tone/component/Analyser", "Tone/core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Meter gets the [RMS](https://en.wikipedia.org/wiki/Root_mean_square)
	 *          of an input signal with some averaging applied. It can also get the raw
	 *          value of the input signal.
	 *
	 *  @constructor
	 *  @extends {Tone.AudioNode}
	 *  @param {Number} smoothing The amount of smoothing applied between frames.
	 *  @example
	 * var meter = new Tone.Meter();
	 * var mic = new Tone.UserMedia().open();
	 * //connect mic to the meter
	 * mic.connect(meter);
	 * //the current level of the mic input in decibels
	 * var level = meter.getValue();
	 */
	Tone.Meter = function(){

		var options = Tone.defaults(arguments, ["smoothing"], Tone.Meter);
		Tone.AudioNode.call(this);

		/**
		 *  The analyser node which computes the levels.
		 *  @private
		 *  @type  {Tone.Analyser}
		 */
		this.input = this.output = this._analyser = new Tone.Analyser("waveform", 1024);

		/**
		 *  The amount of carryover between the current and last frame.
		 *  Only applied meter for "level" type.
		 *  @type  {Number}
		 */
		this.smoothing = options.smoothing;
	};

	Tone.extend(Tone.Meter, Tone.AudioNode);

	/**
	 *  The defaults
	 *  @type {Object}
	 *  @static
	 *  @const
	 */
	Tone.Meter.defaults = {
		"smoothing" : 0.8
	};

	/**
	 *  Get the current decibel value of the incoming signal
	 *  @returns {Decibels}
	 */
	Tone.Meter.prototype.getLevel = function(){
		this._analyser.type = "fft";
		var values = this._analyser.getValue();
		var offset = 28; // normalizes most signal levels
		// TODO: compute loudness from FFT
		return Math.max.apply(this, values) + offset;
	};

	/**
	 *  Get the signal value of the incoming signal
	 *  @returns {Number}
	 */
	Tone.Meter.prototype.getValue = function(){
		this._analyser.type = "waveform";
		var value = this._analyser.getValue();
		return value[0];
	};

	/**
	 * A value from 0 -> 1 where 0 represents no time averaging with the last analysis frame.
	 * @memberOf Tone.Meter#
	 * @type {Number}
	 * @name smoothing
	 * @readOnly
	 */
	Object.defineProperty(Tone.Meter.prototype, "smoothing", {
		get : function(){
			return this._analyser.smoothing;
		},
		set : function(val){
			this._analyser.smoothing = val;
		},
	});

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
