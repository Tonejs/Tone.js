define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/component/Split", "Tone/component/Merge"], 
function(Tone){

	"use strict";

	/**
	 *  @class Creates an effect with an effectSendL/R and effectReturnL/R
	 *
	 *	@constructor
	 *	@extends {Tone.Effect}
	 */
	Tone.StereoEffect = function(){

		Tone.call(this);
		//get the defaults
		var options = this.optionsObject(arguments, ["dry"], Tone.Effect.defaults);

		/**
		 *  the drywet knob to control the amount of effect
		 *  
		 *  @type {Tone.DryWet}
		 */
		this.dryWet = new Tone.DryWet();

		/**
		 *  make the incoming signal mono
		 *  @type {Tone.Merge}
		 *  @private
		 */
		this._mono = new Tone.Merge();

		/**
		 *  then split it
		 *  @type {Tone.Split}
		 *  @private
		 */
		this._split = new Tone.Split();

		/**
		 *  the effects send LEFT
		 *  @type {GainNode}
		 */
		this.effectSendL = this._split.left;

		/**
		 *  the effects send RIGHT
		 *  @type {GainNode}
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
		 */
		this.effectReturnL = this._merge.left;

		/**
		 *  the effect return RIGHT
		 *  @type {GainNode}
		 */
		this.effectReturnR = this._merge.right;

		//connections
		this.input.connect(this._mono, 0, 0);
		this.input.connect(this._mono, 0, 1);
		this._mono.connect(this._split);
		//dry wet connections
		this._mono.connect(this.dryWet.dry);
		this._merge.connect(this.dryWet.wet);
		this.dryWet.connect(this.output);
		//setup values
		this.setDry(options.dry);
	};

	Tone.extend(Tone.StereoEffect, Tone.Effect);

	/**
	 *  clean up
	 */
	Tone.StereoEffect.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.dryWet.dispose();
		this._mono.dispose();
		this._split.dispose();
		this._merge.dispose();
		this._mono = null;
		this._split = null;
		this._merge = null;
		this.effectSendL = null;
		this.effectSendR = null;
		this.effectReturnL = null;
		this.effectReturnR = null;
		this.dryWet = null;
	};

	return Tone.StereoEffect;
});