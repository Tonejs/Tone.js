define(["Tone/core/Tone", "Tone/instrument/MonoSynth", "Tone/signal/Signal", "Tone/signal/Multiply", "Tone/instrument/Monophonic"], 
function(Tone){

	"use strict";

	/**
	 *  @class  FMSynth is composed of two Tone.MonoSynths where one Tone.MonoSynth modulates
	 *          the frequency of a second Tone.MonoSynth. A lot of spectral content 
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
		 *  @type {Tone.MonoSynth}
		 */
		this.carrier = new Tone.MonoSynth(options.carrier);
		this.carrier.volume.value = -10;

		/**
		 *  The modulator voice.
		 *  @type {Tone.MonoSynth}
		 */
		this.modulator = new Tone.MonoSynth(options.modulator);
		this.modulator.volume.value = -10;

		/**
		 *  The frequency control.
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
		this._modulationNode = this.context.createGain();

		//control the two voices frequency
		this.frequency.connect(this.carrier.frequency);
		this.frequency.chain(this.harmonicity, this.modulator.frequency);
		this.frequency.chain(this.modulationIndex, this._modulationNode);
		this.modulator.connect(this._modulationNode.gain);
		this._modulationNode.gain.value = 0;
		this._modulationNode.connect(this.carrier.frequency);
		this.carrier.connect(this.output);
		this._readOnly(["carrier", "modulator", "frequency", "harmonicity", "modulationIndex"]);
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
				"baseFrequency" : 200,
				"octaves" : 8
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
				"baseFrequency" : 600,
				"octaves" : 5
			}
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
	 *  @param  {Time} [time=now] the time the note will release
	 *  @returns {Tone.FMSynth} this
	 *  @private
	 */
	Tone.FMSynth.prototype._triggerEnvelopeRelease = function(time){
		this.carrier.triggerRelease(time);
		this.modulator.triggerRelease(time);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.FMSynth} this
	 */
	Tone.FMSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this._writable(["carrier", "modulator", "frequency", "harmonicity", "modulationIndex"]);
		this.carrier.dispose();
		this.carrier = null;
		this.modulator.dispose();
		this.modulator = null;
		this.frequency.dispose();
		this.frequency = null;
		this.modulationIndex.dispose();
		this.modulationIndex = null;
		this.harmonicity.dispose();
		this.harmonicity = null;
		this._modulationNode.disconnect();
		this._modulationNode = null;
		return this;
	};

	return Tone.FMSynth;
});