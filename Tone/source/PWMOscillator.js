define(["Tone/core/Tone", "Tone/source/Source", "Tone/source/PulseOscillator", "Tone/source/Oscillator"], 
function(Tone){

	"use strict";

	/**
	 *  @class takes an array of Oscillator descriptions and mixes them together
	 *         with the same detune and frequency controls. 
	 *
	 *  @extends {Tone.Oscillator}
	 *  @constructor
	 *  @param {frequency} frequency frequency of the oscillator (meaningless for noise types)
	 *  @param {string} type the type of the oscillator
	 */
	Tone.PWMOscillator = function(){
		var options = this.optionsObject(arguments, ["frequency", "modulationFrequency"], Tone.PWMOscillator.defaults);
		Tone.Source.call(this);

		/**
		 *  the pulse oscillator
		 */
		this._pulse = new Tone.PulseOscillator(options.modulationFrequency);
		//change the pulse oscillator type
		this._pulse._sawtooth.setType("sine");

		/**
		 *  the modulator
		 */
		this._modulator = new Tone.Oscillator({
			"frequency" : options.frequency,
			"detune" : options.detune
		});

		/**
		 *  the frequency control
		 *  @type {Tone.Signal}
		 */
		this.frequency = this._modulator.frequency;

		/**
		 *  the detune control
		 *  @type {Tone.Signal}
		 */
		this.detune = this._modulator.detune;

		/**
		 *  callback which is invoked when the oscillator is stoped
		 *  @type {function()}
		 */
		this.onended = options.onended;

		/**
		 *  the modulation rate of the oscillator
		 *  @type {Tone.Signal}
		 */
		this.modulationFrequency = this._pulse.frequency;	

		//connections
		this._modulator.connect(this._pulse.width);
		this._pulse.connect(this.output);
		this._pulse.onended = this._onended.bind(this);
	};

	Tone.extend(Tone.PWMOscillator, Tone.Oscillator);

	/**
	 *  default values
	 *  @static
	 *  @type {Object}
	 *  @const
	 */
	Tone.PWMOscillator.defaults = {
		"frequency" : 440,
		"detune" : 0,
		"modulationFrequency" : 0.4,
		"onended" : function(){}
	};

	/**
	 *  start the oscillator
	 *  
	 *  @param  {Tone.Time} [time=now]
	 *  @returns {Tone.PWMOscillator} `this`
	 */
	Tone.PWMOscillator.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
			time = this.toSeconds(time);
			this._modulator.start(time);
			this._pulse.start(time);
		}
		return this;
	};

	/**
	 *  stop the oscillator
	 *  @param  {Tone.Time} time (optional) timing parameter
	 *  @returns {Tone.PWMOscillator} `this`
	 */
	Tone.PWMOscillator.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED){
			this.state = Tone.Source.State.STOPPED;
			time = this.toSeconds(time);
			this._modulator.stop(time);
			this._pulse.stop(time);
		}
		return this;
	};

	/**
	 *  internal onended callback
	 *  @private
	 */
	Tone.PWMOscillator.prototype._onended = function(){
		this.onended();
	};

	/**
	 *  set the phase of the oscillator (in degrees)
	 *  @param {number} degrees the phase in degrees
	 *  @returns {Tone.PulseOscillator} `this`
	 */
	Tone.PWMOscillator.prototype.setPhase = function(phase) {
		this._modulator.setPhase(phase);
		return this;
	};

	/**
	 *  returns the phase in degrees
	 *  @returns {number} the phase
	 */
	Tone.PWMOscillator.prototype.getPhase = function(){
		return this._modulator.getPhase();
	};

	/**
	 *  set the modulation rate, with an optional ramp time to that 
	 *  
	 *  @param {number}	freq
	 *  @param {Tone.Time=} rampTime when the oscillator will arrive at the frequency
	 *  @returns {Tone.PulseOscillator} `this`
	 */
	Tone.PWMOscillator.prototype.setModulationFrequency = function(val, rampTime){
		this._pulse.setFrequency(val, rampTime);
		return this;
	};

	/**
	 *  set the parameters at once
	 *  @param {Object} params
	 *  @returns {Tone.PulseOscillator} `this`
	 */
	Tone.PWMOscillator.prototype.set = function(params){
		if (!this.isUndef(params.modulationFrequency)) this.setModulationFrequency(params.modulationFrequency);
		if (!this.isUndef(params.phase)) this.setPhase(params.phase);
		if (!this.isUndef(params.frequency)) this.setFrequency(params.frequency);
		if (!this.isUndef(params.onended)) this._pulse.onended = params.onended;
		if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
		Tone.Source.prototype.set.call(this, params);
		return this;
	};

	/**
	 *  clean up
	 *  @private
	 */
	Tone.PWMOscillator.prototype._dispose = function(){
		Tone.Source.prototype._dispose.call(this);
		this._pulse.dispose();
		this._pulse = null;
		this._modulator.dispose();
		this._modulator = null;
		this.onended = null;
		this.frequency = null;
		this.detune = null;
		this.modulationFrequency = null;
	};

	return Tone.PWMOscillator;
});