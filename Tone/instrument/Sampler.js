define(["Tone/core/Tone", "Tone/source/Player", "Tone/component/Envelope", "Tone/component/Filter", "Tone/source/Source"], 
function(Tone){

	"use strict";

	/**
	 *  @class A simple sampler instrument which plays an audio buffer 
	 *         through an amplitude envelope and optionally a filter
	 *         envelope.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {string|object} url the url of the audio file
	 *  @param {function} load called when the sample has been loaded
	 */
	Tone.Sampler = function(){

		var options = this.optionsObject(arguments, ["url", "load"], Tone.Sampler.defaults);

		/**
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

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
		this.envelope = new Tone.Envelope(options.envelope);

		/**
		 *  the amplitude
		 *  @type {GainNode}
		 *  @private
		 */
		this._amplitude = this.context.createGain();

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
		this.chain(this.player, this.filter, this._amplitude, this.output);
		this.envelope.connect(this._amplitude.gain);
		this.filterEnvelope.connect(this.filter.frequency);
	};

	Tone.extend(Tone.Sampler);

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
	 *  @param {Tone.Time=} [time=now] the time when the note should start
	 *  @param {number=} velocity the velocity of the note
	 */
	Tone.Sampler.prototype.triggerAttack = function(time, velocity){
		this.player.start(time);
		this.envelope.triggerAttack(time, velocity);
		this.filterEnvelope.triggerAttack(time);
	};

	/**
	 *  start the release portion of the sample
	 *  
	 *  @param {Tone.Time=} [time=now] the time when the note should release
	 */
	Tone.Sampler.prototype.triggerRelease = function(time){
		this.filterEnvelope.triggerRelease(time);
		this.envelope.triggerRelease(time);
	};

	/**
	 *  trigger the attack and release after the specified duration
	 *  
	 *  @param  {number|string} note     the note as a number or a string note name
	 *  @param  {Tone.Time} duration the duration of the note
	 *  @param  {Tone.Time=} time     if no time is given, defaults to now
	 *  @param  {number=} velocity the velocity of the attack (0-1)
	 */
	Tone.Sampler.prototype.triggerAttackRelease = function(note, duration, time, velocity) {
		time = this.toSeconds(time);
		this.triggerAttack(note, time, velocity);
		this.triggerRelease(time + this.toSeconds(duration));
	};

	/**
	 *  set volume method borrowed form {@link Tone.Source}
	 *  @function
	 */
	Tone.Sampler.prototype.setVolume = Tone.Source.prototype.setVolume;

	/**
	 *  clean up
	 */
	Tone.Sampler.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
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
