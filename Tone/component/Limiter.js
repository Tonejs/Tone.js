define(["Tone/core/Tone", "Tone/component/Compressor", "Tone/core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.Limiter will limit the loudness of an incoming signal.
	 *         It is composed of a Tone.Compressor with a fast attack
	 *         and release. Limiters are commonly used to safeguard against
	 *         signal clipping. Unlike a compressor, limiters do not provide
	 *         smooth gain reduction and almost completely prevent
	 *         additional gain above the threshold.
	 *
	 *  @extends {Tone.AudioNode}
	 *  @constructor
	 *  @param {number} threshold The theshold above which the limiting is applied.
	 *  @example
	 *  var limiter = new Tone.Limiter(-6);
	 */
	Tone.Limiter = function(){

		var options = Tone.defaults(arguments, ["threshold"], Tone.Limiter);
		Tone.AudioNode.call(this);

		/**
		 *  the compressor
		 *  @private
		 *  @type {Tone.Compressor}
		 */
		this._compressor = this.input = this.output = new Tone.Compressor({
			"attack" : 0.001,
			"decay" : 0.001,
			"threshold" : options.threshold
		});

		/**
		 * The threshold of of the limiter
		 * @type {Decibel}
		 * @signal
		 */
		this.threshold = this._compressor.threshold;

		this._readOnly("threshold");
	};

	Tone.extend(Tone.Limiter, Tone.AudioNode);

	/**
	 *  The default value
	 *  @type {Object}
	 *  @const
	 *  @static
	 */
	Tone.Limiter.defaults = {
		"threshold" : -12
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.Limiter} this
	 */
	Tone.Limiter.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._compressor.dispose();
		this._compressor = null;
		this._writable("threshold");
		this.threshold = null;
		return this;
	};

	return Tone.Limiter;
});
