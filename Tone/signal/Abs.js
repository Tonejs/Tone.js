define(["Tone/core/Tone", "Tone/signal/Threshold", "Tone/signal/Negate", "Tone/signal/EqualZero"], function(Tone){

	/**
	 *  return the absolute value of an incoming signal
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} value
	 */
	Tone.Abs = function(value){
		Tone.call(this);

		/**
		 *  @type {Tone.Threshold}
		 *  @private
		 */
		this._thresh = new Tone.Threshold(0);
		
		/**
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._negate = new Tone.Negate();

		/**
		 *  @type {Tone.EqualZero}
		 *  @private
		 */
		this._not = new Tone.EqualZero();

		/**
		 *  @type {GainNode}
		 *  @private
		 */
		this._positive = this.context.createGain();

		/**
		 *  @type {GainNode}
		 *  @private
		 */
		this._negative = this.context.createGain();

		this.input.connect(this._thresh);
		//two routes, one positive, one negative
		this.chain(this.input, this._positive, this.output);
		this.chain(this.input, this._negate, this._negative, this.output);
		//the switching logic
		this._thresh.connect(this._positive.gain);
		this._positive.gain.value = 0;
		this.chain(this._thresh, this._not, this._negative.gain);
		this._negative.gain.value = 0;
	};

	Tone.extend(Tone.Abs);

	/**
	 *  dispose method
	 */
	Tone.Abs.prototype.dispose = function(){
		this._thresh.dispose();
		this._negate.dispose();
		this._not.dispose();
		this._positive.disconnect();
		this._negative.disconnect();
		this._input.disconnect();
		this._output.disconnect();
		this._thresh = null;
		this._negate = null;
		this._not = null;
		this._positive = null;
		this._negative = null;
		this._input = null;
		this._output = null;
	}; 

	return Tone.Abs;
});