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
	 * @example
	 * var noiseSynth = new Tone.NoiseSynth();
	 */
	Tone.NoiseSynth = function(options){

		//get the defaults
		options = this.defaultArg(options, Tone.NoiseSynth.defaults);
		Tone.Instrument.call(this);

		/**
		 *  The noise source. Set the type by setting
		 *  `noiseSynth.noise.type`. 
		 *  @type {Tone.Noise}
		 */
		this.noise = new Tone.Noise();

		/**
		 *  The filter .
		 *  @type {Tone.Filter}
		 */
		this.filter = new Tone.Filter(options.filter);

		/**
		 *  The filter envelope. 
		 *  @type {Tone.Envelope}
		 */
		this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

		/**
		 *  The amplitude envelope. 
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
	 *  @param {Tone.Time} [time=now] the time the attack should start
	 *  @param {number} [velocity=1] the velocity of the note (0-1)
	 *  @returns {Tone.NoiseSynth} `this`
	 */
	Tone.NoiseSynth.prototype.triggerAttack = function(time, velocity){
		//the envelopes
		this.envelope.triggerAttack(time, velocity);
		this.filterEnvelope.triggerAttack(time);	
		return this;	
	};

	/**
	 *  start the release portion of the envelope
	 *  @param {Tone.Time} [time=now] the time the release should start
	 *  @returns {Tone.NoiseSynth} `this`
	 */
	Tone.NoiseSynth.prototype.triggerRelease = function(time){
		this.envelope.triggerRelease(time);
		this.filterEnvelope.triggerRelease(time);
		return this;
	};

	/**
	 *  trigger the attack and then the release
	 *  @param  {Tone.Time} duration the duration of the note
	 *  @param  {Tone.Time} [time=now]     the time of the attack
	 *  @param  {number} [velocity=1] the velocity
	 *  @returns {Tone.NoiseSynth} `this`
	 */
	Tone.NoiseSynth.prototype.triggerAttackRelease = function(duration, time, velocity){
		time = this.toSeconds(time);
		duration = this.toSeconds(duration);
		this.triggerAttack(time, velocity);
		console.log(time + duration);
		this.triggerRelease(time + duration);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.NoiseSynth} `this`
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
		return this;
	};

	return Tone.NoiseSynth;
});