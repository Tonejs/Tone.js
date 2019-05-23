import Tone from "../core/Tone";
import "../type/TransportTime";

/**
 *  @class Ticks is a primitive type for encoding Time values.
 *         Ticks can be constructed with or without the `new` keyword. Ticks can be passed
 *         into the parameter of any method which takes time as an argument.
 *  @constructor
 *  @extends {Tone.TransportTime}
 *  @param  {String|Number}  val    The time value.
 *  @param  {String=}  units  The units of the value.
 *  @example
 * var t = Ticks("4n");//a quarter note
 */
const Ticks = function(val, units) {
	if (this instanceof Ticks) {

		Tone.TransportTime.call(this, val, units);

	} else {
		return new Ticks(val, units);
	}
};

// Tone.extend(Ticks, Tone.TransportTime);

/**
 *  The default units if none are given.
 *  @type {String}
 *  @private
 */
Ticks.prototype._defaultUnits = "i";

/**
 * Get the current time in the given units
 * @return {Ticks}
 * @private
 */
Ticks.prototype._now = function() {
	return Tone.Transport.ticks;
};

/**
 *  Return the value of the beats in the current units
 *  @param {Number} beats
 *  @return  {Number}
 *  @private
 */
Ticks.prototype._beatsToUnits = function(beats) {
	return this._getPPQ() * beats;
};

/**
 *  Returns the value of a second in the current units
 *  @param {Seconds} seconds
 *  @return  {Number}
 *  @private
 */
Ticks.prototype._secondsToUnits = function(seconds) {
	return Math.floor(seconds / (60 / this._getBpm()) * this._getPPQ());
};

/**
 *  Returns the value of a tick in the current time units
 *  @param {Ticks} ticks
 *  @return  {Number}
 *  @private
 */
Ticks.prototype._ticksToUnits = function(ticks) {
	return ticks;
};

/**
 *  Return the time in ticks
 *  @return  {Ticks}
 */
Ticks.prototype.toTicks = function() {
	return this.valueOf();
};

/**
 *  Return the time in ticks
 *  @return  {Ticks}
 */
Ticks.prototype.toSeconds = function() {
	return (this.valueOf() / this._getPPQ()) * (60 / this._getBpm());
};

export default Ticks;

