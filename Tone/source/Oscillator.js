define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/source/Source", "Tone/core/Transport"], 
function(Tone){

	"use strict";

	/**
	 *  @class Oscilator with start, pause, stop and sync to Transport methods
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number|string} [frequency=440] starting frequency
	 *  @param {string} [type="sine"] type of oscillator (sine|square|triangle|sawtooth)
	 */
	Tone.Oscillator = function(){
		
		var options = this.optionsObject(arguments, ["frequency", "type"], Tone.Oscillator.defaults);
		Tone.Source.call(this, options);

		/**
		 *  the main oscillator
		 *  @type {OscillatorNode}
		 *  @private
		 */
		this._oscillator = null;
		
		/**
		 *  the frequency control signal
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(this.toFrequency(options.frequency));

		/**
		 *  the detune control signal
		 *  @type {Tone.Signal}
		 */
		this.detune = new Tone.Signal(options.detune);

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
		
		//setup
		this.setPhase(this._phase);
	};

	Tone.extend(Tone.Oscillator, Tone.Source);

	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Oscillator.defaults = {
		"type" : "sine",
		"frequency" : 440,
		"detune" : 0,
		"phase" : 0
	};

	/**
	 *  start the oscillator
	 *  @param  {Tone.Time} [time=now] 
	 *  @private
	 */
	Tone.Oscillator.prototype._start = function(time){
		//new oscillator with previous values
		this._oscillator = this.context.createOscillator();
		this._oscillator.setPeriodicWave(this._wave);
		//connect the control signal to the oscillator frequency & detune
		this._oscillator.connect(this.output);
		this.frequency.connect(this._oscillator.frequency);
		this.detune.connect(this._oscillator.detune);
		//start the oscillator
		this._oscillator.onended = this._onended.bind(this);
		this._oscillator.start(this.toSeconds(time));
	};

	/**
	 *  stop the oscillator
	 *  @param  {Tone.Time} [time=now] (optional) timing parameter
	 *  @returns {Tone.Oscillator} `this`
	 */
	Tone.Oscillator.prototype._stop = function(time){
		this._oscillator.stop(this.toSeconds(time));
		return this;
	};

	/**
	 *  exponentially ramp the frequency of the oscillator over the rampTime
	 *  
	 *  @param {Tone.Time}	val
	 *  @param {Tone.Time=} rampTime when the oscillator will arrive at the frequency
	 *  @returns {Tone.Oscillator} `this`
	 */
	Tone.Oscillator.prototype.setFrequency = function(val, rampTime){
		val = this.toFrequency(val);
		if (rampTime){
			this.frequency.exponentialRampToValueAtTime(val, this.toSeconds(rampTime));
		} else {
			this.frequency.setValue(val);
		}
		return this;
	};

	/**
	 *  get the frequency value
	 *  @returns {number}
	 */
	Tone.Oscillator.prototype.getFrequency = function(){
		return this.frequency.getValue();
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
	 *  @returns {Tone.Oscillator} `this`
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
		if (this._oscillator !== null){
			this._oscillator.setPeriodicWave(this._wave);
		}
		this._type = type;
		return this;
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
	 *  @returns {Tone.Oscillator} `this`
	 */
	Tone.Oscillator.prototype.setPhase = function(phase) {
		this._phase = phase * Math.PI / 180;
		this.setType(this._type);
		return this;
	};

	/**
	 *  returns the phase in degrees
	 *  @returns {number} the phase
	 */
	Tone.Oscillator.prototype.getPhase = function() {
		return this._phase * (180 / Math.PI);
	};

	/**
	 *  sync the signal to the Transport's bpm
	 *  @returns {Tone.Oscillator} `this`
	 */
	Tone.Oscillator.prototype.syncFrequency = function(){
		Tone.Transport.syncSignal(this.frequency);
		return this;
	};

	/**
	 *  unsync the oscillator's frequency from teh transprot
	 *  @returns {Tone.Oscillator} `this`
	 */
	Tone.Oscillator.prototype.unsyncFrequency = function(){
		this.frequency.unsync();
		return this;
	};

	/**
	 *  dispose and disconnect
	 *  @return {Tone.Oscillator} `this`
	 */
	Tone.Oscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		if (this._oscillator !== null){
			this._oscillator.disconnect();
			this._oscillator = null;
		}
		this.frequency.dispose();
		this.frequency = null;
		this.detune.dispose();
		this.detune = null;
		this._wave = null;
		return this;
	};

	/**
	 * the type of the oscillator
	 * @memberOf Tone.Oscillator#
	 * @type {string}
	 * @name type
	 */
	Tone._defineGetterSetter(Tone.Oscillator, "type");

	/**
	 * the phase of the oscillator in degrees
	 * @memberOf Tone.Oscillator#
	 * @type {number}
	 * @name phase
	 */
	Tone._defineGetterSetter(Tone.Oscillator, "phase");

	return Tone.Oscillator;
});