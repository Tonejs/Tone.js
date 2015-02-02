define(["Tone/core/Tone", "Tone/component/CrossFade"], function(Tone){

	"use strict";
	
	/**
	 * 	@class  Effect is the base class for effects. connect the effect between
	 * 	        the effectSend and effectReturn GainNodes. then control the amount of
	 * 	        effect which goes to the output using the dry/wet control.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} [initialWet=0] the starting wet value
	 *                                 defaults to 100% wet
	 */
	Tone.Effect = function(){

		Tone.call(this);

		//get all of the defaults
		var options = this.optionsObject(arguments, ["wet"], Tone.Effect.defaults);

		/**
		 *  the drywet knob to control the amount of effect
		 *  @type {Tone.CrossFade}
		 */
		this.dryWet = new Tone.CrossFade();

		/**
		 *  the wet control
		 *  @type {Tone.Signal}
		 */
		this.wet = this.dryWet.fade;

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
		this.input.connect(this.dryWet.a);
		this.input.connect(this.effectSend);
		this.effectReturn.connect(this.dryWet.b);
		this.dryWet.connect(this.output);
		//setup values
		this.setWet(options.wet);
	};

	Tone.extend(Tone.Effect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Effect.defaults = {
		"wet" : 1
	};

	/**
	 * setWet also adjusts the dry / wet balance
	 * wetVal is 0 (100% dry) to 1 (100% wet)
	 * 
	 * @param {number} wetness
	 * @param {Tone.Time=} rampTime
	 * @returns {Tone.Effect} `this`
	 */
	Tone.Effect.prototype.setWet = function(wetVal, rampTime){
		this.dryWet.setFade(wetVal, rampTime);
		return this;
	};

	/**
	 *  bypass the effect
	 *  @returns {Tone.Effect} `this`
	 */
	Tone.Effect.prototype.bypass = function(){
		this.setWet(0);
		return this;
	};

	/**
	 *  chains the effect in between the effectSend and effectReturn
	 *  @param  {Tone} effect
	 *  @internal
	 *  @returns {Tone.Effect} `this`
	 */
	Tone.Effect.prototype.connectEffect = function(effect){
		this.effectSend.chain(effect, this.effectReturn);
		return this;
	};

	/**
	 *  set the preset if it exists
	 *  @param {string} presetName the name of the preset
	 *  @returns {Tone.Effect} `this`
	 */
	Tone.Effect.prototype.setPreset = function(presetName){
		if (!this.isUndef(this.preset) && this.preset.hasOwnProperty(presetName)){
			this.set(this.preset[presetName]);
		}
		return this;
	};

	/**
	 *  tear down
	 *  @returns {Tone.Effect} `this`
	 */
	Tone.Effect.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.dryWet.dispose();
		this.dryWet = null;
		this.effectSend.disconnect();
		this.effectSend = null;
		this.effectReturn.disconnect();
		this.effectReturn = null;
		this.wet = null;
		return this;
	};

	return Tone.Effect;
});