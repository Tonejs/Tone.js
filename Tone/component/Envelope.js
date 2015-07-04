define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Pow"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Envelope is an [ADSR](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope)
	 *          envelope generator. Tone.Envelope outputs a signal which 
	 *          can be connected to an AudioParam or Tone.Signal. 
	 *          <img src="https://upload.wikimedia.org/wikipedia/commons/e/ea/ADSR_parameter.svg">
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Time} [attack] The amount of time it takes for the envelope to go from 
	 *                         0 to it's maximum value. 
	 *  @param {Time} [decay]	The period of time after the attack that it takes for the envelope
	 *                       	to fall to the sustain value. 
	 *  @param {NormalRange} [sustain]	The percent of the maximum value that the envelope rests at until
	 *                                	the release is triggered. 
	 *  @param {Time} [release]	The amount of time after the release is triggered it takes to reach 0. 
	 *  @example
	 * //an amplitude envelope
	 * var gainNode = Tone.context.createGain();
	 * var env = new Tone.Envelope({
	 * 	"attack" : 0.1,
	 * 	"decay" : 0.2,
	 * 	"sustain" : 1,
	 * 	"release" : 0.8,
	 * });
	 * env.connect(gainNode.gain);
	 */
	Tone.Envelope = function(){

		//get all of the defaults
		var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);

		/** 
		 *  When triggerAttack is called, the attack time is the amount of
		 *  time it takes for the envelope to reach it's maximum value. 
		 *  @type {Time}
		 */
		this.attack = options.attack;

		/**
		 *  After the attack portion of the envelope, the value will fall
		 *  over the duration of the decay time to it's sustain value. 
		 *  @type {Time}
		 */
		this.decay = options.decay;
		
		/**
		 * 	The sustain value is the value 
		 * 	which the envelope rests at after triggerAttack is
		 * 	called, but before triggerRelease is invoked. 
		 *  @type {NormalRange}
		 */
		this.sustain = options.sustain;

		/**
		 *  After triggerRelease is called, the envelope's
		 *  value will fall to it's miminum value over the
		 *  duration of the release time. 
		 *  @type {Time}
		 */
		this.release = options.release;

		/**
		 *  the next time the envelope is attacked
		 *  @type {number}
		 *  @private
		 */
		this._nextAttack = Infinity;

		/**
		 *  the next time the envelope is decayed
		 *  @type {number}
		 *  @private
		 */
		this._nextDecay = Infinity;

		/**
		 *  the next time the envelope is sustain
		 *  @type {number}
		 *  @private
		 */
		this._nextSustain = Infinity;

		/**
		 *  the next time the envelope is released
		 *  @type {number}
		 *  @private
		 */
		this._nextRelease = Infinity;

		/**
		 *  the next time the envelope is at standby
		 *  @type {number}
		 *  @private
		 */
		this._nextStandby = Infinity;

		/**
		 *  the next time the envelope is at standby
		 *  @type {number}
		 *  @private
		 */
		this._attackCurve = Tone.Envelope.Type.Linear;

		/** 
		 *  the last recorded velocity value
		 *  @type {number}
		 *  @private
		 */
		this._peakValue = 1;

		/**
		 *  the minimum output value
		 *  @type {number}
		 *  @private
		 */
		this._minOutput = 0.0001;

		/**
		 *  the signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._sig = this.output = new Tone.Signal(0);

		//set the attackCurve initially
		this.attackCurve = options.attackCurve;
	};

	Tone.extend(Tone.Envelope);

	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 */
	Tone.Envelope.defaults = {
		"attack" : 0.01,
		"decay" : 0.1,
		"sustain" : 0.5,
		"release" : 1,
		"attackCurve" : "linear"
	};

	/**
	 *  the envelope time multipler
	 *  @type {number}
	 *  @private
	 */
	Tone.Envelope.prototype._timeMult = 0.25;

	/**
	 * Read the current value of the envelope. Useful for 
	 * syncronizing visual output to the envelope. 
	 * @memberOf Tone.Envelope#
	 * @type {Number}
	 * @name value
	 * @readOnly
	 */
	Object.defineProperty(Tone.Envelope.prototype, "value", {
		get : function(){
			return this._sig.value;
		}
	});

	/**
	 * The slope of the attack. Either "linear" or "exponential". 
	 * @memberOf Tone.Envelope#
	 * @type {string}
	 * @name attackCurve
	 * @example
	 * env.attackCurve = "linear";
	 */
	Object.defineProperty(Tone.Envelope.prototype, "attackCurve", {
		get : function(){
			return this._attackCurve;
		}, 
		set : function(type){
			if (type === Tone.Envelope.Type.Linear || 
				type === Tone.Envelope.Type.Exponential){
				this._attackCurve = type;
			} else {
				throw Error("attackCurve must be either \"linear\" or \"exponential\". Invalid type: ", type);
			}
		}
	});

	/**
	 *  Get the phase of the envelope at the specified time.
	 *  @param  {number}  time
	 *  @return  {Tone.Envelope.Phase} 
	 *  @private
	 */
	Tone.Envelope.prototype._phaseAtTime = function(time){
		if (this._nextRelease > time){
			if (this._nextAttack <= time && this._nextDecay > time){
				return Tone.Envelope.Phase.Attack;
			} else if (this._nextDecay <= time && this._nextSustain > time){
				return Tone.Envelope.Phase.Decay;
			} else if (this._nextSustain <= time && this._nextRelease > time){
				return Tone.Envelope.Phase.Sustain;
			} else {
				return Tone.Envelope.Phase.Standby;	
			}
		} else if (this._nextRelease < time && this._nextStandby > time){
			return Tone.Envelope.Phase.Release;
		} else {
			return Tone.Envelope.Phase.Standby;
		}
	};

	/**
	 *  https://github.com/jsantell/web-audio-automation-timeline
	 *  MIT License, copyright (c) 2014 Jordan Santell
	 *  @private
	 */
	Tone.Envelope.prototype._exponentialApproach = function (t0, v0, v1, timeConstant, t) {
		return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
	};
	/**
	 *  @private
	 */
	Tone.Envelope.prototype._linearInterpolate = function (t0, v0, t1, v1, t) {
		return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
	};
	/**
	 *  @private
	 */
	Tone.Envelope.prototype._exponentialInterpolate = function (t0, v0, t1, v1, t) {
		return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
	};

	/**
	 *  Get the envelopes value at the given time
	 *  @param  {number}  time
	 *  @param  {number}  velocity
	 *  @return  {number} 
	 *  @private
	 */
	Tone.Envelope.prototype._valueAtTime = function(time){
		var attack = this.toSeconds(this.attack);
		var decay = this.toSeconds(this.decay);
		var release = this.toSeconds(this.release);
		switch(this._phaseAtTime(time)){
			case Tone.Envelope.Phase.Attack: 
				if (this._attackCurve === Tone.Envelope.Type.Linear){
					return this._linearInterpolate(this._nextAttack, this._minOutput, this._nextAttack + attack, this._peakValue, time);
				} else {
					return this._exponentialInterpolate(this._nextAttack, this._minOutput, this._nextAttack + attack, this._peakValue, time);
				}
				break;
			case Tone.Envelope.Phase.Decay: 
				return this._exponentialApproach(this._nextDecay, this._peakValue, this.sustain * this._peakValue, decay * this._timeMult, time);
			case Tone.Envelope.Phase.Release: 
				return this._exponentialApproach(this._nextRelease, this._peakValue, this._minOutput, release * this._timeMult, time);
			case Tone.Envelope.Phase.Sustain: 
				return this.sustain * this._peakValue;
			case Tone.Envelope.Phase.Standby: 
				return this._minOutput;
		}
	};

	/**
	 *  Trigger the attack/decay portion of the ADSR envelope. 
	 *  @param  {Time} [time=now] When the attack should start.
	 *  @param {NormalRange} [velocity=1] The velocity of the envelope scales the vales.
	 *                               number between 0-1
	 *  @returns {Tone.Envelope} this
	 *  @example
	 *  //trigger the attack 0.5 seconds from now with a velocity of 0.2
	 *  env.triggerAttack("+0.5", 0.2);
	 */
	Tone.Envelope.prototype.triggerAttack = function(time, velocity){
		//to seconds
		time = this.toSeconds(time);
		var attack = this.toSeconds(this.attack);
		var decay = this.toSeconds(this.decay);

		//get the phase and position
		var valueAtTime = this._valueAtTime(time);
		var attackPast = valueAtTime * attack;

		//compute the timing
		this._nextAttack = time - attackPast;
		this._nextDecay = this._nextAttack + attack;
		this._nextSustain = this._nextDecay + decay;
		this._nextRelease = Infinity;

		//get the values
		this._peakValue = this.defaultArg(velocity, 1);
		var scaledMax = this._peakValue;
		var sustainVal = this.sustain * scaledMax;

		//set the curve		
		this._sig.cancelScheduledValues(time);
		this._sig.setValueAtTime(valueAtTime, time);
		if (this._attackCurve === Tone.Envelope.Type.Linear){
			this._sig.linearRampToValueAtTime(scaledMax, this._nextDecay);
		} else {
			this._sig.exponentialRampToValueAtTime(scaledMax, this._nextDecay);
		}
		this._sig.setTargetAtTime(sustainVal, this._nextDecay, decay * this._timeMult);	
		return this;
	};
	
	/**
	 *  Triggers the release of the envelope.
	 *  @param  {Time} [time=now] When the release portion of the envelope should start. 
	 *  @returns {Tone.Envelope} this
	 *  @example
	 *  //trigger release immediately
	 *  env.triggerRelease();
	 */
	Tone.Envelope.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		var phase = this._phaseAtTime(time);
		var release = this.toSeconds(this.release);

		//computer the value at the start of the next release
		var valueAtTime = this._valueAtTime(time);
		this._peakValue = valueAtTime;

		this._nextRelease = time;
		this._nextStandby = this._nextRelease + release;
		
		//set the values
		this._sig.cancelScheduledValues(this._nextRelease);

		//if the phase is in the attack still, must reschedule the rest of the attack
		if (phase === Tone.Envelope.Phase.Attack){
			this._sig.setCurrentValueNow();
			if (this.attackCurve === Tone.Envelope.Type.Linear){
				this._sig.linearRampToValueAtTime(this._peakValue, this._nextRelease);
			} else {
				this._sig.exponentialRampToValueAtTime(this._peakValue, this._nextRelease);
			}
		} else {
			this._sig.setValueAtTime(this._peakValue, this._nextRelease);
		}
		this._sig.setTargetAtTime(this._minOutput, this._nextRelease, release * this._timeMult);
		return this;
	};

	/**
	 *  triggerAttackRelease is shorthand for triggerAttack, then waiting
	 *  some duration, then triggerRelease. 
	 *  @param {Time} duration The duration of the sustain.
	 *  @param {Time} [time=now] When the attack should be triggered.
	 *  @param {number} [velocity=1] The velocity of the envelope. 
	 *  @returns {Tone.Envelope} this
	 *  @example
	 * //trigger the attack and then the release after 0.6 seconds.
	 * env.triggerAttackRelease(0.6);
	 */
	Tone.Envelope.prototype.triggerAttackRelease = function(duration, time, velocity) {
		time = this.toSeconds(time);
		this.triggerAttack(time, velocity);
		this.triggerRelease(time + this.toSeconds(duration));
		return this;
	};

	/**
	 *  Borrows the connect method from Tone.Signal. 
	 *  @function
	 *  @private
	 */
	Tone.Envelope.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  Disconnect and dispose.
	 *  @returns {Tone.Envelope} this
	 */
	Tone.Envelope.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._sig.dispose();
		this._sig = null;
		return this;
	};

	/**
	 *  The phase of the envelope. 
	 *  @enum {string}
	 */
	Tone.Envelope.Phase = {
		Attack : "attack",
		Decay : "decay",
		Sustain : "sustain",
		Release : "release",
		Standby : "standby",
 	};

 	/**
	 *  The phase of the envelope. 
	 *  @enum {string}
	 */
	Tone.Envelope.Type = {
		Linear : "linear",
		Exponential : "exponential",
 	};

	return Tone.Envelope;
});
