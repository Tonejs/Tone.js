import Tone from "../core/Tone";
import "../type/Ticks";

/**
 *  @class Tone.TransportEvent is an internal class used by (Tone.Transport)[Transport]
 *         to schedule events. Do no invoke this class directly, it is
 *         handled from within Tone.Transport.
 *  @extends {Tone}
 *  @param {Object} options
 */
Tone.TransportEvent = function(Transport, options){

	options = Tone.defaultArg(options, Tone.TransportEvent.defaults);
	Tone.call(this);

	/**
	 * Reference to the Transport that created it
	 * @type {Tone.Transport}
	 */
	this.Transport = Transport;

	/**
	 * The unique id of the event
	 * @type {Number}
	 */
	this.id = Tone.TransportEvent._eventId++;

	/**
	 * The time the event starts
	 * @type {Ticks}
	 */
	this.time = Tone.Ticks(options.time);

	/**
	 * The callback to invoke
	 * @type {Function}
	 */
	this.callback = options.callback;

	/**
	 * If the event should be removed after being created.
	 * @type {Boolean}
	 * @private
	 */
	this._once = options.once;
};

Tone.extend(Tone.TransportEvent);

/**
 * The defaults
 * @static
 * @type {Object}
 */
Tone.TransportEvent.defaults = {
	"once" : false,
	"callback" : Tone.noOp,
};

/**
 * Current ID counter
 * @private
 * @static
 * @type {Number}
 */
Tone.TransportEvent._eventId = 0;

/**
 * Invoke the event callback.
 * @param  {Time} time  The AudioContext time in seconds of the event
 */
Tone.TransportEvent.prototype.invoke = function(time){
	if (this.callback){
		this.callback(time);
		if (this._once && this.Transport){
			this.Transport.clear(this.id);
		}
	}
};

/**
 * Clean up
 * @return {Tone.TransportEvent} this
 */
Tone.TransportEvent.prototype.dispose = function(){
	Tone.prototype.dispose.call(this);
	this.Transport = null;
	this.callback = null;
	this.time = null;
	return this;
};

export default Tone.TransportEvent;

