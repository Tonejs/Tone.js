define(["Tone/core/Tone", "Tone/core/Buffer", "Tone/effect/StereoEffect"], function(Tone){

  "use strict";
	/**
   *  @class  Convolver wrapper for reverb and emulation.
   *  NB: currently, this class only supports 1 buffer member.
   *  Future iterations will include a this.buffers collection for multi buffer mode.
   *  @constructor
   *  @extends {Tone.Effect}
   *  @param {string|Object=} 
   *  @param {function} callback function
   */
  Tone.Convolver = function(){

  //get all of the defaults
  var options = this.optionsObject(arguments, ["url", "onload"], Tone.Convolver.defaults);
  //connections
	Tone.Effect.call(this, options);

  /**
	 * convolver node
	 * @type {[type]}
	 * @private
	 */
	this._convolver = this.context.createConvolver();
	/**
	 * convolution buffers
	 * @type {Array} Array of ArrayBuffers
	 * @private
	 */
	this._buffer = null;

	//if there is a url, load it. 
	if (!this.isUndef(options.url)){
	  this.load(options.url, options.onload);
    //the connections
  }

  this.connectEffect(this._convolver);
  };

  Tone.extend(Tone.Convolver, Tone.Effect);
  
  /**
   *  @static
   *  @type {Object}
  */
  Tone.Convolver.defaults = {
	"url": null,
	"onload": null,
  };

  /**
   *  Load the impulse response url as an audio buffer.
   *  Decodes the audio asynchronously and invokes
   *  the callback once the audio buffer loads.
   * @param {string} url the url of the buffer to load.
   *        filetype support depends on the
   *        browser.
   * @param  {function(Tone.Convolver)=} callback
   */
  Tone.Convolver.prototype.load = function(url, callback){
	var self = this;
	if (!self._buffer){
	  new Tone.Buffer({
		"url"  : url,
		"callback" :  function (buffer){
		  self.setBuffer(buffer);
		  if (callback){
			callback(self);
		  }
		}
	  });
	} else if (callback){
	  callback(self);
	}
  };

  /**
   *  set the buffer
   *
   *  @param {AudioBuffer} buffer the buffer which the player will play.
   *                              note: if you switch the buffer after
   *                              the player is already started, it will not
   *                              take effect until the next time the player
   *                              is started.
   */
  Tone.Convolver.prototype.setBuffer = function(buffer){
	this._buffer = buffer;
	this._convolver.buffer = this._buffer;
  };

  /**
   *  set multiple parameters at once with an object
   *  @param {Object} params the parameters as an object
   */
  Tone.Convolver.prototype.set = function(params){
	if (!this.isUndef(params.bypass)) this.setBypass(params.bypass);
  };

	/**
   *  dispose and disconnect
   */
  Tone.Convolver.prototype.dispose = function(){
	Tone.StereoEffect.prototype.dispose.call(this);
	if (this._source !== null) {
	  this._source.disconnect();
	  this._source = null;
	}
	this._buffer = null;
  };
  return Tone.Convolver;
});