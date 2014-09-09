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
	 */
	Tone.DuoSynth = function(options){

		options = this.defaultArg(options, Tone.DuoSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  the first voice
		 *  @type {Tone.MonoSynth}
		 */
		this.voice0 = new Tone.MonoSynth(options.voice0);
		this.voice0.setVolume(-10);

		/**
		 *  the second voice
		 *  @type {Tone.MonoSynth}
		 */
		this.voice1 = new Tone.MonoSynth(options.voice1);
		this.voice1.setVolume(-10);

		/**
		 *  the vibrato lfo
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._vibrato = new Tone.LFO(options.vibratoRate, -50, 50);
		this._vibrato.start();

		/**
		 *  the vibrato gain
		 *  @type {GainNode}
		 *  @private
		 */
		this._vibratoGain = this.context.createGain();
		this._vibratoGain.gain.value = options.vibratoAmount;

		/**
		 *  the delay before the vibrato starts
		 *  @type {number}
		 *  @private
		 */
		this._vibratoDelay = this.toSeconds(options.vibratoDelay);

		/**
		 *  the amount before the vibrato starts
		 *  @type {number}
		 *  @private
		 */
		this._vibratoAmount = options.vibratoAmount;

		/**
		 *  the frequency control
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(440);

		/**
		 *  the ratio between the two voices
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._harmonicity = new Tone.Multiply(options.harmonicity);

		//control the two voices frequency
		this.frequency.connect(this.voice0.frequency);
		this.chain(this.frequency, this._harmonicity, this.voice1.frequency);
		this._vibrato.connect(this._vibratoGain);
		this.fan(this._vibratoGain, this.voice0.detune, this.voice1.detune);
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
			"oscType" : "sine",
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
			"oscType" : "sine",
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
	 *  @param {Tone.Time=} [time=now] the time the attack should start
	 *  @param {number=} velocity the velocity of the note (0-1)
	 */
	Tone.DuoSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
		time = this.toSeconds(time);
		this.voice0.envelope.triggerAttack(time, velocity);
		this.voice1.envelope.triggerAttack(time, velocity);
		this.voice0.filterEnvelope.triggerAttack(time);
		this.voice1.filterEnvelope.triggerAttack(time);
	};

	/**
	 *  start the release portion of the envelopes
	 *  
	 *  @param {Tone.Time=} [time=now] the time the release should start
	 */
	Tone.DuoSynth.prototype.triggerEnvelopeRelease = function(time){
		this.voice0.triggerRelease(time);
		this.voice1.triggerRelease(time);
	};

	/**
	 *  set the ratio between the two oscillator
	 *  @param {number} ratio
	 */
	Tone.DuoSynth.prototype.setHarmonicity = function(ratio){
		this._harmonicity.setValue(ratio);
	};

	/**
	 *  the glide time between frequencies
	 *  @param {Tone.Time} port
	 */
	Tone.DuoSynth.prototype.setPortamento = function(port){
		this.portamento = this.toSeconds(port);
	};

	/**
	 *  the delay before the vibrato kicks in
	 *  @param {Tone.Time} delay
	 */
	Tone.DuoSynth.prototype.setVibratoDelay = function(delay){
		this._vibratoDelay = this.toSeconds(delay);
	};

	/**
	 *  the vibrato amount. 1 is full vib. 0 is none.
	 *  @param {number} amount an amount between 0-1
	 */
	Tone.DuoSynth.prototype.setVibratoAmount = function(amount){
		this._vibratoAmount = amount;
		this._vibratoGain.gain.setValueAtTime(amount, this.now());
	};

	/**
	 *  the rate of the vibrato
	 *  @param {number} rate
	 */
	Tone.DuoSynth.prototype.setVibratoRate = function(rate){
		this._vibrato.setFrequency(rate);
	};

	/**
	 *  set the volume of the instrument.
	 *  borrowed from {@link Tone.Source}
	 *  @function
	 */
	Tone.DuoSynth.prototype.setVolume = Tone.Source.prototype.setVolume;

	/**
	 *  bulk setter
	 *  @param {Object} param 
	 */
	Tone.DuoSynth.prototype.set = function(params){
		if (!this.isUndef(params.harmonicity)) this.setHarmonicity(params.harmonicity);
		if (!this.isUndef(params.vibratoRate)) this.setVibratoRate(params.vibratoRate);
		if (!this.isUndef(params.vibratoAmount)) this.setVibratoAmount(params.vibratoAmount);
		if (!this.isUndef(params.vibratoDelay)) this.setVibratoDelay(params.vibratoDelay);
		if (!this.isUndef(params.voice0)) this.voice0.set(params.voice0);
		if (!this.isUndef(params.voice1)) this.voice1.set(params.voice1);
		Tone.Monophonic.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.DuoSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this.voice0.dispose();
		this.voice1.dispose();
		this.frequency.dispose();
		this._vibrato.dispose();
		this._vibratoGain.disconnect();
		this._harmonicity.dispose();
		this.voice0 = null;
		this.voice1 = null;
		this.frequency = null;
		this._vibrato = null;
		this._vibratoGain = null;
		this._harmonicity = null;
	};

	return Tone.DuoSynth;
});