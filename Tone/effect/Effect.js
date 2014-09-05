define(["Tone/core/Tone", "Tone/component/DryWet"], function(Tone){

	"use strict";
	
	/**
	 * 	@class  Effect is the base class for effects. connect the effect between
	 * 	        the effectSend and effectReturn GainNodes. then control the amount of
	 * 	        effect which goes to the output using the dry/wet control.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [initalDry=0] the starting dry value
	 *                             defaults to 100% wet
	 */
	Tone.Effect = function(){

		Tone.call(this);

		//get all of the defaults
		var options = this.optionsObject(arguments, ["dry"], Tone.Effect.defaults);

		/**
		 *  the drywet knob to control the amount of effect
		 *  
		 *  @type {Tone.DryWet}
		 */
		this.dryWet = new Tone.DryWet();

		/**
		 *  connect the effectSend to the input of hte effect
		 *  
		 *  @type {GainNode}
		 */
		this.effectSend = this.context.createGain();

		/**
		 *  connect the output of the effect to the effectReturn
		 *  
		 *  @type {GainNode}
		 */
		this.effectReturn = this.context.createGain();

		//connections
		this.input.connect(this.dryWet.dry);
		this.input.connect(this.effectSend);
		this.effectReturn.connect(this.dryWet.wet);
		this.dryWet.connect(this.output);
		//setup values
		this.setDry(options.dry);
	};

	Tone.extend(Tone.Effect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Effect.defaults = {
		"dry" : 0
	};

	/**
	 * setDry adjusts the dry / wet balance
	 * dryness is 0 (100% wet) to 1 (100% dry)
	 * 
	 * @param {number} dryness
	 * @param {Tone.Time=} rampTime
	 */
	Tone.Effect.prototype.setDry = function(dryness, rampTime){
		this.dryWet.setDry(dryness, rampTime);
	};

	/**
	 * setWet also adjusts the dry / wet balance
	 * wetVal is 0 (100% dry) to 1 (100% wet)
	 * 
	 * @param {number} wetness
	 * @param {Tone.Time=} rampTime
	 */
	Tone.Effect.prototype.setWet = function(wetVal, rampTime){
		this.dryWet.setWet(wetVal, rampTime);
	};

	/**
	 *  set in bulk
	 *  @param {Object} param
	 */
	Tone.Effect.prototype.set = function(params){
		if (!this.isUndef(params.dry)) this.setDry(params.dry);
		if (!this.isUndef(params.wet)) this.setWet(params.wet);
	};

	/**
	 *  bypass the effect
	 */
	Tone.Effect.prototype.bypass = function(){
		this.setDry(1);
	};

	/**
	 *  chains the effect in between the effectSend and effectReturn
	 *  @param  {Tone} effect
	 */
	Tone.Effect.prototype.connectEffect = function(effect){
		this.chain(this.effectSend, effect, this.effectReturn);
	};

	/**
	 *  set the preset if it exists
	 *  @param {string} presetName the name of the preset
	 */
	Tone.Effect.prototype.setPreset = function(presetName){
		if (!this.isUndef(this.preset) && this.preset.hasOwnProperty(presetName)){
			this.set(this.preset[presetName]);
		}
	};

	/**
	 *  tear down
	 */
	Tone.Effect.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.dryWet.dispose();
		this.effectSend.disconnect();
		this.effectReturn.disconnect();
		this.dryWet = null;
		this.effectSend = null;
		this.effectReturn = null;
	};

	return Tone.Effect;
});