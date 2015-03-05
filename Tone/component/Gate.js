define(["Tone/core/Tone", "Tone/component/Follower", "Tone/signal/GreaterThan"], function(Tone){

	"use strict";

	/**
	 *  @class  Only pass signal through when it's signal exceeds the
	 *          specified threshold.
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} [threshold = -40] the threshold in Decibels
	 *  @param {Tone.Time} [attack = 0.1] the follower's attack time
	 *  @param {Tone.Time} [release = 0.1] the follower's release time
	 *  @example
	 *  var gate = new Tone.Gate(-30, 0.2, 0.3);
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
	 * The threshold of the gate in decibels
	 * @memberOf Tone.Gate#
	 * @type {number}
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
	 * @type {Tone.Time}
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
	 * @type {Tone.Time}
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

	return Tone.Gate;
});