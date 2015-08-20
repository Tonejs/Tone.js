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
	 *  var soundflower = new Tone.ExternalInput().connect()
	 *  
	 *  Tone.ExternalInput.onload = function(){
	 *  	motu.start();
	 *  	selectSoundflower(Tone.ExternalInput.sourceList);
	 *  }
	 *  	
	 *  function selectSoundflower(sources){
	 *  	for(var i = 0; i < sources.length; i++){
	 *  		if(sources[i].label === "soundflower"){
	 *  			soundflowerIn.inputNum = i;
	 *  			soundflowerIn.start();
	 *  		}
	 *  	}
	 *  };
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
			Tone.ExternalInput._getSources();
		} 

		/**
		 * The input source position in Tone.ExternalInput.sourceList. 
		 * Set before ExternalInput.start().
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
	 * Start the stream
	 * @private
	 */
	Tone.ExternalInput.prototype._start = function(){
		if (this.inputNum < Tone.ExternalInput.sourceList.length && this.inputNum > -1) {
			this._constraints = {
				audio : {
					optional : [{ sourceId: Tone.ExternalInput.sourceList[this.inputNum].id}]
				}
			};
		}
		navigator.getUserMedia(this._constraints, 
			this._onStream.bind(this), this._onStreamError.bind(this));
	};

	/**
	 * Stops the stream. Stream can be restarted with a different inputNum.
	 * @private
	 */
	Tone.ExternalInput.prototype._stop = function(){
		this._stream.stop();
		return this;
	};

	/**
	 * called when the stream is successfully setup
	 * @param  {LocalMediaStream} stream
	 * @private
	 */
	Tone.ExternalInput.prototype._onStream = function(stream){
		this._stream = stream;
		// Wrap a MediaStreamSourceNode around the live input stream.
		this._mediaStream = this.context.createMediaStreamSource(stream);
		this._mediaStream.connect(this.output);
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
	 * @return {Tone.Microphone} this
	 */
	Tone.ExternalInput.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		if (this._mediaStream){
			this._mediaStream.disconnect();
			this._mediaStream = null;
		}
		this._stream = null;
		this._constraints = null;
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
	 * Enumerates sourcelist
	 * @return {Array} sourcelist
	 * @private
	 */
	//call _getsources only when it is first needed

	Tone.ExternalInput._getSources = function(){
		if(Tone.ExternalInput.sourceList.length === 0){
			if(Tone.ExternalInput._canGetSources){
				MediaStreamTrack.getSources(function (media_sources){
					for(var i = 0, max = media_sources.length; i < max; i++) {
						Tone.ExternalInput.sourceList[i] = media_sources[i];
					}
					Tone.ExternalInput.onload();
				});
			} else{
				window.setTimeout(function(){
					Tone.ExternalInput.onload();
				}, 10);
			}
		} else {
			return Tone.ExternalInput.sourceList;
		}
	};

	/**
	 * Callback when all of the devices have been enumerated to 
	 * allow for proper device selection after list of sources 
	 * has been returned.
	 * @static
	 * @function
	 * @example
	 * var audioIn = new Tone.AudioIn(2);
	 * //invoked when browser returns list of available sources
	 * Tone.AudioIn.onload = function(){
	 * 	audioIn.start();
	 * }
	 */
	Tone.ExternalInput.onload = Tone.noOp;


	//polyfill
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || 
		navigator.mozGetUserMedia || navigator.msGetUserMedia;

	return Tone.ExternalInput;
});