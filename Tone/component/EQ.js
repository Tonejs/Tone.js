define(["Tone/core/Tone", "Tone/component/MultibandSplit", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class A 3 band EQ with control over low, mid, and high gain as
	 *         well as the low and high crossover frequencies. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  
	 *  @param {number|object} [lowLevel=0] the gain applied to the lows (in db)
	 *  @param {number} [midLevel=0] the gain applied to the mid (in db)
	 *  @param {number} [highLevel=0] the gain applied to the high (in db)
	 *  @example
	 *  var eq = new Tone.EQ(-10, 3, -20);
	 */
	Tone.EQ = function(){

		var options = this.optionsObject(arguments, ["low", "mid", "high"], Tone.EQ.defaults);

		/**
		 *  the output node
		 *  @type {GainNode}
		 *  @private
		 */
		this.output = this.context.createGain();

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
		 *  the low gain
		 *  @type {GainNode}
		 *  @private
		 */
		this._lowGain = this.context.createGain();

		/**
		 *  the mid gain
		 *  @type {GainNode}
		 *  @private
		 */
		this._midGain = this.context.createGain();

		/**
		 *  the high gain
		 *  @type {GainNode}
		 *  @private
		 */
		this._highGain = this.context.createGain();

		/**
		 * The gain in decibels of the low part
		 * @type {Tone.Signal}
		 */
		this.low = new Tone.Signal(this._lowGain.gain, Tone.Signal.Units.Decibels);

		/**
		 * The gain in decibels of the mid part
		 * @type {Tone.Signal}
		 */
		this.mid = new Tone.Signal(this._midGain.gain, Tone.Signal.Units.Decibels);

		/**
		 * The gain in decibels of the high part
		 * @type {Tone.Signal}
		 */
		this.high = new Tone.Signal(this._highGain.gain, Tone.Signal.Units.Decibels);

		/**
		 *  the low/mid crossover frequency
		 *  @type {Tone.Signal}
		 */
		this.lowFrequency = this._multibandSplit.lowFrequency;

		/**
		 *  the mid/high crossover frequency
		 *  @type {Tone.Signal}
		 */
		this.highFrequency = this._multibandSplit.highFrequency;

		//the frequency bands
		this._multibandSplit.low.chain(this._lowGain, this.output);
		this._multibandSplit.mid.chain(this._midGain, this.output);
		this._multibandSplit.high.chain(this._highGain, this.output);
		//set the gains
		this.high.value = options.low;
		this.mid.value = options.mid;
		this.low.value = options.high;
	};

	Tone.extend(Tone.EQ);

	/**
	 *  the default values
	 *  @type {Object}
	 *  @static
	 */
	Tone.EQ.defaults = {
		"low" : 0,
		"mid" : 0,
		"high" : 0,
		"lowFrequency" : 400,
		"highFrequency" : 2500
	};

	/**
	 *  clean up
	 *  @returns {Tone.EQ} `this`
	 */
	Tone.EQ.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._multibandSplit.dispose();
		this._multibandSplit = null;
		this.lowFrequency = null;
		this.highFrequency = null;
		this._lowGain.disconnect();
		this._lowGain = null;
		this._midGain.disconnect();
		this._midGain = null;
		this._highGain.disconnect();
		this._highGain = null;
		this.low.dispose();
		this.low = null;
		this.mid.dispose();
		this.mid = null;
		this.high.dispose();
		this.high = null;
		return this;
	};

	return Tone.EQ;
});