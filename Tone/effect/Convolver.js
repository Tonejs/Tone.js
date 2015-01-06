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
	Tone.Convolver = function(url){

		Tone.Effect.apply(this, arguments);

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
		this._buffer = new Tone.Buffer(url, this.setBuffer.bind(this));

		this.connectEffect(this._convolver);
	};

	Tone.extend(Tone.Convolver, Tone.Effect);

	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Convolver.defaults = {};

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
		var self = this;
		this._buffer.load(url, function(buff){
			self.setBuffer(buff);
			if (callback){
				callback(this);
			}
		});
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