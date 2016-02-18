define(["Tone/core/Tone", "Tone/core/Gain", "Tone/core/Master"], function (Tone) {

	/**
	 * @class Tone.MultiPlayer implements a "fire and forget"
	 *        style buffer player. This is very good for short samples
	 *        like drum hits, sound effects and instruments samples. 
	 *        Unlike Tone.Player, Tone.MultiPlayer cannot loop samples
	 *        or change any attributes of a playing sample.
	 * @extends {Tone}
	 * @param {Object} buffers An object with sample names as the keys and either
	 *                         urls or Tone.Buffers as the values. 
	 */
	Tone.MultiPlayer = function(buffers){

		Tone.call(this, 0, 1);

		/**
		 * All of the buffers
		 * @type {Object}
		 * @private
		 */
		this._buffers = {};

		/**
		 * The source output node
		 * @type {Tone.Gain}
		 * @private
		 */
		this._sourceOutput = new Tone.Gain();
		this._sourceOutput.connect(this.output);

		//add the buffers
		if (this.isObject(buffers)){
			this.addBuffer(buffers);
		}

		this.output.channelCount = 2;
		this.output.channelCountMode = "explicit";
	};

	Tone.extend(Tone.MultiPlayer);

	/**
	 * Start the given sampleName with 
	 * @param  {String} sampleName The name of the buffer to trigger
	 * @param  {Time} time       The time to play the sample
	 * @param  {Object} options   An object literal of options: gain, 
	 *                            duration, playbackRate, and offset
	 * @return {Tone.MultiPlayer} this
	 */
	Tone.MultiPlayer.prototype.start = function(sampleName, time, options){
		options = this.defaultArg(options, {
			"playbackRate" : 1,
			"gain" : 1,
			"offset" : 0,
			"attack" : 0,
			"release" : 0,
		});

		if (this._buffers.hasOwnProperty(sampleName)){
			var buffer = this._buffers[sampleName];

			//create the source and connect it up
			var source = this.context.createBufferSource();
			source.buffer = buffer.get();
			var gainNode = this.context.createGain();
			source.connect(gainNode);
			gainNode.connect(this._sourceOutput);
			source.playbackRate.value = options.playbackRate;

			//trigger the source with all of the options
			time = this.toSeconds(time);
			source.start(time, options.offset);

			//trigger the gainNode with all of the options
			if (options.attack !== 0){
				gainNode.gain.setValueAtTime(0, time);
				gainNode.gain.linearRampToValueAtTime(options.gain, time + this.toSeconds(options.attack));
			} else {
				gainNode.gain.setValueAtTime(options.gain, time);
			}

			
			if (!this.isUndef(options.duration)){
				var duration = this.toSeconds(options.duration, buffer.duration);
				var release = this.toSeconds(options.release);
				gainNode.gain.setValueAtTime(options.gain, time + duration);
				gainNode.gain.linearRampToValueAtTime(0, time + duration + release);
				source.stop(time + duration + release);
			}
		}
		return this;
	};

	/**
	 * Stop all the samples that are currently playing
	 * @param {Time} time When to stop the samples.
	 * @param {Time} [fadeTime = 0.01] How long to fade out for. 
	 * @return {Tone.MultiPlayer}      this
	 */
	Tone.MultiPlayer.prototype.stopAll = function(time, fadeTime){
		//create a new output node, fade out the current one
		time = this.toSeconds(time);
		fadeTime = this.defaultArg(fadeTime, 0.01);
		fadeTime = this.toSeconds(fadeTime);
		this._sourceOutput.gain.setValueAtTime(1, time);
		//small fade out to avoid pops
		this._sourceOutput.gain.linearRampToValueAtTime(0, time + fadeTime);
		//make a new output
		this._sourceOutput = new Tone.Gain().connect(this.output);
		return this;
	};

	/**
	 * Add a buffer to the list of buffers, or load the given url
	 * @param {String|Object} name The name of the buffer. Or pass in an object
	 *                             with the name as the keys and urls as the values
	 * @param {String|Tone.Buffer} url  Either the url to load, or the
	 *                                  Tone.Buffer which corresponds to the name.
	 * @param {Function=} callback The callback to invoke when the buffer is loaded.
	 * @returns {Tone.MultiPlayer} this
	 */
	Tone.MultiPlayer.prototype.addBuffer = function(name, url, callback){
		var loadCount = 0;
		function loaded(){
			loadCount--;
			if (loadCount === 0){
				if (this.isFunction(url)){
					url();
				}
			}
		}
		if (this.isObject(name)){
			for (var buff in name){
				loadCount++;
				this.addBuffer(buff, name[buff], loaded);
			}
		} else if (url instanceof Tone.Buffer){
			this._buffers[name] = url;
		} else {
			this._buffers[name] = new Tone.Buffer(url, callback);
		}
		return this;
	};

	/**
	 * Clean up
	 * @return {Tone.MultiPlayer} [description]
	 */
	Tone.MultiPlayer.prototype.dispose = function(){
		this.stopAll();
		Tone.prototype.dispose.call(this);
		this._sourceOutput.dispose();
		this._sourceOutput = null;
		for (var buff in this._buffers){
			this._buffers[buff].dispose();
		}
		this._buffers = null;
		return this;
	};

	return Tone.MultiPlayer;
});