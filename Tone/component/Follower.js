define(["Tone/core/Tone", "Tone/signal/Abs", "Tone/signal/Negate", "Tone/signal/Multiply", "Tone/signal/Signal"], 
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
		this._frequencyValues = this.context.createWaveShaper();
		
		/**
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._negate = new Tone.Negate();

		/**
		 *  @type {GainNode}
		 *  @private
		 */
		this._difference = this.context.createGain();

		/**
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delay = this.context.createDelay();
		this._delay.delayTime.value = 0.02; //20 ms delay

		/**
		 *  this keeps it far from 0, even for very small differences
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._mult = new Tone.Multiply(1000);

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
		this.chain(this.input, this._abs, this._filter, this.output);
		//the difference path
		this.chain(this._abs, this._negate, this._difference);
		this.chain(this._filter, this._delay, this._difference);
		//threshold the difference and use the thresh to set the frequency
		this.chain(this._difference, this._mult, this._frequencyValues, this._filter.frequency);
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
		var curveLength = 1024;
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = (i / (curveLength - 1)) * 2 - 1;
			var val;
			if (normalized <= 0){
				val = attack;
			} else {
				val = release;
			} 
			curve[i] = val;
		}
		this._frequencyValues.curve = curve;
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
		this._frequencyValues.disconnect();
		this._delay.disconnect();
		this._difference.disconnect();
		this._abs.dispose();
		this._negate.dispose();
		this._mult.dispose();
		this._filter = null;
		this._delay = null;
		this._frequencyValues = null;
		this._abs = null;
		this._negate = null;
		this._difference = null;
		this._mult = null;
	};

	return Tone.Follower;
});