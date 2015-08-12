define(["Tone/core/Tone", "Tone/instrument/SimpleSynth", "Tone/signal/Signal", "Tone/signal/Multiply", 
	"Tone/instrument/Monophonic", "Tone/signal/AudioToGain"], 
function(Tone){

	"use strict";

	/**
	 *  @class   AMSynth uses the output of one Tone.SimpleSynth to modulate the
	 *          amplitude of another Tone.SimpleSynth. The harmonicity (the ratio between
	 *          the two signals) affects the timbre of the output signal the most.
	 *          Read more about Amplitude Modulation Synthesis on [SoundOnSound](http://www.soundonsound.com/sos/mar00/articles/synthsecrets.htm).
	 *          <img src="https://docs.google.com/drawings/d/1p_os_As-N1bpnK8u55gXlgVw3U7BfquLX0Wj57kSZXY/pub?w=1009&h=457">
	 *
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} [options] the options available for the synth 
	 *                          see defaults below
	 *  @example
	 * var synth = new Tone.SimpleAM().toMaster();
	 * synth.triggerAttackRelease("C4", "8n");
	 */
	Tone.SimpleAM = function(options){

		options = this.defaultArg(options, Tone.SimpleAM.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  The carrier voice. 
		 *  @type {Tone.SimpleSynth}
		 */
		this.carrier = new Tone.SimpleSynth(options.carrier);

		/**
		 *  The modulator voice. 
		 *  @type {Tone.SimpleSynth}
		 */
		this.modulator = new Tone.SimpleSynth(options.modulator);

		/**
		 *  the frequency control
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = new Tone.Signal(440, Tone.Type.Frequency);

		/**
		 *  The ratio between the carrier and the modulator frequencies. A value of 1
		 *  makes both voices in unison, a value of 0.5 puts the modulator an octave below
		 *  the carrier.
		 *  @type {Positive}
		 *  @signal
		 *  @example
		 * //set the modulator an octave above the carrier frequency
		 * simpleAM.harmonicity.value = 2;
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
		this.frequency.connect(this.carrier.frequency);
		this.frequency.chain(this.harmonicity, this.modulator.frequency);
		this.modulator.chain(this._modulationScale, this._modulationNode.gain);
		this.carrier.chain(this._modulationNode, this.output);
		this._readOnly(["carrier", "modulator", "frequency", "harmonicity"]);
	};

	Tone.extend(Tone.SimpleAM, Tone.Monophonic);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.SimpleAM.defaults = {
		"harmonicity" : 3,
		"carrier" : {
			"volume" : -10,
			"portamento" : 0,
			"oscillator" : {
				"type" : "sine"
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.01,
				"sustain" : 1,
				"release" : 0.5
			},
		},
		"modulator" : {
			"volume" : -10,
			"portamento" : 0,
			"oscillator" : {
				"type" : "sine"
			},
			"envelope" : {
				"attack" : 0.5,
				"decay" : 0.1,
				"sustain" : 1,
				"release" : 0.5
			}
		}
	};

	/**
	 *  trigger the attack portion of the note
	 *  
	 *  @param  {Time} [time=now] the time the note will occur
	 *  @param {number} [velocity=1] the velocity of the note
	 *  @returns {Tone.SimpleAM} this
	 *  @private
	 */
	Tone.SimpleAM.prototype._triggerEnvelopeAttack = function(time, velocity){
		//the port glide
		time = this.toSeconds(time);
		//the envelopes
		this.carrier.envelope.triggerAttack(time, velocity);
		this.modulator.envelope.triggerAttack(time);
		return this;
	};

	/**
	 *  trigger the release portion of the note
	 *  
	 *  @param  {Time} [time=now] the time the note will release
	 *  @returns {Tone.SimpleAM} this
	 *  @private
	 */
	Tone.SimpleAM.prototype._triggerEnvelopeRelease = function(time){
		this.carrier.triggerRelease(time);
		this.modulator.triggerRelease(time);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.SimpleAM} this
	 */
	Tone.SimpleAM.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this._writable(["carrier", "modulator", "frequency", "harmonicity"]);
		this.carrier.dispose();
		this.carrier = null;
		this.modulator.dispose();
		this.modulator = null;
		this.frequency.dispose();
		this.frequency = null;
		this.harmonicity.dispose();
		this.harmonicity = null;
		this._modulationScale.dispose();
		this._modulationScale = null;
		this._modulationNode.disconnect();
		this._modulationNode = null;
		return this;
	};

	return Tone.SimpleAM;
});