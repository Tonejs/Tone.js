define(["Tone/core/Tone", "Tone/core/Emitter"], function(Tone){

	"use strict";

	/**
	 *  @class  Buffer loading and storage. Tone.Buffer is used internally by all 
	 *          classes that make requests for audio files such as Tone.Player,
	 *          Tone.Sampler and Tone.Convolver.
	 *          <br><br>
	 *          Aside from load callbacks from individual buffers, Tone.Buffer 
	 *  		provides static methods which keep track of the loading progress 
	 *  		of all of the buffers. These methods are Tone.Buffer.onload, Tone.Buffer.onprogress,
	 *  		and Tone.Buffer.onerror. 
	 *
	 *  @constructor 
	 *  @extends {Tone}
	 *  @param {AudioBuffer|string} url The url to load, or the audio buffer to set. 
	 *  @param {function=} onload A callback which is invoked after the buffer is loaded. 
	 *                            It's recommended to use Tone.Buffer.onload instead 
	 *                            since it will give you a callback when ALL buffers are loaded.
	 *  @example
	 * var buffer = new Tone.Buffer("path/to/sound.mp3", function(){
	 * 	//the buffer is now available.
	 * 	var buff = buffer.get();
	 * });
	 */
	Tone.Buffer = function(){

		var options = this.optionsObject(arguments, ["url", "onload"], Tone.Buffer.defaults);

		/**
		 *  stores the loaded AudioBuffer
		 *  @type {AudioBuffer}
		 *  @private
		 */
		this._buffer = null;

		/**
		 *  indicates if the buffer should be reversed or not
		 *  @type {boolean}
		 *  @private
		 */
		this._reversed = options.reverse;

		/**
		 *  The url of the buffer. <code>undefined</code> if it was 
		 *  constructed with a buffer
		 *  @type {string}
		 *  @readOnly
		 */
		this.url = undefined;

		/**
		 *  Indicates if the buffer is loaded or not. 
		 *  @type {boolean}
		 *  @readOnly
		 */
		this.loaded = false;

		/**
		 *  The callback to invoke when everything is loaded. 
		 *  @type {function}
		 */
		this.onload = options.onload.bind(this, this);

		if (options.url instanceof AudioBuffer || options.url instanceof Tone.Buffer){
			this.set(options.url);
			this.onload(this);
		} else if (this.isString(options.url)){
			this.url = options.url;
			Tone.Buffer._addToQueue(options.url, this);
		}
	};

	Tone.extend(Tone.Buffer);

	/**
	 *  the default parameters
	 *  @type {Object}
	 */
	Tone.Buffer.defaults = {
		"url" : undefined,
		"onload" : Tone.noOp,
		"reverse" : false
	};

	/**
	 *  Pass in an AudioBuffer or Tone.Buffer to set the value
	 *  of this buffer.
	 *  @param {AudioBuffer|Tone.Buffer} buffer the buffer
	 *  @returns {Tone.Buffer} this
	 */
	Tone.Buffer.prototype.set = function(buffer){
		if (buffer instanceof Tone.Buffer){
			this._buffer = buffer.get();
		} else {
			this._buffer = buffer;
		}
		this.loaded = true;
		return this;
	};

	/**
	 *  @return {AudioBuffer} The audio buffer stored in the object.
	 */
	Tone.Buffer.prototype.get = function(){
		return this._buffer;
	};

	/**
	 *  Load url into the buffer. 
	 *  @param {String} url The url to load
	 *  @param {Function=} callback The callback to invoke on load. 
	 *                              don't need to set if `onload` is
	 *                              already set.
	 *  @returns {Tone.Buffer} this
	 */
	Tone.Buffer.prototype.load = function(url, callback){
		this.url = url;
		this.onload = this.defaultArg(callback, this.onload);
		Tone.Buffer._addToQueue(url, this);
		return this;
	};

	/**
	 *  dispose and disconnect
	 *  @returns {Tone.Buffer} this
	 */
	Tone.Buffer.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		Tone.Buffer._removeFromQueue(this);
		this._buffer = null;
		this.onload = Tone.Buffer.defaults.onload;
		return this;
	};

	/**
	 * The duration of the buffer. 
	 * @memberOf Tone.Buffer#
	 * @type {number}
	 * @name duration
	 * @readOnly
	 */
	Object.defineProperty(Tone.Buffer.prototype, "duration", {
		get : function(){
			if (this._buffer){
				return this._buffer.duration;
			} else {
				return 0;
			}
		},
	});

	/**
	 *  Reverse the buffer.
	 *  @private
	 *  @return {Tone.Buffer} this
	 */
	Tone.Buffer.prototype._reverse = function(){
		if (this.loaded){
			for (var i = 0; i < this._buffer.numberOfChannels; i++){
				Array.prototype.reverse.call(this._buffer.getChannelData(i));
			}
		}
		return this;
	};

	/**
	 * Reverse the buffer.
	 * @memberOf Tone.Buffer#
	 * @type {boolean}
	 * @name reverse
	 */
	Object.defineProperty(Tone.Buffer.prototype, "reverse", {
		get : function(){
			return this._reversed;
		},
		set : function(rev){
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
	Tone.Buffer._queue = [];

	/**
	 *  the array of current downloads
	 *  @type {Array}
	 *  @private
	 */
	Tone.Buffer._currentDownloads = [];

	/**
	 *  the total number of downloads
	 *  @type {number}
	 *  @private
	 */
	Tone.Buffer._totalDownloads = 0;

	/**
	 *  the maximum number of simultaneous downloads
	 *  @static
	 *  @type {number}
	 */
	Tone.Buffer.MAX_SIMULTANEOUS_DOWNLOADS = 6;
	
	/**
	 *  Adds a file to be loaded to the loading queue
	 *  @param   {string}   url      the url to load
	 *  @param   {function} callback the callback to invoke once it's loaded
	 *  @private
	 */
	Tone.Buffer._addToQueue = function(url, buffer){
		Tone.Buffer._queue.push({
			url : url,
			Buffer : buffer,
			progress : 0,
			xhr : null
		});
		this._totalDownloads++;
		Tone.Buffer._next();
	};

	/**
	 *  Remove an object from the queue's (if it's still there)
	 *  Abort the XHR if it's in progress
	 *  @param {Tone.Buffer} buffer the buffer to remove
	 *  @private
	 */
	Tone.Buffer._removeFromQueue = function(buffer){
		var i;
		for (i = 0; i < Tone.Buffer._queue.length; i++){
			var q = Tone.Buffer._queue[i];
			if (q.Buffer === buffer){
				Tone.Buffer._queue.splice(i, 1);
			}
		}
		for (i = 0; i < Tone.Buffer._currentDownloads.length; i++){
			var dl = Tone.Buffer._currentDownloads[i];
			if (dl.Buffer === buffer){
				Tone.Buffer._currentDownloads.splice(i, 1);
				dl.xhr.abort();
				dl.xhr.onprogress = null;
				dl.xhr.onload = null;
				dl.xhr.onerror = null;
			}
		}
	};

	/**
	 *  load the next buffer in the queue
	 *  @private
	 */
	Tone.Buffer._next = function(){
		if (Tone.Buffer._queue.length > 0){
			if (Tone.Buffer._currentDownloads.length < Tone.Buffer.MAX_SIMULTANEOUS_DOWNLOADS){
				var next = Tone.Buffer._queue.shift();
				Tone.Buffer._currentDownloads.push(next);
				next.xhr = Tone.Buffer.load(next.url, function(buffer){
					//remove this one from the queue
					var index = Tone.Buffer._currentDownloads.indexOf(next);
					Tone.Buffer._currentDownloads.splice(index, 1);
					next.Buffer.set(buffer);
					if (next.Buffer._reversed){
						next.Buffer._reverse();
					}
					next.Buffer.onload(next.Buffer);
					Tone.Buffer._onprogress();
					Tone.Buffer._next();
				});
				next.xhr.onprogress = function(event){
					next.progress = event.loaded / event.total;
					Tone.Buffer._onprogress();
				};
				next.xhr.onerror = function(e){
					Tone.Buffer.trigger("error", e);
				};
			} 
		} else if (Tone.Buffer._currentDownloads.length === 0){
			Tone.Buffer.trigger("load");
			//reset the downloads
			Tone.Buffer._totalDownloads = 0;
		}
	};

	/**
	 *  internal progress event handler
	 *  @private
	 */
	Tone.Buffer._onprogress = function(){
		var curretDownloadsProgress = 0;
		var currentDLLen = Tone.Buffer._currentDownloads.length;
		var inprogress = 0;
		if (currentDLLen > 0){
			for (var i = 0; i < currentDLLen; i++){
				var dl = Tone.Buffer._currentDownloads[i];
				curretDownloadsProgress += dl.progress;
			}
			inprogress = curretDownloadsProgress;
		}
		var currentDownloadProgress = currentDLLen - inprogress;
		var completed = Tone.Buffer._totalDownloads - Tone.Buffer._queue.length - currentDownloadProgress;
		Tone.Buffer.trigger("progress", completed / Tone.Buffer._totalDownloads);
	};

	/**
	 *  Makes an xhr reqest for the selected url then decodes
	 *  the file as an audio buffer. Invokes
	 *  the callback once the audio buffer loads.
	 *  @param {string} url The url of the buffer to load.
	 *                      filetype support depends on the
	 *                      browser.
	 *  @param {function} callback The function to invoke when the url is loaded. 
	 *  @returns {XMLHttpRequest} returns the XHR
	 */
	Tone.Buffer.load = function(url, callback){
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";
		// decode asynchronously
		request.onload = function() {
			Tone.context.decodeAudioData(request.response, function(buff) {
				if(!buff){
					throw new Error("could not decode audio data:" + url);
				}
				callback(buff);
			});
		};
		//send the request
		request.send();
		return request;
	};

	/**
	 *  @deprecated us on([event]) instead
	 */
	Object.defineProperty(Tone.Buffer, "onload", {
		set : function(cb){
			console.warn("Tone.Buffer.onload is deprecated, use Tone.Buffer.on('load', callback)");
			Tone.Buffer.on("load", cb);
		}
	});

	Object.defineProperty(Tone.Buffer, "onprogress", {
		set : function(cb){
			console.warn("Tone.Buffer.onprogress is deprecated, use Tone.Buffer.on('progress', callback)");
			Tone.Buffer.on("progress", cb);
		}
	});

	Object.defineProperty(Tone.Buffer, "onerror", {
		set : function(cb){
			console.warn("Tone.Buffer.onerror is deprecated, use Tone.Buffer.on('error', callback)");
			Tone.Buffer.on("error", cb);
		}
	});

	return Tone.Buffer;
});