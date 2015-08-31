define(["Tone/core/Tone", "Tone/core/Transport", "Tone/core/Master", 
	"Tone/core/Types", "Tone/core/TimelineState", "Tone/signal/Signal"], 
function(Tone){

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
		//Sources only have an output and no input
		Tone.call(this, 0, 1);

		options = this.defaultArg(options, Tone.Source.defaults);

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
		 * 	Keep track of the scheduled state.
		 *  @type {Tone.TimelineState}
		 *  @private
		 */
		this._state = new Tone.TimelineState(Tone.State.Stopped);

		/**
		 *  The synced `start` callback function from the transport
		 *  @type {Function}
		 *  @private
		 */
		this._bindedStart = this.start.bind(this);

		/**
		 *  The synced `stop` callback function from the transport
		 *  @type {Function}
		 *  @private
		 */
		this._bindedStop = this.stop.bind(this);

		/**
		 *  If the source is synced to the transport or not
		 *  @type {Boolean}
		 *  @private
		 */
		this._isSynced = false;

		/**
		 *  The offset from the start of the Transport `start`
		 *  @type {Time}
		 *  @private
		 */
		this._startDelay = 0;

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
			return this._state.getStateAtTime(this.now());
		}
	});

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
		if (this._isSynced){
			time += this.toSeconds(this._startDelay);
		}
		if (this._state.getStateAtTime(time) !== Tone.State.Started || this.retrigger){
			this._state.setStateAtTime(Tone.State.Started, time);
			if (this._start){
				this._start.apply(this, arguments);
			}
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
		time = this.toSeconds(time);
		if (this._state.getStateAtTime(time) === Tone.State.Started){
			this._state.setStateAtTime(Tone.State.Stopped, time);
			if (this._stop){
				this._stop.apply(this, arguments);
			}
		}
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
		this._isSynced = true;
		this._startDelay = this.defaultArg(delay, 0);
		Tone.Transport.on("start", this._bindedStart);
		Tone.Transport.on("stop pause", this._bindedStop);
		return this;
	};

	/**
	 *  Unsync the source to the Transport. See Tone.Source.sync
	 *  @returns {Tone.Source} this
	 */
	Tone.Source.prototype.unsync = function(){
		this._startDelay = 0;
		this._isSynced = false;
		Tone.Transport.off("start", this._bindedStart);
		Tone.Transport.off("stop pause", this._bindedStop);
		return this;
	};

	/**
	 *	Clean up.
	 *  @return {Tone.Source} this
	 */
	Tone.Source.prototype.dispose = function(){
		this.stop();
		Tone.prototype.dispose.call(this);
		this.unsync();
		this._writable("volume");
		this.volume.dispose();
		this.volume = null;
		this._state.dispose();
		this._state = null;
	};

	return Tone.Source;
});