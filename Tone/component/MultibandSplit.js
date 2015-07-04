define(["Tone/core/Tone", "Tone/component/Filter", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Split the incoming signal into three bands (low, mid, high)
	 *         with two crossover frequency controls. 
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {Frequency|Object} [lowFrequency] the low/mid crossover frequency
	 *  @param {Frequency} [highFrequency] the mid/high crossover frequency
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
		 *  The low band. Alias for <code>output[0]</code>
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
		 *  The mid band output. Alias for <code>output[1]</code>
		 *  @type {Tone.Filter}
		 */
		this.mid = this.output[1] = new Tone.Filter(0, "lowpass");

		/**
		 *  The high band output. Alias for <code>output[2]</code>
		 *  @type {Tone.Filter}
		 */
		this.high = this.output[2] = new Tone.Filter(0, "highpass");

		/**
		 *  The low/mid crossover frequency.
		 *  @type {Frequency}
		 *  @signal
		 */
		this.lowFrequency = new Tone.Signal(options.lowFrequency, Tone.Type.Frequency);

		/**
		 *  The mid/high crossover frequency.
		 *  @type {Frequency}
		 *  @signal
		 */
		this.highFrequency = new Tone.Signal(options.highFrequency, Tone.Type.Frequency);

		/**
		 *  The quality of all the filters
		 *  @type {Number}
		 *  @signal
		 */
		this.Q = new Tone.Signal(options.Q);

		this.input.fan(this.low, this.high);
		this.input.chain(this._lowMidFilter, this.mid);
		//the frequency control signal
		this.lowFrequency.connect(this.low.frequency);
		this.lowFrequency.connect(this._lowMidFilter.frequency);
		this.highFrequency.connect(this.mid.frequency);
		this.highFrequency.connect(this.high.frequency);
		//the Q value
		this.Q.connect(this.low.Q);
		this.Q.connect(this._lowMidFilter.Q);
		this.Q.connect(this.mid.Q);
		this.Q.connect(this.high.Q);

		this._readOnly(["high", "mid", "low", "highFrequency", "lowFrequency"]);
	};

	Tone.extend(Tone.MultibandSplit);

	/**
	 *  @private
	 *  @static
	 *  @type {Object}
	 */
	Tone.MultibandSplit.defaults = {
		"lowFrequency" : 400,
		"highFrequency" : 2500,
		"Q" : 1,
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.MultibandSplit} this
	 */
	Tone.MultibandSplit.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._writable(["high", "mid", "low", "highFrequency", "lowFrequency"]);
		this.low.dispose();
		this.low = null;
		this._lowMidFilter.dispose();
		this._lowMidFilter = null;
		this.mid.dispose();
		this.mid = null;
		this.high.dispose();
		this.high = null;
		this.lowFrequency.dispose();
		this.lowFrequency = null;
		this.highFrequency.dispose();
		this.highFrequency = null;
		this.Q.dispose();
		this.Q = null;
		return this;
	};

	return Tone.MultibandSplit;
});