define(["Tone/core/Tone", "Tone/component/ScaledEnvelope", "Tone/component/Envelope"], 
	function(Tone){

	"use strict";

	/**
	 *  @class Tone.FrequencyEnvelope is a Tone.ScaledEnvelope, but instead of `min` and `max`
	 *         it's got a `baseFrequency` and `octaves` parameter. Also the exponent is 
	 *         hard-coded at 2. 
	 *
	 *  @extends {Tone.Envelope}
	 *  @constructor
	 *  @param {Time|Object} [attack]	the attack time in seconds
	 *  @param {Time} [decay]	the decay time in seconds
	 *  @param {number} [sustain] 	a percentage (0-1) of the full amplitude
	 *  @param {Time} [release]	the release time in seconds
	 *  @example
	 *  var env = new Tone.FrequencyEnvelope({
	 *  	"attack" : 0.2,
	 *  	"baseFrequency" : "C2",
	 *  	"octaves" : 4
	 *  });
	 *  scaledEnv.connect(oscillator.frequency);
	 */
	Tone.FrequencyEnvelope = function(){

		var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);
		options.exponent = 2;
		Tone.ScaledEnvelope.call(this, options);
		options = this.defaultArg(options, Tone.FrequencyEnvelope.defaults);

		/**
		 *  Stores the octave value
		 *  @type {Positive}
		 *  @private
		 */
		this._octaves = options.octaves;

		//setup
		this.baseFrequency = options.baseFrequency;
		this.octaves = options.octaves;
	};

	Tone.extend(Tone.FrequencyEnvelope, Tone.Envelope);

	/**
	 *  the default parameters
	 *  @static
	 */
	Tone.FrequencyEnvelope.defaults = {
		"baseFrequency" : 200,
		"octaves" : 4,
	};

	/**
	 * The envelope's mininum output value. This is the value which it
	 * starts at. 
	 * @memberOf Tone.FrequencyEnvelope#
	 * @type {Frequencye}
	 * @name baseFrequency
	 */
	Object.defineProperty(Tone.FrequencyEnvelope.prototype, "baseFrequency", {
		get : function(){
			return this._scale.min;
		},
		set : function(min){
			this._scale.min = this.toFrequency(min);
		}
	});

	/**
	 * The number of octaves above the baseFrequency that the
	 * envelope will scale to.
	 * @memberOf Tone.FrequencyEnvelope#
	 * @type {Positive}
	 * @name octaves
	 */
	Object.defineProperty(Tone.FrequencyEnvelope.prototype, "octaves", {
		get : function(){
			return this._octaves;
		},
		set : function(octaves){
			this._octaves = octaves;
			this._scale.max = this.baseFrequency * Math.pow(2, octaves);
		}
	});
	
	/**
	 *  clean up
	 *  @returns {Tone.FrequencyEnvelope} this
	 */
	Tone.FrequencyEnvelope.prototype.dispose = function(){
		Tone.ScaledEnvelope.prototype.dispose.call(this);
		return this;
	};

	return Tone.FrequencyEnvelope;
});