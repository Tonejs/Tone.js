define(["Tone/core/Tone", "Tone/component/AmplitudeEnvelope", "Tone/component/ScaledEnvelope", 
	"Tone/source/OmniOscillator", "Tone/signal/Signal", "Tone/component/Filter", "Tone/instrument/Monophonic"], 
function(Tone){

	"use strict";

	/**
	 *  @class  the MonoSynth is a single oscillator, monophonic synthesizer
	 *          with a filter, and two envelopes (on the filter and the amplitude). 
	 *
	 * Flow: 
	 * 
	 * <pre>
	 * OmniOscillator+-->AmplitudeEnvelope+-->Filter 
	 *                                          ^    
	 *                                          |    
	 *                         ScaledEnvelope+--+
	 * </pre>
	 *  
	 *
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} options the options available for the synth 
	 *                          see defaults below
	 */
	Tone.MonoSynth = function(options){

		//get the defaults
		options = this.defaultArg(options, Tone.MonoSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  the first oscillator
		 *  @type {Tone.OmniOscillator}
		 */
		this.oscillator = new Tone.OmniOscillator(options.oscillator);

		/**
		 *  the frequency control signal
		 *  @type {Tone.Signal}
		 */
		this.frequency = this.oscillator.frequency;

		/**
		 *  the detune control signal
		 *  @type {Tone.Signal}
		 */
		this.detune = this.oscillator.detune;

		/**
		 *  the filter
		 *  @type {Tone.Filter}
		 */
		this.filter = new Tone.Filter(options.filter);

		/**
		 *  the filter envelope
		 *  @type {Tone.Envelope}
		 */
		this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

		/**
		 *  the amplitude envelope
		 *  @type {Tone.Envelope}
		 */
		this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

		//connect the oscillators to the output
		this.oscillator.chain(this.filter, this.envelope, this.output);
		//start the oscillators
		this.oscillator.start();
		//connect the filter envelope
		this.filterEnvelope.connect(this.filter.frequency);
	};

	Tone.extend(Tone.MonoSynth, Tone.Monophonic);

	/**
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.MonoSynth.defaults = {
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
			"min" : 20,
			"max" : 4000,
			"exponent" : 2
		}
	};

	/**
	 *  start the attack portion of the envelope
	 *  @param {Tone.Time} [time=now] the time the attack should start
	 *  @param {number} [velocity=1] the velocity of the note (0-1)
	 *  @returns {Tone.MonoSynth} `this`
	 */
	Tone.MonoSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
		//the envelopes
		this.envelope.triggerAttack(time, velocity);
		this.filterEnvelope.triggerAttack(time);	
		return this;	
	};

	/**
	 *  start the release portion of the envelope
	 *  @param {Tone.Time} [time=now] the time the release should start
	 *  @returns {Tone.MonoSynth} `this`
	 */
	Tone.MonoSynth.prototype.triggerEnvelopeRelease = function(time){
		this.envelope.triggerRelease(time);
		this.filterEnvelope.triggerRelease(time);
		return this;
	};


	/**
	 *  clean up
	 *  @returns {Tone.MonoSynth} `this`
	 */
	Tone.MonoSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
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