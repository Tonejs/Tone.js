define(["Tone/core/Tone", "Tone/core/Transport", "Tone/component/Volume", "Tone/core/Master",
	"Tone/type/Type", "Tone/core/TimelineState", "Tone/signal/Signal"], 
function(Tone){

	"use strict";
	
	/**
	 *  @class  Base class for sources. Sources have start/stop methods
	 *          and the ability to be synced to the 
	 *          start/stop of Tone.Transport. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @example
	 * //Multiple state change events can be chained together,
	 * //but must be set in the correct order and with ascending times
	 * 
	 * // OK
	 * state.start().stop("+0.2");
	 * // AND
	 * state.start().stop("+0.2").start("+0.4").stop("+0.7")
	 *
	 * // BAD
	 * state.stop("+0.2").start();
	 * // OR
	 * state.start("+0.3").stop("+0.2");
	 * 
	 */	
	Tone.Source = function(options){

		// this.createInsOuts(0, 1);

		options = this.defaultArg(options, Tone.Source.defaults);

		/**
		 *  The output volume node
		 *  @type  {Tone.Volume}
		 *  @private
		 */
		this._volume = this.output = new Tone.Volume(options.volume);

		/**
		 * The volume of the output in decibels.
		 * @type {Decibels}
		 * @signal
		 * @example
		 * source.volume.value = -6;
		 */
		this.volume = this._volume.volume;
		this._readOnly("volume");

		/**
		 * 	Keep track of the scheduled state.
		 *  @type {Tone.TimelineState}
		 *  @private
		 */
		this._state = new Tone.TimelineState(Tone.State.Stopped);
		this._state.memory = 10;

		/**
		 *  The synced `start` callback function from the transport
		 *  @type {Function}
		 *  @private
		 */
		this._synced = false;

		/**
		 *  Keep track of all of the scheduled event ids
		 *  @type  {Array}
		 *  @private
		 */
		this._scheduled = [];

		//make the output explicitly stereo
		this._volume.output.output.channelCount = 2;
		this._volume.output.output.channelCountMode = "explicit";
		//mute initially
		this.mute = options.mute;
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
		"mute" : false
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
			if (this._synced){
				if (Tone.Transport.state === Tone.State.Started){
					return this._state.getValueAtTime(Tone.Transport.seconds);
				} else {
					return Tone.State.Stopped;
				}
			} else {
				return this._state.getValueAtTime(this.now());
			}
		}
	});

	/**
	 * Mute the output. 
	 * @memberOf Tone.Source#
	 * @type {boolean}
	 * @name mute
	 * @example
	 * //mute the output
	 * source.mute = true;
	 */
	Object.defineProperty(Tone.Source.prototype, "mute", {
		get : function(){
			return this._volume.mute;
		}, 
		set : function(mute){
			this._volume.mute = mute;
		}
	});

	//overwrite these functions
	Tone.Source.prototype._start = Tone.noOp;
	Tone.Source.prototype._stop = Tone.noOp;

	/**
	 *  Start the source at the specified time. If no time is given, 
	 *  start the source now.
	 *  @param  {Time} [time=now] When the source should be started.
	 *  @returns {Tone.Source} this
	 *  @example
	 * source.start("+0.5"); //starts the source 0.5 seconds from now
	 */
	Tone.Source.prototype.start = function(time, offset, duration){
		if (this.isUndef(time) && this._synced){
			time = Tone.Transport.seconds;
		} else {
			time = this.toSeconds(time);
		}	
		//if it's started, stop it and restart it
		if (!this.retrigger && this._state.getValueAtTime(time) === Tone.State.Started){
			this.stop(time);
		}
		this._state.setStateAtTime(Tone.State.Started, time);
		if (this._synced){
			// add the offset time to the event
			var event = this._state.get(time);
			event.offset = this.defaultArg(offset, 0);
			event.duration = duration;
			var sched = Tone.Transport.schedule(function(t){
				this._start(t, offset, duration);
			}.bind(this), time);
			this._scheduled.push(sched);
		} else {
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
		if (this.isUndef(time) && this._synced){
			time = Tone.Transport.seconds;
		} else {
			time = this.toSeconds(time);
		}
		this._state.cancel(time);
		this._state.setStateAtTime(Tone.State.Stopped, time);
		if (!this._synced){
			this._stop.apply(this, arguments);
		} else {
			var sched = Tone.Transport.schedule(this._stop.bind(this), time);
			this._scheduled.push(sched);
		}	
		return this;
	};
	
	/**
	 *  Sync the source to the Transport so that all subsequent
	 *  calls to `start` and `stop` are synced to the TransportTime
	 *  instead of the AudioContext time. 
	 *
	 *  @returns {Tone.Source} this
	 *  @example
	 * //sync the source so that it plays between 0 and 0.3 on the Transport's timeline
	 * source.sync().start(0).stop(0.3);
	 * //start the transport.
	 * Tone.Transport.start();
	 *
	 *  @example
	 * //start the transport with an offset and the sync'ed sources
	 * //will start in the correct position
	 * source.sync().start(0.1);
	 * //the source will be invoked with an offset of 0.4
	 * Tone.Transport.start("+0.5", 0.5);
	 */
	Tone.Source.prototype.sync = function(){
		this._synced = true;
		Tone.Transport.on("start loopStart", function(time, offset){
			if (offset > 0){
				// get the playback state at that time
				var stateEvent = this._state.get(offset);
				// listen for start events which may occur in the middle of the sync'ed time
				if (stateEvent && stateEvent.state === Tone.State.Started && stateEvent.time !== offset){
					// get the offset
					var startOffset = offset - this.toSeconds(stateEvent.time);
					var duration;
					if (stateEvent.duration){
						duration = this.toSeconds(stateEvent.duration) - startOffset;	
					}
					this._start(time, this.toSeconds(stateEvent.offset) + startOffset, duration);
				}
			}
		}.bind(this));
		Tone.Transport.on("stop pause loopEnd", function(time){
			if (this._state.getValueAtTime(Tone.Transport.seconds) === Tone.State.Started){
				this._stop(time);
			}
		}.bind(this));
		return this;
	};

	/**
	 *  Unsync the source to the Transport. See Tone.Source.sync
	 *  @returns {Tone.Source} this
	 */
	Tone.Source.prototype.unsync = function(){
		this._synced = false;
		Tone.Transport.off("start stop pause loopEnd loopStart");
		// clear all of the scheduled ids
		for (var i = 0; i < this._scheduled.length; i++){
			var id = this._scheduled[i];
			Tone.Transport.clear(id);
		}
		this._scheduled = [];
		this._state.cancel(0);
		return this;
	};

	/**
	 *	Clean up.
	 *  @return {Tone.Source} this
	 */
	Tone.Source.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.unsync();
		this._scheduled = null;
		this._writable("volume");
		this._volume.dispose();
		this._volume = null;
		this.volume = null;
		this._state.dispose();
		this._state = null;
	};

	return Tone.Source;
});