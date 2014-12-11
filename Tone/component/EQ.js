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
		 */
		this.lowGain = this.context.createGain();

		/**
		 *  the mid gain
		 *  @type {GainNode}
		 */
		this.midGain = this.context.createGain();

		/**
		 *  the high gain
		 *  @type {GainNode}
		 */
		this.highGain = this.context.createGain();

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
		this._multibandSplit.low.chain(this.lowGain, this.output);
		this._multibandSplit.mid.chain(this.midGain, this.output);
		this._multibandSplit.high.chain(this.highGain, this.output);
		//set the gains
		this.setLow(options.low);
		this.setMid(options.mid);
		this.setHigh(options.high);
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
	 *  set the values in bulk
	 *  @param {object} params the parameters
	 */
	Tone.EQ.prototype.set = function(params){
		if (!this.isUndef(params.mid)) this.setMid(params.mid);
		if (!this.isUndef(params.high)) this.setHigh(params.high);
		if (!this.isUndef(params.low)) this.setLow(params.low);
		if (!this.isUndef(params.lowFrequency)) this.lowFrequency.setValue(params.lowFrequency);
		if (!this.isUndef(params.highFrequency)) this.highFrequency.setValue(params.highFrequency);
	};

	/**
	 *  set the mid range
	 *  @param {number} db the db of the mids
	 */
	Tone.EQ.prototype.setMid = function(db){
		this.midGain.gain.value = this.dbToGain(db);
	};

	/**
	 *  set the high range
	 *  @param {number} db the db of the highs
	 */
	Tone.EQ.prototype.setHigh = function(db){
		this.highGain.gain.value = this.dbToGain(db);
	};

	/**
	 *  set the low range
	 *  @param {number} db the db of the lows
	 */
	Tone.EQ.prototype.setLow = function(db){
		this.lowGain.gain.value = this.dbToGain(db);
	};

	/**
	 *  clean up
	 */
	Tone.EQ.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._multibandSplit.dispose();
		this.lowGain.disconnect();
		this.midGain.disconnect();
		this.highGain.disconnect();
		this._multibandSplit = null;
		this.lowFrequency = null;
		this.highFrequency = null;
		this.lowGain = null;
		this.midGain = null;
		this.highGain = null;
	};

	return Tone.EQ;
});