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
		 */
		this.output = this.context.createGain();
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
	 *  bulk setter
	 *  @param {Object} params the params
	 *  @returns {Tone.Instrument} `this`
	 */
	Tone.Instrument.prototype.set = function(params) {
		if (!this.isUndef(params.volume)) this.setVolume(params.volume);
		return this;
	};

	/**
	 *  gets the setVolume method from {@link Tone.Master}
	 *  @method
	 */
	Tone.Instrument.prototype.setVolume = Tone.Master.setVolume;

	/**
	 *  gets the setVolume method from {@link Tone.Master}
	 *  @method
	 */
	Tone.Instrument.prototype.setVolume = Tone.Master.setVolume;

	/**
	 *  clean up
	 *  @returns {Tone.Instrument} `this`
	 */
	Tone.Instrument.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		return this;
	};

	return Tone.Instrument;
});