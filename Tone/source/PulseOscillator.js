define(["Tone/core/Tone", "Tone/source/Source", "Tone/source/Oscillator", "Tone/signal/Signal", "Tone/signal/Threshold"],
function(Tone){

	"use strict";

	/**
	 *  
	 *  @static 
	 *  @private
	 *  @type {Float32Array}
	 */
	var pulseCurve = new Float32Array(256);

	for(var i=0; i < 128; i++) {
		pulseCurve[i] = -1;
		pulseCurve[i+128] = 1;
	}

	/**
	 *  @class Pulse Oscillator with control over width
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number=} frequency the frequency of the oscillator
	 *  @param {number=} [width = 0.5] the width of the pulse
	 */
	Tone.PulseOscillator = function(frequency, width){

		Tone.Source.call(this);

		/**
		 *  the width of the pulse
		 *  @type {Tone.Signal}
		 */
		this.width = new Tone.Signal(this.defaultArg(width, 0.5));

		/**
		 *  the sawtooth oscillator
		 *  @type {Tone.Oscillator}
		 *  @private
		 */
		this._sawtooth = new Tone.Oscillator(frequency, "sawtooth");

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
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._thresh = this.context.createWaveShaper();
		this._thresh.curve = pulseCurve;

		this.chain(this._sawtooth, this._thresh, this.output);
		this.width.connect(this._thresh);
	};

	Tone.extend(Tone.PulseOscillator, Tone.Source);

	/**
	 *  set the width of the oscillators
	 *  @param {number} width
	 */
	Tone.PulseOscillator.prototype.setWidth = function(width){
		this.width.setValue(width);
	};

	/**
	 *  start the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.PulseOscillator.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			time = this.toSeconds(time);
			this._sawtooth.start(time);
			this.width.output.gain.setValueAtTime(1, time);
			this.state = Tone.Source.State.STARTED;
		}
	};

	/**
	 *  stop the oscillator
	 *  
	 *  @param  {Tone.Time} time 
	 */
	Tone.PulseOscillator.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED){
			time = this.toSeconds(time);
			this._sawtooth.stop(time);
			//the width is still connected to the output. 
			//that needs to be stopped also
			this.width.output.gain.setValueAtTime(0, time);
			this.state = Tone.Source.State.STOPPED;
		}
	};

	/**
	 *  clean up method
	 */
	Tone.PulseOscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this._sawtooth.dispose();
		this.width.dispose();
		this._thresh.disconnect();
		this._sawtooth = null;
		this.frequency = null;
		this.detune = null;
		this.width = null;
		this._thresh = null;
	};

	return Tone.PulseOscillator;
});