define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/component/LFO", "Tone/component/Panner"], function(Tone){

	/**
	 *  AutoPanner is a Tone.Panner with an LFO connected to the pan amount
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param { number= } rate (optional) rate in HZ of the left-right pan
	 */
	Tone.AutoPanner = function(rate){
		Tone.Effect.call(this);

		/**
		 *  the lfo which drives the panning
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfo = new Tone.LFO(rate, 0, 1);

		/**
		 *  the panner node which does the panning
		 *  @type {Tone.Panner}
		 *  @private
		 */
		this._panner = new Tone.Panner();

		//connections
		this.connectEffect(this._panner);
		this._lfo.connect(this._panner.pan);
	};

	//extend Effect
	Tone.extend(Tone.AutoPanner, Tone.Effect);
	
	/**
	 * Start the panner
	 * 
	 * @param {Tone.Time=} Time the panner begins.
	 */
	Tone.AutoPanner.prototype.start = function(time){
		this._lfo.start(time);
	};

	/**
	 * Stop the panner
	 * 
	 * @param {Tone.Time=} time the panner stops.
	 */
	Tone.AutoPanner.prototype.stop = function(time){
		this._lfo.stop(time);
	};

	/**
	 * Set the type of oscillator attached to the AutoPanner.
	 * 
	 * @param {string} type of oscillator the panner is attached to (sine|sawtooth|triangle|square)
	 */
	Tone.AutoPanner.prototype.setType = function(type){
		this._lfo.setType(type);
	};

	/**
	 * Set frequency of the oscillator attached to the AutoPanner.
	 * 
	 * @param {number|string} rate in HZ of the oscillator's frequency.
	 */
	Tone.AutoPanner.prototype.setFrequency = function(rate){
		this._lfo.setFrequency(rate);
	};

	/**
	 *  clean up
	 */
	Tone.AutoPanner.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._lfo.dispose();
		this._panner.dispose();
		this._lfo = null;
		this._panner = null;
	};

	return Tone.AutoPanner;
});
