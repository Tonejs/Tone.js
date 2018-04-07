define(["Tone/core/Tone", "Tone/component/Envelope", "Tone/signal/Scale"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.ScaledEnvelop is an envelope which can be scaled
	 *         to any range. It's useful for applying an envelope
	 *         to a frequency or any other non-NormalRange signal
	 *         parameter.
	 *
	 *  @extends {Tone.Envelope}
	 *  @constructor
	 *  @param {Time|Object} [attack]	the attack time in seconds
	 *  @param {Time} [decay]	the decay time in seconds
	 *  @param {number} [sustain] 	a percentage (0-1) of the full amplitude
	 *  @param {Time} [release]	the release time in seconds
	 *  @example
	 *  var scaledEnv = new Tone.ScaledEnvelope({
	 *  	"attack" : 0.2,
	 *  	"min" : 200,
	 *  	"max" : 2000
	 *  });
	 *  scaledEnv.connect(oscillator.frequency);
	 */
	Tone.ScaledEnvelope = function(){

		//get all of the defaults
		var options = Tone.defaults(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope);
		Tone.Envelope.call(this, options);
		options = Tone.defaultArg(options, Tone.ScaledEnvelope.defaults);

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
	 * The envelope's min output value. This is the value which it
	 * starts at.
	 * @memberOf Tone.ScaledEnvelope#
	 * @type {number}
	 * @name min
	 */
	Object.defineProperty(Tone.ScaledEnvelope.prototype, "min", {
		get : function(){
			return this._scale.min;
		},
		set : function(min){
			this._scale.min = min;
		}
	});

	/**
	 * The envelope's max output value. In other words, the value
	 * at the peak of the attack portion of the envelope.
	 * @memberOf Tone.ScaledEnvelope#
	 * @type {number}
	 * @name max
	 */
	Object.defineProperty(Tone.ScaledEnvelope.prototype, "max", {
		get : function(){
			return this._scale.max;
		},
		set : function(max){
			this._scale.max = max;
		}
	});

	/**
	 * The envelope's exponent value.
	 * @memberOf Tone.ScaledEnvelope#
	 * @type {number}
	 * @name exponent
	 */
	Object.defineProperty(Tone.ScaledEnvelope.prototype, "exponent", {
		get : function(){
			return this._exp.value;
		},
		set : function(exp){
			this._exp.value = exp;
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.ScaledEnvelope} this
	 */
	Tone.ScaledEnvelope.prototype.dispose = function(){
		Tone.Envelope.prototype.dispose.call(this);
		this._scale.dispose();
		this._scale = null;
		this._exp.dispose();
		this._exp = null;
		return this;
	};

	return Tone.ScaledEnvelope;
});
