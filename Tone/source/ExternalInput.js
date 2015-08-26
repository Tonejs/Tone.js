define(["Tone/core/Tone", "Tone/source/Source"], function(Tone){

	"use strict";

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
	 *  var motu = new Tone.ExternalInput(3);
	 *  
	 *  motu.open(function(){
	 *  	motu.start(10);
	 *  });
	 */

	Tone.ExternalInput = function(){

		var options = this.optionsObject(arguments, ["inputNum"], Tone.ExternalInput.defaults);
		Tone.Source.call(this, options);

		/**
		 *  @type {MediaStreamAudioSourceNode}
		 *  @private
		 */
		this._mediaStream = null;
		
		/**
		 *  @type {LocalMediaStream}
		 *  @private
		 */
		this._stream = null;
		
		/**
		 *  @type {Object}
		 *  @private
		 */
		this._constraints = {"audio" : true};

		if(Tone.ExternalInput.sourceList.length === 0){
			Tone.ExternalInput.getSources(function(){});
		}

		/**
		 * The input source position in Tone.ExternalInput.sourceList. 
		 * Set before ExternalInput.open().
		 * @type {[type]}
		 */
		this.inputNum = options.inputNum;

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
	 * @private
	 */
	Tone.ExternalInput.prototype._getUserMedia = function(callback){
		this._constraints = {
			audio : {
				optional : [{sourceId: Tone.ExternalInput.sourceList[this.inputNum].id}]
			}
		};
		navigator.getUserMedia(this._constraints, function(stream){
			this._onStream(stream);
			callback();
		}.bind(this), function(err){
			callback(err);
		});
	};

	/**
	 *  Open the media stream 
	 *  @param  {function =} callback The callback function to 
	 *                       execute when the stream is open
	 *  @return {Tone.ExternalInput} this
	 */
	Tone.ExternalInput.prototype.open = function(callback){
		if(Tone.ExternalInput.sourceList.length === 0){
			Tone.ExternalInput.getSources(function(){
				this._getUserMedia(callback);
			}.bind(this));
		} else {
			this._getUserMedia(callback);
		}
	};

	/**
	 *  Close the media stream
	 *  @return {Tone.ExternalInput} this
	 */
	Tone.ExternalInput.prototype.close = function(){
		if(this._stream){
			this._stream.stop();
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
	};

	/**
	 *  Stops the stream. Stream can be restarted with a different inputNum.
	 *  @private
	 */
	Tone.ExternalInput.prototype._stop = function(time){
		this._gate.gain.setValueAtTime(0, time);
		return this;
	};

	/**
	 * called when the stream is successfully setup
	 * @param  {LocalMediaStream} stream
	 * @private
	 */
	Tone.ExternalInput.prototype._onStream = function(stream){
		this._stream = stream;
		//Wrap a MediaStreamSourceNode around the live input stream.
		this._mediaStream = this.context.createMediaStreamSource(stream);
		//Connect the MediaStreamSourceNode to a gate gain node
		this._gate = this.context.createGain();
		this._gate.gain.value = 0;
		this._mediaStream.connect(this._gate);
		this._gate.connect(this.output);
	};
	/**
	 * called on error
	 * @param  {Error} e 
	 * @private
	 */
	Tone.ExternalInput.prototype._onStreamError = function(e){
		console.error(e);
	};

	/**
	 * Clean up.
	 * @return {Tone.ExternalInput} this
	 */
	Tone.ExternalInput.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		if (this._mediaStream){
			this._mediaStream.disconnect();
			this._mediaStream = null;
		}
		this._stream = null;
		this._constraints = null;
		this.inputNum = null;
		return this;
	};

	///////////////////////////////////////////////////////////////////////////
	// STATIC METHODS
	///////////////////////////////////////////////////////////////////////////

	/**
	 * The array of available sources, different depending on whether connection is secure
	 * @type {Array}
	 */
	Tone.ExternalInput.sourceList = [];

	/**
	 * indicates whether browser supports MediaStreamTrack.getSources (i.e. Chrome vs Firefox)
	 * @type {Boolean}
	 * @private
	 */
	Tone.ExternalInput._canGetSources = Tone.prototype.isFunction(MediaStreamTrack.getSources);

	/**
	 *  Populates the source list. Accepts a callback 
	 *  @param  {function=} callback Callback to be executed after populating list 
	 *  @return {Array} Tone.ExternalInput.sourceList
	 *  @example
	 *  var soundflower = new Tone.ExternalInput();
	 *  Tone.ExternalInput.getSources(function(){
	 *  	selectSoundflower(Tone.ExternalInput.sourceList);
	 *  });
	 *
	 * function selectSoundflower(sources){
	 *  	for(var i = 0; i < sources.length; i++){
	 *  		if(sources[i].label === "soundflower"){
	 *  			soundflower.inputNum = i;
	 *  			soundflower.open(function(){
	 *  				soundflower.start();
	 *  			});
	 *  		}
	 *  	}
	 *  };
	 */
	Tone.ExternalInput.getSources = function(callback){
		if(Tone.ExternalInput.sourceList.length === 0 && Tone.ExternalInput._canGetSources){
			MediaStreamTrack.getSources(function (media_sources){
				for(var i = 0, max = media_sources.length; i < max; i++) {
					if(media_sources[i].kind === "audio"){
					Tone.ExternalInput.sourceList[i] = media_sources[i];
					}
				}
				callback();
			});
		} else {
			callback();
		}
		return Tone.ExternalInput.sourceList;
	};

	//polyfill
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || 
		navigator.mozGetUserMedia || navigator.msGetUserMedia;

	return Tone.ExternalInput;
});