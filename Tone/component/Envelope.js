define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	/**
	 *  Envelope 
	 *  ADR envelope generator attaches to an AudioParam or AudioNode
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
		
		/** @type {GainNode} */
		this.output = this.context.createGain();

		/** @type {number} */
		this.attack = this.toSeconds(this.defaultArg(attack, 0.01));
		/** @type {number} */
		this.decay = this.toSeconds(this.defaultArg(decay, 0.1));
		/** @type {number} */
		this.release = this.toSeconds(this.defaultArg(release, 1));
		/** @type {number} */
		this.sustain = this.toSeconds(this.defaultArg(sustain, 0.5));

		/** @type {number} */
		this.min = this.defaultArg(minOutput, 0);
		/** @type {number} */
		this.max = this.defaultArg(maxOutput, 1);
		
		/** @type {Tone.Signal} */
		this.control = new Tone.Signal(this.min);

		//connections
		this.control.connect(this.output);
	};

	Tone.extend(Tone.Envelope);

	/**
	 * attack->decay->sustain linear ramp
	 * @param  {Tone.Time=} time
	 */
	Tone.Envelope.prototype.triggerAttack = function(time){
		var sustainVal = (this.max - this.min) * this.sustain + this.min;
		if (!time){
			this.control.linearRampToValueNow(this.max, this.attack);
			this.control.linearRampToValueAtTime(sustainVal, this.now() + this.attack + this.decay);	
		} else {
			var startVal = this.min;
			time = this.toSeconds(time);
			this.control.cancelScheduledValues(time);
			this.control.setValueAtTime(startVal, time);
			this.control.linearRampToValueAtTime(this.max, time + this.attack);
			this.control.linearRampToValueAtTime(sustainVal, time + this.attack + this.decay);
		}
	};

	/**
	 * attack->decay->sustain exponential attack and linear decay
	 * @param  {Tone.Time=} time
	 */
	Tone.Envelope.prototype.triggerExponentialAttack = function(time){
		var sustainVal = (this.max - this.min) * this.sustain + this.min;
		if (!time){
			this.control.exponentialRampToValueNow(this.max, this.attack);
			this.control.linearRampToValueAtTime(sustainVal, this.now() + this.attack + this.decay);	
		} else {
			var startVal = this.min;
			time = this.toSeconds(time);
			this.control.cancelScheduledValues(time);
			this.control.setValueAtTime(startVal, time);
			this.control.exponentialRampToValueAtTime(this.max, time + this.attack);
			this.control.linearRampToValueAtTime(sustainVal, time + this.attack + this.decay);
		}
	};

	
	/**
	 * triggers the release of the envelope with a linear ramp
	 * @param  {Tone.Time=} time
	 */
	Tone.Envelope.prototype.triggerRelease = function(time){
		if (time){
			//if there's a time, start at the sustain value
			var startVal = (this.max - this.min) * this.sustain + this.min;
			time = this.toSeconds(time);
			this.control.cancelScheduledValues(time);
			this.control.setValueAtTime(startVal, time);
			this.control.linearRampToValueAtTime(this.min, time + this.toSeconds(this.release));
		} else {
			this.control.linearRampToValueNow(this.min, this.toSeconds(this.release));
		}
	};


	/**
	 * triggers the release of the envelope with an exponential ramp
	 * 
	 * @param  {Tone.Time=} time
	 */
	Tone.Envelope.prototype.triggerExponentialRelease = function(time){
		if (time){
			//if there's a time, start at the sustain value
			var startVal = (this.max - this.min) * this.sustain + this.min;
			time = this.toSeconds(time);
			this.control.cancelScheduledValues(time);
			this.control.setValueAtTime(startVal, time);
			this.control.exponentialRampToValueAtTime(this.min, time + this.toSeconds(this.release));
		} else {
			this.control.exponentialRampToValueNow(this.min, this.toSeconds(this.release));
		}
	};

	/**
	 * 	pointer to the parent's connect method
	 * 	@private
	 */
	Tone.Envelope.prototype._connect = Tone.prototype.connect;

	/**
	 * connect the envelope
	 * 
	 * if the envelope is connected to a param, the params 
	 * value will be set to 0 so that it doesn't interfere with the envelope
	 * 
	 * @param  {number} param
	 * @param {number=} outputNumber
	 * @param {number=} inputNumber 
	 */
	Tone.Envelope.prototype.connect = function(param, outputNumber, inputNumber){
		if (param instanceof AudioParam){
			//set the initial value
			param.value = 0;
		} 
		this._connect(param, outputNumber, inputNumber);
	};

	/**
	 *  disconnect and dispose
	 */
	Tone.Envelope.prototype.dispose = function(){
		this.control.dispose();
		this.output.disconnect();
		this.control = null;
		this.output = null;
	};

	return Tone.Envelope;
});
