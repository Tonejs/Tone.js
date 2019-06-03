import Tone from "../core/Tone";
import "../core/TransportEvent";
import "../type/Ticks";

/**
 *  @class Tone.TransportRepeatEvent is an internal class used by Tone.Transport
 *         to schedule repeat events. This class should not be instantiated directly.
 *  @extends {Tone.TransportEvent}
 *  @param {Object} options
 */
Tone.TransportRepeatEvent = function(Transport, options){

	Tone.TransportEvent.call(this, Transport, options);
	options = Tone.defaultArg(options, Tone.TransportRepeatEvent.defaults);

	/**
	 * When the event should stop repeating
	 * @type {Ticks}
	 * @private
	 */
	this.duration = Tone.Ticks(options.duration);

	/**
	 * The interval of the repeated event
	 * @type {Ticks}
	 * @private
	 */
	this._interval = Tone.Ticks(options.interval);

	/**
	 * The ID of the current timeline event
	 * @type {Number}
	 * @private
	 */
	this._currentId = -1;

	/**
	 * The ID of the next timeline event
	 * @type {Number}
	 * @private
	 */
	this._nextId = -1;

	/**
	  * The time of the next event
	  * @type {Ticks}
	  * @private
	  */
	this._nextTick = this.time;

	/**
	 * a reference to the bound start method
	 * @type {Function}
	 * @private
	 */
	this._boundRestart = this._restart.bind(this);
	this.Transport.on("start loopStart", this._boundRestart);
	this._restart();
};

Tone.extend(Tone.TransportRepeatEvent, Tone.TransportEvent);

/**
 * The defaults
 * @static
 * @type {Object}
 */
Tone.TransportRepeatEvent.defaults = {
	"duration" : Infinity,
	"interval" : 1
};

/**
 * Invoke the callback. Returns the tick time which
 * the next event should be scheduled at.
 * @param  {Number} time  The AudioContext time in seconds of the event
 */
Tone.TransportRepeatEvent.prototype.invoke = function(time){
	//create more events if necessary
	this._createEvents(time);
	//call the super class
	Tone.TransportEvent.prototype.invoke.call(this, time);
};

/**
 * Push more events onto the timeline to keep up with the position of the timeline
 * @private
 */
Tone.TransportRepeatEvent.prototype._createEvents = function(time){
	// schedule the next event
	var ticks = this.Transport.getTicksAtTime(time);
	if (ticks >= this.time && ticks >= this._nextTick &&
	this._nextTick + this._interval < this.time + this.duration){
		this._nextTick += this._interval;
		this._currentId = this._nextId;
		this._nextId = this.Transport.scheduleOnce(this.invoke.bind(this), Tone.Ticks(this._nextTick));
	}
};

/**
 * Push more events onto the timeline to keep up with the position of the timeline
 * @private
 */
Tone.TransportRepeatEvent.prototype._restart = function(time){
	this.Transport.clear(this._currentId);
	this.Transport.clear(this._nextId);
	this._nextTick = this.time;
	var ticks = this.Transport.getTicksAtTime(time);
	if (ticks > this.time){
		this._nextTick = this.time + Math.ceil((ticks - this.time) / this._interval) * this._interval;
	}
	this._currentId = this.Transport.scheduleOnce(this.invoke.bind(this), Tone.Ticks(this._nextTick));
	this._nextTick += this._interval;
	this._nextId = this.Transport.scheduleOnce(this.invoke.bind(this), Tone.Ticks(this._nextTick));
};

/**
 * Clean up
 * @return {Tone.TransportRepeatEvent} this
 */
Tone.TransportRepeatEvent.prototype.dispose = function(){
	this.Transport.clear(this._currentId);
	this.Transport.clear(this._nextId);
	this.Transport.off("start loopStart", this._boundRestart);
	this._boundCreateEvents = null;
	Tone.TransportEvent.prototype.dispose.call(this);
	this.duration = null;
	this._interval = null;
	return this;
};

export default Tone.TransportRepeatEvent;

