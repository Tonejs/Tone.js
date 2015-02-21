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
		 *  @type {Tone.Source.State}
		 *  @readOnly
		 */
		this.state = Tone.Source.State.STOPPED;

		/**
		 * the onended callback when the source is done playing
		 * @type {function}
		 */
		this.onended = options.onended;

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
	 *  star thte source
	 *  @param  {Tone.Time} time 
	 *  @returns {Tone.Source} `this`
	 */
	Tone.Source.prototype.start = function(time){
		if (this.state !== Tone.Source.State.STARTED || this.retrigger){
			this.state = Tone.Source.State.STARTED;
			var now = this.now();
			time = this.toSeconds(time, now);
			this._start.apply(this, arguments);
		}
		return this;
	};

	/**
	 * 	stop the source
	 *  @param  {Tone.Time} time 
	 *  @returns {Tone.Source} `this`
	 */
	Tone.Source.prototype.stop = function(time){
		if (this.state !== Tone.Source.State.STOPPED){
			clearTimeout(this._timeout);
			var now = this.now();
			time = this.toSeconds(time, now);
			var diff = now - time;
			if (diff !== 0){
				this._timeout = setTimeout(function(){
					this.state = Tone.Source.State.STOPPED;
					this.onended();
				}.bind(this), diff * 1000);
			} else {
				this.state = Tone.Source.State.STOPPED;
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
		this.state = null;
		clearTimeout(this._timeout);
		this.onended = function(){};
		this.volume.dispose();
		this.volume = null;
	};

	/**
	 *  internal onended callback
	 *  @private
	 */
	Tone.Source.prototype._onended = function(){
		this.state = Tone.Source.State.STOPPED;
		this.onended();
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