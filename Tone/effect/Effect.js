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
		 *  @private
		 */
		this._dryWet = new Tone.CrossFade(options.wet);

		/**
		 *  The wet control, i.e. how much of the effected
		 *  will pass through to the output. 
		 *  @type {Tone.Signal}
		 */
		this.wet = this._dryWet.fade;

		/**
		 *  connect the effectSend to the input of hte effect
		 *  
		 *  @type {GainNode}
		 *  @private
		 */
		this.effectSend = this.context.createGain();

		/**
		 *  connect the output of the effect to the effectReturn
		 *  
		 *  @type {GainNode}
		 *  @private
		 */
		this.effectReturn = this.context.createGain();

		//connections
		this.input.connect(this._dryWet.a);
		this.input.connect(this.effectSend);
		this.effectReturn.connect(this._dryWet.b);
		this._dryWet.connect(this.output);
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
	 *  bypass the effect
	 *  @returns {Tone.Effect} `this`
	 */
	Tone.Effect.prototype.bypass = function(){
		this.wet.value = 0;
		return this;
	};

	/**
	 *  chains the effect in between the effectSend and effectReturn
	 *  @param  {Tone} effect
	 *  @private
	 *  @returns {Tone.Effect} `this`
	 */
	Tone.Effect.prototype.connectEffect = function(effect){
		this.effectSend.chain(effect, this.effectReturn);
		return this;
	};

	/**
	 *  tear down
	 *  @returns {Tone.Effect} `this`
	 */
	Tone.Effect.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._dryWet.dispose();
		this._dryWet = null;
		this.effectSend.disconnect();
		this.effectSend = null;
		this.effectReturn.disconnect();
		this.effectReturn = null;
		this.wet = null;
		return this;
	};

	return Tone.Effect;
});