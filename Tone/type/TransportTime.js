define(["Tone/core/Tone", "Tone/type/Time"], function(Tone){

	/**
	 *  @class Tone.TransportTime is a the time along the Transport's
	 *         timeline. It is similar to Tone.Time, but instead of evaluating
	 *         against the AudioContext's clock, it is evaluated against
	 *         the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
	 *  @constructor
	 *  @param  {Time}  val    The time value as a number or string
	 *  @param  {String=}  units  Unit values
	 *  @extends {Tone.Time}
	 */
	Tone.TransportTime = function(val, units){
		if (this instanceof Tone.TransportTime){

			Tone.Time.call(this, val, units);

		} else {
			return new Tone.TransportTime(val, units);
		}
	};

	Tone.extend(Tone.TransportTime, Tone.Time);

	/**
	 * Return the current time in whichever context is relevant
	 * @type {Number}
	 * @private
	 */
	Tone.TransportTime.prototype._now = function(){
		return Tone.Transport.seconds;
	};

	return Tone.TransportTime;
});
