define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	/**
	 *  Envelope 
	 *  ADR envelope generator attaches to an AudioParam
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Tone.Time=} attack
	 *  @param {Tone.Time=} decay
	 *  @param {number=} sustain 	a percentage (0-1) of the full amplitude
	 *  @param {Tone.Time=} release
	 *  @param {number=} minOutput the lowest point of the envelope
	 *  @param {number=} maxOutput the highest point of the envelope
	 */
	Tone.Envelope = function(attack, decay, sustain, release, minOutput, maxOutput){
		//extend Unit
		Tone.call(this);

		//set the parameters
		this.attack = this.defaultArg(attack, 0.01);
		this.decay = this.defaultArg(decay, 0.1);
		this.release = this.defaultArg(release, 1);
		this.sustain = this.defaultArg(sustain, 0.5);

		this.min = this.defaultArg(minOutput, 0);
		this.max = this.defaultArg(maxOutput, 1);
		
		//the control signal
		this.control = new Tone.Signal(this.min);

		//connections
		this.chain(this.control, this.output);
	};

	Tone.extend(Tone.Envelope);

	/**
	 * attack->decay->sustain linear ramp
	 * @param  {Tone.Time} time
	 */
	Tone.Envelope.prototype.triggerAttack = function(time){
		var startVal = this.min;
		if (!time){
			startVal = this.control.getValue();
		}
		time = this.defaultArg(time, this.now());
		time = this.toSeconds(time);
		this.control.cancelScheduledValues(time);
		this.control.setValueAtTime(startVal, time);
		var attackTime = this.toSeconds(this.attack);
		var decayTime = this.toSeconds(this.decay);
		this.control.linearRampToValueAtTime(this.max, time + attackTime);
		var sustainVal = (this.max - this.min) * this.sustain + this.min;
		this.control.linearRampToValueAtTime(sustainVal, time + attackTime + decayTime);
	};

	/**
	 * attack->decay->sustain exponential ramp
	 * @param  {Tone.Time} time
	 */
	Tone.Envelope.prototype.triggerAttackExp = function(time){
		var startVal = this.min;
		if (!time){
			startVal = this.control.getValue();
		}
		time = this.toSeconds(time);
		this.control.cancelScheduledValues(time);
		this.control.setValueAtTime(startVal, time);
		var attackTime = this.toSeconds(this.attack);
		var decayTime = this.toSeconds(this.decay);
		this.control.linearRampToValueAtTime(this.max, time + attackTime);
		var sustainVal = (this.max - this.min) * this.sustain + this.min;
		this.control.exponentialRampToValueAtTime(sustainVal, time + attackTime + decayTime);
	};

	
	/**
	 * triggers the release of the envelope with a linear ramp
	 * @param  {Tone.Time} time
	 */
	Tone.Envelope.prototype.triggerRelease = function(time){
		var startVal = this.control.getValue();
		if (time){
			startVal = (this.max - this.min) * this.sustain + this.min;
		}
		time = this.toSeconds(time);
		this.control.cancelScheduledValues(time);
		this.control.setValueAtTime(startVal, time);
		this.control.linearRampToValueAtTime(this.min, time + this.toSeconds(this.release));
	};


	/**
	 * triggers the release of the envelope with an exponential ramp
	 * 
	 * @param  {Tone.Time} time
	 */
	Tone.Envelope.prototype.triggerReleaseExp = function(time){
		var startVal = this.control.getValue();
		if (time){
			startVal = (this.max - this.min) * this.sustain + this.min;
		}
		time = this.toSeconds(time);
		this.control.cancelScheduledValues(time);
		this.control.setValueAtTime(startVal, time);
		this.control.exponentialRampToValueAtTime(this.min, time + this.toSeconds(this.release));
	};

	/**
	 * 	@private
	 * 	pointer to the parent's connect method
	 */
	Tone.Envelope.prototype._connect = Tone.prototype.connect;

	/**
	 * connect the envelope
	 * 
	 * if the envelope is connected to a param, the params 
	 * value will be set to 0 so that it doesn't interfere with the envelope
	 * 
	 * @param  {number} param
	 */
	Tone.Envelope.prototype.connect = function(param){
		if (param instanceof AudioParam){
			//set the initial value
			param.value = 0;
		} 
		this._connect(param);
	};

	return Tone.Envelope;
});
