define(["Tone/core/Tone", "Tone/source/Source", "Tone/source/PulseOscillator", "Tone/source/Oscillator"], 
function(Tone){

	"use strict";

	/**
	 *  @class takes an array of Oscillator descriptions and mixes them together
	 *         with the same detune and frequency controls. 
	 *
	 *  @extends {Tone.Source}
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
		 *  the modulation rate of the oscillator
		 *  @type {Tone.Signal}
		 */
		this.modulationFrequency = this._pulse.frequency;

		/**
		 *  callback which is invoked when the oscillator is stoped
		 *  @type {function()}
		 */
		this.onended = options.onended;

		//connections
		this._modulator.connect(this._pulse.width);
		this._pulse.connect(this.output);
		this._pulse.onended = this._onended.bind(this);
	};

	Tone.extend(Tone.PWMOscillator, Tone.Source);

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
	 */
	Tone.PWMOscillator.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
			time = this.toSeconds(time);
			this._modulator.start(time);
			this._pulse.start(time);
		}
	};

	/**
	 *  stop the oscillator
	 *  @param  {Tone.Time} time (optional) timing parameter
	 */
	Tone.PWMOscillator.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED){
			if (!time){
				this.state = Tone.Source.State.STOPPED;
			}
			time = this.toSeconds(time);
			this._modulator.stop(time);
			this._pulse.stop(time);
		}
	};

	/**
	 *  internal on end call
	 *  @private
	 */
	Tone.PWMOscillator.prototype._onended = function(){
		this.state = Tone.Source.State.STOPPED;
		this.onended();
	};

	/**
	 *  exponentially ramp the frequency of the oscillator over the rampTime
	 *  borrows the method from {@link Tone.Oscillator}
	 *  
	 *  @param {Tone.Time}	val
	 *  @param {Tone.Time=} rampTime when the oscillator will arrive at the frequency
	 *  @function
	 */
	Tone.PWMOscillator.prototype.setFrequency = Tone.Oscillator.prototype.setFrequency;

	/**
	 *  set the phase of the oscillator (in degrees)
	 *  @param {number} degrees the phase in degrees
	 */
	Tone.PWMOscillator.prototype.setPhase = function(phase) {
		this._modulator.setPhase(phase);
	};

	/**
	 *  set the modulation rate, with an optional ramp time to that 
	 *  
	 *  @param {number}	freq
	 *  @param {Tone.Time=} rampTime when the oscillator will arrive at the frequency
	 */
	Tone.PWMOscillator.prototype.setModulationFrequency = function(val, rampTime){
		this._pulse.setFrequency(val, rampTime);
	};

	/**
	 *  set the parameters at once
	 *  @param {Object} params
	 */
	Tone.PWMOscillator.prototype.set = function(params){
		if (!this.isUndef(params.modulationFrequency)) this.setModulationFrequency(params.modulationFrequency);
		if (!this.isUndef(params.phase)) this.setPhase(params.phase);
		if (!this.isUndef(params.frequency)) this.setFrequency(params.frequency);
		if (!this.isUndef(params.onended)) this.onended = params.onended;
		if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
		Tone.Source.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.PWMOscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this._pulse.dispose();
		this._modulator.dispose();
		this._pulse = null;
		this._modulator = null;
		this.onended = null;
		this.frequency = null;
		this.detune = null;
		this.modulationFrequency = null;
	};

	return Tone.PWMOscillator;
});