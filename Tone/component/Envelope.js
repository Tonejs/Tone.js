define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Pow"], function(Tone){

	"use strict";

	/**
	 *  @class  ADSR envelope generator attaches to an AudioParam or Signal. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Tone.Time|Object} [attack=0.01]	the attack time in seconds
	 *  @param {Tone.Time} [decay=0.1]	the decay time in seconds
	 *  @param {number} [sustain=0.5] 	a percentage (0-1) of the full amplitude
	 *  @param {Tone.Time} [release=1]	the release time in seconds
	 *  @example
	 *  var gainNode = Tone.context.createGain();
	 *  var env = new Tone.Envelope({
	 *  	"attack" : 0.1,
	 *  	"decay" : 0.2,
	 *  	"sustain" : 1,
	 *  	"release" : 0.8,
	 *  });
	 *  env.connect(gainNode.gain);
	 */
	Tone.Envelope = function(){

		//get all of the defaults
		var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);

		/** 
		 *  The attack time
		 *  @type {Tone.Time}
		 */
		this.attack = options.attack;

		/**
		 *  The decay time
		 *  @type {Tone.Time}
		 */
		this.decay = options.decay;
		
		/**
		 *  the sustain is a value between 0-1
		 *  @type {number}
		 */
		this.sustain = options.sustain;

		/**
		 *  The release time
		 *  @type {Tone.Time}
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
		this._attackType = Tone.Envelope.Type.LINEAR;

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

		//set the attackType initially
		this.attackType = options.attackType;
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
		"attackType" : "linear"
	};

	/**
	 *  the envelope time multipler
	 *  @type {number}
	 *  @private
	 */
	Tone.Envelope.prototype._timeMult = 0.25;

	/**
	 * The slope of the attack. Either "linear" or "exponential"
	 * @memberOf Tone.Envelope#
	 * @type {number}
	 * @name attackType
	 * @example
	 * env.attackType = "linear";
	 */
	Object.defineProperty(Tone.Envelope.prototype, "attackType", {
		get : function(){
			return this._attackType;
		}, 
		set : function(type){
			if (type === Tone.Envelope.Type.LINEAR || 
				type === Tone.Envelope.Type.EXPONENTIAL){
				this._attackType = type;
			} else {
				throw Error("attackType must be either \"linear\" or \"exponential\". Invalid type: ", type);
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
				return Tone.Envelope.Phase.ATTACK;
			} else if (this._nextDecay <= time && this._nextSustain > time){
				return Tone.Envelope.Phase.DECAY;
			} else if (this._nextSustain <= time && this._nextRelease > time){
				return Tone.Envelope.Phase.SUSTAIN;
			} else {
				return Tone.Envelope.Phase.STANDBY;	
			}
		} else if (this._nextRelease < time && this._nextStandby > time){
			return Tone.Envelope.Phase.RELEASE;
		} else {
			return Tone.Envelope.Phase.STANDBY;
		}
	};

	// https://github.com/jsantell/web-audio-automation-timeline
	// MIT License, copyright (c) 2014 Jordan Santell
	Tone.Envelope.prototype._exponentialApproach = function (t0, v0, v1, timeConstant, t) {
		return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
	};

	Tone.Envelope.prototype._linearInterpolate = function (t0, v0, t1, v1, t) {
		return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
	};

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
			case Tone.Envelope.Phase.ATTACK: 
				if (this._attackType === Tone.Envelope.Type.LINEAR){
					return this._linearInterpolate(this._nextAttack, this._minOutput, this._nextAttack + attack, this._peakValue, time);
				} else {
					return this._exponentialInterpolate(this._nextAttack, this._minOutput, this._nextAttack + attack, this._peakValue, time);
				}
				break;
			case Tone.Envelope.Phase.DECAY: 
				return this._exponentialApproach(this._nextDecay, this._peakValue, this.sustain * this._peakValue, decay * this._timeMult, time);
			case Tone.Envelope.Phase.RELEASE: 
				return this._exponentialApproach(this._nextRelease, this._peakValue, this._minOutput, release * this._timeMult, time);
			case Tone.Envelope.Phase.SUSTAIN: 
				return this.sustain * this._peakValue;
			case Tone.Envelope.Phase.STANDBY: 
				return this._minOutput;
		}
	};

	/**
	 *  Trigger the attack/decay portion of the ADSR envelope. 
	 *  @param  {Tone.Time} [time=now]
	 *  @param {number} [velocity=1] the velocity of the envelope scales the vales.
	 *                               number between 0-1
	 *  @returns {Tone.Envelope} `this`
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
		if (this._attackType === Tone.Envelope.Type.LINEAR){
			this._sig.linearRampToValueAtTime(scaledMax, this._nextDecay);
		} else {
			this._sig.exponentialRampToValueAtTime(scaledMax, this._nextDecay);
		}
		this._sig.setTargetAtTime(sustainVal, this._nextDecay, decay * this._timeMult);	
		return this;
	};
	
	/**
	 *  Triggers the release of the envelope.
	 *  @param  {Tone.Time} [time=now]
	 *  @returns {Tone.Envelope} `this`
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
		if (phase === Tone.Envelope.Phase.ATTACK){
			this._sig.setCurrentValueNow();
			if (this.attackType === Tone.Envelope.Type.LINEAR){
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
	 *  Trigger the attack and release after a sustain time
	 *  @param {Tone.Time} duration the duration of the note
	 *  @param {Tone.Time} [time=now] the time of the attack
	 *  @param {number} [velocity=1] the velocity of the note
	 *  @returns {Tone.Envelope} `this`
	 *  @example
	 *  //trigger the attack and then the release after 0.6 seconds.
	 *  env.triggerAttackRelease(0.6);
	 */
	Tone.Envelope.prototype.triggerAttackRelease = function(duration, time, velocity) {
		time = this.toSeconds(time);
		this.triggerAttack(time, velocity);
		this.triggerRelease(time + this.toSeconds(duration));
		return this;
	};

	/**
	 *  Borrows the connect method from {@link Tone.Signal}
	 *  @function
	 */
	Tone.Envelope.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  disconnect and dispose
	 *  @returns {Tone.Envelope} `this`
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
		ATTACK : "attack",
		DECAY : "decay",
		SUSTAIN : "sustain",
		RELEASE : "release",
		STANDBY : "standby",
 	};

 	/**
	 *  The phase of the envelope. 
	 *  @enum {string}
	 */
	Tone.Envelope.Type = {
		LINEAR : "linear",
		EXPONENTIAL : "exponential",
 	};

	return Tone.Envelope;
});
