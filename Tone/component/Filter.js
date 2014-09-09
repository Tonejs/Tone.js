define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class  Filter object which allows for all of the same native methods
	 *          as the BiquadFilter (with AudioParams implemented as Tone.Signals)
	 *          but adds the ability to set the filter rolloff at -12 (default), 
	 *          -24 and -48. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number|Object=} freq the frequency
	 *  @param {string=} type the type of filter
	 *  @param {number=} [rolloff=-12] the rolloff which is the drop per octave. 
	 *                                 3 choices: -12, -24, and -48
	 */
	Tone.Filter = function(){
		Tone.call(this);

		var options = this.optionsObject(arguments, ["frequency", "type", "rolloff"], Tone.Filter.defaults);

		/**
		 *  the filter(s)
		 *  @type {Array.<BiquadFilterNode>}
		 *  @private
		 */
		this._filters = [];

		/**
		 *  the frequency of the filter
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(options.frequency);

		/**
		 *  the detune parameter
		 *  @type {Tone.Signal}
		 */
		this.detune = new Tone.Signal(0);

		/**
		 *  the gain of the filter, only used in certain filter types
		 *  @type {AudioParam}
		 */
		this.gain = new Tone.Signal(options.gain);

		/**
		 *  the Q or Quality of the filter
		 *  @type {Tone.Signal}
		 */
		this.Q = new Tone.Signal(options.Q);

		/**
		 *  the type of the filter
		 *  @type {string}
		 *  @private
		 */
		this._type = options.type;

		//set the rolloff and make the connections
		this.setRolloff(options.rolloff);
	};

	Tone.extend(Tone.Filter);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @type {Object}
	 */
	Tone.Filter.defaults = {
		"type" : "lowpass",
		"frequency" : 350,
		"rolloff" : -12,
		"Q" : 1,
		"gain" : 0,
	};

	/**
	 *  set the parameters at once
	 *  @param {Object} params
	 */
	Tone.Filter.prototype.set = function(params){
		if (!this.isUndef(params.type)) this.setType(params.type);
		if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
		if (!this.isUndef(params.frequency)) this.frequency.setValue(params.frequency);
		if (!this.isUndef(params.Q)) this.Q.setValue(params.Q);
		if (!this.isUndef(params.gain)) this.gain.setValue(params.gain);
		if (!this.isUndef(params.rolloff)) this.setRolloff(params.rolloff);
	};

	/**
	 *  set the type
	 *  @param {string} type the filter type
	 */
	Tone.Filter.prototype.setType = function(type){
		this._type = type;
		for (var i = 0; i < this._filters.length; i++){
			this._filters[i].type = type;
		}
	};

	/**
	 *  get the type
	 *  @return {string} the type of the filter
	 */
	Tone.Filter.prototype.getType = function(){
		return this._type;
	};

	/**
	 *  set the frequency
	 *  @param {number} freq the frequency value
	 */
	Tone.Filter.prototype.setFrequency = function(freq){
		this.frequency.setValue(freq);
	};

	/**
	 *  set the quality of the filter
	 *  @param {number} Q the filter's Q
	 */
	Tone.Filter.prototype.setQ = function(Q){
		this.Q.setValue(Q);
	};

	/**
	 *  set the rolloff frequency which is the drop in db
	 *  per octave. implemented internally by cascading filters
	 *  
	 *  @param {number} rolloff the slope of the rolloff. only accepts
	 *                          -12, -24, and -48. 
	 */
	Tone.Filter.prototype.setRolloff = function(rolloff){
		var cascadingCount = Math.log(rolloff / -12) / Math.LN2 + 1;
		//check the rolloff is valid
		if (cascadingCount % 1 !== 0){
			throw new RangeError("Filter rolloff can only be -12, -24, or -48");
		}
		//first disconnect the filters and throw them away
		this.input.disconnect();
		for (var i = 0; i < this._filters.length; i++) {
			this._filters[i].disconnect();
			this._filters[i] = null;
		}
		this._filters = new Array(cascadingCount);
		for (var count = 0; count < cascadingCount; count++){
			var filter = this.context.createBiquadFilter();
			filter.type = this._type;
			this.frequency.connect(filter.frequency);
			this.detune.connect(filter.detune);
			this.Q.connect(filter.Q);
			this.gain.connect(filter.gain);
			this._filters[count] = filter;
		}
		//connect them up
		var connectionChain = [this.input].concat(this._filters).concat([this.output]);
		this.chain.apply(this, connectionChain);
	};

	/**
	 *  clean up
	 */
	Tone.Filter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		for (var i = 0; i < this._filters.length; i++) {
			this._filters[i].disconnect();
			this._filters[i] = null;
		}
		this.frequency.dispose();
		this.Q.dispose();
		this.detune.dispose();
		this.gain.dispose();
		this._filters = null;
		this.frequency = null;
		this.Q = null;
		this.gain = null;
		this.detune = null;
	};

	return Tone.Filter;
});