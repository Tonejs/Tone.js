define(["Tone/core/Tone", "Tone/core/Buffer", "Tone/effect/Effect"], function(Tone){

	"use strict";

	/**
	 *  @class  Convolver wrapper for reverb and emulation.
	 *          NB: currently, this class only supports 1 buffer member.
	 *          Future iterations will include a this.buffers collection for multi buffer mode.
	 *  
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {string|Object|AudioBuffer=} url
	 *  @param {function=} callback function
	 */
	Tone.Convolver = function(){

		//get all of the defaults
		var options = this.optionsObject(arguments, ["url", "onload"], Tone.Convolver.defaults);
		//connections
		Tone.Effect.call(this, options);

	  	/**
		 *  convolver node
		 *  @type {ConvolverNode}
		 *  @private
		 */
		this._convolver = this.context.createConvolver();

		/**
		 *  the convolution buffer
		 *  @type {Tone.Buffer}
		 *  @private
		 */
		this._buffer = new Tone.Buffer(options.url, this._onload.bind(this, options.onload));

		this.connectEffect(this._convolver);
	};

	Tone.extend(Tone.Convolver, Tone.Effect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Convolver.defaults = {
		"onload": function(){},
	};

	/**
	 *  Load the impulse response url as an audio buffer.
	 *  Decodes the audio asynchronously and invokes
	 *  the callback once the audio buffer loads.
	 *  @param {string} url the url of the buffer to load.
	 *                      filetype support depends on the
	 *                      browser.
	 *  @param  {function(Tone.Convolver)=} callback
	 */
	Tone.Convolver.prototype.load = function(url, callback){
		this._buffer.load(url, this._onload.bind(this, callback));
	};

	/**
	 *  internal onload event, called when the buffer is loaded
	 *  @param {function} callback pass in the callback to invoke
	 *  @private
	 */
	Tone.Convolver.prototype._onload = function(callback){
		this.setBuffer(this._buffer.get());
		callback(this);
	};

	/**
	 *  set the buffer
	 *  @param {AudioBuffer} buffer the impulse response
	 */
	Tone.Convolver.prototype.setBuffer = function(buffer){
		this._buffer.set(buffer);
		this._convolver.buffer = this._buffer.get();
	};

	/**
	 *  set multiple parameters at once with an object
	 *  @param {Object} params the parameters as an object
	 */
	Tone.Convolver.prototype.set = function(params){
		if (!this.isUndef(params.buffer)) this.setBuffer(params.buffer);
		Tone.Effect.prototype.set.call(this, params);
	};

	/**
	 *  dispose and disconnect
	 */
	Tone.Convolver.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._convolver.disconnect();
		this._convolver = null;
		this._buffer.dispose();
		this._buffer = null;
	}; 

	return Tone.Convolver;
});