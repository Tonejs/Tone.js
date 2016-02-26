define(["Tone/core/Tone", "Tone/source/Source", "Tone/core/Gain"], function(Tone){

	"use strict";

	//polyfill for getUserMedia
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || 
		navigator.mozGetUserMedia || navigator.msGetUserMedia;

	/**
	 *  @class  Tone.ExternalInput is a WebRTC Audio Input. Check 
	 *          [Media Stream API Support](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)
	 *          to see which browsers are supported. As of
	 *          writing this, Chrome, Firefox, and Opera 
	 *          support Media Stream. Chrome allows enumeration 
	 *          of the sources, and access to device name over a 
	 *          secure (HTTPS) connection. See [https://simpl.info](https://simpl.info/getusermedia/sources/index.html) 
	 *          vs [http://simple.info](https://simpl.info/getusermedia/sources/index.html) 
	 *          on a Chrome browser for the difference.
	 *         
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number} [inputNum=0] If multiple inputs are present, select the input number. Chrome only.
	 *  @example
	 * //select the third input
	 * var motu = new Tone.ExternalInput(3);
	 * 
	 * //opening the input asks the user to activate their mic
	 * motu.open(function(){
	 * 	//opening is activates the microphone
	 * 	//starting lets audio through
	 * 	motu.start(10);
	 * });
	 */

	Tone.ExternalInput = function(){

		var options = this.optionsObject(arguments, ["inputNum"], Tone.ExternalInput.defaults);
		Tone.Source.call(this, options);

		/**
		 *  The MediaStreamNode 
		 *  @type {MediaStreamAudioSourceNode}
		 *  @private
		 */
		this._mediaStream = null;
		
		/**
		 *  The media stream created by getUserMedia.
		 *  @type {LocalMediaStream}
		 *  @private
		 */
		this._stream = null;
		
		/**
		 *  The constraints argument for getUserMedia
		 *  @type {Object}
		 *  @private
		 */
		this._constraints = {"audio" : true};

		/**
		 *  The input source position in Tone.ExternalInput.sources. 
		 *  Set before ExternalInput.open().
		 *  @type {Number}
		 *  @private
		 */
		this._inputNum = options.inputNum;

		/**
		 *  Gates the input signal for start/stop. 
		 *  Initially closed.
		 *  @type {GainNode}
		 *  @private
		 */
		this._gate = new Tone.Gain(0).connect(this.output);
	};

	Tone.extend(Tone.ExternalInput, Tone.Source);

	/**
	 * the default parameters
	 * @type {Object}
	 */
	Tone.ExternalInput.defaults = {
		"inputNum" : 0
	};

	/**
	 * wrapper for getUserMedia function
	 * @param {function} callback
	 * @private
	 */
	Tone.ExternalInput.prototype._getUserMedia = function(callback){
		if (!Tone.ExternalInput.supported){
			throw new Error("browser does not support 'getUserMedia'");
		}
		if (Tone.ExternalInput.sources[this._inputNum]){
			this._constraints = {
				audio : {
					optional : [{sourceId: Tone.ExternalInput.sources[this._inputNum].id}]
				}
			};
		}
		navigator.getUserMedia(this._constraints, function(stream){
			this._onStream(stream);
			callback();
		}.bind(this), function(err){
			callback(err);
		});
	};

	/**
	 * called when the stream is successfully setup
	 * @param  {LocalMediaStream} stream
	 * @private
	 */
	Tone.ExternalInput.prototype._onStream = function(stream){
		if (!this.isFunction(this.context.createMediaStreamSource)){
			throw new Error("browser does not support the 'MediaStreamSourceNode'");
		}
		//can only start a new source if the previous one is closed
		if (!this._stream){
			this._stream = stream;
			//Wrap a MediaStreamSourceNode around the live input stream.
			this._mediaStream = this.context.createMediaStreamSource(stream);
			//Connect the MediaStreamSourceNode to a gate gain node
			this._mediaStream.connect(this._gate);
		} 
	};

	/**
	 *  Open the media stream 
	 *  @param  {function=} callback The callback function to 
	 *                       execute when the stream is open
	 *  @return {Tone.ExternalInput} this
	 */
	Tone.ExternalInput.prototype.open = function(callback){
		callback = this.defaultArg(callback, Tone.noOp);
		Tone.ExternalInput.getSources(function(){
			this._getUserMedia(callback);
		}.bind(this));
		return this;
	};

	/**
	 *  Close the media stream
	 *  @return {Tone.ExternalInput} this
	 */
	Tone.ExternalInput.prototype.close = function(){
		if(this._stream){
			var track = this._stream.getTracks()[this._inputNum];
			if (!this.isUndef(track)){
				track.stop();
			} 
			this._stream = null;
		}
		return this;
	};

	/**
	 *  Start the stream
	 *  @private
	 */
	Tone.ExternalInput.prototype._start = function(time){
		time = this.toSeconds(time);
		this._gate.gain.setValueAtTime(1, time);
		return this;
	};

	/**
	 *  Stops the stream.
	 *  @private
	 */
	Tone.ExternalInput.prototype._stop = function(time){
		time = this.toSeconds(time);
		this._gate.gain.setValueAtTime(0, time);
		return this;
	};

	/**
	 * Clean up.
	 * @return {Tone.ExternalInput} this
	 */
	Tone.ExternalInput.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this.close();
		if (this._mediaStream){
			this._mediaStream.disconnect();
			this._mediaStream = null;
		}
		this._constraints = null;
		this._gate.dispose();
		this._gate = null;
		return this;
	};

	///////////////////////////////////////////////////////////////////////////
	// STATIC METHODS
	///////////////////////////////////////////////////////////////////////////

	/**
	 * The array of available sources, different depending on whether connection is secure
	 * @type {Array}
	 * @static
	 */
	Tone.ExternalInput.sources = [];

	/**
	 * indicates whether browser supports MediaStreamTrack.getSources (i.e. Chrome vs Firefox)
	 * @type {Boolean}
	 * @private
	 */
	Tone.ExternalInput._canGetSources = !Tone.prototype.isUndef(window.MediaStreamTrack) && Tone.prototype.isFunction(MediaStreamTrack.getSources);

	/**
	 *  If getUserMedia is supported by the browser.
	 *  @type  {Boolean}
	 *  @memberOf Tone.ExternalInput#
	 *  @name supported
	 *  @static
	 *  @readOnly
	 */
	Object.defineProperty(Tone.ExternalInput, "supported", {
		get : function(){
			return Tone.prototype.isFunction(navigator.getUserMedia);
		}
	});

	/**
	 *  Populates the source list. Invokes the callback with an array of 
	 *  possible audio sources.
	 *  @param  {function=} callback Callback to be executed after populating list 
	 *  @return {Tone.ExternalInput} this
	 *  @static
	 *  @example
	 * var soundflower = new Tone.ExternalInput();
	 * Tone.ExternalInput.getSources(selectSoundflower);
	 *
	 * function selectSoundflower(sources){
	 * 	for(var i = 0; i < sources.length; i++){
	 * 		if(sources[i].label === "soundflower"){
	 * 			soundflower.inputNum = i;
	 * 			soundflower.open(function(){
	 * 				soundflower.start();
	 * 			});
	 * 			break;
	 * 		}
	 * 	}
	 * };
	 */
	Tone.ExternalInput.getSources = function(callback){
		if(Tone.ExternalInput.sources.length === 0 && Tone.ExternalInput._canGetSources){
			MediaStreamTrack.getSources(function (media_sources){
				for(var i = 0; i < media_sources.length; i++) {
					if(media_sources[i].kind === "audio"){
						Tone.ExternalInput.sources[i] = media_sources[i];
					}
				}
				callback(Tone.ExternalInput.sources);
			});
		} else {
			callback(Tone.ExternalInput.sources);
		}
		return this;
	};

	return Tone.ExternalInput;
});