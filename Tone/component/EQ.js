define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/component/Filter"], function(Tone){

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

		Tone.call(this);

		var options = this.optionsObject(arguments, ["low", "mid", "high"], Tone.EQ.defaults);

		/**
		 *  the low band
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this._lowFilter = new Tone.Filter(0, "lowpass");

		/**
		 *  the lower filter of the mid band
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this._lowMidFilter = new Tone.Filter(0, "highpass");

		/**
		 *  the lower filter of the mid band
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this._highMidFilter = new Tone.Filter(0, "lowpass");

		/**
		 *  the high filter
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this._highFilter = new Tone.Filter(0, "highpass");

		/**
		 *  the crossover frequency for lows
		 *  @type {Tone.Signal}
		 */
		this.lowFrequency = new Tone.Signal(options.lowFrequency);

		/**
		 *  the crossover frequency for highs
		 *  @type {Tone.Signal}
		 */
		this.highFrequency = new Tone.Signal(options.highFrequency);

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

		//the frequency bands
		this.chain(this.input, this._lowFilter, this.lowGain, this.output);
		this.chain(this.input, this._lowMidFilter, this._highMidFilter, this.midGain, this.output);
		this.chain(this.input, this._highFilter, this.highGain, this.output);
		//frequency control
		this.lowFrequency.connect(this._lowFilter.frequency);
		this.lowFrequency.connect(this._lowMidFilter.frequency);
		this.highFrequency.connect(this._highMidFilter.frequency);
		this.highFrequency.connect(this._highFilter.frequency);
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
		this._lowFilter.dispose();
		this._lowMidFilter.dispose();
		this._highMidFilter.dispose();
		this._highFilter.dispose();
		this.lowFrequency.dispose();
		this.highFrequency.dispose();
		this.lowGain.disconnect();
		this.midGain.disconnect();
		this.highGain.disconnect();
		this._lowFilter = null;
		this._lowMidFilter = null;
		this._highMidFilter = null;
		this._highFilter = null;
		this.lowFrequency = null;
		this.highFrequency = null;
		this.lowGain = null;
		this.midGain = null;
		this.highGain = null;
	};

	return Tone.EQ;
});