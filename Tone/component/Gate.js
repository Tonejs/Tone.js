define(["Tone/core/Tone", "Tone/component/Follower", "Tone/signal/GreaterThan"], function(Tone){

	/**
	 *  @class  Only pass signal through when it's signal exceeds the
	 *          specified threshold.
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [thresh = -40] the threshold in Decibels
	 *  @param {number=} [smoothTime = 0.1] the amount of smoothing applied to the 
	 *                               		incoming signal
	 */
	Tone.Gate = function(thresh, smoothTime){
		Tone.call(this);

		//default values
		thresh = this.defaultArg(thresh, -40);
		smoothTime = this.defaultArg(smoothTime, 0.1);

		/**
		 *  @type {Tone.Follower}
		 *  @private
		 */
		this._follower = new Tone.Follower(smoothTime);

		/**
		 *  @type {Tone.GreaterThan}
		 *  @private
		 */
		this._gt = new Tone.GreaterThan(this.dbToGain(thresh));

		//the connections
		this.chain(this.input, this.output);
		//the control signal
		this.chain(this.input, this._follower, this._gt, this.output.gain);
		this.output.gain.value = 0;
	};

	Tone.extend(Tone.Gate);

	/**
	 *  set the gating threshold
	 *  @param {number} thresh the gating threshold
	 */
	Tone.Gate.prototype.setThreshold = function(thresh){
		this._gt.setValue(this.dbToGain(thresh));
	};

	/**
	 *  set the amount of smoothing applied to the incoming signal
	 *  @param {Tone.Time} smoothTime 
	 */
	Tone.Gate.prototype.setSmoothTime = function(smoothTime){
		this._follower.setSmoothTime(smoothTime);
	};

	/**
	 *  dispose
	 */
	Tone.Gate.prototype.dispose = function(){
		this._follower.dispose();
		this._gt.dispose();
		this.input.disconnect();
		this.output.disconnect();
		this._follower = null;
		this._gt = null;
		this.input = null;
		this.output = null;
	};

	return Tone.Gate;
});