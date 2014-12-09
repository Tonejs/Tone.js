define(["Tone/core/Tone"], function(Tone){

	"use strict";
	/**
	 *  @class  Buffer loading and storage. Tone.Buffer will load and store the buffers
	 *          in the same data structure they were given in the argument. If given
	 *          a string, this.buffer will equal an AudioBuffer. If constructed
	 *          with an array, the samples will be placed in an array in the same
	 *          order. 
	 *  
	 *  @constructor 
	 *  @param {Object|Array|string} url the urls to be loaded
	 */
	
	Tone.Buffer = function(){

		var options = this.optionsObject(arguments, ["url", "callback"], Tone.Buffer.defaults);

		/**
		*  stores the loaded AudioBuffers in the same format they were
		*  given in the constructor
		*  @type {Object|Array|AudioBuffer}
		*/
		this.buffers = null;

		var self = this;
		if(typeof options.url !== "object") {
			this._loadBuffer(options.url, options.callback); //it's a string
		} else { //otherwise it's an array of object map
			this._loadBuffers(options.url, function(buffer){
				self.buffer = buffer;
				options.callback(buffer);
			});
		}

	};

	Tone.extend(Tone.Buffer);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Buffer.defaults = {
		"url" : "",
		"callback" : function(){}
	};

	/**
	 *  makes an xhr reqest for the selected url
	 *  Load the audio file as an audio buffer.
	 *  Decodes the audio asynchronously and invokes
	 *  the callback once the audio buffer loads.
	 *  @private
	 *  @param {string} url the url of the buffer to load.
	 *                      filetype support depends on the
	 *                      browser.
	 *  @param {function} callback function
	 */
	Tone.Buffer.prototype._loadBuffer = function(url, callback){
	
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";
		// decode asynchronously
		var self = this;
		request.onload = function() {
			self.context.decodeAudioData(request.response, function(buff) {
				if(!buff){
					console.log("error in buffer data");
					return;
				}
				callback(buff);
			});
		};
		request.onerror = function() {
			console.log("error loading buffer");
		};
		//send the request
		request.send();
	};

	/**
	 * Loads multiple buffers given a collection of urls
	 * @private
	 * @param  {Object|Array}   urls     keyVal object of urls or Array
	 * @param  {Function} callback
	 */
	Tone.Buffer.prototype._loadBuffers = function(urls, callback){
		var loadCounter = {
			total : 0,
			loaded : 0
		};
		var incrementCount = function(i, buffers){
			var key = i;
			return function(loadedBuffer){
				buffers[key] = loadedBuffer;
				loadCounter.loaded++;
				if (loadCounter.total === loadCounter.loaded){
					callback(buffers);
				}
			};
		};
		if (Array.isArray(urls)){
			var len = urls.length;
			loadCounter.total = len;
			this.buffer = new Array(len);
			for (var i = 0; i < len; i++){
				this._loadBuffer(urls[i], incrementCount(i, this.buffer));
			}
		} else {
			loadCounter.total = Object.keys(urls).length;
			this.buffer = {};
			for (var key in urls){
				this._loadBuffer(urls[key], incrementCount(key, this.buffer));
			}
		}
	};

	/**
	 *  dispose and disconnect
	 */
	Tone.Buffer.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.buffer = null;
	};

	return Tone.Buffer;
});