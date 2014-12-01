define(["Tone/core/Tone", "Tone/signal/Abs", "Tone/signal/Subtract", 
	"Tone/signal/Multiply", "Tone/signal/Signal", "Tone/signal/WaveShaper"], 
function(Tone){

	"use strict";

	/**
	 *  @class  Follow the envelope of the incoming signal. 
	 *          Careful with small (< 0.02) attack or decay values. 
	 *          The follower has some ripple which gets exaggerated
	 *          by small values. 
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Tone.Time=} [attack = 0.05] 
	 *  @param {Tone.Time=} [release = 0.5] 
	 */
	Tone.Follower = function(){

		Tone.call(this);
		var options = this.optionsObject(arguments, ["attack", "release"], Tone.Follower.defaults);

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
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delay = this.context.createDelay();
		this._delay.delayTime.value = this.bufferTime;

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
		this._attack = this.secondsToFrequency(options.attack);

		/**
		 *  @private
		 *  @type {number}
		 */
		this._release = this.secondsToFrequency(options.release);

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

	Tone.extend(Tone.Follower);

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
	 *  @param   {number} attack  
	 *  @param   {number} release 
	 *  @private
	 */
	Tone.Follower.prototype._setAttackRelease = function(attack, release){
		var minTime = this.bufferTime;
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
	 *  set the attack time
	 *  @param {Tone.Time} attack
	 */
	Tone.Follower.prototype.setAttack = function(attack){
		this._attack = this.secondsToFrequency(attack);
		this._setAttackRelease(this._attack, this._release);
	};

	/**
	 *  set the release time
	 *  @param {Tone.Time} release
	 */
	Tone.Follower.prototype.setRelease = function(release){
		this._release = this.secondsToFrequency(release);
		this._setAttackRelease(this._attack, this._release);
	};

	/**
	 *  setter in bulk
	 *  @param {Object} params 
	 */
	Tone.Follower.prototype.set = function(params){
		if (!this.isUndef(params.attack)) this.setAttack(params.attack);
		if (!this.isUndef(params.release)) this.setRelease(params.release);
		Tone.Effect.prototype.set.call(this, params);
	};

	/**
	 *  borrows the connect method from Signal so that the output can be used
	 *  as a control signal {@link Tone.Signal}
	 */
	Tone.Follower.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose
	 */
	Tone.Follower.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._filter.disconnect();
		this._filter = null;
		this._frequencyValues.disconnect();
		this._frequencyValues = null;
		this._delay.disconnect();
		this._delay = null;
		this._sub.disconnect();
		this._sub = null;
		this._abs.dispose();
		this._abs = null;
		this._mult.dispose();
		this._mult = null;
		this._curve = null;
	};

	return Tone.Follower;
});