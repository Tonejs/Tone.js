define(["Tone/core/Tone", "Tone/instrument/MonoSynth", "Tone/component/LFO", "Tone/signal/Signal", "Tone/signal/Multiply", "Tone/instrument/Monophonic"], 
function(Tone){

	"use strict";

	/**
	 *  @class  the DuoSynth is a monophonic synth composed of two 
	 *          MonoSynths run in parallel with control over the 
	 *          frequency ratio between the two voices and vibrato effect.
	 *
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} options the options available for the synth 
	 *                          see defaults below
	 *  @example
	 *  var duoSynth = new Tone.DuoSynth();
	 */
	Tone.DuoSynth = function(options){

		options = this.defaultArg(options, Tone.DuoSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  the first voice
		 *  @type {Tone.MonoSynth}
		 */
		this.voice0 = new Tone.MonoSynth(options.voice0);
		this.voice0.volume.value = -10;

		/**
		 *  the second voice
		 *  @type {Tone.MonoSynth}
		 */
		this.voice1 = new Tone.MonoSynth(options.voice1);
		this.voice1.volume.value = -10;

		/**
		 *  The vibrato LFO. 
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._vibrato = new Tone.LFO(options.vibratoRate, -50, 50);
		this._vibrato.start();

		/**
		 * the vibrato frequency
		 * @type {Tone.Signal}
		 */
		this.vibratoRate = this._vibrato.frequency;

		/**
		 *  the vibrato gain
		 *  @type {GainNode}
		 *  @private
		 */
		this._vibratoGain = this.context.createGain();

		/**
		 * The amount of vibrato
		 * @type {Tone.Signal}
		 */
		this.vibratoAmount = new Tone.Signal(this._vibratoGain.gain, Tone.Signal.Units.Gain);
		this.vibratoAmount.value = options.vibratoAmount;

		/**
		 *  the delay before the vibrato starts
		 *  @type {number}
		 *  @private
		 */
		this._vibratoDelay = this.toSeconds(options.vibratoDelay);

		/**
		 *  the frequency control
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(440, Tone.Signal.Units.Frequency);

		/**
		 *  the ratio between the two voices
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._harmonicity = new Tone.Multiply(options.harmonicity);

		//control the two voices frequency
		this.frequency.connect(this.voice0.frequency);
		this.frequency.chain(this._harmonicity, this.voice1.frequency);
		this._vibrato.connect(this._vibratoGain);
		this._vibratoGain.fan(this.voice0.detune, this.voice1.detune);
		this.voice0.connect(this.output);
		this.voice1.connect(this.output);
	};

	Tone.extend(Tone.DuoSynth, Tone.Monophonic);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.DuoSynth.defaults = {
		"vibratoAmount" : 0.5,
		"vibratoRate" : 5,
		"vibratoDelay" : 1,
		"harmonicity" : 1.5,
		"voice0" : {
			"volume" : -10,
			"portamento" : 0,
			"oscillator" : {
				"type" : "sine"
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			}
		},
		"voice1" : {
			"volume" : -10,
			"portamento" : 0,
			"oscillator" : {
				"type" : "sine"
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			}
		}
	};

	/**
	 *  start the attack portion of the envelopes
	 *  
	 *  @param {Tone.Time} [time=now] the time the attack should start
	 *  @param {number} [velocity=1] the velocity of the note (0-1)
	 *  @returns {Tone.DuoSynth} `this`
	 */
	Tone.DuoSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
		time = this.toSeconds(time);
		this.voice0.envelope.triggerAttack(time, velocity);
		this.voice1.envelope.triggerAttack(time, velocity);
		this.voice0.filterEnvelope.triggerAttack(time);
		this.voice1.filterEnvelope.triggerAttack(time);
		return this;
	};

	/**
	 *  start the release portion of the envelopes
	 *  
	 *  @param {Tone.Time} [time=now] the time the release should start
	 *  @returns {Tone.DuoSynth} `this`
	 */
	Tone.DuoSynth.prototype.triggerEnvelopeRelease = function(time){
		this.voice0.triggerRelease(time);
		this.voice1.triggerRelease(time);
		return this;
	};

	/**
	 * The ratio between the two carrier and the modulator. 
	 * @memberOf Tone.DuoSynth#
	 * @type {number}
	 * @name harmonicity
	 */
	Object.defineProperty(Tone.DuoSynth.prototype, "harmonicity", {
		get : function(){
			return this._harmonicity.value;
		},
		set : function(harm){
			this._harmonicity.value = harm;
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.DuoSynth} `this`
	 */
	Tone.DuoSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this.voice0.dispose();
		this.voice0 = null;
		this.voice1.dispose();
		this.voice1 = null;
		this.frequency.dispose();
		this.frequency = null;
		this._vibrato.dispose();
		this._vibrato = null;
		this._vibratoGain.disconnect();
		this._vibratoGain = null;
		this._harmonicity.dispose();
		this._harmonicity = null;
		this.vibratoAmount.dispose();
		this.vibratoAmount = null;
		this.vibratoRate = null;
		return this;
	};

	return Tone.DuoSynth;
});