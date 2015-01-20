define(["Tone/core/Tone", "Tone/signal/Scale", "Tone/signal/Pow"], 
function(Tone){
	
	/**
	 *  @class  performs an exponential scaling on an input signal.
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
	 *  set the exponential scaling curve
	 *  @param {number} exp the exponent to raise the incoming signal to
	 */
	Tone.ScaleExp.prototype.setExponent = function(exp){
		this._exp.setExponent(exp);
	};

	/**
	 *  set the minimum output value
	 *  @param {number} min the minimum output value
	 */
	Tone.ScaleExp.prototype.setMin = function(min){
		this._scale.setMin(min);
	};

	/**
	 * @return {number} the minimum output value
	 */
	Tone.ScaleExp.prototype.getMin = function(){
		return this._scale.getMin();
	};

	/**
	 *  set the minimum output value
	 *  @param {number} min the minimum output value
	 */
	Tone.ScaleExp.prototype.setMax = function(max){
		this._scale.setMax(max);
	};

	/**
	 * @return {number} the minimum output value
	 */
	Tone.ScaleExp.prototype.getMax = function(){
		return this._scale.getMax();
	};

	/**
	 *  clean up
	 */
	Tone.ScaleExp.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._scale.dispose();
		this._scale = null;
		this._exp.dispose();
		this._exp = null;
	}; 


	return Tone.ScaleExp;
});
