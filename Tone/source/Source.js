define(["Tone/core/Tone", "Tone/core/Transport"], function(Tone){
	/**
	 *  base class for sources
	 *
	 *  sources have start/stop/pause
	 *
	 *  they also have the ability to be synced to the 
	 *  start/stop/pause of Tone.Transport
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
	 */
	Tone.Source.prototype.sync = function(){
		if (this.state !== Tone.Source.State.SYNCED){
			this.state = Tone.Source.State.SYNCED;
			Tone.Transport.sync(this);
		}
	};

	/**
	 *  unsync the source to the Transport
	 */
	Tone.Source.prototype.unsync = function(){
		if (this.state === Tone.Source.State.SYNCED){
			Tone.Transport.unsync(this);
		}
	};


	/**
	 *  @param {number} value 
	 *  @param {Tone.Time=} fadeTime (optional) time it takes to reach the value
	 */
	Tone.Source.prototype.setVolume = function(value, fadeTime){
		var now = this.now();
		if (fadeTime){
			var currentVolume = this.output.gain.value;
			this.output.gain.cancelScheduledValues(now);
			this.output.gain.setValueAtTime(currentVolume, now);
			this.output.gain.linearRampToValueAtTime(value, now + this.toSeconds(time));
		} else {
			this.output.gain.setValueAtTime(value, now);
		}
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