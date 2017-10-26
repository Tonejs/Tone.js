define(["Tone/core/Tone", "Tone/signal/Scale", "Tone/signal/Pow"], function(Tone){

	/**
	 *  @class  Performs an exponential scaling on an input signal.
	 *          Scales a NormalRange value [0,1] exponentially
	 *          to the output range of outputMin to outputMax.
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {number} [outputMin=0] The output value when the input is 0.
	 *  @param {number} [outputMax=1]	The output value when the input is 1.
	 *  @param {number} [exponent=2] The exponent which scales the incoming signal.
	 *  @example
	 * var scaleExp = new Tone.ScaleExp(0, 100, 2);
	 * var signal = new Tone.Signal(0.5).connect(scaleExp);
	 */
	Tone.ScaleExp = function(outputMin, outputMax, exponent){

		Tone.SignalBase.call(this);

		/**
		 *  scale the input to the output range
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._scale = this.output = new Tone.Scale(outputMin, outputMax);

		/**
		 *  @private
		 *  @type {Tone.Pow}
		 *  @private
		 */
		this._exp = this.input = new Tone.Pow(Tone.defaultArg(exponent, 2));

		this._exp.connect(this._scale);
	};

	Tone.extend(Tone.ScaleExp, Tone.SignalBase);

	/**
	 * Instead of interpolating linearly between the <code>min</code> and
	 * <code>max</code> values, setting the exponent will interpolate between
	 * the two values with an exponential curve.
	 * @memberOf Tone.ScaleExp#
	 * @type {number}
	 * @name exponent
	 */
	Object.defineProperty(Tone.ScaleExp.prototype, "exponent", {
		get : function(){
			return this._exp.value;
		},
		set : function(exp){
			this._exp.value = exp;
		}
	});

	/**
	 * The minimum output value. This number is output when
	 * the value input value is 0.
	 * @memberOf Tone.ScaleExp#
	 * @type {number}
	 * @name min
	 */
	Object.defineProperty(Tone.ScaleExp.prototype, "min", {
		get : function(){
			return this._scale.min;
		},
		set : function(min){
			this._scale.min = min;
		}
	});

	/**
	 * The maximum output value. This number is output when
	 * the value input value is 1.
	 * @memberOf Tone.ScaleExp#
	 * @type {number}
	 * @name max
	 */
	Object.defineProperty(Tone.ScaleExp.prototype, "max", {
		get : function(){
			return this._scale.max;
		},
		set : function(max){
			this._scale.max = max;
		}
	});

	/**
	 *  Clean up.
	 *  @returns {Tone.ScaleExp} this
	 */
	Tone.ScaleExp.prototype.dispose = function(){
		Tone.SignalBase.prototype.dispose.call(this);
		this._scale.dispose();
		this._scale = null;
		this._exp.dispose();
		this._exp = null;
		return this;
	};

	return Tone.ScaleExp;
});
