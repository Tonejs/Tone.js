define(["Tone/core/Tone", "Tone/signal/Abs", "Tone/signal/Negate", "Tone/signal/Multiply"], function(Tone){

	/**
	 *  @class  Follow the envelope of the incoming signal
	 *          Note: due to the nature of low-pass filters, 
	 *          there is some rippling which is proportional
	 *          to the smoothTime
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Tone.Time=} [smoothTime = 0.1] 
	 */
	Tone.Follower = function(smoothTime){

		Tone.call(this);

		//default values
		smoothTime = this.defaultArg(smoothTime, 0.1);

		/**
		 *  @type {Tone.Abs}
		 *  @private
		 */
		this._abs = new Tone.Abs();

		/**
		 *  the lowpass filter which smooths the input
		 *  @type {BiquadFilterNode}
		 *  @private
		 */
		this._filter = this.context.createBiquadFilter();
		this._filter.type = "lowpass";
		this._filter.frequency.value = this.secondsToFrequency(smoothTime);
		this._filter.Q.value = -10;

		//the connections
		this.chain(this.input, this._abs, this._filter, this.output);
	};

	Tone.extend(Tone.Follower);

	/**
	 *  dispose
	 */
	Tone.Follower.prototype.dispose = function(){
		this._filter.disconnect();
		this.input.disconnect();
		this.output.disconnect();
		this._abs.dispose();
		this._filter = null;
		this.input = null;
		this.output = null;
		this._abs = null;
	};

	return Tone.Follower;
});