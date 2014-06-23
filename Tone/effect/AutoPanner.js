define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/component/LFO", "Tone/component/Panner"], function(Tone){

	/**
	 *  AutoPanner is a Tone.Panner with an LFO connected to the pan amount
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param { number= } rate (optional) rate in HZ of the left-right pan
	 *  @param { number= } amount (optional) of the pan (0 - 1)
	 */
	Tone.AutoPanner = function(rate, amount){
		Tone.Effect.call(this);

		/**
		 *  the lfo which drives the panning
		 *  @type {Tone.LFO}
		 */
		this.lfo = new Tone.LFO(rate, 0, 1);

		/**
		 *  the panner node which does the panning
		 *  @type {Tone.Panner}
		 */
		this.panner = new Tone.Panner();

		//connections
		this.connectEffect(this.panner);
		this.lfo.connect(this.panner.pan);
		//default dry value
		this.setDry(this.defaultArg(amount, 1));
	};

	//extend Effect
	Tone.extend(Tone.AutoPanner, Tone.Effect);
	
	/**
	 * Start the panner
	 * 
	 * @param {Tone.Time=} Time the panner begins.
	 */
	Tone.AutoPanner.prototype.start = function(time){
		this.lfo.start(time);
	};

	/**
	 * Stop the panner
	 * 
	 * @param {Tone.Time=} time the panner stops.
	 */
	Tone.AutoPanner.prototype.stop = function(time){
		this.lfo.stop(time);
	};

	/**
	 * Set the type of oscillator attached to the AutoPanner.
	 * 
	 * @param {string} type of oscillator the panner is attached to (sine|sawtooth|triangle|square)
	 */
	Tone.AutoPanner.prototype.setType = function(type){
		this.lfo.setType(type);
	};

	/**
	 * Set frequency of the oscillator attached to the AutoPanner.
	 * 
	 * @param {number|string} rate in HZ of the oscillator's frequency.
	 */
	Tone.AutoPanner.prototype.setFrequency = function(rate){
		this.lfo.setFrequency(rate);
	};

	/**
	 *  pointer to the parent's dipose method
	 */
	Tone.AutoPanner.prototype._effectDispose = Tone.Effect.prototype.dispose;

	/**
	 *  clean up
	 */
	Tone.AutoPanner.prototype.dispose = function(){
		this._effectDispose();
		this.lfo.dispose();
		this.panner.dispose();
		this.lfo = null;
		this.panner = null;
	};

	return Tone.AutoPanner;
});
