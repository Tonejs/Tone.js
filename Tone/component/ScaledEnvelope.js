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
		 *  scale the signal to the desired range
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._scale = this.output = new Tone.Scale(options.min, options.max);

		this._sig.connect(this._scale);
	};

	Tone.extend(Tone.ScaledEnvelope, Tone.Envelope);

	/**
	 *  the default parameters
	 *  @static
	 */
	Tone.ScaledEnvelope.defaults = {
		"min" : 0,
		"max" : 1,
	};

	/**
	 *  set all of the parameters in bulk
	 *  @param {Object} param the name of member as the key
	 *                        and the value as the value 
	 */
	Tone.ScaledEnvelope.prototype.set = function(params){
		if (!this.isUndef(params.min)) this.setMin(params.min);
		if (!this.isUndef(params.max)) this.setMax(params.max);
		Tone.Envelope.prototype.set.call(this, params);
	};

	/**
	 *  set the envelope max
	 *  @param {number} max
	 */
	Tone.ScaledEnvelope.prototype.setMax = function(max){
		this._scale.setMax(max);
	};

	/**
	 *  set the envelope min
	 *  @param {number} min
	 */
	Tone.ScaledEnvelope.prototype.setMin = function(min){
		this._scale.setMin(min);
	};

	/**
	 *  clean up
	 */
	Tone.ScaledEnvelope.prototype.dispose = function(){
		Tone.Envelope.prototype.dispose.call(this);
		this._scale.dispose();
		this._scale = null;
	};

	return Tone.ScaledEnvelope;
});