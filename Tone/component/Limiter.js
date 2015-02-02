define(["Tone/core/Tone", "Tone/component/Compressor"], function(Tone){

	"use strict";

	/**
	 *  @class A limiter on the incoming signal. Composed of a Tone.Compressor
	 *         with a fast attack and decay value. 
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} threshold the threshold in decibels
	 */
	Tone.Limiter = function(threshold){

		/**
		 *  the compressor
		 *  @private
		 *  @type {Tone.Compressor}
		 */
		this._compressor = this.input = this.output = new Tone.Compressor({
			"attack" : 0.001,
			"decay" : 0.001,
			"threshold" : threshold
		});
	};

	Tone.extend(Tone.Limiter);

	/**
	 *  set the threshold value
	 *  @param {number} value the threshold in decibels
	 *  @returns {Tone.Limiter} `this`
	 */
	Tone.Limiter.prototype.setThreshold = function(value) {
		this._compressor.setThreshold(value);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.Limiter} `this`
	 */
	Tone.Limiter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._compressor.dispose();
		this._compressor = null;
		return this;
	};

	return Tone.Limiter;
});