define(["Tone/core/Tone", "Tone/source/Player", "Tone/component/Envelope", "Tone/component/Filter"], 
function(Tone){

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
	Tone.Sampler = function(url, load){

		//get all of the defaults
		var options;
		if (arguments.length === 1 && typeof url === "object"){
			options = url;
		} else {
			options = {
				"url" : url,
				"load" : load
			};
		}
		options = this.defaultArg(options, this._defaults);

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
		this.chain(this.player, this.filter, this.output);
		this.envelope.connect(this.player.output);
		this.filterEnvelope.connect(this.filter.frequency);
	};

	Tone.extend(Tone.Sampler);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @private
	 */
	Tone.Sampler.prototype._defaults = {
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
			"min" : 0,
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
