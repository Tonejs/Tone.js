define(["Tone/core/Tone", "Tone/source/Player", "Tone/component/AmplitudeEnvelope", "Tone/component/Filter", "Tone/instrument/Instrument"], 
function(Tone){

	"use strict";

	/**
	 *  @class A simple sampler instrument which plays an audio buffer 
	 *         through an amplitude envelope and optionally a filter
	 *         envelope.
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {string|object} url the url of the audio file
	 *  @param {function} load called when the sample has been loaded
	 */
	Tone.Sampler = function(){

		Tone.Instrument.call(this);

		var options = this.optionsObject(arguments, ["url", "load"], Tone.Sampler.defaults);

		/**
		 *  the sample player
		 *  @type {Tone.Player}
		 */
		this.player = new Tone.Player(options.url, options.load);
		this.player.retrigger = true;

		/**
		 *  the amplitude envelope
		 *  @type {Tone.Envelope}
		 */
		this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

		/**
		 *  the filter envelope
		 *  @type {Tone.Envelope}
		 */
		this.filterEnvelope = new Tone.Envelope(options.filterEnvelope);

		/**
		 *  the filter
		 *  @type {BiquadFilterNode}
		 */
		this.filter = new Tone.Filter(options.filter);

		//connections
		this.chain(this.player, this.filter, this.envelope, this.output);
		this.filterEnvelope.connect(this.filter.frequency);
	};

	Tone.extend(Tone.Sampler, Tone.Instrument);

	/**
	 *  the default parameters
	 *
	 *  @static
	 */
	Tone.Sampler.defaults = {
		"url" : null,
		"load" : function(){},
		"envelope" : {
			"attack" : 0.001,
			"decay" : 0,
			"sustain" : 1,
			"release" : 0.1
		},
		"filterEnvelope" : {
			"attack" : 0.001,
			"decay" : 0.001,
			"sustain" : 1,
			"release" : 0.5,
			"min" : 20,
			"max" : 20000
		},
		"filter" : {
			"type" : "lowpass"
		}
	};

	/**
	 *  set the parameters in bulk
	 *  @param {Object} param
	 */
	 Tone.Sampler.prototype.set = function(params){
	 	if (!this.isUndef(params.filterEnvelope)) this.filterEnvelope.set(params.filterEnvelope);
	 	if (!this.isUndef(params.envelope)) this.envelope.set(params.envelope);
	 	if (!this.isUndef(params.filter)) this.filter.set(params.filter);
	 };

	/**
	 *  start the sample
	 *
	 *  @param {number} [note=0] the interval in the sample should be played at 0 = no change
	 *  @param {Tone.Time} [time=now] the time when the note should start
	 *  @param {number} [velocity=1] the velocity of the note
	 */
	Tone.Sampler.prototype.triggerAttack = function(note, time, velocity){
		time = this.toSeconds(time);
		note = this.defaultArg(note, 0);
		this.player.setPlaybackRate(this.intervalToFrequencyRatio(note), time);
		this.player.start(time);
		this.envelope.triggerAttack(time, velocity);
		this.filterEnvelope.triggerAttack(time);
	};

	/**
	 *  start the release portion of the sample
	 *  
	 *  @param {Tone.Time} [time=now] the time when the note should release
	 */
	Tone.Sampler.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		this.filterEnvelope.triggerRelease(time);
		this.envelope.triggerRelease(time);
	};

	/**
	 *  clean up
	 */
	Tone.Sampler.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		this.player.dispose();
		this.filterEnvelope.dispose();
		this.envelope.dispose();
		this.filter.dispose();
		this.player = null;
		this.filterEnvelope = null;
		this.envelope = null;
		this.filter = null;
	};

	return Tone.Sampler;
});
