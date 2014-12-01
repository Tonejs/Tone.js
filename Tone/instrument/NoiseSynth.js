define(["Tone/core/Tone", "Tone/component/AmplitudeEnvelope", "Tone/component/ScaledEnvelope", 
	"Tone/source/Noise", "Tone/signal/Signal", "Tone/component/Filter", "Tone/instrument/Instrument"], 
function(Tone){

	"use strict";

	/**
	 *  @class  the NoiseSynth is a single oscillator, monophonic synthesizer
	 *          with a filter, and two envelopes (on the filter and the amplitude)
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {Object} options the options available for the synth 
	 *                          see defaults below
	 */
	Tone.NoiseSynth = function(options){

		//get the defaults
		options = this.defaultArg(options, Tone.NoiseSynth.defaults);
		Tone.Instrument.call(this);

		/**
		 *  the noise source
		 *  @type {Tone.Noise}
		 */
		this.noise = new Tone.Noise();

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

		//connect the noise to the output
		this.noise.chain(this.filter, this.envelope, this.output);
		//start the noise
		this.noise.start();
		//connect the filter envelope
		this.filterEnvelope.connect(this.filter.frequency);
	};

	Tone.extend(Tone.NoiseSynth, Tone.Instrument);

	/**
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.NoiseSynth.defaults = {
		"noise" : {
			"type" : "white"
		},
		"filter" : {
			"Q" : 6,
			"type" : "highpass",
			"rolloff" : -24
		},
		"envelope" : {
			"attack" : 0.005,
			"decay" : 0.1,
			"sustain" : 0.0,
		},
		"filterEnvelope" : {
			"attack" : 0.06,
			"decay" : 0.2,
			"sustain" : 0,
			"release" : 2,
			"min" : 20,
			"max" : 4000,
			"exponent" : 2
		}
	};

	/**
	 *  start the attack portion of the envelope
	 *  @param {Tone.Time=} [time=now] the time the attack should start
	 *  @param {number=} velocity the velocity of the note (0-1)
	 */
	Tone.NoiseSynth.prototype.triggerAttack = function(time, velocity){
		//the envelopes
		this.envelope.triggerAttack(time, velocity);
		this.filterEnvelope.triggerAttack(time);		
	};

	/**
	 *  start the release portion of the envelope
	 *  @param {Tone.Time=} [time=now] the time the release should start
	 */
	Tone.NoiseSynth.prototype.triggerRelease = function(time){
		this.envelope.triggerRelease(time);
		this.filterEnvelope.triggerRelease(time);
	};

	/**
	 *  trigger the attack and then the release
	 *  @param  {Tone.Time=} duration the duration of the note
	 *  @param  {Tone.Time=} time     the time of the attack
	 *  @param  {number=} velocity the velocity
	 */
	Tone.NoiseSynth.prototype.triggerAttackRelease = function(duration, time, velocity){
		time = this.toSeconds(time);
		duration = this.toSeconds(duration);
		this.triggerAttack(time, velocity);
		console.log(time + duration);
		this.triggerRelease(time + duration);
	};

	/**
	 *  set the oscillator type
	 *  @param {string} oscType the type of oscillator
	 */
	Tone.NoiseSynth.prototype.setNoiseType = function(type){
		this.noise.setType(type);
	};

	/**
	 *  set the members at once
	 *  @param {Object} params all of the parameters as an object.
	 *                         params for envelope and filterEnvelope 
	 *                         should be nested objects. 
	 */
	Tone.NoiseSynth.prototype.set = function(params){
		if (!this.isUndef(params.noise)) this.noise.set(params.noise);
		if (!this.isUndef(params.filterEnvelope)) this.filterEnvelope.set(params.filterEnvelope);
		if (!this.isUndef(params.envelope)) this.envelope.set(params.envelope);
		if (!this.isUndef(params.filter)) this.filter.set(params.filter);
	};

	/**
	 *  clean up
	 */
	Tone.NoiseSynth.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		this.noise.dispose();
		this.noise = null;
		this.envelope.dispose();
		this.envelope = null;
		this.filterEnvelope.dispose();
		this.filterEnvelope = null;
		this.filter.dispose();
		this.filter = null;
	};

	return Tone.NoiseSynth;
});