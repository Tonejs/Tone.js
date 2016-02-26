define(["Tone/core/Tone", "Tone/component/AmplitudeEnvelope", "Tone/component/FrequencyEnvelope", 
	"Tone/source/OmniOscillator", "Tone/signal/Signal", "Tone/component/Filter", "Tone/instrument/Monophonic"], 
function(Tone){

	"use strict";

	/**
	 *  @class  Tone.MonoSynth is composed of one oscillator, one filter, and two envelopes.
	 *          The amplitude of the Tone.Oscillator and the cutoff frequency of the 
	 *          Tone.Filter are controlled by Tone.Envelopes. 
	 *          <img src="https://docs.google.com/drawings/d/1gaY1DF9_Hzkodqf8JI1Cg2VZfwSElpFQfI94IQwad38/pub?w=924&h=240">
	 *          
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} [options] the options available for the synth 
	 *                          see defaults below
	 *  @example
	 * var synth = new Tone.MonoSynth({
	 * 	"oscillator" : {
	 * 		"type" : "square"
	 *  },
	 *  "envelope" : {
	 *  	"attack" : 0.1
	 *  }
	 * }).toMaster();
	 * synth.triggerAttackRelease("C4", "8n");
	 */
	Tone.MonoSynth = function(options){

		//get the defaults
		options = this.defaultArg(options, Tone.MonoSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  The oscillator.
		 *  @type {Tone.OmniOscillator}
		 */
		this.oscillator = new Tone.OmniOscillator(options.oscillator);

		/**
		 *  The frequency control.
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = this.oscillator.frequency;

		/**
		 *  The detune control.
		 *  @type {Cents}
		 *  @signal
		 */
		this.detune = this.oscillator.detune;

		/**
		 *  The filter.
		 *  @type {Tone.Filter}
		 */
		this.filter = new Tone.Filter(options.filter);

		/**
		 *  The filter envelope.
		 *  @type {Tone.FrequencyEnvelope}
		 */
		this.filterEnvelope = new Tone.FrequencyEnvelope(options.filterEnvelope);

		/**
		 *  The amplitude envelope.
		 *  @type {Tone.AmplitudeEnvelope}
		 */
		this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

		//connect the oscillators to the output
		this.oscillator.chain(this.filter, this.envelope, this.output);
		//start the oscillators
		this.oscillator.start();
		//connect the filter envelope
		this.filterEnvelope.connect(this.filter.frequency);
		this._readOnly(["oscillator", "frequency", "detune", "filter", "filterEnvelope", "envelope"]);
	};

	Tone.extend(Tone.MonoSynth, Tone.Monophonic);

	/**
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.MonoSynth.defaults = {
		"frequency" : "C4",
		"detune" : 0,
		"oscillator" : {
			"type" : "square"
		},
		"filter" : {
			"Q" : 6,
			"type" : "lowpass",
			"rolloff" : -24
		},
		"envelope" : {
			"attack" : 0.005,
			"decay" : 0.1,
			"sustain" : 0.9,
			"release" : 1
		},
		"filterEnvelope" : {
			"attack" : 0.06,
			"decay" : 0.2,
			"sustain" : 0.5,
			"release" : 2,
			"baseFrequency" : 200,
			"octaves" : 7,
			"exponent" : 2
		}
	};

	/**
	 *  start the attack portion of the envelope
	 *  @param {Time} [time=now] the time the attack should start
	 *  @param {NormalRange} [velocity=1] the velocity of the note (0-1)
	 *  @returns {Tone.MonoSynth} this
	 *  @private
	 */
	Tone.MonoSynth.prototype._triggerEnvelopeAttack = function(time, velocity){
		//the envelopes
		this.envelope.triggerAttack(time, velocity);
		this.filterEnvelope.triggerAttack(time);	
		return this;	
	};

	/**
	 *  start the release portion of the envelope
	 *  @param {Time} [time=now] the time the release should start
	 *  @returns {Tone.MonoSynth} this
	 *  @private
	 */
	Tone.MonoSynth.prototype._triggerEnvelopeRelease = function(time){
		this.envelope.triggerRelease(time);
		this.filterEnvelope.triggerRelease(time);
		return this;
	};


	/**
	 *  clean up
	 *  @returns {Tone.MonoSynth} this
	 */
	Tone.MonoSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this._writable(["oscillator", "frequency", "detune", "filter", "filterEnvelope", "envelope"]);
		this.oscillator.dispose();
		this.oscillator = null;
		this.envelope.dispose();
		this.envelope = null;
		this.filterEnvelope.dispose();
		this.filterEnvelope = null;
		this.filter.dispose();
		this.filter = null;
		this.frequency = null;
		this.detune = null;
		return this;
	};

	return Tone.MonoSynth;
});