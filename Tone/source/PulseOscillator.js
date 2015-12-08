define(["Tone/core/Tone", "Tone/source/Source", "Tone/source/Oscillator", "Tone/signal/Signal", "Tone/signal/WaveShaper"],
function(Tone){

	"use strict";

	/**
	 *  @class Tone.PulseOscillator is a pulse oscillator with control over pulse width,
	 *         also known as the duty cycle. At 50% duty cycle (width = 0.5) the wave is 
	 *         a square and only odd-numbered harmonics are present. At all other widths 
	 *         even-numbered harmonics are present. Read more 
	 *         [here](https://wigglewave.wordpress.com/2014/08/16/pulse-waveforms-and-harmonics/).
	 *
	 *  @constructor
	 *  @extends {Tone.Oscillator}
	 *  @param {Frequency} [frequency] The frequency of the oscillator
	 *  @param {NormalRange} [width] The width of the pulse
	 *  @example
	 * var pulse = new Tone.PulseOscillator("E5", 0.4).toMaster().start();
	 */
	Tone.PulseOscillator = function(){

		var options = this.optionsObject(arguments, ["frequency", "width"], Tone.Oscillator.defaults);
		Tone.Source.call(this, options);

		/**
		 *  The width of the pulse. 
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.width = new Tone.Signal(options.width, Tone.Type.NormalRange);

		/**
		 *  gate the width amount
		 *  @type {GainNode}
		 *  @private
		 */
		this._widthGate = this.context.createGain();

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
		 *  The frequency control.
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = this._sawtooth.frequency;

		/**
		 *  The detune in cents. 
		 *  @type {Cents}
		 *  @signal
		 */
		this.detune = this._sawtooth.detune;

		/**
		 *  Threshold the signal to turn it into a square
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
		this.width.chain(this._widthGate, this._thresh);
		this._readOnly(["width", "frequency", "detune"]);
	};

	Tone.extend(Tone.PulseOscillator, Tone.Oscillator);

	/**
	 *  The default parameters.
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
	 *  start the oscillator
	 *  @param  {Time} time 
	 *  @private
	 */
	Tone.PulseOscillator.prototype._start = function(time){
		time = this.toSeconds(time);
		this._sawtooth.start(time);
		this._widthGate.gain.setValueAtTime(1, time);
	};

	/**
	 *  stop the oscillator
	 *  @param  {Time} time 
	 *  @private
	 */
	Tone.PulseOscillator.prototype._stop = function(time){
		time = this.toSeconds(time);
		this._sawtooth.stop(time);
		//the width is still connected to the output. 
		//that needs to be stopped also
		this._widthGate.gain.setValueAtTime(0, time);
	};

	/**
	 * The phase of the oscillator in degrees.
	 * @memberOf Tone.PulseOscillator#
	 * @type {Degrees}
	 * @name phase
	 */
	Object.defineProperty(Tone.PulseOscillator.prototype, "phase", {
		get : function(){
			return this._sawtooth.phase;
		}, 
		set : function(phase){
			this._sawtooth.phase = phase;
		}
	});

	/**
	 * The type of the oscillator. Always returns "pulse".
	 * @readOnly
	 * @memberOf Tone.PulseOscillator#
	 * @type {string}
	 * @name type
	 */
	Object.defineProperty(Tone.PulseOscillator.prototype, "type", {
		get : function(){
			return "pulse";
		}
	});

	/**
	 * The partials of the waveform. Cannot set partials for this waveform type
	 * @memberOf Tone.PulseOscillator#
	 * @type {Array}
	 * @name partials
	 * @private
	 */
	Object.defineProperty(Tone.PulseOscillator.prototype, "partials", {
		get : function(){
			return [];
		}
	});

	/**
	 *  Clean up method.
	 *  @return {Tone.PulseOscillator} this
	 */
	Tone.PulseOscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this._sawtooth.dispose();
		this._sawtooth = null;
		this._writable(["width", "frequency", "detune"]);
		this.width.dispose();
		this.width = null;
		this._widthGate.disconnect();
		this._widthGate = null;
		this._widthGate = null;
		this._thresh.disconnect();
		this._thresh = null;
		this.frequency = null;
		this.detune = null;
		return this;
	};

	return Tone.PulseOscillator;
});