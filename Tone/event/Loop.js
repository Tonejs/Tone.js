import Tone from "../core/Tone";
import "../event/Event";

/**
 *  @class Tone.Loop creates a looped callback at the 
 *         specified interval. The callback can be 
 *         started, stopped and scheduled along
 *         the Transport's timeline. 
 *  @example
 * var loop = new Tone.Loop(function(time){
 * 	//triggered every eighth note. 
 * 	console.log(time);
 * }, "8n").start(0);
 * Tone.Transport.start();
 *  @extends {Tone}
 *  @param {Function} callback The callback to invoke with the event.
 *  @param {Time} interval The time between successive callback calls. 
 */
Tone.Loop = function(){

	var options = Tone.defaults(arguments, ["callback", "interval"], Tone.Loop);
	Tone.call(this);

	/**
	 *  The event which produces the callbacks
	 */
	this._event = new Tone.Event({
		"callback" : this._tick.bind(this),
		"loop" : true,
		"loopEnd" : options.interval,
		"playbackRate" : options.playbackRate,
		"probability" : options.probability
	});

	/**
	 *  The callback to invoke with the next event in the pattern
	 *  @type {Function}
	 */
	this.callback = options.callback;

	//set the iterations
	this.iterations = options.iterations;
};

Tone.extend(Tone.Loop);

/**
 *  The defaults
 *  @const
 *  @type  {Object}
 */
Tone.Loop.defaults = {
	"interval" : "4n",
	"callback" : Tone.noOp,
	"playbackRate" : 1,
	"iterations" : Infinity,
	"probability" : true,
	"mute" : false
};

/**
 *  Start the loop at the specified time along the Transport's
 *  timeline.
 *  @param  {TimelinePosition=}  time  When to start the Loop.
 *  @return  {Tone.Loop}  this
 */
Tone.Loop.prototype.start = function(time){
	this._event.start(time);
	return this;
};

/**
 *  Stop the loop at the given time.
 *  @param  {TimelinePosition=}  time  When to stop the Loop.
 *  @return  {Tone.Loop}  this
 */
Tone.Loop.prototype.stop = function(time){
	this._event.stop(time);
	return this;
};

/**
 *  Cancel all scheduled events greater than or equal to the given time
 *  @param  {TimelinePosition}  [time=0]  The time after which events will be cancel.
 *  @return  {Tone.Loop}  this
 */
Tone.Loop.prototype.cancel = function(time){
	this._event.cancel(time);
	return this;
};

/**
 *  Internal function called when the notes should be called
 *  @param  {Number}  time  The time the event occurs
 *  @private
 */
Tone.Loop.prototype._tick = function(time){
	this.callback(time);
};

/**
 *  The state of the Loop, either started or stopped.
 *  @memberOf Tone.Loop#
 *  @type {String}
 *  @name state
 *  @readOnly
 */
Object.defineProperty(Tone.Loop.prototype, "state", {
	get : function(){
		return this._event.state;
	}
});

/**
 *  The progress of the loop as a value between 0-1. 0, when
 *  the loop is stopped or done iterating. 
 *  @memberOf Tone.Loop#
 *  @type {NormalRange}
 *  @name progress
 *  @readOnly
 */
Object.defineProperty(Tone.Loop.prototype, "progress", {
	get : function(){
		return this._event.progress;
	}
});

/**
 *  The time between successive callbacks. 
 *  @example
 * loop.interval = "8n"; //loop every 8n
 *  @memberOf Tone.Loop#
 *  @type {Time}
 *  @name interval
 */
Object.defineProperty(Tone.Loop.prototype, "interval", {
	get : function(){
		return this._event.loopEnd;
	},
	set : function(interval){
		this._event.loopEnd = interval;
	}
});

/**
 *  The playback rate of the loop. The normal playback rate is 1 (no change). 
 *  A `playbackRate` of 2 would be twice as fast. 
 *  @memberOf Tone.Loop#
 *  @type {Time}
 *  @name playbackRate
 */
Object.defineProperty(Tone.Loop.prototype, "playbackRate", {
	get : function(){
		return this._event.playbackRate;
	},
	set : function(rate){
		this._event.playbackRate = rate;
	}
});

/**
 *  Random variation +/-0.01s to the scheduled time. 
 *  Or give it a time value which it will randomize by.
 *  @type {Boolean|Time}
 *  @memberOf Tone.Loop#
 *  @name humanize
 */
Object.defineProperty(Tone.Loop.prototype, "humanize", {
	get : function(){
		return this._event.humanize;
	},
	set : function(variation){
		this._event.humanize = variation;
	}
});

/**
 *  The probably of the callback being invoked.
 *  @memberOf Tone.Loop#
 *  @type {NormalRange}
 *  @name probability
 */
Object.defineProperty(Tone.Loop.prototype, "probability", {
	get : function(){
		return this._event.probability;
	},
	set : function(prob){
		this._event.probability = prob;
	}
});

/**
 *  Muting the Loop means that no callbacks are invoked.
 *  @memberOf Tone.Loop#
 *  @type {Boolean}
 *  @name mute
 */
Object.defineProperty(Tone.Loop.prototype, "mute", {
	get : function(){
		return this._event.mute;
	},
	set : function(mute){
		this._event.mute = mute;
	}
});

/**
 *  The number of iterations of the loop. The default
 *  value is Infinity (loop forever).
 *  @memberOf Tone.Loop#
 *  @type {Positive}
 *  @name iterations
 */
Object.defineProperty(Tone.Loop.prototype, "iterations", {
	get : function(){
		if (this._event.loop === true){
			return Infinity;
		} else {
			return this._event.loop;
		}
	},
	set : function(iters){
		if (iters === Infinity){
			this._event.loop = true;
		} else {
			this._event.loop = iters;
		}
	}
});

/**
 *  Clean up
 *  @return  {Tone.Loop}  this
 */
Tone.Loop.prototype.dispose = function(){
	this._event.dispose();
	this._event = null;
	this.callback = null;
};

export default Tone.Loop;

