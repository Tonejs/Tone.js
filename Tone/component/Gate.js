define(["Tone/core/Tone", "Tone/component/Follower", "Tone/signal/GreaterThan"], function(Tone){

	"use strict";

	/**
	 *  @class  Only pass signal through when it's signal exceeds the
	 *          specified threshold.
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [thresh = -40] the threshold in Decibels
	 *  @param {number=} [attackTime = 0.1] the follower's attacktime
	 *  @param {number=} [releaseTime = 0.1] the follower's release time
	 */
	Tone.Gate = function(thresh, attackTime, releaseTime){
		Tone.call(this);

		//default values
		thresh = this.defaultArg(thresh, -40);
		attackTime = this.defaultArg(attackTime, 0.1);
		releaseTime = this.defaultArg(releaseTime, 0.2);

		/**
		 *  @type {Tone.Follower}
		 *  @private
		 */
		this._follower = new Tone.Follower(attackTime, releaseTime);

		/**
		 *  @type {Tone.GreaterThan}
		 *  @private
		 */
		this._gt = new Tone.GreaterThan(this.dbToGain(thresh));

		//the connections
		this.chain(this.input, this.output);
		//the control signal
		this.chain(this.input, this._gt, this._follower, this.output.gain);
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
	 *  set attack time of the follower
	 *  @param {Tone.Time} attackTime
	 */
	Tone.Gate.prototype.setAttack = function(attackTime){
		this._follower.setAttack(attackTime);
	};

	/**
	 *  set attack time of the follower
	 *  @param {Tone.Time} releaseTime
	 */
	Tone.Gate.prototype.setRelease = function(releaseTime){
		this._follower.setRelease(releaseTime);
	};

	/**
	 *  dispose
	 */
	Tone.Gate.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._follower.dispose();
		this._gt.dispose();
		this._follower = null;
		this._gt = null;
	};

	return Tone.Gate;
});