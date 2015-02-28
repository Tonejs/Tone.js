define(["Tone/core/Tone", "Tone/core/Master", "Tone/core/Note"], function(Tone){

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
		 *  @private
		 */
		this.output = this.context.createGain();

		/**
		 * the volume of the output in decibels
		 * @type {Tone.Signal}
		 */
		this.volume = new Tone.Signal(this.output.gain, Tone.Signal.Units.Decibels);
	};

	Tone.extend(Tone.Instrument);

	/**
	 *  @abstract
	 *  @param {string|number} note the note to trigger
	 *  @param {Tone.Time} [time=now] the time to trigger the ntoe
	 *  @param {number} [velocity=1] the velocity to trigger the note
	 */
	Tone.Instrument.prototype.triggerAttack = function(){};

	/**
	 *  @abstract
	 *  @param {Tone.Time} [time=now] when to trigger the release
	 */
	Tone.Instrument.prototype.triggerRelease = function(){};

	/**
	 *  trigger the attack and then the release
	 *  @param  {string|number} note     the note to trigger
	 *  @param  {Tone.Time} duration the duration of the note
	 *  @param {Tone.Time} [time=now]     the time of the attack
	 *  @param  {number} velocity the velocity
	 *  @returns {Tone.Instrument} `this`
	 */
	Tone.Instrument.prototype.triggerAttackRelease = function(note, duration, time, velocity){
		time = this.toSeconds(time);
		duration = this.toSeconds(duration);
		this.triggerAttack(note, time, velocity);
		this.triggerRelease(time + duration);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.Instrument} `this`
	 */
	Tone.Instrument.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.volume.dispose();
		this.volume = null;
		return this;
	};

	return Tone.Instrument;
});