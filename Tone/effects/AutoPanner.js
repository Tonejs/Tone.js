define(["Tone/core/Tone", "Tone/source/Oscillator", "Tone/component/Panner", "Tone/effects/Effect"], function(Tone){

	/**
	* AutoPanner creates a left-right panner effect (not a 3D panner).
	*
	* @constructor
	* @param { number= } rate (optional) rate in HZ of the left-right pan
	* @param { number= } amount (optional) of the pan in dB (0 - 1)
	*/
	Tone.AutoPanner = function(rate, amount){
		Tone.Effect.call(this);

		//defaults
		amount = this.defaultArg(amount, 1);
		rate = this.defaultArg(rate, 1);

		//components
		this.osc = new Tone.Oscillator(rate);
		this.amount = this.context.createGain();
		this.panner = new Tone.Panner();

		//connections
		this.connectEffect(this.panner);
		this.chain(this.osc, this.amount, this.panner.control);
	};

	//extend Effect
	Tone.extend(Tone.AutoPanner, Tone.Effect);
	
	/**
	 * Start the panner
	 * 
	 * @param {Tone.Time} Time the panner begins.
	 */
	Tone.AutoPanner.prototype.start = function(time){
		this.osc.start(time);
	};

	/**
	 * Stop the panner
	 * 
	 * @param {Tone.Time} time the panner stops.
	 */
	Tone.AutoPanner.prototype.stop = function(time){
		this.osc.stop(time);
	};

	/**
	 * Set the type of oscillator attached to the AutoPanner.
	 * 
	 * @param {string} type of oscillator the panner is attached to (sine|sawtooth|triangle|square)
	 */
	Tone.AutoPanner.prototype.setType = function(type){
		this.osc.setType(type);
	};

	/**
	 * Set frequency of the oscillator attached to the AutoPanner.
	 * 
	 * @param {number|string} rate in HZ of the oscillator's frequency.
	 */
	Tone.AutoPanner.prototype.setFrequency = function(rate){
		this.osc.setFrequency(rate);
	};

	/**
	 * Set the amount of the AutoPanner.
	 * 
	 * @param {number} amount in dB (0 - 1)
	 */
	Tone.AutoPanner.prototype.setAmount = function(amount){
		this.amount.gain.value = amount;
	};

	return Tone.AutoPanner;
});
