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
	 *  @extends {Tone.Oscillator}
	 *  @param {Tone.Time} [frequency="4n"]
	 *  @param {number} [outputMin=0]
	 *  @param {number} [outputMax=1]
	 */
	Tone.LFO = function(){

		var options = this.optionsObject(arguments, ["frequency", "min", "max"], Tone.LFO.defaults);

		/** 
		 *  the oscillator
		 *  @type {Tone.Oscillator}
		 */
		this.oscillator = new Tone.Oscillator({
			"frequency" : options.frequency, 
			"type" : options.type, 
			"phase" : options.phase
		});

		/**
		 *  the lfo's frequency
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

	Tone.extend(Tone.LFO, Tone.Oscillator);

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
		"phase" : 0,
		"frequency" : "4n",
	};

	/**
	 *  start the LFO
	 *  @param  {Tone.Time} [time=now] the time the LFO will start
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.start = function(time){
		this.oscillator.start(time);
		return this;
	};

	/**
	 *  stop the LFO
	 *  @param  {Tone.Time} [time=now] the time the LFO will stop
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.stop = function(time){
		this.oscillator.stop(time);
		return this;
	};

	/**
	 *  Sync the start/stop/pause to the transport 
	 *  and the frequency to the bpm of the transport
	 *
	 *  @param {Tone.Time} [delay=0] the time to delay the start of the
	 *                                LFO from the start of the transport
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.sync = function(delay){
		this.oscillator.sync(delay);
		this.oscillator.syncFrequency();
		return this;
	};

	/**
	 *  unsync the LFO from transport control
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.unsync = function(){
		this.oscillator.unsync();
		this.oscillator.unsyncFrequency();
		return this;
	};

	/**
	 *  set the phase
	 *  @param {number} phase 
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.setPhase = function(phase){
		this.oscillator.setPhase(phase);
		return this;
	};

	/**
	 *  @returns {number} the phase
	 */
	Tone.LFO.prototype.getPhase = function(){
		return this.oscillator.getPhase();
	};

	/**
	 *  set the minimum output of the LFO
	 *  @param {number} min 
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.setMin = function(min){
		this._scaler.setMin(min);
		return this;
	};

	/**
	 *  @return {number} the minimum output of the LFO
	 */
	Tone.LFO.prototype.getMin = function(){
		return this._scaler.min;
	};

	/**
	 *  Set the maximum output of the LFO
	 *  @param {number} min 
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.setMax = function(max){
		this._scaler.setMax(max);
		return this;
	};

	/**
	 *  @return {number} the maximum output of the LFO
	 */
	Tone.LFO.prototype.getMax = function(){
		return this._scaler.max;
	};

	/**
	 *  Set the waveform of the LFO
	 *  @param {string} type 
	 *  @returns {Tone.LFO} `this`
	 */
	Tone.LFO.prototype.setType = function(type){
		this.oscillator.setType(type);
		return this;
	};

	/**
	 *  @returns {string} the type
	 */
	Tone.LFO.prototype.getType = function(){
		return this.oscillator.getType();
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
	 *  @returns {Tone.LFO} `this`
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
		return this;
	};

	/**
	 * the miniumum output of the scale
	 * @memberOf Tone.LFO#
	 * @type {number}
	 * @name min
	 */
	Tone._defineGetterSetter(Tone.LFO, "min");

	/**
	 * the maximum output of the scale
	 * @memberOf Tone.LFO#
	 * @type {number}
	 * @name max
	 */
	Tone._defineGetterSetter(Tone.LFO, "max");

	return Tone.LFO;
});