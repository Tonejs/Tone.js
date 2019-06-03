import Tone from "../core/Tone";
import "../effect/Effect";
import "../component/Split";
import "../component/Merge";
import "../component/CrossFade";

/**
 *  @class Base class for Stereo effects. Provides effectSendL/R and effectReturnL/R.
 *
 *	@constructor
 *	@extends {Tone.Effect}
 */
Tone.StereoEffect = function(){

	//get the defaults
	Tone.AudioNode.call(this);
	var options = Tone.defaults(arguments, ["wet"], Tone.Effect);
	this.createInsOuts(1, 1);

	/**
	 *  the drywet knob to control the amount of effect
	 *  @type {Tone.CrossFade}
	 *  @private
	 */
	this._dryWet = new Tone.CrossFade(options.wet);

	/**
	 *  The wet control, i.e. how much of the effected
	 *  will pass through to the output.
	 *  @type {NormalRange}
	 *  @signal
	 */
	this.wet = this._dryWet.fade;

	/**
	 *  then split it
	 *  @type {Tone.Split}
	 *  @private
	 */
	this._split = new Tone.Split();

	/**
	 *  the effects send LEFT
	 *  @type {GainNode}
	 *  @private
	 */
	this.effectSendL = this._split.left;

	/**
	 *  the effects send RIGHT
	 *  @type {GainNode}
	 *  @private
	 */
	this.effectSendR = this._split.right;

	/**
	 *  the stereo effect merger
	 *  @type {Tone.Merge}
	 *  @private
	 */
	this._merge = new Tone.Merge();

	/**
	 *  the effect return LEFT
	 *  @type {GainNode}
	 *  @private
	 */
	this.effectReturnL = this._merge.left;

	/**
	 *  the effect return RIGHT
	 *  @type {GainNode}
	 *  @private
	 */
	this.effectReturnR = this._merge.right;

	//connections
	Tone.connect(this.input, this._split);
	//dry wet connections
	Tone.connect(this.input, this._dryWet, 0, 0);
	this._merge.connect(this._dryWet, 0, 1);
	this._dryWet.connect(this.output);
	this._readOnly(["wet"]);
};

Tone.extend(Tone.StereoEffect, Tone.Effect);

/**
 *  Clean up.
 *  @returns {Tone.StereoEffect} this
 */
Tone.StereoEffect.prototype.dispose = function(){
	Tone.AudioNode.prototype.dispose.call(this);
	this._dryWet.dispose();
	this._dryWet = null;
	this._split.dispose();
	this._split = null;
	this._merge.dispose();
	this._merge = null;
	this.effectSendL = null;
	this.effectSendR = null;
	this.effectReturnL = null;
	this.effectReturnR = null;
	this._writable(["wet"]);
	this.wet = null;
	return this;
};

export default Tone.StereoEffect;

