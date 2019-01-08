define(["../core/Tone", "../source/Source", "../source/PulseOscillator",
	"../source/Oscillator", "../signal/Multiply"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.PWMOscillator modulates the width of a Tone.PulseOscillator
	 *         at the modulationFrequency. This has the effect of continuously
	 *         changing the timbre of the oscillator by altering the harmonics
	 *         generated.
	 *
	 *  @extends {Tone.Source}
	 *  @constructor
	 *  @param {Frequency} frequency The starting frequency of the oscillator.
	 *  @param {Frequency} modulationFrequency The modulation frequency of the width of the pulse.
	 *  @example
	 *  var pwm = new Tone.PWMOscillator("Ab3", 0.3).toMaster().start();
	 */
	Tone.PWMOscillator = function(){
		var options = Tone.defaults(arguments, ["frequency", "modulationFrequency"], Tone.PWMOscillator);
		Tone.Source.call(this, options);

		/**
		 *  the pulse oscillator
		 *  @type {Tone.PulseOscillator}
		 *  @private
		 */
		this._pulse = new Tone.PulseOscillator(options.modulationFrequency);
		//change the pulse oscillator type
		this._pulse._sawtooth.type = "sine";

		/**
		 *  the modulator
		 *  @type {Tone.Oscillator}
		 *  @private
		 */
		this._modulator = new Tone.Oscillator({
			"frequency" : options.frequency,
			"detune" : options.detune,
			"phase" : options.phase
		});

		/**
		 *  Scale the oscillator so it doesn't go silent
		 *  at the extreme values.
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._scale = new Tone.Multiply(2);

		/**
		 *  The frequency control.
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = this._modulator.frequency;

		/**
		 *  The detune of the oscillator.
		 *  @type {Cents}
		 *  @signal
		 */
		this.detune = this._modulator.detune;

		/**
		 *  The modulation rate of the oscillator.
		 *  @type {Frequency}
		 *  @signal
		 */
		this.modulationFrequency = this._pulse.frequency;

		//connections
		this._modulator.chain(this._scale, this._pulse.width);
		this._pulse.connect(this.output);
		this._readOnly(["modulationFrequency", "frequency", "detune"]);
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
		"phase" : 0,
		"modulationFrequency" : 0.4,
	};

	/**
	 *  start the oscillator
	 *  @param  {Time} [time=now]
	 *  @private
	 */
	Tone.PWMOscillator.prototype._start = function(time){
		time = this.toSeconds(time);
		this._modulator.start(time);
		this._pulse.start(time);
	};

	/**
	 *  stop the oscillator
	 *  @param  {Time} time (optional) timing parameter
	 *  @private
	 */
	Tone.PWMOscillator.prototype._stop = function(time){
		time = this.toSeconds(time);
		this._modulator.stop(time);
		this._pulse.stop(time);
	};

	/**
	 *  restart the oscillator
	 *  @param  {Time} time (optional) timing parameter
	 *  @private
	 */
	Tone.PWMOscillator.prototype.restart = function(time){
		this._modulator.restart(time);
		this._pulse.restart(time);
	};

	/**
	 * The type of the oscillator. Always returns "pwm".
	 * @readOnly
	 * @memberOf Tone.PWMOscillator#
	 * @type {string}
	 * @name type
	 */
	Object.defineProperty(Tone.PWMOscillator.prototype, "type", {
		get : function(){
			return "pwm";
		}
	});

	/**
	 * The baseType of the oscillator. Always returns "pwm".
	 * @readOnly
	 * @memberOf Tone.PWMOscillator#
	 * @type {string}
	 * @name baseType
	 */
	Object.defineProperty(Tone.PWMOscillator.prototype, "baseType", {
		get : function(){
			return "pwm";
		}
	});

	/**
	 * The partials of the waveform. Cannot set partials for this waveform type
	 * @memberOf Tone.PWMOscillator#
	 * @type {Array}
	 * @name partials
	 * @private
	 */
	Object.defineProperty(Tone.PWMOscillator.prototype, "partials", {
		get : function(){
			return [];
		}
	});

	/**
	 * The phase of the oscillator in degrees.
	 * @memberOf Tone.PWMOscillator#
	 * @type {number}
	 * @name phase
	 */
	Object.defineProperty(Tone.PWMOscillator.prototype, "phase", {
		get : function(){
			return this._modulator.phase;
		},
		set : function(phase){
			this._modulator.phase = phase;
		}
	});

	/**
	 *  Clean up.
	 *  @return {Tone.PWMOscillator} this
	 */
	Tone.PWMOscillator.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this._pulse.dispose();
		this._pulse = null;
		this._scale.dispose();
		this._scale = null;
		this._modulator.dispose();
		this._modulator = null;
		this._writable(["modulationFrequency", "frequency", "detune"]);
		this.frequency = null;
		this.detune = null;
		this.modulationFrequency = null;
		return this;
	};

	return Tone.PWMOscillator;
});
