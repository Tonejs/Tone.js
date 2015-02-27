define(["Tone/core/Tone", "Tone/signal/Scale", "Tone/signal/Pow"], 
function(Tone){
	
	/**
	 *  @class  Performs an exponential scaling on an input signal.
	 *          Scales a normal gain range [0,1] exponentially
	 *          to the output range of outputMin to outputMax.
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {number} [outputMin=0]
	 *  @param {number} [outputMax=1]
	 *  @param {number} [exponent=2] the exponent which scales the incoming signal
	 */
	Tone.ScaleExp = function(outputMin, outputMax, exponent){

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
		this._exp = this.input = new Tone.Pow(this.defaultArg(exponent, 2));

		this._exp.connect(this._scale);
	};

	Tone.extend(Tone.ScaleExp, Tone.SignalBase);

	/**
	 * The minimum output value.
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
	 * The minimum output value.
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
	 * The maximum output value.
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
	 *  clean up
	 *  @returns {Tone.ScaleExp} `this`
	 */
	Tone.ScaleExp.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._scale.dispose();
		this._scale = null;
		this._exp.dispose();
		this._exp = null;
		return this;
	}; 


	return Tone.ScaleExp;
});
