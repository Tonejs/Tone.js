define(["Tone/core/Tone"], function(Tone){

	"use strict";

	/**
	 *  @class A thin wrapper around the DynamicsCompressorNode
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} [threshold=-24] threshold in decibels
	 *  @param {number} [ratio=12] gain reduction ratio
	 *  @example
	 *  var comp = new Tone.Compressor(-30, 3);
	 */
	Tone.Compressor = function(){

		var options = this.optionsObject(arguments, ["threshold", "ratio"], Tone.Compressor.defaults);

		/**
		 *  the compressor node
		 *  @type {DynamicsCompressorNode}
		 *  @private
		 */
		this._compressor = this.context.createDynamicsCompressor();

		/**
		 *  the input and output
		 */
		this.input = this.output = this._compressor;

		/**
		 *  the threshold vaue
		 *  @type {AudioParam}
		 */
		this.threshold = this._compressor.threshold;

		/**
		 *  The attack parameter
		 *  @type {Tone.Signal}
		 */
		this.attack = new Tone.Signal(this._compressor.attack, Tone.Signal.Units.Time);

		/**
		 *  The release parameter
		 *  @type {Tone.Signal}
		 */
		this.release = new Tone.Signal(this._compressor.release, Tone.Signal.Units.Time);

		/**
		 *  The knee parameter
		 *  @type {AudioParam}
		 */
		this.knee = this._compressor.knee;

		/**
		 *  The ratio value
		 *  @type {AudioParam}
		 */
		this.ratio = this._compressor.ratio;

		//set the defaults
		this.set(options);
	};

	Tone.extend(Tone.Compressor);

	/**
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Compressor.defaults = {
		"ratio" : 12,
		"threshold" : -24,
		"release" : 0.25,
		"attack" : 0.003,
		"knee" : 30
	};

	/**
	 *  clean up
	 *  @returns {Tone.Compressor} `this`
	 */
	Tone.Compressor.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._compressor.disconnect();
		this._compressor = null;
		this.attack.dispose();
		this.attack = null;
		this.release.dispose();
		this.release = null;
		this.threshold = null;
		this.ratio = null;
		this.knee = null;
		return this;
	};

	return Tone.Compressor;
});