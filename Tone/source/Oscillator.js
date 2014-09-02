define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/source/Source"], 
function(Tone){

	"use strict";

	/**
	 *  @class Oscilator with start, pause, stop and sync to Transport methods
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number|string=} frequency starting frequency
	 *  @param {string=} type type of oscillator (sine|square|triangle|sawtooth)
	 */
	Tone.Oscillator = function(){
		
		Tone.Source.call(this);
		var options = this.optionsObject(arguments, ["frequency", "type"], Tone.Oscillator.defaults);

		/**
		 *  the main oscillator
		 *  @type {OscillatorNode}
		 *  @private
		 */
		this.oscillator = this.context.createOscillator();
		
		/**
		 *  the frequency control signal
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(options.frequency);

		/**
		 *  the detune control signal
		 *  @type {Tone.Signal}
		 */
		this.detune = new Tone.Signal(options.detune);

		/**
		 *  callback which is invoked when the oscillator is stoped
		 *  @type {function()}
		 */
		this.onended = options.onended;

		/**
		 *  the periodic wave
		 *  @type {PeriodicWave}
		 *  @private
		 */
		this._wave = null;

		/**
		 *  the phase of the oscillator
		 *  between 0 - 360
		 *  @type {number}
		 *  @private
		 */
		this._phase = options.phase;

		/**
		 *  the type of the oscillator
		 *  @type {string}
		 *  @private
		 */
		this._type = options.type;
		
		//connections
		this.oscillator.connect(this.output);
		//setup
		this.setPhase(this._phase);
	};

	Tone.extend(Tone.Oscillator, Tone.Source);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @type {Object}
	 */
	Tone.Oscillator.defaults = {
		"type" : "sine",
		"frequency" : 440,
		"onended" : function(){},
		"detune" : 0,
		"phase" : 0
	};

	/**
	 *  start the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.Oscillator.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
			//get previous values
			//new oscillator with previous values
			this.oscillator = this.context.createOscillator();
			this.oscillator.setPeriodicWave(this._wave);
			//connect the control signal to the oscillator frequency & detune
			this.oscillator.connect(this.output);
			this.frequency.connect(this.oscillator.frequency);
			this.detune.connect(this.oscillator.detune);
			//start the oscillator
			this.oscillator.start(this.toSeconds(time));
			this.oscillator.onended = this._onended.bind(this);
		}
	};

	/**
	 *  stop the oscillator
	 *  @param  {Tone.Time=} time (optional) timing parameter
	 */
	Tone.Oscillator.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED){
			if (!time){
				this.state = Tone.Source.State.STOPPED;
			}
			this.oscillator.stop(this.toSeconds(time));
		}
	};

	/**
	 *  exponentially ramp the frequency of the oscillator over the rampTime
	 *  
	 *  @param {Tone.Time}	val
	 *  @param {Tone.Time=} rampTime when the oscillator will arrive at the frequency
	 */
	Tone.Oscillator.prototype.setFrequency = function(val, rampTime){
		if (rampTime){
			this.frequency.exponentialRampToValueAtTime(this.toFrequency(val), this.toSeconds(rampTime));
		} else {
			this.frequency.setValue(this.toFrequency(val));
		}
	};

	/**
	 *  set the oscillator type
	 *
	 *  uses PeriodicWave even for native types so that it can set the phase
	 *
	 *  the the PeriodicWave equations are from the Web Audio Source code
	 *  here: https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/modules/webaudio/PeriodicWave.cpp&sq=package:chromium
	 *  
	 *  @param {string} type (sine|square|triangle|sawtooth)
	 */
	Tone.Oscillator.prototype.setType = function(type){
		var fftSize = 4096;
		var halfSize = fftSize / 2;

		var real = new Float32Array(halfSize);
		var imag = new Float32Array(halfSize);
		
		// Clear DC and Nyquist.
		real[0] = 0;
		imag[0] = 0;

		var shift = this._phase;	
		for (var n = 1; n < halfSize; ++n) {
			var piFactor = 2 / (n * Math.PI);
			var b; 
			switch (type) {
				case "sine": 
					b = (n === 1) ? 1 : 0;
					break;
				case "square":
					b = (n & 1) ? 2 * piFactor : 0;
					break;
				case "sawtooth":
					b = piFactor * ((n & 1) ? 1 : -1);
					break;
				case "triangle":
					if (n & 1) {
						b = 2 * (piFactor * piFactor) * ((((n - 1) >> 1) & 1) ? -1 : 1);
					} else {
						b = 0;
					}
					break;
				default:
					throw new TypeError("invalid oscillator type: "+type);
			}
			if (b !== 0){
				real[n] = -b * Math.sin(shift);
				imag[n] = b * Math.cos(shift);
			} else {
				real[n] = 0;
				imag[n] = 0;
			}
		}
		var periodicWave = this.context.createPeriodicWave(real, imag);
		this._wave = periodicWave;
		this.oscillator.setPeriodicWave(this._wave);
		this._type = type;
	};

	/**
	 *  @return {string} the type of oscillator
	 */
	Tone.Oscillator.prototype.getType = function() {
		return this._type;
	};

	/**
	 *  set the phase of the oscillator (in degrees)
	 *  @param {number} degrees the phase in degrees
	 */
	Tone.Oscillator.prototype.setPhase = function(phase) {
		this._phase = phase * Math.PI / 180;
		this.setType(this._type);
	};

	/**
	 *  set the parameters at once
	 *  @param {Object} params
	 */
	Tone.Oscillator.prototype.set = function(params){
		if (!this.isUndef(params.type)) this.setType(params.type);
		if (!this.isUndef(params.phase)) this.setPhase(params.phase);
		if (!this.isUndef(params.frequency)) this.frequency.setValue(params.frequency);
		if (!this.isUndef(params.onended)) this.onended = params.onended;
		if (!this.isUndef(params.detune)) this.detune.setValue(params.detune);
	};

	/**
	 *  internal on end call
	 *  @private
	 */
	Tone.Oscillator.prototype._onended = function(){
		this.state = Tone.Source.State.STOPPED;
		this.onended();
	};

	/**
	 *  dispose and disconnect
	 */
	Tone.Oscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this.stop();
		if (this.oscillator !== null){
			this.oscillator.disconnect();
			this.oscillator = null;
		}
		this.frequency.dispose();
		this.detune.dispose();
		this._wave = null;
		this.detune = null;
		this.frequency = null;
	};

	return Tone.Oscillator;
});