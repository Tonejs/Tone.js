define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/component/Split", 
	"Tone/component/Merge", "Tone/component/CrossFade"], 
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
		var options = this.optionsObject(arguments, ["wet"], Tone.Effect.defaults);

		/**
		 *  the drywet knob to control the amount of effect
		 *  
		 *  @type {Tone.CrossFade}
		 */
		this.dryWet = new Tone.CrossFade();

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
		this.input.connect(this._split);
		//dry wet connections
		this.input.connect(this.dryWet, 0, 0);
		this._merge.connect(this.dryWet, 0, 1);
		this.dryWet.connect(this.output);
		//setup values
		this.setWet(options.wet);
	};

	Tone.extend(Tone.StereoEffect, Tone.Effect);

	/**
	 *  clean up
	 *  @returns {Tone.StereoEffect} `this`
	 */
	Tone.StereoEffect.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.dryWet.dispose();
		this.dryWet = null;
		this._split.dispose();
		this._split = null;
		this._merge.dispose();
		this._merge = null;
		this.effectSendL = null;
		this.effectSendR = null;
		this.effectReturnL = null;
		this.effectReturnR = null;
		return this;
	};

	return Tone.StereoEffect;
});