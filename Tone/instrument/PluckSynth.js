define(["Tone/core/Tone", "Tone/instrument/Instrument", "Tone/source/Noise", "Tone/component/LowpassCombFilter"], function(Tone){

	"use strict";

	/**
	 *  @class Karplus-String string synthesis. 
	 *  
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {Object} options see the defaults
	 */
	Tone.PluckSynth = function(options){

		options = this.defaultArg(options, Tone.PluckSynth.defaults);
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
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.PluckSynth.defaults = {
		"attackNoise" : 1,
		"dampening" : 4000,
		"resonance" : 0.5
	};

	/**
	 *  trigger the attack portion
	 *  @param {string|number} note the note name or frequency
	 *  @param {Tone.Time} [time=now] the time of the note
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
	 *  set the resonance of the instrument
	 *  @param {number} resonance the resonance between (0, 1)
	 */
	Tone.PluckSynth.prototype.setResonance = function(resonance) {
		this.resonance.setValue(resonance);
	};

	/**
	 *  set the dampening of the instrument
	 *  @param {number} dampening a frequency value of the lowpass filter
	 *                            nominal range of (1000, 10000)
	 */
	Tone.PluckSynth.prototype.setDampening = function(dampening) {
		this.dampening.setValue(dampening);
	};

	/**
	 *  set the length of the attack noise
	 *  @param {number} attackNoise	the length of the attack nosie. 
	 *                              a value of 1 is normal.
	 */
	Tone.PluckSynth.prototype.setAttackNoise = function(attackNoise) {
		this.attackNoise = attackNoise;
	};

	/**
	 *  bulk setter
	 *  @param {Object} param 
	 */
	Tone.PluckSynth.prototype.set = function(params){
		if (!this.isUndef(params.resonance)) this.setResonance(params.resonance);
		if (!this.isUndef(params.dampening)) this.setDampening(params.dampening);
		if (!this.isUndef(params.attackNoise)) this.setAttackNoise(params.attackNoise);
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