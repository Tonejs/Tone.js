define(["Tone/core/Tone", "Tone/core/Transport", "Tone/core/Master"], function(Tone){

	"use strict";
	
	/**
	 *  @class  Base class for sources. Sources have start/stop methods
	 *          and the ability to be synced to the 
	 *          start/stop of Tone.Transport.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */	
	Tone.Source = function(options){
		//unlike most ToneNodes, Sources only have an output and no input
		Tone.call(this, 0, 1);
		options = this.defaultArg(options, Tone.Source.defaults);

		/**
		 * Callback is invoked when the source is done playing.
		 * @type {function}
		 * @example
		 * source.onended = function(){
		 * 	console.log("the source is done playing");
		 * }
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
		 * The volume of the output in decibels.
		 * @type {Decibels}
		 * @signal
		 * @example
		 * source.volume.value = -6;
		 */
		this.volume = new Tone.Signal({
			"param" : this.output.gain,
			"value" : options.volume,
			"units" : Tone.Type.Decibels
		});
		this._readOnly("volume");

		/**
		 * 	keeps track of the timeout for chaning the state
		 * 	and calling the onended
		 *  @type {number}
		 *  @private
		 */
		this._timeout = -1;

		//make the output explicitly stereo
		this.output.channelCount = 2;
		this.output.channelCountMode = "explicit";
	};

	Tone.extend(Tone.Source);

	/**
	 *  The default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Source.defaults = {
		"onended" : Tone.noOp,
		"volume" : 0,
	};

	/**
	 *  Returns the playback state of the source, either "started" or "stopped".
	 *  @type {Tone.State}
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
	 *  @param  {Time}  time
	 *  @return  {Tone.State} 
	 *  @private
	 */
	Tone.Source.prototype._stateAtTime = function(time){
		time = this.toSeconds(time);
		if (this._nextStart <= time && this._nextStop > time){
			return Tone.State.Started;
		} else if (this._nextStop <= time){
			return Tone.State.Stopped;
		} else {
			return Tone.State.Stopped;
		}
	};

	/**
	 *  Start the source at the specified time. If no time is given, 
	 *  start the source now.
	 *  @param  {Time} [time=now] When the source should be started.
	 *  @returns {Tone.Source} this
	 *  @example
	 * source.start("+0.5"); //starts the source 0.5 seconds from now
	 */
	Tone.Source.prototype.start = function(time){
		time = this.toSeconds(time);
		if (this._stateAtTime(time) !== Tone.State.Started || this.retrigger){
			this._nextStart = time;
			this._nextStop = Infinity;
			this._start.apply(this, arguments);
		}
		return this;
	};

	/**
	 *  Stop the source at the specified time. If no time is given, 
	 *  stop the source now.
	 *  @param  {Time} [time=now] When the source should be stopped. 
	 *  @returns {Tone.Source} this
	 *  @example
	 * source.stop(); // stops the source immediately
	 */
	Tone.Source.prototype.stop = function(time){
		var now = this.now();
		time = this.toSeconds(time, now);
		if (this._stateAtTime(time) === Tone.State.Started){
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
	 *  Not ready yet. 
 	 *  @private
 	 *  @abstract
	 *  @param  {Time} time 
	 *  @returns {Tone.Source} this
	 */
	Tone.Source.prototype.pause = function(time){
		//if there is no pause, just stop it
		this.stop(time);
		return this;
	};

	/**
	 *  Sync the source to the Transport so that when the transport
	 *  is started, this source is started and when the transport is stopped
	 *  or paused, so is the source. 
	 *
	 *  @param {Time} [delay=0] Delay time before starting the source after the
	 *                               Transport has started. 
	 *  @returns {Tone.Source} this
	 *  @example
	 * //sync the source to start 1 measure after the transport starts
	 * source.sync("1m");
	 * //start the transport. the source will start 1 measure later. 
	 * Tone.Transport.start();
	 */
	Tone.Source.prototype.sync = function(delay){
		Tone.Transport.syncSource(this, delay);
		return this;
	};

	/**
	 *  Unsync the source to the Transport. See Tone.Source.sync
	 *  @returns {Tone.Source} this
	 */
	Tone.Source.prototype.unsync = function(){
		Tone.Transport.unsyncSource(this);
		return this;
	};

	/**
	 *	Clean up.
	 *  @return {Tone.Source} this
	 */
	Tone.Source.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.stop();
		clearTimeout(this._timeout);
		this.onended = Tone.noOp;
		this._writable("volume");
		this.volume.dispose();
		this.volume = null;
	};

	return Tone.Source;
});