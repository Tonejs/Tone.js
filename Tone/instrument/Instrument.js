define(["Tone/core/Tone", "Tone/source/Source", "Tone/core/Note"], function(Tone){

	"use strict";

	/**
	 *  @class  Base-class for all instruments
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Instrument = function(){

		/**
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();
	};

	Tone.extend(Tone.Instrument);

	/**
	 *  @abstract
	 *  @param {string|number} note the note to trigger
	 *  @param {Tone.Time=} time the time to trigger the ntoe
	 *  @param {number=} velocity the velocity to trigger the note
	 */
	Tone.Instrument.prototype.triggerAttack = function(){};

	/**
	 *  @abstract
	 *  @param {Tone.Time=} time when to trigger the release
	 */
	Tone.Instrument.prototype.triggerRelease = function(){};

	/**
	 *  trigger the attack and then the release
	 *  @param  {string|number} note     the note to trigger
	 *  @param  {Tone.Time=} duration the duration of the note
	 *  @param  {Tone.Time=} time     the time of the attack
	 *  @param  {number} velocity the velocity
	 */
	Tone.Instrument.prototype.triggerAttackRelease = function(note, duration, time, velocity){
		time = this.toSeconds(time);
		duration = this.toSeconds(duration);
		this.triggerAttack(note, time, velocity);
		this.triggerRelease(time + duration);
	};

	/**
	 *  gets the setVolume method from {@link Tone.Source}
	 *  @method
	 */
	Tone.Instrument.prototype.setVolume = Tone.Source.prototype.setVolume;

	/**
	 *  clean up
	 */
	Tone.Instrument.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
	};

	return Tone.Instrument;
});