define(["Tone/core/Tone", "Tone/instrument/Synth", "Tone/signal/Signal", "Tone/signal/Multiply", "Tone/instrument/Monophonic"], 
function(Tone){

	"use strict";

	/**
	 *  @class  FMSynth is composed of two Tone.Synths where one Tone.Synth modulates
	 *          the frequency of a second Tone.Synth. A lot of spectral content 
	 *          can be explored using the modulationIndex parameter. Read more about
	 *          frequency modulation synthesis on [SoundOnSound](http://www.soundonsound.com/sos/apr00/articles/synthsecrets.htm).
	 *          <img src="https://docs.google.com/drawings/d/1h0PUDZXPgi4Ikx6bVT6oncrYPLluFKy7lj53puxj-DM/pub?w=902&h=462">
	 *
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} [options] the options available for the synth 
	 *                          see defaults below
	 *  @example
	 * var fmSynth = new Tone.FMSynth().toMaster();
	 * fmSynth.triggerAttackRelease("C5", "4n");
	 */
	Tone.FMSynth = function(options){

		options = this.defaultArg(options, Tone.FMSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  The carrier voice.
		 *  @type {Tone.Synth}
		 *  @private
		 */
		this._carrier = new Tone.Synth(options.carrier);
		this._carrier.volume.value = -10;


		/**
		 *  The carrier's oscillator
		 *  @type {Tone.Oscillator}
		 */
		this.oscillator = this._carrier.oscillator;

		/**
		 *  The carrier's envelope
		 *  @type {Tone.Oscillator}
		 */
		this.envelope = this._carrier.envelope.set(options.envelope);

		/**
		 *  The modulator voice.
		 *  @type {Tone.Synth}
		 *  @private
		 */
		this._modulator = new Tone.Synth(options.modulator);
		this._modulator.volume.value = -10;


		/**
		 *  The modulator's oscillator which is applied
		 *  to the amplitude of the oscillator
		 *  @type {Tone.Oscillator}
		 */
		this.modulation = this._modulator.oscillator.set(options.modulation);

		/**
		 *  The modulator's envelope
		 *  @type {Tone.Oscillator}
		 */
		this.modulationEnvelope = this._modulator.envelope.set(options.modulationEnvelope);

		/**
		 *  The frequency control.
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = new Tone.Signal(440, Tone.Type.Frequency);

		/**
		 *  The detune in cents
		 *  @type {Cents}
		 *  @signal
		 */
		this.detune = new Tone.Signal(options.detune, Tone.Type.Cents);

		/**
		 *  Harmonicity is the ratio between the two voices. A harmonicity of
		 *  1 is no change. Harmonicity = 2 means a change of an octave. 
		 *  @type {Positive}
		 *  @signal
		 *  @example
		 * //pitch voice1 an octave below voice0
		 * synth.harmonicity.value = 0.5;
		 */
		this.harmonicity = new Tone.Multiply(options.harmonicity);
		this.harmonicity.units = Tone.Type.Positive;

		/**
		 *  The modulation index which essentially the depth or amount of the modulation. It is the 
		 *  ratio of the frequency of the modulating signal (mf) to the amplitude of the 
		 *  modulating signal (ma) -- as in ma/mf. 
		 *	@type {Positive}
		 *	@signal
		 */
		this.modulationIndex = new Tone.Multiply(options.modulationIndex);
		this.modulationIndex.units = Tone.Type.Positive;

		/**
		 *  the node where the modulation happens
		 *  @type {GainNode}
		 *  @private
		 */
		this._modulationNode = new Tone.Gain(0);

		//control the two voices frequency
		this.frequency.connect(this._carrier.frequency);
		this.frequency.chain(this.harmonicity, this._modulator.frequency);
		this.frequency.chain(this.modulationIndex, this._modulationNode);
		this.detune.fan(this._carrier.detune, this._modulator.detune);
		this._modulator.connect(this._modulationNode.gain);
		this._modulationNode.connect(this._carrier.frequency);
		this._carrier.connect(this.output);
		this._readOnly(["frequency", "harmonicity", "modulationIndex", "oscillator", "envelope", "modulation", "modulationEnvelope", "detune"]);
	};

	Tone.extend(Tone.FMSynth, Tone.Monophonic);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.FMSynth.defaults = {
		"harmonicity" : 3,
		"modulationIndex" : 10,
		"detune" : 0,
		"oscillator" : {
			"type" : "sine"
		},
		"envelope" : {
			"attack" : 0.01,
			"decay" : 0.01,
			"sustain" : 1,
			"release" : 0.5
		},
		"moduation" : {
			"type" : "square"
		},
		"modulationEnvelope" : {
			"attack" : 0.5,
			"decay" : 0.0,
			"sustain" : 1,
			"release" : 0.5
		}
	};

	/**
	 * 	trigger the attack portion of the note
	 *  
	 *  @param  {Time} [time=now] the time the note will occur
	 *  @param {number} [velocity=1] the velocity of the note
	 *  @returns {Tone.FMSynth} this
	 *  @private
	 */
	Tone.FMSynth.prototype._triggerEnvelopeAttack = function(time, velocity){
		time = this.toSeconds(time);
		//the envelopes
		this.envelope.triggerAttack(time, velocity);
		this.modulationEnvelope.triggerAttack(time);
		return this;
	};

	/**
	 *  trigger the release portion of the note
	 *  
	 *  @param  {Time} [time=now] the time the note will release
	 *  @returns {Tone.FMSynth} this
	 *  @private
	 */
	Tone.FMSynth.prototype._triggerEnvelopeRelease = function(time){
		time = this.toSeconds(time);
		this.envelope.triggerRelease(time);
		this.modulationEnvelope.triggerRelease(time);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.FMSynth} this
	 */
	Tone.FMSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this._writable(["frequency", "harmonicity", "modulationIndex", "oscillator", "envelope", "modulation", "modulationEnvelope", "detune"]);
		this._carrier.dispose();
		this._carrier = null;
		this._modulator.dispose();
		this._modulator = null;
		this.frequency.dispose();
		this.frequency = null;
		this.detune.dispose();
		this.detune = null;
		this.modulationIndex.dispose();
		this.modulationIndex = null;
		this.harmonicity.dispose();
		this.harmonicity = null;
		this._modulationNode.dispose();
		this._modulationNode = null;
		this.oscillator = null;
		this.envelope = null;
		this.modulationEnvelope = null;
		this.modulation = null;
		return this;
	};

	return Tone.FMSynth;
});