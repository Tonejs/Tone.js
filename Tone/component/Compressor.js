define(["Tone/core/Tone"], function(Tone){

	"use strict";

	/**
	 *  @class A thin wrapper around the DynamicsCompressorNode
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} [threshold=-24] threshold in decibels
	 *  @param {number} [ratio=12] gain reduction ratio
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
		 *  the input
		 */
		this.input = this._compressor;

		/**
		 *  the output
		 */
		this.output = this._compressor;

		/**
		 *  the threshold vaue
		 *  @type {AudioParam}
		 */
		this.threshold = this._compressor.threshold;

		/**
		 *  the attack vaue
		 *  @type {AudioParam}
		 */
		this.attack = this._compressor.attack;

		/**
		 *  the release vaue
		 *  @type {AudioParam}
		 */
		this.release = this._compressor.release;

		/**
		 *  the knee vaue
		 *  @type {AudioParam}
		 */
		this.knee = this._compressor.knee;

		/**
		 *  the ratio vaue
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
	 *  bulk setter
	 *  @param {Object} params
	 */
	Tone.Compressor.prototype.set = function(params){
		if (!this.isUndef(params.attack)) this.setAttack(params.attack);
		if (!this.isUndef(params.release)) this.setRelease(params.release);
		if (!this.isUndef(params.threshold)) this.setThreshold(params.threshold);
		if (!this.isUndef(params.knee)) this.setKnee(params.knee);
		if (!this.isUndef(params.ratio)) this.setRatio(params.ratio);
	};

	/**
	 *  set the attack time
	 *  @param {Tone.Time} time the attack time
	 */
	Tone.Compressor.prototype.setAttack = function(time) {
		this._compressor.attack.value = this.toSeconds(time);
	};

	/**
	 *  set the release time
	 *  @param {Tone.Time} time the release time
	 */
	Tone.Compressor.prototype.setRelease = function(time) {
		this._compressor.release.value = this.toSeconds(time);
	};

	/**
	 *  set the threshold value
	 *  @param {number} value the threshold in decibels
	 */
	Tone.Compressor.prototype.setThreshold = function(value) {
		this._compressor.threshold.value = value;
	};

	/**
	 *  set the knee value
	 *  @param {number} knee
	 */
	Tone.Compressor.prototype.setKnee = function(knee) {
		this._compressor.knee.value = knee;
	};

	/**
	 *  set the ratio value
	 *  @param {number} ratio
	 */
	Tone.Compressor.prototype.setRatio = function(ratio) {
		this._compressor.ratio.value = ratio;
	};

	/**
	 *  clean up
	 */
	Tone.Compressor.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._compressor.disconnect();
		this._compressor = null;
		this.attack = null;
		this.release = null;
		this.threshold = null;
		this.ratio = null;
		this.knee = null;
	};

	return Tone.Compressor;
});