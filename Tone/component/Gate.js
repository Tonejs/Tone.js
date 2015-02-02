define(["Tone/core/Tone", "Tone/component/Follower", "Tone/signal/GreaterThan"], function(Tone){

	"use strict";

	/**
	 *  @class  Only pass signal through when it's signal exceeds the
	 *          specified threshold.
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} [threshold = -40] the threshold in Decibels
	 *  @param {number} [attackTime = 0.1] the follower's attacktime
	 *  @param {number} [releaseTime = 0.1] the follower's release time
	 */
	Tone.Gate = function(){
		
		Tone.call(this);
		var options = this.optionsObject(arguments, ["threshold", "attack", "release"], Tone.Gate.defaults);

		/**
		 *  @type {Tone.Follower}
		 *  @private
		 */
		this._follower = new Tone.Follower(options.attack, options.release);

		/**
		 *  @type {Tone.GreaterThan}
		 *  @private
		 */
		this._gt = new Tone.GreaterThan(this.dbToGain(options.threshold));

		//the connections
		this.input.connect(this.output);
		//the control signal
		this.input.chain(this._gt, this._follower, this.output.gain);
	};

	Tone.extend(Tone.Gate);

	/**
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.Gate.defaults = {
		"attack" : 0.1, 
		"release" : 0.1,
		"threshold" : -40
	};

	/**
	 *  set the gating threshold
	 *  @param {number} thresh the gating threshold
	 *  @returns {Tone.Gate} `this`
	 */
	Tone.Gate.prototype.setThreshold = function(thresh){
		this._gt.setValue(this.dbToGain(thresh));
		return this;
	};

	/**
	 *  @returns {number} the gating threshold in db
	 */
	Tone.Gate.prototype.getThreshold = function(){
		return this.gainToDb(this._gt.getValue());
	};

	/**
	 *  set attack time of the follower
	 *  @param {Tone.Time} attackTime
	 *  @returns {Tone.Gate} `this`
	 */
	Tone.Gate.prototype.setAttack = function(attackTime){
		this._follower.setAttack(attackTime);
		return this;
	};

	/**
	 *  @returns {Tone.Time} the attack time
	 */
	Tone.Gate.prototype.getAttack = function(){
		return this._follower.attack;
	};

	/**
	 *  set attack time of the follower
	 *  @param {Tone.Time} releaseTime
	 *  @returns {Tone.Gate} `this`
	 */
	Tone.Gate.prototype.setRelease = function(releaseTime){
		this._follower.setRelease(releaseTime);
		return this;
	};

	/**
	 *  @returns {Tone.Time} the release time
	 */
	Tone.Gate.prototype.getRelease = function(){
		return this._follower.release;
	};

	/**
	 *  dispose
	 *  @returns {Tone.Gate} `this`
	 */
	Tone.Gate.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._follower.dispose();
		this._gt.dispose();
		this._follower = null;
		this._gt = null;
		return this;
	};

	/**
	 * the threshold of the gate in decibels
	 * @memberOf Tone.Gate#
	 * @type {number}
	 * @name threshold
	 */
	Tone._defineGetterSetter(Tone.Gate, "threshold");

	/**
	 * the attack speed of the gate
	 * @memberOf Tone.Gate#
	 * @type {Tone.Time}
	 * @name attack
	 */
	Tone._defineGetterSetter(Tone.Gate, "attack");

	/**
	 * the release speed of the gate
	 * @memberOf Tone.Gate#
	 * @type {Tone.Time}
	 * @name release
	 */
	Tone._defineGetterSetter(Tone.Gate, "release");

	return Tone.Gate;
});