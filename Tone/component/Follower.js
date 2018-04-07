define(["Tone/core/Tone", "Tone/signal/Abs", "Tone/signal/Subtract", "Tone/signal/Multiply",
	"Tone/signal/Signal", "Tone/signal/WaveShaper", "Tone/type/Type", "Tone/core/Delay", "Tone/core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Follower is a  crude envelope follower which will follow
	 *          the amplitude of an incoming signal.
	 *          Take care with small (< 0.02) attack or decay values
	 *          as follower has some ripple which is exaggerated
	 *          at these values. Read more about envelope followers (also known
	 *          as envelope detectors) on [Wikipedia](https://en.wikipedia.org/wiki/Envelope_detector).
	 *
	 *  @constructor
	 *  @extends {Tone.AudioNode}
	 *  @param {Time|Object} [attack] The rate at which the follower rises.
	 *  @param {Time=} release The rate at which the folower falls.
	 *  @example
	 * var follower = new Tone.Follower(0.2, 0.4);
	 */
	Tone.Follower = function(){

		var options = Tone.defaults(arguments, ["attack", "release"], Tone.Follower);
		Tone.AudioNode.call(this);
		this.createInsOuts(1, 1);

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
		this._filter.frequency.value = 0;
		this._filter.Q.value = -100;

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._frequencyValues = new Tone.WaveShaper();

		/**
		 *  @type {Tone.Subtract}
		 *  @private
		 */
		this._sub = new Tone.Subtract();

		/**
		 *  @type {Tone.Delay}
		 *  @private
		 */
		this._delay = new Tone.Delay(this.blockTime);

		/**
		 *  this keeps it far from 0, even for very small differences
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._mult = new Tone.Multiply(10000);

		/**
		 *  @private
		 *  @type {number}
		 */
		this._attack = options.attack;

		/**
		 *  @private
		 *  @type {number}
		 */
		this._release = options.release;

		//the smoothed signal to get the values
		this.input.chain(this._abs, this._filter, this.output);
		//the difference path
		this._abs.connect(this._sub, 0, 1);
		this._filter.chain(this._delay, this._sub);
		//threshold the difference and use the thresh to set the frequency
		this._sub.chain(this._mult, this._frequencyValues, this._filter.frequency);
		//set the attack and release values in the table
		this._setAttackRelease(this._attack, this._release);
	};

	Tone.extend(Tone.Follower, Tone.AudioNode);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Follower.defaults = {
		"attack" : 0.05,
		"release" : 0.5
	};

	/**
	 *  sets the attack and release times in the wave shaper
	 *  @param   {Time} attack
	 *  @param   {Time} release
	 *  @private
	 */
	Tone.Follower.prototype._setAttackRelease = function(attack, release){
		var minTime = this.blockTime;
		attack = Tone.Time(attack).toFrequency();
		release = Tone.Time(release).toFrequency();
		attack = Math.max(attack, minTime);
		release = Math.max(release, minTime);
		this._frequencyValues.setMap(function(val){
			if (val <= 0){
				return attack;
			} else {
				return release;
			}
		});
	};

	/**
	 * The attack time.
	 * @memberOf Tone.Follower#
	 * @type {Time}
	 * @name attack
	 */
	Object.defineProperty(Tone.Follower.prototype, "attack", {
		get : function(){
			return this._attack;
		},
		set : function(attack){
			this._attack = attack;
			this._setAttackRelease(this._attack, this._release);
		}
	});

	/**
	 * The release time.
	 * @memberOf Tone.Follower#
	 * @type {Time}
	 * @name release
	 */
	Object.defineProperty(Tone.Follower.prototype, "release", {
		get : function(){
			return this._release;
		},
		set : function(release){
			this._release = release;
			this._setAttackRelease(this._attack, this._release);
		}
	});

	/**
	 *  Borrows the connect method from Signal so that the output can be used
	 *  as a Tone.Signal control signal.
	 *  @function
	 */
	Tone.Follower.prototype.connect = Tone.SignalBase.prototype.connect;

	/**
	 *  dispose
	 *  @returns {Tone.Follower} this
	 */
	Tone.Follower.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._filter.disconnect();
		this._filter = null;
		this._frequencyValues.disconnect();
		this._frequencyValues = null;
		this._delay.dispose();
		this._delay = null;
		this._sub.disconnect();
		this._sub = null;
		this._abs.dispose();
		this._abs = null;
		this._mult.dispose();
		this._mult = null;
		this._curve = null;
		return this;
	};

	return Tone.Follower;
});
