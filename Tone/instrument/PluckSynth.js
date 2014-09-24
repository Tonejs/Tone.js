define(["Tone/core/Tone", "Tone/instrument/Instrument", "Tone/source/Noise", "Tone/component/LowpassCombFilter"], function(Tone){

	"use strict";

	/**
	 *  @class Karplus-String string synthesis. 
	 *  
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 */
	Tone.PluckSynth = function(){

		Tone.Instrument.call(this);

		/**
		 *  @type {Tone.Noise}
		 *  @private
		 */
		this._noise = new Tone.Noise("pink");

		/**
		 *  the amount of noise at the attack. 
		 *  nominal range of [0.1, 20]
		 *  @type {number}
		 */
		this.attackNoise = 1;

		/**
		 *  the LFCF
		 *  @type {Tone.LowpassCombFilter}
		 *  @private
		 */
		this._lfcf = new Tone.LowpassCombFilter(1 / 440);

		/**
		 *  the resonance control
		 *  @type {Tone.Signal}
		 */
		this.resonance = this._lfcf.resonance;

		/**
		 *  the dampening control. i.e. the lowpass filter frequency of the comb filter
		 *  @type {Tone.Signal}
		 */
		this.dampening = this._lfcf.dampening;

		//connections
		this._noise.connect(this._lfcf);
		this._lfcf.connect(this.output);
	};

	Tone.extend(Tone.PluckSynth, Tone.Instrument);


	/**
	 *  trigger the attack portion
	 */
	Tone.PluckSynth.prototype.triggerAttack = function(note, time) {
		if (typeof note === "string"){
			note = this.noteToFrequency(note);
		}
		time = this.toSeconds(time);
		var delayAmount = 1 / note;
		this._lfcf.setDelayTime(delayAmount, time);		
		this._noise.start(time);
		this._noise.stop(time + delayAmount * this.attackNoise);
	};

	/**
	 *  clean up
	 */
	Tone.PluckSynth.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		this._noise.dispose();
		this._lfcf.dispose();
		this._noise = null;
		this._lfcf = null;
		this.dampening = null;
		this.resonance = null;
	};

	return Tone.PluckSynth;
});