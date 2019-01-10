define(["../core/Tone", "../instrument/Synth", "../signal/Signal", "../signal/Multiply",
	"../instrument/Monophonic", "../signal/AudioToGain", "../core/Gain"], function(Tone){

	"use strict";

	/**
	 *  @class  AMSynth uses the output of one Tone.Synth to modulate the
	 *          amplitude of another Tone.Synth. The harmonicity (the ratio between
	 *          the two signals) affects the timbre of the output signal greatly.
	 *          Read more about Amplitude Modulation Synthesis on
	 *          [SoundOnSound](https://web.archive.org/web/20160404103653/http://www.soundonsound.com:80/sos/mar00/articles/synthsecrets.htm).
	 *          <img src="https://docs.google.com/drawings/d/1TQu8Ed4iFr1YTLKpB3U1_hur-UwBrh5gdBXc8BxfGKw/pub?w=1009&h=457">
	 *
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} [options] the options available for the synth
	 *                            see defaults below
	 *  @example
	 * var synth = new Tone.AMSynth().toMaster();
	 * synth.triggerAttackRelease("C4", "4n");
	 */
	Tone.AMSynth = function(options){

		options = Tone.defaultArg(options, Tone.AMSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  The carrier voice.
		 *  @type {Tone.Synth}
		 *  @private
		 */
		this._carrier = new Tone.Synth();
		this._carrier.volume.value = -10;

		/**
		 *  The carrier's oscillator
		 *  @type {Tone.Oscillator}
		 */
		this.oscillator = this._carrier.oscillator.set(options.oscillator);

		/**
		 *  The carrier's envelope
		 *  @type {Tone.AmplitudeEnvelope}
		 */
		this.envelope = this._carrier.envelope.set(options.envelope);

		/**
		 *  The modulator voice.
		 *  @type {Tone.Synth}
		 *  @private
		 */
		this._modulator = new Tone.Synth();
		this._modulator.volume.value = -10;

		/**
		 *  The modulator's oscillator which is applied
		 *  to the amplitude of the oscillator
		 *  @type {Tone.Oscillator}
		 */
		this.modulation = this._modulator.oscillator.set(options.modulation);

		/**
		 *  The modulator's envelope
		 *  @type {Tone.AmplitudeEnvelope}
		 */
		this.modulationEnvelope = this._modulator.envelope.set(options.modulationEnvelope);

		/**
		 *  The frequency.
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
		 *  convert the -1,1 output to 0,1
		 *  @type {Tone.AudioToGain}
		 *  @private
		 */
		this._modulationScale = new Tone.AudioToGain();

		/**
		 *  the node where the modulation happens
		 *  @type {Tone.Gain}
		 *  @private
		 */
		this._modulationNode = new Tone.Gain();

		//control the two voices frequency
		this.frequency.connect(this._carrier.frequency);
		this.frequency.chain(this.harmonicity, this._modulator.frequency);
		this.detune.fan(this._carrier.detune, this._modulator.detune);
		this._modulator.chain(this._modulationScale, this._modulationNode.gain);
		this._carrier.chain(this._modulationNode, this.output);
		this._readOnly(["frequency", "harmonicity", "oscillator", "envelope", "modulation", "modulationEnvelope", "detune"]);
	};

	Tone.extend(Tone.AMSynth, Tone.Monophonic);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.AMSynth.defaults = {
		"harmonicity" : 3,
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
		"modulation" : {
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
	 *  trigger the attack portion of the note
	 *
	 *  @param  {Time} [time=now] the time the note will occur
	 *  @param {NormalRange} [velocity=1] the velocity of the note
	 *  @private
	 *  @returns {Tone.AMSynth} this
	 */
	Tone.AMSynth.prototype._triggerEnvelopeAttack = function(time, velocity){
		//the port glide
		time = this.toSeconds(time);
		//the envelopes
		this._carrier._triggerEnvelopeAttack(time, velocity);
		this._modulator._triggerEnvelopeAttack(time);
		return this;
	};

	/**
	 *  trigger the release portion of the note
	 *
	 *  @param  {Time} [time=now] the time the note will release
	 *  @private
	 *  @returns {Tone.AMSynth} this
	 */
	Tone.AMSynth.prototype._triggerEnvelopeRelease = function(time){
		this._carrier._triggerEnvelopeRelease(time);
		this._modulator._triggerEnvelopeRelease(time);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.AMSynth} this
	 */
	Tone.AMSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this._writable(["frequency", "harmonicity", "oscillator", "envelope", "modulation", "modulationEnvelope", "detune"]);
		this._carrier.dispose();
		this._carrier = null;
		this._modulator.dispose();
		this._modulator = null;
		this.frequency.dispose();
		this.frequency = null;
		this.detune.dispose();
		this.detune = null;
		this.harmonicity.dispose();
		this.harmonicity = null;
		this._modulationScale.dispose();
		this._modulationScale = null;
		this._modulationNode.dispose();
		this._modulationNode = null;
		this.oscillator = null;
		this.envelope = null;
		this.modulationEnvelope = null;
		this.modulation = null;
		return this;
	};

	return Tone.AMSynth;
});
