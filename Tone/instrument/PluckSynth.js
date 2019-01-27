import Tone from "../core/Tone";
import "../instrument/Instrument";
import "../source/Noise";
import "../component/LowpassCombFilter";

/**
 *  @class Karplus-String string synthesis. Often out of tune.
 *         Will change when the AudioWorkerNode is available across
 *         browsers.
 *
 *  @constructor
 *  @extends {Tone.Instrument}
 *  @param {Object} [options] see the defaults
 *  @example
 * var plucky = new Tone.PluckSynth().toMaster();
 * plucky.triggerAttack("C4");
 */
Tone.PluckSynth = function(options){

	options = Tone.defaultArg(options, Tone.PluckSynth.defaults);
	Tone.Instrument.call(this, options);

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
	this.attackNoise = options.attackNoise;

	/**
	 *  the LFCF
	 *  @type {Tone.LowpassCombFilter}
	 *  @private
	 */
	this._lfcf = new Tone.LowpassCombFilter({
		"resonance" : options.resonance,
		"dampening" : options.dampening
	});

	/**
	 *  The resonance control.
	 *  @type {NormalRange}
	 *  @signal
	 */
	this.resonance = this._lfcf.resonance;

	/**
	 *  The dampening control. i.e. the lowpass filter frequency of the comb filter
	 *  @type {Frequency}
	 *  @signal
	 */
	this.dampening = this._lfcf.dampening;

	//connections
	this._noise.connect(this._lfcf);
	this._lfcf.connect(this.output);
	this._readOnly(["resonance", "dampening"]);
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
	"resonance" : 0.7
};

/**
 *  Trigger the note.
 *  @param {Frequency} note The note to trigger.
 *  @param {Time} [time=now] When the note should be triggered.
 *  @returns {Tone.PluckSynth} this
 */
Tone.PluckSynth.prototype.triggerAttack = function(note, time){
	note = this.toFrequency(note);
	time = this.toSeconds(time);
	var delayAmount = 1 / note;
	this._lfcf.delayTime.setValueAtTime(delayAmount, time);
	this._noise.start(time);
	this._noise.stop(time + delayAmount * this.attackNoise);
	return this;
};

/**
 *	Make this method which belongs to the parent class private since
 *	PluckSynth does not have any 'release' method.
 * 	@memberOf Tone.PluckSynth#
 *  @function
 *  @private
 *  @name triggerAttackRelease
 */

/**
 *  Clean up.
 *  @returns {Tone.PluckSynth} this
 */
Tone.PluckSynth.prototype.dispose = function(){
	Tone.Instrument.prototype.dispose.call(this);
	this._noise.dispose();
	this._lfcf.dispose();
	this._noise = null;
	this._lfcf = null;
	this._writable(["resonance", "dampening"]);
	this.dampening = null;
	this.resonance = null;
	return this;
};

export default Tone.PluckSynth;

