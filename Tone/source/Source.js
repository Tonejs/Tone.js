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
	};

	/**
	 *  @abstract
	 *  @param  {Tone.Time} time 
	 */
	Tone.Source.prototype.start = function(){};

	/**
 	 *  @abstract
	 *  @param  {Tone.Time} time 
	 */
	Tone.Source.prototype.stop = function(){};


	/**
 	 *  @abstract
	 *  @param  {Tone.Time} time 
	 */
	Tone.Source.prototype.pause = function(time){
		//if there is no pause, just stop it
		this.stop(time);
	};

	/**
	 *  sync the source to the Transport
	 *
	 *  @param {Tone.Time} [delay=0] delay time before starting the source
	 */
	Tone.Source.prototype.sync = function(delay){
		Tone.Transport.syncSource(this, delay);
	};

	/**
	 *  unsync the source to the Transport
	 */
	Tone.Source.prototype.unsync = function(){
		Tone.Transport.unsyncSource(this);
	};

	/**
	 *  gets the setVolume method from {@link Tone.Master}
	 *  @method
	 */
	Tone.Source.prototype.setVolume = Tone.Master.setVolume;

	/**
	 *  gets the getVolume method from {@link Tone.Master}
	 *  @method
	 */
	Tone.Source.prototype.getVolume = Tone.Master.getVolume;

	/**
	 *	clean up
	 *  @private
	 */
	Tone.Source.prototype._dispose = function(){
		this.state = null;
	};

	/**
	 *  internal onended callback
	 *  @private
	 */
	Tone.Source.prototype._onended = function(){
		this.onended();
	};

	/**
	 * the volume of the source
	 * @memberOf Tone.Source#
	 * @type {number}
	 * @name volume
	 */
	Tone._defineGetterSetter(Tone.Source, "volume");

	/**
	 *  @enum {string}
	 */
	Tone.Source.State = {
		STARTED : "started",
		PAUSED : "paused",
		STOPPED : "stopped",
		SYNCED : "synced"
 	};

	return Tone.Source;
});