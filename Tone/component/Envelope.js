define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	/**
	 *  Envelope 
	 *  ADR envelope generator attaches to an AudioParam or AudioNode
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Tone.Time|Object=} attack
	 *  @param {Tone.Time=} decay
	 *  @param {number=} sustain 	a percentage (0-1) of the full amplitude
	 *  @param {Tone.Time=} release
	 *  @param {number=} minOutput the lowest point of the envelope
	 *  @param {number=} maxOutput the highest point of the envelope
	 */
	Tone.Envelope = function(attack, decay, sustain, release, minOutput, maxOutput){

		//get all of the defaults
		var params = this._defaults;
		if (arguments.length === 1 && typeof attack === "object"){
			params = this.defaultArg(attack, this._defaults);
			attack = params.attack;
		} 
		
		/** 
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/** 
		 *  the attack time in seconds
		 *  @type {number}
		 */
		this.attack = this.toSeconds(this.defaultArg(attack, params.attack));

		/**
		 *  the decay time in seconds
		 *  @type {number}
		 */
		this.decay = this.toSeconds(this.defaultArg(decay, params.decay));
		
		/**
		 *  the sustain is a value between 0-1
		 *  @type {number}
		 */
		this.sustain = this.toSeconds(this.defaultArg(sustain, params.sustain));

		/**
		 *  the release time in seconds
		 *  @type {number}
		 */
		this.release = this.toSeconds(this.defaultArg(release, params.release));

		/**
		 *  the minimum output of the envelope
		 *  @type {number}
		 */
		this.min = this.defaultArg(minOutput, params.min);

		/**
		 *  the maximum output of the envelope
		 *  @type {number}
		 */
		this.max = this.defaultArg(maxOutput, params.max);
		
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
	 *  @private
	 */
	Tone.Envelope.prototype._defaults = {
		"attack" : 0.01,
		"decay" : 0.1,
		"sustain" : 0.5,
		"release" : 1,
		"min" : 0,
		"max" : 1
	};

	/**
	 *  set all of the parameters in bulk
	 *  @param {Object} param the name of member as the key
	 *                        and the value as the value 
	 */
	Tone.Envelope.prototype.set = function(params){
		if (!this.isUndef(params.attack)) this.attack = params.attack;
		if (!this.isUndef(params.decay)) this.decay = params.decay;
		if (!this.isUndef(params.sustain)) this.sustain = params.sustain;
		if (!this.isUndef(params.release)) this.release = params.release;
		if (!this.isUndef(params.min)) this.min = params.min;
		if (!this.isUndef(params.max)) this.max = params.max;
	};

	/**
	 * attack->decay->sustain linear ramp
	 * @param  {Tone.Time=} time
	 */
	Tone.Envelope.prototype.triggerAttack = function(time){
		var sustainVal = (this.max - this.min) * this.sustain + this.min;
		if (!time){
			this._control.linearRampToValueNow(this.max, this.attack);
			this._control.linearRampToValueAtTime(sustainVal, this.now() + this.attack + this.decay);	
		} else {
			var startVal = this.min;
			time = this.toSeconds(time);
			this._control.cancelScheduledValues(time);
			this._control.setValueAtTime(startVal, time);
			this._control.linearRampToValueAtTime(this.max, time + this.attack);
			this._control.linearRampToValueAtTime(sustainVal, time + this.attack + this.decay);
		}
	};

	/**
	 * attack->decay->sustain exponential attack and linear decay
	 * @param  {Tone.Time=} time
	 */
	Tone.Envelope.prototype.triggerExponentialAttack = function(time){
		var sustainVal = (this.max - this.min) * this.sustain + this.min;
		if (!time){
			this._control.exponentialRampToValueNow(this.max, this.attack);
			this._control.linearRampToValueAtTime(sustainVal, this.now() + this.attack + this.decay);	
		} else {
			var startVal = this.min;
			time = this.toSeconds(time);
			this._control.cancelScheduledValues(time);
			this._control.setValueAtTime(startVal, time);
			this._control.exponentialRampToValueAtTime(this.max, time + this.attack);
			this._control.linearRampToValueAtTime(sustainVal, time + this.attack + this.decay);
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
			this._control.cancelScheduledValues(time);
			this._control.setValueAtTime(startVal, time);
			this._control.linearRampToValueAtTime(this.min, time + this.toSeconds(this.release));
		} else {
			this._control.linearRampToValueNow(this.min, this.toSeconds(this.release));
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
			this._control.cancelScheduledValues(time);
			this._control.setValueAtTime(startVal, time);
			this._control.exponentialRampToValueAtTime(this.min, time + this.toSeconds(this.release));
		} else {
			this._control.exponentialRampToValueNow(this.min, this.toSeconds(this.release));
		}
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
