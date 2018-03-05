define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/signal/WaveShaper"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.ChebyShev is a Chebyshev waveshaper, an effect which is good 
	 *         for making different types of distortion sounds.
	 *         Note that odd orders sound very different from even ones, 
	 *         and order = 1 is no change. 
	 *         Read more at [music.columbia.edu](http://music.columbia.edu/cmc/musicandcomputers/chapter4/04_06.php).
	 *
	 *  @extends {Tone.Effect}
	 *  @constructor
	 *  @param {Positive|Object} [order] The order of the chebyshev polynomial. Normal range between 1-100. 
	 *  @example
	 * //create a new cheby
	 * var cheby = new Tone.Chebyshev(50);
	 * //create a monosynth connected to our cheby
	 * synth = new Tone.MonoSynth().connect(cheby);
	 */
	Tone.Chebyshev = function(){

		var options = Tone.defaults(arguments, ["order"], Tone.Chebyshev);
		Tone.Effect.call(this, options);

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._shaper = new Tone.WaveShaper(4096);

		/**
		 * holds onto the order of the filter
		 * @type {number}
		 * @private
		 */
		this._order = options.order;

		this.connectEffect(this._shaper);
		this.order = options.order;
		this.oversample = options.oversample;
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
	 * The order of the Chebyshev polynomial which creates
	 * the equation which is applied to the incoming 
	 * signal through a Tone.WaveShaper. The equations
	 * are in the form:<br>
	 * order 2: 2x^2 + 1<br>
	 * order 3: 4x^3 + 3x <br>
	 * @memberOf Tone.Chebyshev#
	 * @type {Positive}
	 * @name order
	 */
	Object.defineProperty(Tone.Chebyshev.prototype, "order", {
		get : function(){
			return this._order;
		},
		set : function(order){
			this._order = order;
			var curve = new Array(4096);
			var len = curve.length;
			for (var i = 0; i < len; ++i){
				var x = i * 2 / len - 1;
				if (x === 0){
					//should output 0 when input is 0
					curve[i] = 0;
				} else {
					curve[i] = this._getCoefficient(x, order, {});
				}
			}
			this._shaper.curve = curve;
		} 
	});

	/**
	 * The oversampling of the effect. Can either be "none", "2x" or "4x".
	 * @memberOf Tone.Chebyshev#
	 * @type {string}
	 * @name oversample
	 */
	Object.defineProperty(Tone.Chebyshev.prototype, "oversample", {
		get : function(){
			return this._shaper.oversample;
		},
		set : function(oversampling){
			this._shaper.oversample = oversampling;
		} 
	});

	/**
	 *  Clean up. 
	 *  @returns {Tone.Chebyshev} this
	 */
	Tone.Chebyshev.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._shaper.dispose();
		this._shaper = null;
		return this;
	};

	return Tone.Chebyshev;
});
