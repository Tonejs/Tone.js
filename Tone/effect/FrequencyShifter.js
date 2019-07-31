import Tone from "../core/Tone";
import "../component/PhaseShiftAllpass";
import "../source/Oscillator";
import "../signal/Signal";
import "../signal/Multiply";
import "../signal/Negate";
import "../signal/Add";
import "../effect/Effect";

/**
 *  @class Tone.FrequencyShifter shifts frequencys.
 *
 *  @extends {Tone.Effect}
 *  @param {Interval=} pitch The interval to transpose the incoming signal by.
 */
Tone.FrequencyShifter = function(){

	var options = Tone.defaults(arguments, ["pitch"], Tone.FrequencyShifter);
	Tone.Effect.call(this, options);

	//this.createInsOuts(1, 1);

	/**
	 *  The ring modulators carrier frequency
	 *  @type  {Tone.Signal}
	 */
	this.carrierFrequency = new Tone.Signal(options.pitch);

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
	var now = this.now();
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
	"pitch" : 0
};

/**
 * Repitch the incoming signal by some interval (measured
 * in semi-tones).
 * @memberOf Tone.FrequencyShifter#
 * @type {Interval}
 * @name pitch
 * @example
 * frequencyShifter.pitch = -12; //down one octave
 * frequencyShifter.pitch = 7; //up a fifth
 */
Object.defineProperty(Tone.FrequencyShifter.prototype, "pitch", {
	get : function(){
		return this.carrierFrequency.value;
	},
	set : function(interval){
		this.carrierFrequency.value = Tone.intervalToFrequencyRatio(interval);
	}
});

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
