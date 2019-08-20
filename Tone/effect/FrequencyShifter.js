import Tone from "../core/Tone";
import "../component/PhaseShiftAllpass";
import "../source/Oscillator";
import "../signal/Signal";
import "../signal/Multiply";
import "../signal/Negate";
import "../signal/Add";
import "../effect/Effect";

/**
 *  @class Tone.FrequencyShifter can be used to shift all frequencies of a signal by a fixed amount.
 *         The amount can be changed at audio rate and the effect is applied in real time.
 *         The frequency shifting is implemented with a technique called single side band modulation using a ring modulator.
 *         Note: Contrary to pitch shifting, all frequencies are shifted by the same amount,
 *         destroying the harmonic relationship between them. This leads to the classic ring modulator timbre distortion.
 *         The algorithm will produces some aliasing towards the high end, especially if your source material contains a lot of high frequencies.
 *         Unfortunatelly the webaudio API does not support resampling buffers in real time, so it is not possible to fix it properly.
 *         Depending on the use case it might be an option to low pass filter your input before frequency shifting it to get ride of the aliasing.
 *         You can find a very detailed description of the algorithm here: https://larzeitlin.github.io/RMFS/
 *
 *  @extends {Tone.Effect}
 *  @param {Number=} frequencyShift The incoming signal is shifted by this frequency value.
 *  @example
 *  let input = new Tone.Oscillator(230, "sawtooth").start();
 *  let shift = new Tone.FrequencyShifter(42).toMaster();
 *  input.connect(shift).
 */
Tone.FrequencyShifter = function(){

	var options = Tone.defaults(arguments, ["frequencyShift"], Tone.FrequencyShifter);
	Tone.Effect.call(this, options);

	/**
	 *  The ring modulators carrier frequency. This frequency determines
	 *  by how many Hertz the input signal will be shifted up or down. Default is 0.
	 *  @type  {Tone.Signal}
	 */
	this.carrierFrequency = new Tone.Signal(options.frequencyShift);

	/**
	 *  The ring modulators sine carrier
	 *  @type  {Tone.Oscillator}
	 *  @private
	 */
	const sineConfig = {
		"type" : "sine",
		"frequency" : this.carrierFrequency.value,
		"phase" : 0
	};
	this._sine = new Tone.Oscillator(sineConfig);

	/**
	 *  The ring modulators cosine carrier
	 *  @type  {Tone.Oscillator}
	 *  @private
	 */
	const cosineConfig = {
		"type" : "sine",
		"frequency" : this.carrierFrequency.value,
		"phase" : -90
	};
	this._cosine = new Tone.Oscillator(cosineConfig);

	/**
	 *  The sine multiply operator
	 *  @type  {Tone.Multiply}
	 *  @private
	 */
	this._sineMultipy = new Tone.Multiply();

	/**
	 *  The cosine multiply operator
	 *  @type  {Tone.Multiply}
	 *  @private
	 */
	this._cosineMultiply = new Tone.Multiply();

	/**
	 *  The negate operator
	 *  @type  {Tone.Negate}
	 *  @private
	 */
	this._negate = new Tone.Negate();

	/**
	 *  The final add operator
	 *  @type  {Tone.Add}
	 *  @private
	 */
	this._add = new Tone.Add();

	/**
	 *  The phase shifter to create the initial 90° phase offset
	 *  @type  {Tone.PhaseShiftAllpass}
	 *  @private
	 */
	this._phaseShifter = new Tone.PhaseShiftAllpass();

	// connect the carrier frequency signal to the two oscillators
	this.carrierFrequency.connect(this._sine.frequency);
	this.carrierFrequency.connect(this._cosine.frequency);

	// connect the audio graph
	Tone.connect(this.input, this._phaseShifter);

	this._phaseShifter.connect(this._cosineMultiply, 1, 0);
	this._cosine.connect(this._cosineMultiply, 0, 1);

	this._phaseShifter.connect(this._sineMultipy, 0, 0);
	this._sine.connect(this._sineMultipy, 0, 1);
	this._sineMultipy.connect(this._negate);

	this._cosineMultiply.connect(this._add, 0, 0);
	this._negate.connect(this._add, 0, 1);

	this._add.connect(this.output);

	// start the oscillators at the same time
	const now = this.now();
	this._sine.start(now);
	this._cosine.start(now);
};

Tone.extend(Tone.FrequencyShifter, Tone.Effect);

/**
 *  default values
 *  @static
 *  @type {Object}
 *  @const
 */
Tone.FrequencyShifter.defaults = {
	"frequencyShift" : 0
};

/**
 *  Clean up.
 *  @return  {Tone.FrequencyShifter}  this
 */
Tone.FrequencyShifter.prototype.dispose = function(){
	Tone.Effect.prototype.dispose.call(this);
	this.carrierFrequency.dispose();
	this.carrierFrequency = null;
	this._sine.dispose();
	this._sine = null;
	this._cosine.dispose();
	this._cosine = null;
	this._sineMultipy.dispose();
	this._sineMultipy = null;
	this._cosineMultiply.dispose();
	this._cosineMultiply = null;
	this._negate.dispose();
	this._negate = null;
	this._add.dispose();
	this._add = null;
	this._phaseShifter.dispose();
	this._phaseShifter = null;
	return this;
};

export default Tone.FrequencyShifter;
