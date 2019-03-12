import Tone from "../core/Tone";
import "../core/Emitter";
import "../type/Type";
import "../shim/AudioBuffer";

/**
 *  @class  Buffer loading and storage. Tone.Buffer is used internally by all
 *          classes that make requests for audio files such as Tone.Player,
 *          Tone.Sampler and Tone.Convolver.
 *
 *          Aside from load callbacks from individual buffers, Tone.Buffer
 *  		provides events which keep track of the loading progress
 *  		of _all_ of the buffers. These are Tone.Buffer.on("load" / "progress" / "error")
 *
 *  @constructor
 *  @extends {Tone}
 *  @param {AudioBuffer|String} url The url to load, or the audio buffer to set.
 *  @param {Function=} onload A callback which is invoked after the buffer is loaded.
 *                            It's recommended to use `Tone.Buffer.on('load', callback)` instead
 *                            since it will give you a callback when _all_ buffers are loaded.
 *  @param {Function=} onerror The callback to invoke if there is an error
 *  @example
 * var buffer = new Tone.Buffer("path/to/sound.mp3", function(){
 * 	//the buffer is now available.
 * 	var buff = buffer.get();
 * });
 *  @example
 * //can load provide fallback extension types if the first type is not supported.
 * var buffer = new Tone.Buffer("path/to/sound.[mp3|ogg|wav]");
 */
Tone.Buffer = function(){

	var options = Tone.defaults(arguments, ["url", "onload", "onerror"], Tone.Buffer);
	Tone.call(this);

	/**
	 *  stores the loaded AudioBuffer
	 *  @type {AudioBuffer}
	 *  @private
	 */
	this._buffer = null;

	/**
	 *  indicates if the buffer should be reversed or not
	 *  @type {Boolean}
	 *  @private
	 */
	this._reversed = options.reverse;

	/**
	 *  The XHR
	 *  @type  {XMLHttpRequest}
	 *  @private
	 */
	this._xhr = null;

	/**
	 * Private callback when the buffer is loaded.
	 * @type {Function}
	 * @private
	 */
	this.onload = Tone.noOp;

	if (options.url instanceof AudioBuffer || options.url instanceof Tone.Buffer){
		this.set(options.url);
		if (!this.loaded){
			this.onload = options.onload;
		}
	} else if (Tone.isString(options.url)){
		this.load(options.url).then(options.onload).catch(options.onerror);
	}
};

Tone.extend(Tone.Buffer);

/**
 *  the default parameters
 *  @type {Object}
 */
Tone.Buffer.defaults = {
	"url" : undefined,
	"reverse" : false,
	"onload" : Tone.noOp,
	"onerror" : Tone.noOp
};

/**
 *  Pass in an AudioBuffer or Tone.Buffer to set the value
 *  of this buffer.
 *  @param {AudioBuffer|Tone.Buffer} buffer the buffer
 *  @returns {Tone.Buffer} this
 */
Tone.Buffer.prototype.set = function(buffer){
	if (buffer instanceof Tone.Buffer){
		//if it's loaded, set it
		if (buffer.loaded){
			this._buffer = buffer.get();
		} else {
			//otherwise when it's loaded, invoke it's callback
			buffer.onload = function(){
				this.set(buffer);
				this.onload(this);
			}.bind(this);
		}
	} else {
		this._buffer = buffer;
	}
	//reverse it initially
	if (this._reversed){
		this._reverse();
	}
	return this;
};

/**
 *  @return {AudioBuffer} The audio buffer stored in the object.
 */
Tone.Buffer.prototype.get = function(){
	return this._buffer;
};

/**
 *  Makes an xhr reqest for the selected url then decodes
 *  the file as an audio buffer. Invokes
 *  the callback once the audio buffer loads.
 *  @param {String} url The url of the buffer to load.
 *                      filetype support depends on the
 *                      browser.
 *  @returns {Promise} returns a Promise which resolves with the Tone.Buffer
 */
Tone.Buffer.prototype.load = function(url, onload, onerror){

	var promise = new Promise(function(load, error){

		this._xhr = Tone.Buffer.load(url,

			//success
			function(buff){
				this._xhr = null;
				this.set(buff);
				load(this);
				this.onload(this);
				if (onload){
					onload(this);
				}
			}.bind(this),

			//error
			function(err){
				this._xhr = null;
				error(err);
				if (onerror){
					onerror(err);
				}
			}.bind(this));

	}.bind(this));

	return promise;
};

/**
 *  dispose and disconnect
 *  @returns {Tone.Buffer} this
 */
Tone.Buffer.prototype.dispose = function(){
	Tone.prototype.dispose.call(this);
	this._buffer = null;
	if (this._xhr){
		Tone.Buffer._removeFromDownloadQueue(this._xhr);
		this._xhr.abort();
		this._xhr = null;
	}
	return this;
};

/**
 * If the buffer is loaded or not
 * @memberOf Tone.Buffer#
 * @type {Boolean}
 * @name loaded
 * @readOnly
 */
Object.defineProperty(Tone.Buffer.prototype, "loaded", {
	"get" : function(){
		return this.length > 0;
	},
});

/**
 * The duration of the buffer.
 * @memberOf Tone.Buffer#
 * @type {Number}
 * @name duration
 * @readOnly
 */
Object.defineProperty(Tone.Buffer.prototype, "duration", {
	"get" : function(){
		if (this._buffer){
			return this._buffer.duration;
		} else {
			return 0;
		}
	},
});

/**
 * The length of the buffer in samples
 * @memberOf Tone.Buffer#
 * @type {Number}
 * @name length
 * @readOnly
 */
Object.defineProperty(Tone.Buffer.prototype, "length", {
	"get" : function(){
		if (this._buffer){
			return this._buffer.length;
		} else {
			return 0;
		}
	},
});

/**
 * The number of discrete audio channels. Returns 0 if no buffer
 * is loaded.
 * @memberOf Tone.Buffer#
 * @type {Number}
 * @name numberOfChannels
 * @readOnly
 */
Object.defineProperty(Tone.Buffer.prototype, "numberOfChannels", {
	"get" : function(){
		if (this._buffer){
			return this._buffer.numberOfChannels;
		} else {
			return 0;
		}
	},
});

/**
 *  Set the audio buffer from the array. To create a multichannel AudioBuffer,
 *  pass in a multidimensional array.
 *  @param {Float32Array} array The array to fill the audio buffer
 *  @return {Tone.Buffer} this
 */
Tone.Buffer.prototype.fromArray = function(array){
	var isMultidimensional = array[0].length > 0;
	var channels = isMultidimensional ? array.length : 1;
	var len = isMultidimensional ? array[0].length : array.length;
	var buffer = this.context.createBuffer(channels, len, this.context.sampleRate);
	if (!isMultidimensional && channels === 1){
		array = [array];
	}
	for (var c = 0; c < channels; c++){
		buffer.copyToChannel(array[c], c);
	}
	this._buffer = buffer;
	return this;
};

/**
 * 	Sums muliple channels into 1 channel
 *  @param {Number=} channel Optionally only copy a single channel from the array.
 *  @return {Array}
 */
Tone.Buffer.prototype.toMono = function(chanNum){
	if (Tone.isNumber(chanNum)){
		this.fromArray(this.toArray(chanNum));
	} else {
		var outputArray = new Float32Array(this.length);
		var numChannels = this.numberOfChannels;
		for (var channel = 0; channel < numChannels; channel++){
			var channelArray = this.toArray(channel);
			for (var i = 0; i < channelArray.length; i++){
				outputArray[i] += channelArray[i];
			}
		}
		//divide by the number of channels
		outputArray = outputArray.map(function(sample){
			return sample / numChannels;
		});
		this.fromArray(outputArray);
	}
	return this;
};

/**
 * 	Get the buffer as an array. Single channel buffers will return a 1-dimensional
 * 	Float32Array, and multichannel buffers will return multidimensional arrays.
 *  @param {Number=} channel Optionally only copy a single channel from the array.
 *  @return {Array}
 */
Tone.Buffer.prototype.toArray = function(channel){
	if (Tone.isNumber(channel)){
		return this.getChannelData(channel);
	} else if (this.numberOfChannels === 1){
		return this.toArray(0);
	} else {
		var ret = [];
		for (var c = 0; c < this.numberOfChannels; c++){
			ret[c] = this.getChannelData(c);
		}
		return ret;
	}
};

/**
 *  Returns the Float32Array representing the PCM audio data for the specific channel.
 *  @param  {Number}  channel  The channel number to return
 *  @return  {Float32Array}  The audio as a TypedArray
 */
Tone.Buffer.prototype.getChannelData = function(channel){
	return this._buffer.getChannelData(channel);
};

/**
 *  Cut a subsection of the array and return a buffer of the
 *  subsection. Does not modify the original buffer
 *  @param {Time} start The time to start the slice
 *  @param {Time=} end The end time to slice. If none is given
 *                     will default to the end of the buffer
 *  @return {Tone.Buffer} this
 */
Tone.Buffer.prototype.slice = function(start, end){
	end = Tone.defaultArg(end, this.duration);
	var startSamples = Math.floor(this.context.sampleRate * this.toSeconds(start));
	var endSamples = Math.floor(this.context.sampleRate * this.toSeconds(end));
	var replacement = [];
	for (var i = 0; i < this.numberOfChannels; i++){
		replacement[i] = this.toArray(i).slice(startSamples, endSamples);
	}
	var retBuffer = new Tone.Buffer().fromArray(replacement);
	return retBuffer;
};

/**
 *  Reverse the buffer.
 *  @private
 *  @return {Tone.Buffer} this
 */
Tone.Buffer.prototype._reverse = function(){
	if (this.loaded){
		for (var i = 0; i < this.numberOfChannels; i++){
			Array.prototype.reverse.call(this.getChannelData(i));
		}
	}
	return this;
};

/**
 * Reverse the buffer.
 * @memberOf Tone.Buffer#
 * @type {Boolean}
 * @name reverse
 */
Object.defineProperty(Tone.Buffer.prototype, "reverse", {
	"get" : function(){
		return this._reversed;
	},
	"set" : function(rev){
		if (this._reversed !== rev){
			this._reversed = rev;
			this._reverse();
		}
	},
});

///////////////////////////////////////////////////////////////////////////
// STATIC METHODS
///////////////////////////////////////////////////////////////////////////

//statically inherits Emitter methods
Tone.Emitter.mixin(Tone.Buffer);

/**
 *  the static queue for all of the xhr requests
 *  @type {Array}
 *  @private
 */
Tone.Buffer._downloadQueue = [];

/**
 *  A path which is prefixed before every url.
 *  @type  {String}
 *  @static
 */
Tone.Buffer.baseUrl = "";

/**
 *  Create a Tone.Buffer from the array. To create a multichannel AudioBuffer,
 *  pass in a multidimensional array.
 *  @param {Float32Array} array The array to fill the audio buffer
 *  @return {Tone.Buffer} A Tone.Buffer created from the array
 */
Tone.Buffer.fromArray = function(array){
	return (new Tone.Buffer()).fromArray(array);
};

/**
 * Creates a Tone.Buffer from a URL, returns a promise
 * which resolves to a Tone.Buffer
 * @param  {String} url The url to load.
 * @return {Promise<Tone.Buffer>}     A promise which resolves to a Tone.Buffer
 */
Tone.Buffer.fromUrl = function(url){
	var buffer = new Tone.Buffer();
	return buffer.load(url).then(function(){
		return buffer;
	});
};

/**
 * Remove an xhr request from the download queue
 * @private
 */
Tone.Buffer._removeFromDownloadQueue = function(request){
	var index = Tone.Buffer._downloadQueue.indexOf(request);
	if (index !== -1){
		Tone.Buffer._downloadQueue.splice(index, 1);
	}
};

/**
 *  Loads a url using XMLHttpRequest.
 *  @param {String} url
 *  @param {Function} onload
 *  @param {Function} onerror
 *  @param {Function} onprogress
 *  @return {XMLHttpRequest}
 */
Tone.Buffer.load = function(url, onload, onerror){
	//default
	onload = Tone.defaultArg(onload, Tone.noOp);

	// test if the url contains multiple extensions
	var matches = url.match(/\[(.+\|?)+\]$/);
	if (matches){
		var extensions = matches[1].split("|");
		var extension = extensions[0];
		for (var i = 0; i < extensions.length; i++){
			if (Tone.Buffer.supportsType(extensions[i])){
				extension = extensions[i];
				break;
			}
		}
		url = url.replace(matches[0], extension);
	}

	function onError(e){
		Tone.Buffer._removeFromDownloadQueue(request);
		Tone.Buffer.emit("error", e);
		if (onerror){
			onerror(e);
		} else {
			throw e;
		}
	}

	function onProgress(){
		//calculate the progress
		var totalProgress = 0;
		for (var i = 0; i < Tone.Buffer._downloadQueue.length; i++){
			totalProgress += Tone.Buffer._downloadQueue[i].progress;
		}
		Tone.Buffer.emit("progress", totalProgress / Tone.Buffer._downloadQueue.length);
	}

	var request = new XMLHttpRequest();
	request.open("GET", Tone.Buffer.baseUrl + url, true);
	request.responseType = "arraybuffer";
	//start out as 0
	request.progress = 0;

	Tone.Buffer._downloadQueue.push(request);

	request.addEventListener("load", function(){

		if (request.status === 200){
			Tone.context.decodeAudioData(request.response).then(function(buff){

				request.progress = 1;
				onProgress();
				onload(buff);

				Tone.Buffer._removeFromDownloadQueue(request);
				if (Tone.Buffer._downloadQueue.length === 0){
					//emit the event at the end
					Tone.Buffer.emit("load");
				}
			}).catch(function(){
				Tone.Buffer._removeFromDownloadQueue(request);
				onError("Tone.Buffer: could not decode audio data: "+url);
			});
		} else {
			onError("Tone.Buffer: could not locate file: "+url);
		}
	});
	request.addEventListener("error", onError);

	request.addEventListener("progress", function(event){
		if (event.lengthComputable){
			//only go to 95%, the last 5% is when the audio is decoded
			request.progress = (event.loaded / event.total) * 0.95;
			onProgress();
		}
	});

	request.send();

	return request;
};

/**
 *  Stop all of the downloads in progress
 *  @return {Tone.Buffer}
 *  @static
 */
Tone.Buffer.cancelDownloads = function(){
	Tone.Buffer._downloadQueue.slice().forEach(function(request){
		Tone.Buffer._removeFromDownloadQueue(request);
		request.abort();
	});
	return Tone.Buffer;
};

/**
 *  Checks a url's extension to see if the current browser can play that file type.
 *  @param {String} url The url/extension to test
 *  @return {Boolean} If the file extension can be played
 *  @static
 *  @example
 * Tone.Buffer.supportsType("wav"); //returns true
 * Tone.Buffer.supportsType("path/to/file.wav"); //returns true
 */
Tone.Buffer.supportsType = function(url){
	var extension = url.split(".");
	extension = extension[extension.length - 1];
	var response = document.createElement("audio").canPlayType("audio/"+extension);
	return response !== "";
};

/**
 *  Returns a Promise which resolves when all of the buffers have loaded
 *  @return {Promise}
 */
Tone.loaded = function(){
	var onload, onerror;
	function removeEvents(){
		//remove the events when it's resolved
		Tone.Buffer.off("load", onload);
		Tone.Buffer.off("error", onerror);
	}
	return new Promise(function(success, fail){
		onload = function(){
			success();
		};
		onerror = function(){
			fail();
		};
		//add the event listeners
		Tone.Buffer.on("load", onload);
		Tone.Buffer.on("error", onerror);
	}).then(removeEvents).catch(function(e){
		removeEvents();
		throw new Error(e);
	});
};

export default Tone.Buffer;

