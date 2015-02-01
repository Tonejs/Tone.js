define(["Tone/core/Tone", "Tone/source/Player", "Tone/component/AmplitudeEnvelope", "Tone/component/ScaledEnvelope",
	"Tone/component/Filter", "Tone/instrument/Instrument"], 
function(Tone){

	"use strict";

	/**
	 *  @class A simple sampler instrument which plays an audio buffer 
	 *         through an amplitude envelope and a filter envelope. Nested
	 *         lists will be flattened like so: 
	 *         ```javascript
	 *         var sampler = new Sampler({
	 *         	A : {
	 *         		1 : {"./audio/casio/A1.mp3",
	 *         		2 : "./audio/casio/A2.mp3",
	 *         	},
	 *         	"B.1" : "./audio/casio/B1.mp3",
	 *         });
	 *         //...once samples have loaded
	 *         sampler.triggerAttack("A.1", time, velocity);
	 *         ```
	 *
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {Object|string} urls the urls of the audio file
	 *  @param {Object} options the options object for the synth
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
		 *  the amplitude envelope
		 *  @type {Tone.Envelope}
		 */
		this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

		/**
		 *  the filter envelope
		 *  @type {Tone.Envelope}
		 */
		this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

		/**
		 *  the name of the current sample
		 *  @type {string}
		 */
		this.sample = options.sample;

		/**
		 *  the filter
		 *  @type {BiquadFilterNode}
		 */
		this.filter = new Tone.Filter(options.filter);

		this._loadBuffers(urls);
		//connections
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
			this._buffers["0"] = new Tone.Buffer(urls, this.setSample.bind(this, "0"));
		} else {
			urls = this._flattenUrls(urls);
			for (var buffName in urls){
				var urlString = urls[buffName];
				this._buffers[buffName] = new Tone.Buffer(urlString, this.setSample.bind(this, buffName));
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
	 *  set the parameters in bulk
	 *  @param {Object} param
	 *  @returns {Tone.Sampler} `this`
	 */
	Tone.Sampler.prototype.set = function(params){
		if (!this.isUndef(params.filterEnvelope)) this.filterEnvelope.set(params.filterEnvelope);
		if (!this.isUndef(params.envelope)) this.envelope.set(params.envelope);
		if (!this.isUndef(params.player)) this.player.set(params.player);
		if (!this.isUndef(params.filter)) this.filter.set(params.filter);
		if (!this.isUndef(params.sample)) this.setSample(params.sample);
		if (!this.isUndef(params.pitch)) this.setPitch(params.pitch);
		return this;
	};

	/**
	 *  repitch the sampled note by some interval.
	 *  ```javascript
	 *  sampler.setPitch(12); //one octave higher
	 *  sampler.setPitch(-7); //down a fifth
	 *  ```
	 *  @param {number} interval the interval in half-steps.
	 *                           0 indicates no change.
	 *  @returns {Tone.Sampler} `this`
	 */
	Tone.Sampler.prototype.setPitch = function(interval, time){
		time = this.toSeconds(time);
		this.player.setPlaybackRate(this.intervalToFrequencyRatio(interval), time);
		return this;
	};

	/**
	 * set the name of the sample to trigger
	 * @param {string} name the name of the sample
	 * @returns {Tone.Sampler} `this`
	 */
	Tone.Sampler.prototype.setSample = function(name){
		if (this._buffers.hasOwnProperty(name)){
			this._sample = name;
			this.player.setBuffer(this._buffers[name]);
		} else {
			throw new Error("Sampler does not have a sample named "+name);
		}
		return this;
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
			this.setSample(name);
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
