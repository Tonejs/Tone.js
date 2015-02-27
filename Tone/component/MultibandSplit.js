define(["Tone/core/Tone", "Tone/component/Filter", "Tone/signal/Signal"], function(Tone){

	"use strict";

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