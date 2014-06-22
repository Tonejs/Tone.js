define(["Tone/core/Tone", "Tone/source/Oscillator", "Tone/signal/Scale"], function(Tone){

	/**
	 *  Low Frequency Oscillator
	 *
	 *  LFO produces an output signal which can be attached to an AudioParam
	 *  	for constant control over that parameter
	 *  	the LFO can also be synced to the transport
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} rate      
	 *  @param {number=} outputMin 
	 *  @param {number=} outputMax
	 */
	Tone.LFO = function(rate, outputMin, outputMax){
		/** @type {GainNode} */
		this.input = this.context.createGain();
		/** @type {Tone.Oscillator} */
		this.oscillator = new Tone.Oscillator(this.defaultArg(rate, 1), "sine");
		/**
			@type {Tone.Scale} 
			@private
		*/
		this._scaler = new Tone.Scale(this.defaultArg(outputMin, 0), this.defaultArg(outputMax, 1));
		/** alias for the output */
		this.output = this._scaler;

		//connect it up
		this.chain(this.oscillator, this.output);
	};

	Tone.extend(Tone.LFO);

	/**
	 *  start the LFO
	 *  @param  {Tone.Time} time 
	 */
	Tone.LFO.prototype.start = function(time){
		this.oscillator.start(time);
	};

	/**
	 *  stop the LFO
	 *  @param  {Tone.Time} time 
	 */
	Tone.LFO.prototype.stop = function(time){
		this.oscillator.stop(time);
	};

	/**
	 *  Sync the start/stop/pause to the transport 
	 *  and the frequency to the bpm of the transport
	 */
	Tone.LFO.prototype.sync = function(){
		this.oscillator.sync();
	};

	/**
	 *  unsync the LFO from transport control
	 */
	Tone.LFO.prototype.unsync = function(){
		this.oscillator.unsync();
	};


	/**
	 *  set the frequency
	 *  @param {number} rate 
	 */
	Tone.LFO.prototype.setFrequency = function(rate){
		this.oscillator.setFrequency(rate);
	};

	/**
	 *  set the minimum output of the LFO
	 *  @param {number} min 
	 */
	Tone.LFO.prototype.setMin = function(min){
		this._scaler.setOutputMin(min);
	};

	/**
	 *  set the maximum output of the LFO
	 *  @param {number} min 
	 */
	Tone.LFO.prototype.setMax = function(max){
		this._scaler.setOuputMax(max);
	};

	/**
	 *  set the waveform of the LFO
	 *  @param {string} type 
	 */
	Tone.LFO.prototype.setType = function(type){
		this.oscillator.setType(type);
	};

	/**
	 *  pointer to the parent's connect method
	 *  @private
	 */
	Tone.LFO.prototype._connect = Tone.prototype.connect;

	/**
	 *	override the connect method so that it 0's out the value 
	 *	if attached to an AudioParam
	 *	
	 *  @borrows Tone.Signal.connect as Tone.LFO.connect
	 */
	Tone.LFO.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  disconnect and dispose
	 */
	Tone.LFO.prototype.dispose = function(){
		this.oscillator.dispose();
		this.output.disconnect();
		this._scaler.dispose();
		this.oscillator = null;
		this.output = null;
		this._scaler = null;
	};

	return Tone.LFO;
});