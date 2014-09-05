define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

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
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/** 
		 *  the attack time in seconds
		 *  @type {number}
		 */
		this.attack = this.toSeconds(options.attack);

		/**
		 *  the decay time in seconds
		 *  @type {number}
		 */
		this.decay = this.toSeconds(options.decay);
		
		/**
		 *  the sustain is a value between 0-1
		 *  @type {number}
		 */
		this.sustain = this.toSeconds(options.sustain);

		/**
		 *  the release time in seconds
		 *  @type {number}
		 */
		this.release = this.toSeconds(options.release);

		/**
		 *  the minimum output of the envelope
		 *  @type {number}
		 */
		this.min = this.toSeconds(options.min);

		/**
		 *  the maximum output of the envelope
		 *  @type {number}
		 */
		this.max = this.toSeconds(options.max);
		
		/** 
		 *  the control signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._control = new Tone.Signal(this.min);

		//connections
		this._control.connect(this.output);
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
		"max" : 1
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
		this.attack = this.toSeconds(time);
	};

	/**
	 *  set the decay time
	 *  @param {Tone.Time} time
	 */
	Tone.Envelope.prototype.setDecay = function(time){
		this.decay = this.toSeconds(time);
	};

	/**
	 *  set the release time
	 *  @param {Tone.Time} time
	 */
	Tone.Envelope.prototype.setRelease = function(time){
		this.release = this.toSeconds(time);
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
		this.max = max;
	};

	/**
	 *  set the envelope min
	 *  @param {number} min
	 */
	Tone.Envelope.prototype.setMin = function(min){
		this.min = min;
		//should move the signal to the min
		this._control.setValueAtTime(this.min, this.now());
	};

	/**
	 * attack->decay->sustain linear ramp
	 * @param  {Tone.Time=} time
	 * @param {number=} [velocity=1] the velocity of the envelope scales the vales.
	 *                               number between 0-1
	 */
	Tone.Envelope.prototype.triggerAttack = function(time, velocity){
		velocity = this.defaultArg(velocity, 1);
		var scaledMax = this.max * velocity;
		var sustainVal = (scaledMax - this.min) * this.sustain + this.min;
		time = this.toSeconds(time);
		this._control.cancelScheduledValues(time);
		this._control.setTargetAtTime(scaledMax, time, this.attack / 4);
		this._control.setTargetAtTime(sustainVal, time + this.attack, this.decay / 4);	
	};
	
	/**
	 * triggers the release of the envelope with a linear ramp
	 * @param  {Tone.Time=} time
	 */
	Tone.Envelope.prototype.triggerRelease = function(time){
		time = this.toSeconds(time);
		this._control.cancelScheduledValues(time);
		this._control.setTargetAtTime(this.min, time, this.toSeconds(this.release) / 4);
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
		this._control.dispose();
		this._control = null;
	};

	return Tone.Envelope;
});
