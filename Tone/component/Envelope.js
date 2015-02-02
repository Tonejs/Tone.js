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
	 */
	Tone.Envelope = function(){

		//get all of the defaults
		var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);

		/** 
		 *  the attack time in seconds
		 *  @type {Tone.Time}
		 */
		this.attack = options.attack;

		/**
		 *  the decay time in seconds
		 *  @type {Tone.Time}
		 */
		this.decay = options.decay;
		
		/**
		 *  the sustain is a value between 0-1
		 *  @type {number}
		 */
		this.sustain = options.sustain;

		/**
		 *  the release time in seconds
		 *  @type {Tone.Time}
		 */
		this.release = options.release;

		/**
		 *  the signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._sig = this.output = new Tone.Signal(0);
	};

	Tone.extend(Tone.Envelope);

	/**
	 *  the default parameters
	 *
	 *  @static
	 */
	Tone.Envelope.defaults = {
		"attack" : 0.01,
		"decay" : 0.1,
		"sustain" : 0.5,
		"release" : 1,
	};

	/**
	 *  set the attack time
	 *  @param {Tone.Time} time
	 *  @returns {Tone.Envelope} `this`
	 */
	Tone.Envelope.prototype.setAttack = function(time){
		this.attack = time;
		return this;
	};

	/**
	 *  set the decay time
	 *  @param {Tone.Time} time
	 *  @returns {Tone.Envelope} `this`
	 */
	Tone.Envelope.prototype.setDecay = function(time){
		this.decay = time;
		return this;
	};

	/**
	 *  set the release time
	 *  @param {Tone.Time} time
	 *  @returns {Tone.Envelope} `this`
	 */
	Tone.Envelope.prototype.setRelease = function(time){
		this.release = time;
		return this;
	};

	/**
	 *  set the sustain amount
	 *  @param {number} sustain value between 0-1
	 *  @returns {Tone.Envelope} `this`
	 */
	Tone.Envelope.prototype.setSustain = function(sustain){
		this.sustain = sustain;
		return this;
	};

	/**
	 *  the envelope time multipler
	 *  @type {number}
	 *  @private
	 */
	Tone.Envelope.prototype._timeMult = 0.25;

	/**
	 *  attack->decay->sustain linear ramp
	 *  @param  {Tone.Time} [time=now]
	 *  @param {number} [velocity=1] the velocity of the envelope scales the vales.
	 *                               number between 0-1
	 *  @returns {Tone.Envelope} `this`
	 */
	Tone.Envelope.prototype.triggerAttack = function(time, velocity){
		velocity = this.defaultArg(velocity, 1);
		var attack = this.toSeconds(this.attack);
		var decay = this.toSeconds(this.decay);
		var scaledMax = velocity;
		var sustainVal = this.sustain * scaledMax;
		time = this.toSeconds(time);
		this._sig.cancelScheduledValues(time);
		this._sig.setTargetAtTime(scaledMax, time, attack * this._timeMult);
		this._sig.setTargetAtTime(sustainVal, time + attack, decay * this._timeMult);	
		return this;
	};
	
	/**
	 *  triggers the release of the envelope with a linear ramp
	 *  @param  {Tone.Time} [time=now]
	 *  @returns {Tone.Envelope} `this`
	 */
	Tone.Envelope.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		this._sig.cancelScheduledValues(time);
		var release = this.toSeconds(this.release);
		this._sig.setTargetAtTime(0, time, release * this._timeMult);
		return this;
	};

	/**
	 *  trigger the attack and release after a sustain time
	 *  @param {Tone.Time} duration the duration of the note
	 *  @param {Tone.Time} [time=now] the time of the attack
	 *  @param {number} [velocity=1] the velocity of the note
	 *  @returns {Tone.Envelope} `this`
	 */
	Tone.Envelope.prototype.triggerAttackRelease = function(duration, time, velocity) {
		time = this.toSeconds(time);
		this.triggerAttack(time, velocity);
		this.triggerRelease(time + this.toSeconds(duration));
		return this;
	};

	/**
	 *  borrows the connect method from {@link Tone.Signal}
	 *  
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

	return Tone.Envelope;
});
