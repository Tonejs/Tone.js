define(["Tone/core/Tone", "Tone/component/MultibandSplit", "Tone/core/Gain"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.EQ3 is a three band EQ with control over low, mid, and high gain as
	 *         well as the low and high crossover frequencies.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  
	 *  @param {Decibels|Object} [lowLevel] The gain applied to the lows.
	 *  @param {Decibels} [midLevel] The gain applied to the mid.
	 *  @param {Decibels} [highLevel] The gain applied to the high.
	 *  @example
	 * var eq = new Tone.EQ3(-10, 3, -20);
	 */
	Tone.EQ3 = function(){

		var options = this.optionsObject(arguments, ["low", "mid", "high"], Tone.EQ3.defaults);

		/**
		 *  the output node
		 *  @type {GainNode}
		 *  @private
		 */
		this.output = new Tone.Gain();

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
		 *  The gain for the lower signals
		 *  @type  {Tone.Gain}
		 *  @private
		 */
		this._lowGain = new Tone.Gain(options.low, Tone.Type.Decibels);

		/**
		 *  The gain for the mid signals
		 *  @type  {Tone.Gain}
		 *  @private
		 */
		this._midGain = new Tone.Gain(options.mid, Tone.Type.Decibels);

		/**
		 * The gain in decibels of the high part
		 * @type {Tone.Gain}
		 * @private
		 */
		this._highGain = new Tone.Gain(options.high, Tone.Type.Decibels);

		/**
		 * The gain in decibels of the low part
		 * @type {Decibels}
		 * @signal
		 */
		this.low = this._lowGain.gain;

		/**
		 * The gain in decibels of the mid part
		 * @type {Decibels}
		 * @signal
		 */
		this.mid = this._midGain.gain;

		/**
		 * The gain in decibels of the high part
		 * @type {Decibels}
		 * @signal
		 */
		this.high = this._highGain.gain;

		/**
		 *  The Q value for all of the filters. 
		 *  @type {Positive}
		 *  @signal
		 */
		this.Q = this._multibandSplit.Q;

		/**
		 *  The low/mid crossover frequency. 
		 *  @type {Frequency}
		 *  @signal
		 */
		this.lowFrequency = this._multibandSplit.lowFrequency;

		/**
		 *  The mid/high crossover frequency. 
		 *  @type {Frequency}
		 *  @signal
		 */
		this.highFrequency = this._multibandSplit.highFrequency;

		//the frequency bands
		this._multibandSplit.low.chain(this._lowGain, this.output);
		this._multibandSplit.mid.chain(this._midGain, this.output);
		this._multibandSplit.high.chain(this._highGain, this.output);
		this._readOnly(["low", "mid", "high", "lowFrequency", "highFrequency"]);
	};

	Tone.extend(Tone.EQ3);

	/**
	 *  the default values
	 */
	Tone.EQ3.defaults = {
		"low" : 0,
		"mid" : 0,
		"high" : 0,
		"lowFrequency" : 400,
		"highFrequency" : 2500
	};

	/**
	 *  clean up
	 *  @returns {Tone.EQ3} this
	 */
	Tone.EQ3.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._writable(["low", "mid", "high", "lowFrequency", "highFrequency"]);
		this._multibandSplit.dispose();
		this._multibandSplit = null;
		this.lowFrequency = null;
		this.highFrequency = null;
		this._lowGain.dispose();
		this._lowGain = null;
		this._midGain.dispose();
		this._midGain = null;
		this._highGain.dispose();
		this._highGain = null;
		this.low = null;
		this.mid = null;
		this.high = null;
		this.Q = null;
		return this;
	};

	return Tone.EQ3;
});