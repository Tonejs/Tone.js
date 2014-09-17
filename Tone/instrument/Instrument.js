define(["Tone/core/Tone", "Tone/source/Source"], function(Tone){

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
	 */
	Tone.Instrument.prototype.triggerAttack = function(){};

	/**
	 *  @abstract
	 */
	Tone.Instrument.prototype.triggerRelease = function(){};

	/**
	 *  @abstract
	 */
	Tone.Instrument.prototype.triggerAttackRelease = function(){};

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