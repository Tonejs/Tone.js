define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/ScaleExp"], function(Tone){

	"use strict";

	/**
	 *  @class  ADSR envelope generator attaches to an AudioParam or Signal
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Tone.Time|Object=} attack
	 *  @param {Tone.Time=} decay
	 *  @param {number=} sustain 	a percentage (0-1) of the full amplitude
	 *  @param {Tone.Time=} release
	 */
	Tone.Envelope = function(){

		//get all of the defaults
		var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);

		/** 
		 *  the attack time in seconds
		 *  @type {number}
		 */
		this.attack = options.attack;

		/**
		 *  the decay time in seconds
		 *  @type {number}
		 */
		this.decay = options.decay;
		
		/**
		 *  the sustain is a value between 0-1
		 *  @type {number}
		 */
		this.sustain = options.sustain;

		/**
		 *  the release time in seconds
		 *  @type {number}
		 */
		this.release = options.release;

		/**
		 *  the signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._sig = new Tone.Signal(0);
		
		/** 
		 *  the signal scaler
		 *  @type {Tone.ScaleExp}
		 *  @private
		 */
		this._scaleExp = this.output = new Tone.ScaleExp(0, 1, options.min, options.max, options.exponent);

		//connections
		this.chain(this._sig, this._scaleExp);
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
		"min" : 0,
		"max" : 1,
		"exponent" : 1
	};

	// SETTERS //

	/**
	 *  set all of the parameters in bulk
	 *  @param {Object} param the name of member as the key
	 *                        and the value as the value 
	 */
	Tone.Envelope.prototype.set = function(params){
		if (!this.isUndef(params.attack)) this.setAttack(params.attack);
		if (!this.isUndef(params.decay)) this.setDecay(params.decay);
		if (!this.isUndef(params.sustain)) this.setSustain(params.sustain);
		if (!this.isUndef(params.release)) this.setRelease(params.release);
		if (!this.isUndef(params.min)) this.setMin(params.min);
		if (!this.isUndef(params.max)) this.setMax(params.max);
	};

	/**
	 *  set the attack time
	 *  @param {Tone.Time} time
	 */
	Tone.Envelope.prototype.setAttack = function(time){
		this.attack = time;
	};

	/**
	 *  set the decay time
	 *  @param {Tone.Time} time
	 */
	Tone.Envelope.prototype.setDecay = function(time){
		this.decay = time;
	};

	/**
	 *  set the release time
	 *  @param {Tone.Time} time
	 */
	Tone.Envelope.prototype.setRelease = function(time){
		this.release = time;
	};

	/**
	 *  set the sustain amount
	 *  @param {number} sustain value between 0-1
	 */
	Tone.Envelope.prototype.setSustain = function(sustain){
		this.sustain = sustain;
	};

	/**
	 *  set the envelope max
	 *  @param {number} max
	 */
	Tone.Envelope.prototype.setMax = function(max){
		this._scaleExp.setOutputMax(max);
	};

	/**
	 *  set the envelope min
	 *  @param {number} min
	 */
	Tone.Envelope.prototype.setMin = function(min){
		this._scaleExp.setOutputMin(min);
	};

	/**
	 *  the envelope time multipler
	 *  @type {number}
	 *  @private
	 */
	Tone.Envelope.prototype._timeMult = 0.25;

	/**
	 * attack->decay->sustain linear ramp
	 * @param  {Tone.Time=} time
	 * @param {number=} [velocity=1] the velocity of the envelope scales the vales.
	 *                               number between 0-1
	 */
	Tone.Envelope.prototype.triggerAttack = function(time, velocity){
		velocity = this.defaultArg(velocity, 1);
		var attack = this.toSeconds(this.attack);
		var decay = this.toSeconds(this.decay);
		var scaledMax = velocity;
		var sustainVal = this.sustain;
		time = this.toSeconds(time);
		this._sig.cancelScheduledValues(time);
		this._sig.setTargetAtTime(scaledMax, time, attack * this._timeMult);
		this._sig.setTargetAtTime(sustainVal, time + attack, decay * this._timeMult);	
	};
	
	/**
	 * triggers the release of the envelope with a linear ramp
	 * @param  {Tone.Time=} time
	 */
	Tone.Envelope.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		this._sig.cancelScheduledValues(time);
		var release = this.toSeconds(this.release);
		this._sig.setTargetAtTime(0, time, release * this._timeMult);
	};

	/**
	 *  trigger the attack and release after a sustain time
	 *  @param {Tone.Time} duration the duration of the note
	 *  @param {Tone.Time=} time the time of the attack
	 *  @param {number=} velocity the velocity of the note
	 */
	Tone.Envelope.prototype.triggerAttackRelease = function(duration, time, velocity) {
		time = this.toSeconds(time);
		this.triggerAttack(time, velocity);
		this.triggerRelease(time + this.toSeconds(duration));
	};

	/**
	 *  borrows the connect method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Envelope.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  disconnect and dispose
	 */
	Tone.Envelope.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._sig.dispose();
		this._sig = null;
		this._scaleExp.dispose();
		this._scaleExp = null;
	};

	return Tone.Envelope;
});
