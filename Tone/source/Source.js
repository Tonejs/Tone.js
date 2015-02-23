define(["Tone/core/Tone", "Tone/core/Transport", "Tone/core/Master"], function(Tone){

	"use strict";
	
	/**
	 *  @class  Base class for sources.
	 *          Sources have start/stop/pause and 
	 *          the ability to be synced to the 
	 *          start/stop/pause of Tone.Transport.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */	
	Tone.Source = function(options){
		//unlike most ToneNodes, Sources only have an output and no input
		Tone.call(this, 0, 1);
		options = this.defaultArg(options, Tone.Source.defaults);

		/**
		 * the onended callback when the source is done playing
		 * @type {function}
		 */
		this.onended = options.onended;

		/**
		 *  the next time the source is started
		 *  @type {number}
		 *  @private
		 */
		this._nextStart = Infinity;

		/**
		 *  the next time the source is stopped
		 *  @type {number}
		 *  @private
		 */
		this._nextStop = Infinity;

		/**
		 * the volume of the output in decibels
		 * @type {Tone.Signal}
		 */
		this.volume = new Tone.Signal(this.output.gain, Tone.Signal.Units.Decibels);

		/**
		 * 	keeps track of the timeout for chaning the state
		 * 	and calling the onended
		 *  @type {number}
		 *  @private
		 */
		this._timeout = -1;
	};

	Tone.extend(Tone.Source);

	/**
	 *  the default parameters
	 *
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Source.defaults = {
		"onended" : function(){},
		"volume" : 0,
	};

	/**
	 *  The state of the source.
	 *  @type {Tone.Source.State}
	 *  @readOnly
	 *  @memberOf Tone.Source#
	 *  @name state
	 */
	Object.defineProperty(Tone.Source.prototype, "state", {
		get : function(){
			return this._stateAtTime(this.now());
		}
	});

	/**
	 *  Get the state of the source at the specified time.
	 *  @param  {Tone.Time}  time
	 *  @return  {Tone.Source.State} 
	 *  @private
	 */
	Tone.Source.prototype._stateAtTime = function(time){
		time = this.toSeconds(time);
		if (this._nextStart <= time && this._nextStop > time){
			return Tone.Source.State.STARTED;
		} else if (this._nextStop <= time){
			return Tone.Source.State.STOPPED;
		} else {
			return Tone.Source.State.STOPPED;
		}
	};

	/**
	 *  Start the source at the time.
	 *  @param  {Tone.Time} [time=now]
	 *  @returns {Tone.Source} `this`
	 */
	Tone.Source.prototype.start = function(time){
		time = this.toSeconds(time);
		if (this._stateAtTime(time) !== Tone.Source.State.STARTED || this.retrigger){
			this._nextStart = time;
			this._nextStop = Infinity;
			this._start.apply(this, arguments);
		}
		return this;
	};

	/**
	 * 	stop the source
	 *  @param  {Tone.Time} [time=now]
	 *  @returns {Tone.Source} `this`
	 */
	Tone.Source.prototype.stop = function(time){
		var now = this.now();
		time = this.toSeconds(time, now);
		if (this._stateAtTime(time) === Tone.Source.State.STARTED){
			this._nextStop = this.toSeconds(time);
			clearTimeout(this._timeout);
			var diff = time - now;
			if (diff > 0){
				//add a small buffer before invoking the callback
				this._timeout = setTimeout(this.onended, diff * 1000 + 20);
			} else {
				this.onended();
			}
			this._stop.apply(this, arguments);
		}
		return this;
	};

	/**
 	 *  @abstract
	 *  @param  {Tone.Time} time 
	 *  @returns {Tone.Source} `this`
	 */
	Tone.Source.prototype.pause = function(time){
		//if there is no pause, just stop it
		this.stop(time);
		return this;
	};

	/**
	 *  sync the source to the Transport
	 *
	 *  @param {Tone.Time} [delay=0] delay time before starting the source
	 *  @returns {Tone.Source} `this`
	 */
	Tone.Source.prototype.sync = function(delay){
		Tone.Transport.syncSource(this, delay);
		return this;
	};

	/**
	 *  unsync the source to the Transport
	 *  @returns {Tone.Source} `this`
	 */
	Tone.Source.prototype.unsync = function(){
		Tone.Transport.unsyncSource(this);
		return this;
	};

	/**
	 *	clean up
	 *  @return {Tone.Source} `this`
	 */
	Tone.Source.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.stop();
		clearTimeout(this._timeout);
		this.onended = function(){};
		this.volume.dispose();
		this.volume = null;
	};

	/**
	 *  @enum {string}
	 */
	Tone.Source.State = {
		STARTED : "started",
		PAUSED : "paused",
		STOPPED : "stopped",
		WAITING : "waiting"
 	};

	return Tone.Source;
});