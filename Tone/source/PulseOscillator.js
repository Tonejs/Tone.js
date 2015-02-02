define(["Tone/core/Tone", "Tone/source/Source", "Tone/source/Oscillator", "Tone/signal/Signal", "Tone/signal/WaveShaper"],
function(Tone){

	"use strict";

	/**
	 *  @class Pulse Oscillator with control over width
	 *
	 *  @constructor
	 *  @extends {Tone.Oscillator}
	 *  @param {number} [frequency=440] the frequency of the oscillator
	 *  @param {number} [width = 0.5] the width of the pulse
	 */
	Tone.PulseOscillator = function(){

		var options = this.optionsObject(arguments, ["frequency", "width"], Tone.Oscillator.defaults);
		Tone.Source.call(this, options);

		/**
		 *  the width of the pulse
		 *  @type {Tone.Signal}
		 */
		this.width = new Tone.Signal(options.width);

		/**
		 *  the sawtooth oscillator
		 *  @type {Tone.Oscillator}
		 *  @private
		 */
		this._sawtooth = new Tone.Oscillator({
			frequency : options.frequency,
			detune : options.detune,
			type : "sawtooth",
			phase : options.phase
		});

		/**
		 *  the oscillators frequency
		 *  @type {Tone.Signal}
		 */
		this.frequency = this._sawtooth.frequency;

		/**
		 *  the oscillators detune
		 *  @type {Tone.Signal}
		 */
		this.detune = this._sawtooth.detune;

		/**
		 *  threshold the signal to turn it into a square
		 *  
		 *  @type {Tone.WaveShaper}
		 *  @private
		 */
		this._thresh = new Tone.WaveShaper(function(val){
			if (val < 0){
				return -1;
			} else {
				return 1;
			}
		});

		//connections
		this._sawtooth.chain(this._thresh, this.output);
		this.width.connect(this._thresh);
		this._sawtooth.onended = this._onended.bind(this);
	};

	Tone.extend(Tone.PulseOscillator, Tone.Oscillator);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.PulseOscillator.defaults = {
		"frequency" : 440,
		"detune" : 0,
		"phase" : 0,
		"width" : 0.2,
	};

	/**
	 *  set the width of the oscillators
	 *  @param {number} width
	 *  @returns {Tone.PulseOscillator} `this`
	 */
	Tone.PulseOscillator.prototype.setWidth = function(width){
		this.width.setValue(width);
		return this;
	};

	/**
	 *  set the phase of the oscillator
	 *  @param {number} phase
	 *  @returns {Tone.PulseOscillator} `this`
	 */
	Tone.PulseOscillator.prototype.setPhase = function(phase){
		this._sawtooth.setPhase(phase);
		return this;
	};

	/**
	 *  returns the phase in degrees
	 *  @returns {number} the phase
	 */
	Tone.PulseOscillator.prototype.getPhase = function(){
		return this._sawtooth.getPhase();
	};

	/**
	 *  start the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 *  @returns {Tone.PulseOscillator} `this`
	 */
	Tone.PulseOscillator.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
			time = this.toSeconds(time);
			this._sawtooth.start(time);
			this.width.output.gain.setValueAtTime(1, time);
		}
		return this;
	};

	/**
	 *  stop the oscillator
	 *  @param  {Tone.Time} time 
	 *  @returns {Tone.PulseOscillator} `this`
	 */
	Tone.PulseOscillator.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED){
			this.state = Tone.Source.State.STOPPED;
			time = this.toSeconds(time);
			this._sawtooth.stop(time);
			//the width is still connected to the output. 
			//that needs to be stopped also
			this.width.output.gain.setValueAtTime(0, time);
		}
		return this;
	};

	/**
	 *  clean up method
	 *  @private
	 */
	Tone.PulseOscillator.prototype._dispose = function(){
		Tone.Source.prototype._dispose.call(this);
		this._sawtooth.dispose();
		this._sawtooth = null;
		this.width.dispose();
		this.width = null;
		this._thresh.disconnect();
		this._thresh = null;
		this.frequency = null;
		this.detune = null;
	};

	return Tone.PulseOscillator;
});