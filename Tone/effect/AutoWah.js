define(["../core/Tone", "../component/Follower", "../signal/ScaleExp",
	"../effect/Effect", "../component/Filter"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.AutoWah connects a Tone.Follower to a bandpass filter (Tone.Filter).
	 *          The frequency of the filter is adjusted proportionally to the
	 *          incoming signal's amplitude. Inspiration from [Tuna.js](https://github.com/Dinahmoe/tuna).
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {Frequency|Object} [baseFrequency] The frequency the filter is set
	 *                                            to at the low point of the wah
	 *  @param {Positive} [octaves] The number of octaves above the baseFrequency
	 *                                the filter will sweep to when fully open
	 *  @param {Decibels} [sensitivity] The decibel threshold sensitivity for
	 *                                   the incoming signal. Normal range of -40 to 0.
	 *  @example
	 * var autoWah = new Tone.AutoWah(50, 6, -30).toMaster();
	 * //initialize the synth and connect to autowah
	 * var synth = new Synth.connect(autoWah);
	 * //Q value influences the effect of the wah - default is 2
	 * autoWah.Q.value = 6;
	 * //more audible on higher notes
	 * synth.triggerAttackRelease("C4", "8n")
	 */
	Tone.AutoWah = function(){

		var options = Tone.defaults(arguments, ["baseFrequency", "octaves", "sensitivity"], Tone.AutoWah);
		Tone.Effect.call(this, options);

		/**
		 *  The envelope follower. Set the attack/release
		 *  timing to adjust how the envelope is followed.
		 *  @type {Tone.Follower}
		 *  @private
		 */
		this.follower = new Tone.Follower(options.follower);

		/**
		 *  scales the follower value to the frequency domain
		 *  @type {Tone}
		 *  @private
		 */
		this._sweepRange = new Tone.ScaleExp(0, 1, 0.5);

		/**
		 *  @type {number}
		 *  @private
		 */
		this._baseFrequency = options.baseFrequency;

		/**
		 *  @type {number}
		 *  @private
		 */
		this._octaves = options.octaves;

		/**
		 *  the input gain to adjust the sensitivity
		 *  @type {Tone.Gain}
		 *  @private
		 */
		this._inputBoost = new Tone.Gain();

		/**
		 *  @type {BiquadFilterNode}
		 *  @private
		 */
		this._bandpass = new Tone.Filter({
			"rolloff" : -48,
			"frequency" : 0,
			"Q" : options.Q,
		});

		/**
		 *  @type {Tone.Filter}
		 *  @private
		 */
		this._peaking = new Tone.Filter(0, "peaking");
		this._peaking.gain.value = options.gain;

		/**
		 * The gain of the filter.
		 * @type {Number}
		 * @signal
		 */
		this.gain = this._peaking.gain;

		/**
		 * The quality of the filter.
		 * @type {Positive}
		 * @signal
		 */
		this.Q = this._bandpass.Q;

		//the control signal path
		this.effectSend.chain(this._inputBoost, this.follower, this._sweepRange);
		this._sweepRange.connect(this._bandpass.frequency);
		this._sweepRange.connect(this._peaking.frequency);
		//the filtered path
		this.effectSend.chain(this._bandpass, this._peaking, this.effectReturn);
		//set the initial value
		this._setSweepRange();
		this.sensitivity = options.sensitivity;

		this._readOnly(["gain", "Q"]);
	};

	Tone.extend(Tone.AutoWah, Tone.Effect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.AutoWah.defaults = {
		"baseFrequency" : 100,
		"octaves" : 6,
		"sensitivity" : 0,
		"Q" : 2,
		"gain" : 2,
		"follower" : {
			"attack" : 0.3,
			"release" : 0.5
		}
	};

	/**
	 * The number of octaves that the filter will sweep above the
	 * baseFrequency.
	 * @memberOf Tone.AutoWah#
	 * @type {Number}
	 * @name octaves
	 */
	Object.defineProperty(Tone.AutoWah.prototype, "octaves", {
		get : function(){
			return this._octaves;
		},
		set : function(octaves){
			this._octaves = octaves;
			this._setSweepRange();
		}
	});

	/**
	 * The base frequency from which the sweep will start from.
	 * @memberOf Tone.AutoWah#
	 * @type {Frequency}
	 * @name baseFrequency
	 */
	Object.defineProperty(Tone.AutoWah.prototype, "baseFrequency", {
		get : function(){
			return this._baseFrequency;
		},
		set : function(baseFreq){
			this._baseFrequency = baseFreq;
			this._setSweepRange();
		}
	});

	/**
	 * The sensitivity to control how responsive to the input signal the filter is.
	 * @memberOf Tone.AutoWah#
	 * @type {Decibels}
	 * @name sensitivity
	 */
	Object.defineProperty(Tone.AutoWah.prototype, "sensitivity", {
		get : function(){
			return Tone.gainToDb(1 / this._inputBoost.gain.value);
		},
		set : function(sensitivy){
			this._inputBoost.gain.value = 1 / Tone.dbToGain(sensitivy);
		}
	});

	/**
	 *  sets the sweep range of the scaler
	 *  @private
	 */
	Tone.AutoWah.prototype._setSweepRange = function(){
		this._sweepRange.min = this._baseFrequency;
		this._sweepRange.max = Math.min(this._baseFrequency * Math.pow(2, this._octaves), this.context.sampleRate / 2);
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.AutoWah} this
	 */
	Tone.AutoWah.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this.follower.dispose();
		this.follower = null;
		this._sweepRange.dispose();
		this._sweepRange = null;
		this._bandpass.dispose();
		this._bandpass = null;
		this._peaking.dispose();
		this._peaking = null;
		this._inputBoost.dispose();
		this._inputBoost = null;
		this._writable(["gain", "Q"]);
		this.gain = null;
		this.Q = null;
		return this;
	};

	return Tone.AutoWah;
});
