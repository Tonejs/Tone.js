define(["Tone/core/Tone", "Tone/core/Buffer", "Tone/effect/Effect"], function(Tone){

	"use strict";

	/**
	 *  @class  Convolver wrapper for reverb and emulation.
	 *  
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {string|AudioBuffer=} url
	 *  @example
	 *  var convolver = new Tone.Convolver("./path/to/ir.wav");
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
		this._buffer = new Tone.Buffer(url, function(buffer){
			this.buffer = buffer;
		}.bind(this));

		this.connectEffect(this._convolver);
	};

	Tone.extend(Tone.Convolver, Tone.Effect);

	/**
	 *  The convolver's buffer
	 *  @memberOf Tone.Convolver#
	 *  @type {AudioBuffer}
	 *  @name buffer
	 */
	Object.defineProperty(Tone.Convolver.prototype, "buffer", {
		get : function(){
			return this._buffer.get();
		},
		set : function(buffer){
			this._buffer.set(buffer);
			this._convolver.buffer = buffer;
		}
	});

	/**
	 *  Load an impulse response url as an audio buffer.
	 *  Decodes the audio asynchronously and invokes
	 *  the callback once the audio buffer loads.
	 *  @param {string} url the url of the buffer to load.
	 *                      filetype support depends on the
	 *                      browser.
	 *  @param  {function=} callback
	 *  @returns {Tone.Convolver} `this`
	 */
	Tone.Convolver.prototype.load = function(url, callback){
		this._buffer.load(url, function(buff){
			this.buffer = buff;
			if (callback){
				callback();
			}
		}.bind(this));
		return this;
	};

	/**
	 *  dispose and disconnect
	 *  @returns {Tone.Convolver} `this`
	 */
	Tone.Convolver.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._convolver.disconnect();
		this._convolver = null;
		this._buffer.dispose();
		this._buffer = null;
		return this;
	}; 

	return Tone.Convolver;
});