define(["Tone/core/Tone", "Tone/source/Player", "Tone/component/Envelope"], 
function(Tone){

	/**
	 *  @class A simple sampler instrument which plays an audio buffer 
	 *         through an amplitude envelope and optionally a filter
	 *         envelope.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {string} url the url of the audio file
	 *  @param {function} loaded called when the sample has been loaded
	 */
	Tone.Sampler = function(url, loaded){

		/**
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the sample player
		 *  @type {Tone.Player}
		 */
		this.player = new Tone.Player(url, loaded);
		this.player.retrigger = true;

		/**
		 *  the amplitude envelope
		 *  @type {Tone.Envelope}
		 */
		this.envelope = new Tone.Envelope(0.001, 0, 1, 0.1);

		/**
		 *  the filter envelope
		 *  @type {Tone.Envelope}
		 */
		this.filterEnvelope = new Tone.Envelope(0.001, 0.6, 0, 0, 0, 20000);

		/**
		 *  the filter
		 *  @type {BiquadFilterNode}
		 */
		this.filter = this.context.createBiquadFilter();

		//connections
		this.chain(this.player, this.filter, this.output);
		this.envelope.connect(this.player.output);
		this.filterEnvelope.connect(this.filter.frequency);
	};

	Tone.extend(Tone.Sampler);

	/**
	 *  start the sample
	 *  
	 *  @param {Tone.Time=} [time=now] the time when the note should start
	 */
	Tone.Sampler.prototype.triggerAttack = function(time){
		this.player.start(time);
		this.envelope.triggerAttack(time);
		this.filterEnvelope.triggerRelease(time);
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
	 *  clean up
	 */
	Tone.Sampler.prototype.dispose = function(){
		this.player.dispose();
		this.filterEnvelope.dispose();
		this.envelope.dispose();
		this.output.disconnect();
		this.filter.disconnect();
		this.player = null;
		this.filterEnvelope = null;
		this.envelope = null;
		this.output = null;
		this.filter = null;
	};

	return Tone.Sampler;
});
