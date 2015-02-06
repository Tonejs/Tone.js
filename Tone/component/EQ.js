define(["Tone/core/Tone", "Tone/component/MultibandSplit"], function(Tone){

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
	 */
	Tone.EQ = function(){

		var options = this.optionsObject(arguments, ["low", "mid", "high"], Tone.EQ.defaults);

		/**
		 *  the output node
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the multiband split
		 *  @type {Tone.MultibandSplit}
		 *  @private
		 */
		this._multibandSplit = new Tone.MultibandSplit({
			"lowFrequency" : options.lowFrequency,
			"highFrequency" : options.highFrequency
		});

		/**
		 *  input node
		 */
		this.input = this._multibandSplit;

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
		this.high = options.low;
		this.mid = options.mid;
		this.low = options.high;
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
	 * The gain in decibels of the low part
	 * @memberOf Tone.EQ#
	 * @type {number}
	 * @name low
	 */
	Object.defineProperty(Tone.EQ.prototype, "low", {
		get : function(){
			return this.gainToDb(this._lowGain.gain.value);
		},
		set : function(db){
			this._lowGain.gain.value = this.dbToGain(db);
		}
	});

	/**
	 * the gain in decibels of the mid
	 * @memberOf Tone.EQ#
	 * @type {number}
	 * @name mid
	 */
	Object.defineProperty(Tone.EQ.prototype, "mid", {
		get : function(){
			return this.gainToDb(this._midGain.gain.value);
		},
		set : function(db){
			this._midGain.gain.value = this.dbToGain(db);
		}
	});

	/**
	 * the gain in decibels of the high
	 * @memberOf Tone.EQ#
	 * @type {number}
	 * @name high
	 */
	Object.defineProperty(Tone.EQ.prototype, "high", {
		get : function(){
			return this.gainToDb(this._highGain.gain.value);
		},
		set : function(db){
			this._highGain.gain.value = this.dbToGain(db);
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.EQ} `this`
	 */
	Tone.EQ.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._multibandSplit.dispose();
		this._lowGain.disconnect();
		this._midGain.disconnect();
		this._highGain.disconnect();
		this._multibandSplit = null;
		this.lowFrequency = null;
		this.highFrequency = null;
		this._lowGain = null;
		this._midGain = null;
		this._highGain = null;
		return this;
	};

	return Tone.EQ;
});