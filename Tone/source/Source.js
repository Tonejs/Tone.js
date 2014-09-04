define(["Tone/core/Tone", "Tone/core/Transport"], function(Tone){

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
	Tone.Source = function(){
		/**
		 *  unlike most ToneNodes, Sources only have an output and no input
		 *  
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  @type {Tone.Source.State}
		 */
		this.state = Tone.Source.State.STOPPED;
	};

	Tone.extend(Tone.Source);

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
	 *  @param {Tone.Time=} delay optional delay time before starting the source
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
	 *  set the volume in decibels
	 *  @param {number} db in decibels
	 *  @param {Tone.Time=} fadeTime (optional) time it takes to reach the value
	 */
	Tone.Source.prototype.setVolume = function(db, fadeTime){
		var now = this.now();
		var gain = this.dbToGain(db);
		if (fadeTime){
			var currentVolume = this.output.gain.value;
			this.output.gain.cancelScheduledValues(now);
			this.output.gain.setValueAtTime(currentVolume, now);
			this.output.gain.linearRampToValueAtTime(gain, now + this.toSeconds(fadeTime));
		} else {
			this.output.gain.setValueAtTime(gain, now);
		}
	};

	/**
	 *	clean up  
	 */
	Tone.Source.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.state = null;
	};

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