define(["Tone/core/Tone", "Tone/instrument/SimpleSynth", "Tone/signal/Signal", "Tone/signal/Multiply", 
	"Tone/instrument/Monophonic", "Tone/signal/AudioToGain"], 
function(Tone){

	"use strict";

	/**
	 *  @class  AMSynth uses the output of one Tone.SimpleSynth to modulate the
	 *          amplitude of another Tone.SimpleSynth. The harmonicity (the ratio between
	 *          the two signals) affects the timbre of the output signal greatly.
	 *          Read more about Amplitude Modulation Synthesis on 
	 *          [SoundOnSound](http://www.soundonsound.com/sos/mar00/articles/synthsecrets.htm).
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

		options = this.defaultArg(options, Tone.AMSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  The carrier voice. 
		 *  @type {Tone.SimpleSynth}
		 */
		this._carrier = new Tone.SimpleSynth();
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
		 *  @type {Tone.SimpleSynth}
		 */
		this._modulator = new Tone.SimpleSynth();
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
		 *  The frequency.
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = new Tone.Signal(440, Tone.Type.Frequency);

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
		 *  @type {GainNode}
		 *  @private
		 */
		this._modulationNode = this.context.createGain();

		//control the two voices frequency
		this.frequency.connect(this._carrier.frequency);
		this.frequency.chain(this.harmonicity, this._modulator.frequency);
		this._modulator.chain(this._modulationScale, this._modulationNode.gain);
		this._carrier.chain(this._modulationNode, this.output);
		this._readOnly(["frequency", "harmonicity", "oscillator", "envelope", "modulation", "modulationEnvelope"]);
	};

	Tone.extend(Tone.AMSynth, Tone.Monophonic);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.AMSynth.defaults = {
		"harmonicity" : 3,
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
		this.envelope.triggerAttack(time, velocity);
		this.modulationEnvelope.triggerAttack(time, velocity);
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
		this.envelope.triggerRelease(time);
		this.modulationEnvelope.triggerRelease(time);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.AMSynth} this
	 */
	Tone.AMSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this._writable(["frequency", "harmonicity", "oscillator", "envelope", "modulation", "modulationEnvelope"]);
		this._carrier.dispose();
		this._carrier = null;
		this._modulator.dispose();
		this._modulator = null;
		this.frequency.dispose();
		this.frequency = null;
		this.harmonicity.dispose();
		this.harmonicity = null;
		this._modulationScale.dispose();
		this._modulationScale = null;
		this._modulationNode.disconnect();
		this._modulationNode = null;
		this.oscillator = null;
		this.envelope = null;
		this.modulationEnvelope = null;
		this.modulation = null;
		return this;
	};

	return Tone.AMSynth;
});