define(["Tone/core/Tone", "Tone/component/Follower", "Tone/signal/GreaterThan"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Gate only passes a signal through when the incoming 
	 *          signal exceeds a specified threshold. To do this, Gate uses 
	 *          a Tone.Follower to follow the amplitude of the incoming signal. 
	 *          A common implementation of this class is a [Noise Gate](https://en.wikipedia.org/wiki/Noise_gate).
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Decibels|Object} [threshold] The threshold above which the gate will open. 
	 *  @param {Time=} attack The follower's attack time
	 *  @param {Time=} release The follower's release time
	 *  @example
	 * var gate = new Tone.Gate(-30, 0.2, 0.3).toMaster();
	 * var mic = new Tone.Microphone().connect(gate);
	 * //the gate will only pass through the incoming 
	 * //signal when it's louder than -30db
	 */
	Tone.Gate = function(){
		
		this.createInsOuts(1, 1);
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
	 * The threshold of the gate in decibels
	 * @memberOf Tone.Gate#
	 * @type {Decibels}
	 * @name threshold
	 */
	Object.defineProperty(Tone.Gate.prototype, "threshold", {
		get : function(){
			return this.gainToDb(this._gt.value);
		}, 
		set : function(thresh){
			this._gt.value = this.dbToGain(thresh);
		}
	});

	/**
	 * The attack speed of the gate
	 * @memberOf Tone.Gate#
	 * @type {Time}
	 * @name attack
	 */
	Object.defineProperty(Tone.Gate.prototype, "attack", {
		get : function(){
			return this._follower.attack;
		}, 
		set : function(attackTime){
			this._follower.attack = attackTime;
		}
	});

	/**
	 * The release speed of the gate
	 * @memberOf Tone.Gate#
	 * @type {Time}
	 * @name release
	 */
	Object.defineProperty(Tone.Gate.prototype, "release", {
		get : function(){
			return this._follower.release;
		}, 
		set : function(releaseTime){
			this._follower.release = releaseTime;
		}
	});

	/**
	 *  Clean up. 
	 *  @returns {Tone.Gate} this
	 */
	Tone.Gate.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._follower.dispose();
		this._gt.dispose();
		this._follower = null;
		this._gt = null;
		return this;
	};

	return Tone.Gate;
});