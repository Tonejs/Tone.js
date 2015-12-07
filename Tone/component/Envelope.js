define(["Tone/core/Tone", "Tone/signal/TimelineSignal", 
	"Tone/signal/Pow", "Tone/core/Type"], function(Tone){

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
		 *  the next time the envelope is at standby
		 *  @type {number}
		 *  @private
		 */
		this._attackCurve = Tone.Envelope.Type.Linear;

		/**
		 *  the next time the envelope is at standby
		 *  @type {number}
		 *  @private
		 */
		this._releaseCurve = Tone.Envelope.Type.Exponential;

		/**
		 *  the minimum output value
		 *  @type {number}
		 *  @private
		 */
		this._minOutput = 0.00001;

		/**
		 *  the signal
		 *  @type {Tone.TimelineSignal}
		 *  @private
		 */
		this._sig = this.output = new Tone.TimelineSignal();
		this._sig.setValueAtTime(this._minOutput, 0);

		//set the attackCurve initially
		this.attackCurve = options.attackCurve;
		this.releaseCurve = options.releaseCurve;
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
		"attackCurve" : "linear",
		"releaseCurve" : "exponential",
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
	 * The slope of the Release. Either "linear" or "exponential".
	 * @memberOf Tone.Envelope#
	 * @type {string}
	 * @name releaseCurve
	 * @example
	 * env.releaseCurve = "linear";
	 */
	Object.defineProperty(Tone.Envelope.prototype, "releaseCurve", {
		get : function(){
			return this._releaseCurve;
		}, 
		set : function(type){
			if (type === Tone.Envelope.Type.Linear || 
				type === Tone.Envelope.Type.Exponential){
				this._releaseCurve = type;
			} else {
				throw Error("releaseCurve must be either \"linear\" or \"exponential\". Invalid type: ", type);
			}
		}
	});

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
		var now = this.now() + this.blockTime;
		time = this.toSeconds(time, now);
		var attack = this.toSeconds(this.attack) + time;
		var decay = this.toSeconds(this.decay);
		velocity = this.defaultArg(velocity, 1);
		//attack
		if (this._attackCurve === Tone.Envelope.Type.Linear){
			this._sig.linearRampToValueBetween(velocity, time, attack);
		} else {
			this._sig.exponentialRampToValueBetween(velocity, time, attack);
		}
		//decay
		this._sig.setValueAtTime(velocity, attack);
		this._sig.exponentialRampToValueAtTime(this.sustain * velocity, attack + decay);
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
		var now = this.now() + this.blockTime;
		time = this.toSeconds(time, now);
		var release = this.toSeconds(this.release);
		if (this._releaseCurve === Tone.Envelope.Type.Linear){
			this._sig.linearRampToValueBetween(this._minOutput, time, time + release);
		} else {
			this._sig.exponentialRampToValueBetween(this._minOutput, time, release + time);
		}
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
