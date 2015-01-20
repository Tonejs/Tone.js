define(["Tone/core/Tone", "Tone/source/Oscillator", "Tone/signal/Scale", "Tone/signal/Signal", "Tone/signal/AudioToGain"], 
function(Tone){

	"use strict";

	/**
	 *  @class  The Low Frequency Oscillator produces an output signal 
	 *          which can be attached to an AudioParam or Tone.Signal 
	 *          for constant control over that parameter. the LFO can 
	 *          also be synced to the transport to start/stop/pause
	 *          and change when the tempo changes.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Tone.Time} [rate="4n"]
	 *  @param {number} [outputMin=0]
	 *  @param {number} [outputMax=1]
	 */
	Tone.LFO = function(){

		var options = this.optionsObject(arguments, ["rate", "min", "max"], Tone.LFO.defaults);

		/** 
		 *  the oscillator
		 *  @type {Tone.Oscillator}
		 */
		this.oscillator = new Tone.Oscillator(options.rate, options.type);

		/**
		 *  pointer to the oscillator's frequency
		 *  @type {Tone.Signal}
		 */
		this.frequency = this.oscillator.frequency;

		/**
		 *  @type {Tone.AudioToGain} 
		 *  @private
		 */
		this._a2g = new Tone.AudioToGain();

		/**
		 *  @type {Tone.Scale} 
		 *  @private
		 */
		this._scaler = this.output = new Tone.Scale(options.min, options.max);

		//connect it up
		this.oscillator.chain(this._a2g, this._scaler);
	};

	Tone.extend(Tone.LFO);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.LFO.defaults = {
		"type" : "sine",
		"min" : 0,
		"max" : 1,
		"frequency" : "4n",
	};

	/**
	 *  start the LFO
	 *  @param  {Tone.Time} [time=now] the time the LFO will start
	 */
	Tone.LFO.prototype.start = function(time){
		this.oscillator.start(time);
	};

	/**
	 *  stop the LFO
	 *  @param  {Tone.Time} [time=now] the time the LFO will stop
	 */
	Tone.LFO.prototype.stop = function(time){
		this.oscillator.stop(time);
	};

	/**
	 *  Sync the start/stop/pause to the transport 
	 *  and the frequency to the bpm of the transport
	 *
	 *  @param {Tone.Time} [delay=0] the time to delay the start of the
	 *                                LFO from the start of the transport
	 */
	Tone.LFO.prototype.sync = function(delay){
		Tone.Transport.syncSource(this.oscillator, delay);
		Tone.Transport.syncSignal(this.oscillator.frequency);
	};

	/**
	 *  unsync the LFO from transport control
	 */
	Tone.LFO.prototype.unsync = function(){
		Tone.Transport.unsyncSource(this.oscillator);
		Tone.Transport.unsyncSignal(this.oscillator.frequency);
	};


	/**
	 *  set the frequency
	 *  @param {Tone.Time} rate 
	 */
	Tone.LFO.prototype.setFrequency = function(rate){
		this.oscillator.setFrequency(rate);
	};

	/**
	 * @return {number} the current frequency
	 */
	Tone.LFO.prototype.getFrequency = function(){
		return this.oscillator.getFrequency();
	};

	/**
	 *  set the phase
	 *  @param {number} phase 
	 */
	Tone.LFO.prototype.setPhase = function(phase){
		this.oscillator.setPhase(phase);
	};

	/**
	 * @return {number} the phase
	 */
	Tone.LFO.prototype.getPhase = function(){
		return this.oscillator.getPhase();
	};

	/**
	 *  set the minimum output of the LFO
	 *  @param {number} min 
	 */
	Tone.LFO.prototype.setMin = function(min){
		this._scaler.setMin(min);
	};

	/**
	 * @return {number} the minimum output of the LFO
	 */
	Tone.LFO.prototype.getMin = function(){
		return this._scaler.getMin();
	};

	/**
	 *  Set the maximum output of the LFO
	 *  @param {number} min 
	 */
	Tone.LFO.prototype.setMax = function(max){
		this._scaler.setMax(max);
	};

	/**
	 * @return {number} the maximum output of the LFO
	 */
	Tone.LFO.prototype.getMax = function(){
		return this._scaler.getMax();
	};

	/**
	 *  Set the waveform of the LFO
	 *  @param {string} type 
	 */
	Tone.LFO.prototype.setType = function(type){
		this.oscillator.setType(type);
	};

	/**
	 * @return {string} the LFO type
	 */
	Tone.LFO.prototype.getType = function(){
		return this.oscillator.getType();
	};

	/**
	 *  set all of the parameters with an object
	 *  @param {Object} params 
	 */
	Tone.LFO.prototype.set = function(params){
		if (!this.isUndef(params.frequency)) this.setFrequency(params.frequency);
		if (!this.isUndef(params.type)) this.setType(params.type);
		if (!this.isUndef(params.min)) this.setMin(params.min);
		if (!this.isUndef(params.max)) this.setMax(params.max);
	};

	/**
	 *	Override the connect method so that it 0's out the value 
	 *	if attached to an AudioParam or Tone.Signal. 
	 *	
	 *	Borrowed from {@link Tone.Signal}
	 *	
	 *  @function
	 */
	Tone.LFO.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  disconnect and dispose
	 */
	Tone.LFO.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.oscillator.dispose();
		this.oscillator = null;
		this._scaler.dispose();
		this._scaler = null;
		this._a2g.dispose();
		this._a2g = null;
		this.frequency = null;
	};

	return Tone.LFO;
});