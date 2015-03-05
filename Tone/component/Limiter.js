define(["Tone/core/Tone", "Tone/component/Compressor"], function(Tone){

	"use strict";

	/**
	 *  @class A limiter on the incoming signal. Composed of a Tone.Compressor
	 *         with a fast attack and decay value. 
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} threshold the threshold in decibels
	 *  @example
	 *  var limiter = new Tone.Limiter(-6);
	 */
	Tone.Limiter = function(threshold){

		/**
		 *  the compressor
		 *  @private
		 *  @type {Tone.Compressor}
		 */
		this._compressor = this.input = this.output = new Tone.Compressor({
			"attack" : 0.0001,
			"decay" : 0.0001,
			"threshold" : threshold
		});

		/**
		 * The threshold of of the limiter
		 * @type {AudioParam}
		 */
		this.threshold = this._compressor.threshold;
	};

	Tone.extend(Tone.Limiter);

	/**
	 *  clean up
	 *  @returns {Tone.Limiter} `this`
	 */
	Tone.Limiter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._compressor.dispose();
		this._compressor = null;
		this.threshold = null;
		return this;
	};

	return Tone.Limiter;
});