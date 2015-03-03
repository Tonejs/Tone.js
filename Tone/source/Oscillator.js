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
	 *  @example
	 *  var osc = new Tone.Oscillator(440, "sine");
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
		 *  The frequency control signal in hertz.
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(options.frequency, Tone.Signal.Units.Frequency);

		/**
		 *  The detune control signal in cents. 
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
		this._type = null;
		
		//setup
		this.type = options.type;
		this.phase = this._phase;
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
		this._oscillator.start(this.toSeconds(time));
	};

	/**
	 *  stop the oscillator
	 *  @private
	 *  @param  {Tone.Time} [time=now] (optional) timing parameter
	 *  @returns {Tone.Oscillator} `this`
	 */
	Tone.Oscillator.prototype._stop = function(time){
		if (this._oscillator){
			this._oscillator.stop(this.toSeconds(time));
			this._oscillator = null;
		}
		return this;
	};

	/**
	 *  Sync the signal to the Transport's bpm. Any changes to the transports bpm,
	 *  will also affect the oscillators frequency. 
	 *  @returns {Tone.Oscillator} `this`
	 *  @example
	 *  Tone.Transport.bpm.value = 120;
	 *  osc.frequency.value = 440;
	 *  osc.syncFrequency();
	 *  Tone.Transport.bpm.value = 240; 
	 *  // the frequency of the oscillator is doubled to 880
	 */
	Tone.Oscillator.prototype.syncFrequency = function(){
		Tone.Transport.syncSignal(this.frequency);
		return this;
	};

	/**
	 *  Unsync the oscillator's frequency from the Transport. 
	 *  See {@link Tone.Oscillator#syncFrequency}.
	 *  @returns {Tone.Oscillator} `this`
	 */
	Tone.Oscillator.prototype.unsyncFrequency = function(){
		Tone.Transport.unsyncSignal(this.frequency);
		return this;
	};

	/**
	 * The type of the oscillator: either sine, square, triangle, or sawtooth.
	 *
	 * Uses PeriodicWave internally even for native types so that it can set the phase.
	 *
	 * PeriodicWave equations are from the Web Audio Source code:
	 * https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/modules/webaudio/PeriodicWave.cpp&sq=package:chromium
	 *  
	 * @memberOf Tone.Oscillator#
	 * @type {string}
	 * @name type
	 * @example
	 * osc.type = "square";
	 * osc.type; //returns "square"
	 */
	Object.defineProperty(Tone.Oscillator.prototype, "type", {
		get : function(){
			return this._type;
		},
		set : function(type){
			if (this.type !== type){

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
			}
		}
	});

	/**
	 * The phase of the oscillator in degrees. 
	 * @memberOf Tone.Oscillator#
	 * @type {number}
	 * @name phase
	 * @example
	 * osc.phase = 180; //flips the phase of the oscillator
	 */
	Object.defineProperty(Tone.Oscillator.prototype, "phase", {
		get : function(){
			return this._phase * (180 / Math.PI);
		}, 
		set : function(phase){
			this._phase = phase * Math.PI / 180;
			//reset the type
			this.type = this._type;
		}
	});

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

	return Tone.Oscillator;
});