define(["Tone/core/Tone", "Tone/instrument/Instrument", "Tone/source/Noise", "Tone/component/LowpassCombFilter"], function(Tone){

	"use strict";

	/**
	 *  @class Karplus-String string synthesis. 
	 *  
	 *  @constructor
	 *  @extends {Tone.Instrument}
	 *  @param {Object} options see the defaults
	 *  @example
	 *  var plucky = new Tone.PluckSynth();
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
		 *  The amount of noise at the attack. 
		 *  Nominal range of [0.1, 20]
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
	 *  @returns {Tone.PluckSynth} `this`
	 */
	Tone.PluckSynth.prototype.triggerAttack = function(note, time) {
		note = this.toFrequency(note);
		time = this.toSeconds(time);
		var delayAmount = 1 / note;
		this._lfcf.setDelayTimeAtTime(delayAmount, time);		
		this._noise.start(time);
		this._noise.stop(time + delayAmount * this.attackNoise);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.PluckSynth} `this`
	 */
	Tone.PluckSynth.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		this._noise.dispose();
		this._lfcf.dispose();
		this._noise = null;
		this._lfcf = null;
		this.dampening = null;
		this.resonance = null;
		return this;
	};

	return Tone.PluckSynth;
});