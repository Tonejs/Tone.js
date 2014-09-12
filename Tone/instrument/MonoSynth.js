define(["Tone/core/Tone", "Tone/component/Envelope", "Tone/source/Oscillator", 
	"Tone/signal/Signal", "Tone/component/Filter", "Tone/signal/Add", "Tone/instrument/Monophonic"], 
function(Tone){

	"use strict";

	/**
	 *  @class  the MonoSynth is a single oscillator, monophonic synthesizer
	 *          with a filter, and two envelopes (on the filter and the amplitude)
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
		 *  @type {Tone.Oscillator}
		 */
		this.oscillator = new Tone.Oscillator(0, options.oscType);

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
		this.filterEnvelope = new Tone.Envelope(options.filterEnvelope);

		/**
		 *  the amplitude envelope
		 *  @type {Tone.Envelope}
		 */
		this.envelope = new Tone.Envelope(options.envelope);

		/**
		 *  the amplitude
		 *  @type {GainNode}
		 *  @private
		 */
		this._amplitude = this.context.createGain();

		//connect the oscillators to the output
		this.oscillator.connect(this.filter);
		this.filter.connect(this._amplitude);
		//start the oscillators
		this.oscillator.start();
		//connect the envelopes
		this.filterEnvelope.connect(this.filter.frequency);
		this.envelope.connect(this._amplitude.gain);
		this._amplitude.connect(this.output);
	};

	Tone.extend(Tone.MonoSynth, Tone.Monophonic);

	/**
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.MonoSynth.defaults = {
		"oscType" : "square",
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
			"max" : 4000
		}
	};

	/**
	 *  start the attack portion of the envelope
	 *  @param {Tone.Time=} [time=now] the time the attack should start
	 *  @param {number=} velocity the velocity of the note (0-1)
	 */
	Tone.MonoSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
		//the envelopes
		this.envelope.triggerAttack(time, velocity);
		this.filterEnvelope.triggerAttack(time);		
	};

	/**
	 *  start the release portion of the envelope
	 *  @param {Tone.Time=} [time=now] the time the release should start
	 */
	Tone.MonoSynth.prototype.triggerEnvelopeRelease = function(time){
		this.envelope.triggerRelease(time);
		this.filterEnvelope.triggerRelease(time);
	};

	/**
	 *  set the oscillator type
	 *  @param {string} oscType the type of oscillator
	 */
	Tone.MonoSynth.prototype.setOscType = function(type){
		this.oscillator.setType(type);
	};

	/**
	 *  set the members at once
	 *  @param {Object} params all of the parameters as an object.
	 *                         params for envelope and filterEnvelope 
	 *                         should be nested objects. 
	 */
	Tone.MonoSynth.prototype.set = function(params){
		if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
		if (!this.isUndef(params.oscType)) this.setOscType(params.oscType);
		if (!this.isUndef(params.filterEnvelope)) this.filterEnvelope.set(params.filterEnvelope);
		if (!this.isUndef(params.envelope)) this.envelope.set(params.envelope);
		if (!this.isUndef(params.filter)) this.filter.set(params.filter);
		Tone.Monophonic.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.MonoSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this.oscillator.dispose();
		this.envelope.dispose();
		this.filterEnvelope.dispose();
		this.filter.dispose();
		this._amplitude.disconnect();
		this.oscillator = null;
		this.filterEnvelope = null;
		this.envelope = null;
		this.filter = null;
		this.detune = null;
		this._amplitude = null;
		this.frequency = null;
		this.detune = null;
	};

	return Tone.MonoSynth;
});