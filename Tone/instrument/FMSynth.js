define(["Tone/core/Tone", "Tone/instrument/MonoSynth", "Tone/signal/Signal", "Tone/signal/Multiply", "Tone/instrument/Monophonic"], 
function(Tone){

	"use strict";

	/**
	 *  @class  the FMSynth is composed of two MonoSynths where one MonoSynth is the 
	 *          carrier and the second is the modulator.
	 *
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} options the options available for the synth 
	 *                          see defaults below
	 *  @example
	 *  var fmSynth = new Tone.FMSynth();
	 */
	Tone.FMSynth = function(options){

		options = this.defaultArg(options, Tone.FMSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  the first voice
		 *  @type {Tone.MonoSynth}
		 */
		this.carrier = new Tone.MonoSynth(options.carrier);
		this.carrier.volume.value = -10;

		/**
		 *  the second voice
		 *  @type {Tone.MonoSynth}
		 */
		this.modulator = new Tone.MonoSynth(options.modulator);
		this.modulator.volume.value = -10;

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

		/**
		 *  
		 *
		 *	@type {Tone.Multiply}
		 *	@private
		 */
		this._modulationIndex = new Tone.Multiply(options.modulationIndex);

		/**
		 *  the node where the modulation happens
		 *  @type {GainNode}
		 *  @private
		 */
		this._modulationNode = this.context.createGain();

		//control the two voices frequency
		this.frequency.connect(this.carrier.frequency);
		this.frequency.chain(this._harmonicity, this.modulator.frequency);
		this.frequency.chain(this._modulationIndex, this._modulationNode);
		this.modulator.connect(this._modulationNode.gain);
		this._modulationNode.gain.value = 0;
		this._modulationNode.connect(this.carrier.frequency);
		this.carrier.connect(this.output);
	};

	Tone.extend(Tone.FMSynth, Tone.Monophonic);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.FMSynth.defaults = {
		"harmonicity" : 3,
		"modulationIndex" : 10,
		"carrier" : {
			"volume" : -10,
			"portamento" : 0,
			"oscillator" : {
				"type" : "sine"
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5,
				"min" : 20000,
				"max" : 20000
			}
		},
		"modulator" : {
			"volume" : -10,
			"portamento" : 0,
			"oscillator" : {
				"type" : "triangle"
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5,
				"min" : 20000,
				"max" : 20000
			}
		}
	};

	/**
	 *  trigger the attack portion of the note
	 *  
	 *  @param  {Tone.Time} [time=now] the time the note will occur
	 *  @param {number} [velocity=1] the velocity of the note
	 *  @returns {Tone.FMSynth} `this`
	 */
	Tone.FMSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
		//the port glide
		time = this.toSeconds(time);
		//the envelopes
		this.carrier.envelope.triggerAttack(time, velocity);
		this.modulator.envelope.triggerAttack(time);
		this.carrier.filterEnvelope.triggerAttack(time);
		this.modulator.filterEnvelope.triggerAttack(time);
		return this;
	};

	/**
	 *  trigger the release portion of the note
	 *  
	 *  @param  {Tone.Time} [time=now] the time the note will release
	 *  @returns {Tone.FMSynth} `this`
	 */
	Tone.FMSynth.prototype.triggerEnvelopeRelease = function(time){
		this.carrier.triggerRelease(time);
		this.modulator.triggerRelease(time);
		return this;
	};

	/**
	 * The ratio between the two carrier and the modulator. 
	 * @memberOf Tone.FMSynth#
	 * @type {number}
	 * @name harmonicity
	 */
	Object.defineProperty(Tone.FMSynth.prototype, "harmonicity", {
		get : function(){
			return this._harmonicity.value;
		},
		set : function(harm){
			this._harmonicity.value = harm;
		}
	});

	/**
	 * The modulation index which is in essence the depth or amount of the modulation. In other terms it is the 
	 *  ratio of the frequency of the modulating signal (mf) to the amplitude of the 
	 *  modulating signal (ma) -- as in ma/mf. 
	 * @memberOf Tone.FMSynth#
	 * @type {number}
	 * @name modulationIndex
	 */
	Object.defineProperty(Tone.FMSynth.prototype, "modulationIndex", {
		get : function(){
			return this._modulationIndex.value;
		},
		set : function(mod){
			this._modulationIndex.value = mod;
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.FMSynth} `this`
	 */
	Tone.FMSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this.carrier.dispose();
		this.carrier = null;
		this.modulator.dispose();
		this.modulator = null;
		this.frequency.dispose();
		this.frequency = null;
		this._modulationIndex.dispose();
		this._modulationIndex = null;
		this._harmonicity.dispose();
		this._harmonicity = null;
		this._modulationNode.disconnect();
		this._modulationNode = null;
		return this;
	};

	return Tone.FMSynth;
});