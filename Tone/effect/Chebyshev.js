define(["Tone/core/Tone", "Tone/effect/Effect"], function(Tone){

	"use strict";

	/**
	 *  @class A Chebyshev waveshaper. Good for making different types of distortion sounds.
	 *         Note that odd orders sound very different from even ones. order = 1 is no change. 
	 *         http://music.columbia.edu/cmc/musicandcomputers/chapter4/04_06.php
	 *
	 *  @extends {Tone.Effect}
	 *  @constructor
	 *  @param {number} order the order of the chebyshev polynomial
	 */
	Tone.Chebyshev = function(){

		var options = this.optionsObject(arguments, ["order"], Tone.Chebyshev.defaults);
		Tone.Effect.call(this);

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._shaper = this.context.createWaveShaper();

		/**
		 *  the curve that the waveshaper uses
		 *  @type {Float32Array}
		 *  @private
		 */
		this._curve = new Float32Array(4096);

		this.connectEffect(this._shaper);
		this.setOrder(options.order);
		this.setOversample(options.oversample);
	};

	Tone.extend(Tone.Chebyshev, Tone.Effect);

	/**
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Chebyshev.defaults = {
		"order" : 1,
		"oversample" : "none"
	};

	/**
	 *  set the order of the Chebyshev polynomial i.e.
	 *  order = 2 -> 2x^2 + 1
	 *  order = 3 -> 4x^3 + 3x
	 *  @param   {number} order the order of the Chebyshev nominal range of 1 - 100
	 */
	Tone.Chebyshev.prototype.setOrder = function(order) {
		var len = this._curve.length;
		for (var i = 0; i < len; ++i) {
			var x = i * 2 / len - 1;
			if (x === 0){
				//should output 0 when input is 0
				this._curve[i] = 0;
			} else {
				this._curve[i] = this._getCoefficient(x, order, {});
			}
		}
		this._shaper.curve = this._curve;
	};

	/**
	 *  get the coefficient for that degree
	 *  @param {number} x the x value
	 *  @param   {number} degree 
	 *  @param {Object} memo memoize the computed value. 
	 *                       this speeds up computation greatly. 
	 *  @return  {number}       the coefficient 
	 *  @private
	 */
	Tone.Chebyshev.prototype._getCoefficient = function(x, degree, memo){
		if (memo.hasOwnProperty(degree)){
			return memo[degree];
		} else if (degree === 0){
			memo[degree] = 0;
		} else if (degree === 1){
			memo[degree] = x;
		} else {
			memo[degree] = 2 * x * this._getCoefficient(x, degree - 1, memo) - this._getCoefficient(x, degree - 2, memo);
		}
		return memo[degree];
	};

	/**
	 *  set the oversampling
	 *  @param {string} oversampling can either be "none", "2x" or "4x"
	 */
	Tone.Chebyshev.prototype.setOversample = function(oversampling) {
		this._shaper.oversample = oversampling;
	};

	/**
	 *  clean up
	 */
	Tone.Chebyshev.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._shaper.disconnect();
		this._shaper = null;
		this._curve = null;
	};

	return Tone.Chebyshev;
});