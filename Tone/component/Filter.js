define(["Tone/core/Tone"], function(Tone){

	/**
	 *  @class  paper thin wrapper around native filter. 
	 *          exposes all the same audio params, but
	 *          adds ability to be set through a JSON 
	 *          description. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number|Object=} freq the frequency
	 *  @param {string} type the type of filter
	 */
	Tone.Filter = function(freq, type){

		/**
		 *  the filter
		 *  @type {BiquadFilterNode}
		 *  @private
		 */
		this._filter = this.context.createBiquadFilter();

		/**
		 *  the input and the output are just aliases
		 *  for the filter
		 *  @type {BiquadFilterNode}
		 */
		this.input = this.output = this._filter;

		/**
		 *  exposes the filter's frequency param
		 *  @type {AudioParam}
		 */
		this.frequency = this._filter.frequency;

		/**
		 *  exposes the filter's gain param
		 *  @type {AudioParam}
		 */
		this.gain = this._filter.gain;

		/**
		 *  exposes the filter's Q param
		 *  @type {AudioParam}
		 */
		this.Q = this._filter.Q;

		/**
		 *  exposes the filter's detune param
		 *  @type {AudioParam}
		 */
		this.detune = this._filter.detune;

		//set the defaults
		var options;
		if (arguments.length === 1 && typeof freq === "object"){
			options = freq;
		} else {
			options = {
				"frequency" : freq,
				"type" : type,
			};
		}
		options = this.defaultArg(options, this._defaults);
		this.frequency.value = options.frequency;
		this._filter.type = options.type;
		this.detune.value = options.detune;
		this.gain.value = options.gain;
		this.Q.value = options.Q;
	};

	Tone.extend(Tone.Filter);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @private
	 */
	Tone.Filter.prototype._defaults = {
		"type" : "lowpass",
		"frequency" : 350,
		"Q" : 1,
		"gain" : 0,
		"detune" : 0
	};

	/**
	 *  set the parameters at once
	 *  @param {Object} params
	 */
	Tone.Filter.prototype.set = function(params){
		if (!this.isUndef(params.type)) this.setType(params.type);
		if (!this.isUndef(params.frequency)) this.frequency.value = params.frequency;
		if (!this.isUndef(params.Q)) this.Q.value = params.Q;
		if (!this.isUndef(params.gain)) this.gain.value = params.gain;
		if (!this.isUndef(params.detune)) this.detune.value = params.detune;
	};

	/**
	 *  set the type
	 *  @param {string} type the filter type
	 */
	Tone.Filter.prototype.setType = function(type){
		this._filter.type = type;
	};

	/**
	 *  get the type
	 *  @return {string} the type of the filter
	 */
	Tone.Filter.prototype.getType = function(){
		return this._filter.type;
	};

	/**
	 *  clean up
	 */
	Tone.Filter.prototype.dispose = function(){
		this._filter.disconnect();
		this._filter = null;
		this.frequency = null;
		this.Q = null;
		this.detune = null;
		this.gain = null;
	};

	return Tone.Filter;
});