define(["Tone/core/Tone"], 
function(Tone){

	/**
	 *  base class for sources
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */	
	Tone.Source = function(){

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
	Tone.Source.prototype.pause = function(){};

	/**
	 *  @param {number} value 
	 *  @param {Tone.Time} time (relative to 'now')
	 */
	Tone.Source.prototype.fadeTo = function(value, time){
		var currentVolume = this.output.gain.value;
		var now = this.now();
		this.output.gain.cancelScheduledValues(now);
		this.output.gain.setValueAtTime(currentVolume, now);
		this.output.gain.linearRampToValueAtTime(value, this.toSeconds(time));
	};

	/**
	 *  @param {number} value 
	 */
	Tone.Source.prototype.setVolume = function(value){
		this.output.gain.value = value;
	};

	return Tone.Source;
});