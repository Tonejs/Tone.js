define(["Tone/core/Tone"], function(Tone){

	"use strict";
	/**
	 *  @class  Simple Buffer for use with Player, Convolver, and Sampler objects.
	 *  
	 *  @constructor 
	 *  @param {Object|Array|string} keyval map of urls for loading into buffers | Array of url strings | url string   
	 *                                If a url is passed in, it will be converted to Object. loaded
	 *                                and invoke the callback if it also passed
	 *                                in.
	 */
	
	Tone.Buffer = function(){

		var options = this.optionsObject(arguments, ["url", "callback"], Tone.Buffer.defaults);

		/**
		*  the Object array of raw arraybuffers. 
		*  If a single string is passed into the constructor, this._buffers will remain empty
		*  @type {Object|Array|string}
		*/
		this._buffers = {};

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
		"callback" : function(){ return; }
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
		var buffers = this._buffers;
		var incrementCount = function(i){
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
			loadCounter.total = urls.length;
			for (var i = 0; i < urls.length; i++){
				this._loadBuffer(urls[i], incrementCount(i));
			}
		} else {
			loadCounter.total = Object.keys(urls).length;
			for (var key in urls){
				this._loadBuffer(urls[key], incrementCount(key));
			}
		}
	};

	/**
	 *  dispose and disconnect
	 */
	Tone.Buffer.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._buffers = null;
	};

	return Tone.Buffer;
});