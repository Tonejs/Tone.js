define(["Tone/core/Tone", "Tone/component/Envelope", "Tone/signal/Scale"], 
	function(Tone){

	"use strict";

	/**
	 *  @class An envelope which can be scaled to any range. 
	 *         Useful for applying an envelope to a filter
	 *
	 *  @extends {Tone.Envelope}
	 *  @constructor
	 *  @param {Tone.Time|Object} [attack=0.01]	the attack time in seconds
	 *  @param {Tone.Time} [decay=0.1]	the decay time in seconds
	 *  @param {number} [sustain=0.5] 	a percentage (0-1) of the full amplitude
	 *  @param {Tone.Time} [release=1]	the release time in seconds
	 */
	Tone.ScaledEnvelope = function(){

		//get all of the defaults
		var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);
		Tone.Envelope.call(this, options);
		options = this.defaultArg(options, Tone.ScaledEnvelope.defaults);

		/** 
		 *  scale the incoming signal by an exponent
		 *  @type {Tone.Pow}
		 *  @private
		 */
		this._exp = this.output = new Tone.Pow(options.exponent);

		/**
		 *  scale the signal to the desired range
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._scale = this.output = new Tone.Scale(options.min, options.max);

		this._sig.chain(this._exp, this._scale);
	};

	Tone.extend(Tone.ScaledEnvelope, Tone.Envelope);

	/**
	 *  the default parameters
	 *  @static
	 */
	Tone.ScaledEnvelope.defaults = {
		"min" : 0,
		"max" : 1,
		"exponent" : 1
	};

	/**
	 *  set the envelope max
	 *  @param {number} max
	 *  @returns {Tone.ScaledEnvelope} `this`
	 */
	Tone.ScaledEnvelope.prototype.setMax = function(max){
		this._scale.setMax(max);
		return this;
	};

	/**
	 *  set the envelope min
	 *  @param {number} min
	 *  @returns {Tone.ScaledEnvelope} `this`
	 */
	Tone.ScaledEnvelope.prototype.setMin = function(min){
		this._scale.setMin(min);
		return this;
	};

	/**
	 *  @returns {number} the envelope's max
	 */
	Tone.ScaledEnvelope.prototype.getMax = function(){
		return this._scale.getMax();
	};

	/**
	 *  @returns {number} the envelope's min
	 */
	Tone.ScaledEnvelope.prototype.getMin = function(){
		return this._scale.getMin();
	};

	/**
	 *  set the exponent which scales the signal
	 *  @param {number} exp
	 *  @returns {Tone.ScaledEnvelope} `this`
	 */
	Tone.ScaledEnvelope.prototype.setExponent = function(exp){
		this._exp.setExponent(exp);
		return this;
	};

	/**
	 *  @returns {number} the exponent which scales the signal
	 */
	Tone.ScaledEnvelope.prototype.getExponent = function(){
		return this._exp.getExponent();
	};

	/**
	 *  clean up
	 *  @returns {Tone.ScaledEnvelope} `this`
	 */
	Tone.ScaledEnvelope.prototype.dispose = function(){
		Tone.Envelope.prototype.dispose.call(this);
		this._scale.dispose();
		this._scale = null;
		this._exp.dispose();
		this._exp = null;
		return this;
	};

	/**
	 * the envelope's min
	 * @memberOf Tone.ScaledEnvelope#
	 * @type {number}
	 * @name min
	 */
	Tone._defineGetterSetter(Tone.ScaledEnvelope, "min");

	/**
	 * the envelope's max
	 * @memberOf Tone.ScaledEnvelope#
	 * @type {number}
	 * @name max
	 */
	Tone._defineGetterSetter(Tone.ScaledEnvelope, "max");

	/**
	 * the envelope's exponent
	 * @memberOf Tone.ScaledEnvelope#
	 * @type {number}
	 * @name exponent
	 */
	Tone._defineGetterSetter(Tone.ScaledEnvelope, "exponent");

	return Tone.ScaledEnvelope;
});