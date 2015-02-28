define(["Tone/core/Tone", "Tone/source/Player", "Tone/component/AmplitudeEnvelope", "Tone/component/ScaledEnvelope",
	"Tone/component/Filter", "Tone/instrument/Instrument"], 
function(Tone){

	"use strict";

	/**
	 *  @class A simple sampler instrument which plays an audio buffer 
	 *         through an amplitude envelope and a filter envelope. Nested
	 *         lists will be flattened.
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {Object|string} urls the urls of the audio file
	 *  @param {Object} options the options object for the synth
	 *  @example
	 *  var sampler = new Sampler({
	 *  	A : {
	 *  		1 : {"./audio/casio/A1.mp3",
	 *  		2 : "./audio/casio/A2.mp3",
	 *  	},
	 *  	"B.1" : "./audio/casio/B1.mp3",
	 *  });
	 *  //...once samples have loaded
	 *  sampler.triggerAttack("A.1", time, velocity);
	 */
	Tone.Sampler = function(urls, options){

		Tone.Instrument.call(this);
		options = this.defaultArg(options, Tone.Sampler.defaults);

		/**
		 *  the sample player
		 *  @type {Tone.Player}
		 */
		this.player = new Tone.Player(options.player);
		this.player.retrigger = true;

		/**
		 *  the buffers
		 *  @type {Object<Tone.Buffer>}
		 *  @private
		 */
		this._buffers = {};

		/**
		 *  The amplitude envelope. 
		 *  @type {Tone.Envelope}
		 */
		this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

		/**
		 *  The filter envelope. 
		 *  @type {Tone.Envelope}
		 */
		this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

		/**
		 *  The name of the current sample. 
		 *  @type {string}
		 */
		this._sample = options.sample;

		/**
		 * the private reference to the pitch
		 * @type {number}
		 * @private
		 */
		this._pitch = options.pitch;

		/**
		 *  The filter.
		 *  @type {BiquadFilterNode}
		 */
		this.filter = new Tone.Filter(options.filter);

		//connections / setup
		this._loadBuffers(urls);
		this.pitch = options.pitch;
		this.player.chain(this.filter, this.envelope, this.output);
		this.filterEnvelope.connect(this.filter.frequency);
	};

	Tone.extend(Tone.Sampler, Tone.Instrument);

	/**
	 *  the default parameters
	 *  @static
	 */
	Tone.Sampler.defaults = {
		"sample" : 0,
		"pitch" : 0,
		"player" : {
			"loop" : false,
		},
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
			"max" : 20000,
			"exponent" : 2,
		},
		"filter" : {
			"type" : "lowpass"
		}
	};

	/**
	 *  load the buffers
	 *  @param   {Object} urls   the urls
	 *  @private
	 */
	Tone.Sampler.prototype._loadBuffers = function(urls){
		if (typeof urls === "string"){
			this._buffers["0"] = new Tone.Buffer(urls, function(){
				this.sample = "0";
			}.bind(this));
		} else {
			urls = this._flattenUrls(urls);
			for (var buffName in urls){
				this._sample = buffName;
				var urlString = urls[buffName];
				this._buffers[buffName] = new Tone.Buffer(urlString);
			}
		}
	};

	/**
	 *  flatten an object into a single depth object
	 *  https://gist.github.com/penguinboy/762197
	 *  @param   {Object} ob 	
	 *  @return  {Object}    
	 *  @private
	 */
	Tone.Sampler.prototype._flattenUrls = function(ob) {
		var toReturn = {};
		for (var i in ob) {
			if (!ob.hasOwnProperty(i)) continue;
			if ((typeof ob[i]) == "object") {
				var flatObject = this._flattenUrls(ob[i]);
				for (var x in flatObject) {
					if (!flatObject.hasOwnProperty(x)) continue;
					toReturn[i + "." + x] = flatObject[x];
				}
			} else {
				toReturn[i] = ob[i];
			}
		}
		return toReturn;
	};

	/**
	 *  start the sample.
	 *  @param {string=} sample the name of the samle to trigger, defaults to
	 *                          the last sample used
	 *  @param {Tone.Time} [time=now] the time when the note should start
	 *  @param {number} [velocity=1] the velocity of the note
	 *  @returns {Tone.Sampler} `this`
	 */
	Tone.Sampler.prototype.triggerAttack = function(name, time, velocity){
		time = this.toSeconds(time);
		if (name){
			this.sample = name;
		}
		this.player.start(time, 0);
		this.envelope.triggerAttack(time, velocity);
		this.filterEnvelope.triggerAttack(time);
		return this;
	};

	/**
	 *  start the release portion of the sample
	 *  
	 *  @param {Tone.Time} [time=now] the time when the note should release
	 *  @returns {Tone.Sampler} `this`
	 */
	Tone.Sampler.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		this.filterEnvelope.triggerRelease(time);
		this.envelope.triggerRelease(time);
		this.player.stop(this.toSeconds(this.envelope.release) + time);
		return this;
	};

	/**
	 * The name of the sample to trigger.
	 * @memberOf Tone.Sampler#
	 * @type {number|string}
	 * @name sample
	 */
	Object.defineProperty(Tone.Sampler.prototype, "sample", {
		get : function(){
			return this._sample;
		},
		set : function(name){
			if (this._buffers.hasOwnProperty(name)){
				this._sample = name;
				this.player.buffer = this._buffers[name];
			} else {
				throw new Error("Sampler does not have a sample named "+name);
			}
		}
	});

	/**
	 * Repitch the sampled note by some interval (measured
	 * in semi-tones). 
	 * @memberOf Tone.Sampler#
	 * @type {number}
	 * @name pitch
	 * @example
	 * sampler.pitch = -12; //down one octave
	 * sampler.pitch = 7; //up a fifth
	 */
	Object.defineProperty(Tone.Sampler.prototype, "pitch", {
		get : function(){
			return this._pitch;
		},
		set : function(interval){
			this._pitch = interval;
			this.player.playbackRate = this.intervalToFrequencyRatio(interval);
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.Sampler} `this`
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
		for (var sample in this._buffers){
			this._buffers[sample].dispose();
			this._buffers[sample] = null;
		}
		this._buffers = null;
		return this;
	};

	return Tone.Sampler;
});
