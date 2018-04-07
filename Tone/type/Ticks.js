define(["Tone/core/Tone", "Tone/type/TransportTime"], function(Tone){

	/**
	 *  @class Tone.Ticks is a primitive type for encoding Time values.
	 *         Tone.Ticks can be constructed with or without the `new` keyword. Tone.Ticks can be passed
	 *         into the parameter of any method which takes time as an argument.
	 *  @constructor
	 *  @extends {Tone.TransportTime}
	 *  @param  {String|Number}  val    The time value.
	 *  @param  {String=}  units  The units of the value.
	 *  @example
	 * var t = Tone.Ticks("4n");//a quarter note
	 */
	Tone.Ticks = function(val, units){
		if (this instanceof Tone.Ticks){

			Tone.TransportTime.call(this, val, units);

		} else {
			return new Tone.Ticks(val, units);
		}
	};

	Tone.extend(Tone.Ticks, Tone.TransportTime);

	/**
	 *  The default units if none are given.
	 *  @type {String}
	 *  @private
	 */
	Tone.Ticks.prototype._defaultUnits = "i";

	/**
	 * Get the current time in the given units
	 * @return {Ticks}
	 * @private
	 */
	Tone.Ticks.prototype._now = function(){
		return Tone.Transport.ticks;
	};

	/**
	 *  Return the value of the beats in the current units
	 *  @param {Number} beats
	 *  @return  {Number}
	 *  @private
	 */
	Tone.Ticks.prototype._beatsToUnits = function(beats){
		return this._getPPQ() * beats;
	};

	/**
	 *  Returns the value of a second in the current units
	 *  @param {Seconds} seconds
	 *  @return  {Number}
	 *  @private
	 */
	Tone.Ticks.prototype._secondsToUnits = function(seconds){
		return seconds / (60 / this._getBpm()) * this._getPPQ();
	};

	/**
	 *  Returns the value of a tick in the current time units
	 *  @param {Ticks} ticks
	 *  @return  {Number}
	 *  @private
	 */
	Tone.Ticks.prototype._ticksToUnits = function(ticks){
		return ticks;
	};

	/**
	 *  Return the time in ticks
	 *  @return  {Ticks}
	 */
	Tone.Ticks.prototype.toTicks = function(){
		return this.valueOf();
	};

	/**
	 *  Return the time in ticks
	 *  @return  {Ticks}
	 */
	Tone.Ticks.prototype.toSeconds = function(){
		return (this.valueOf() / this._getPPQ()) * (60 / this._getBpm());
	};

	return Tone.Ticks;
});
