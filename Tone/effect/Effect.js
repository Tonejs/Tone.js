define(["Tone/core/Tone", "Tone/component/DryWet"], function(Tone){
	
	/**
	 * 	@class  Effect is the base class for effects. connect the effect between
	 * 	the effectSend and effectReturn GainNodes. then control the amount of
	 * 	effect which goes to the output using the dry/wet control.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} initalDry the starting dry value
	 *                             defaults to 0.5 (50% dry / 50% wet)
	 */
	Tone.Effect = function(initialDry){
		Tone.call(this);

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
		this.setDry(this.defaultArg(initialDry, 0.5));
	};

	Tone.extend(Tone.Effect);

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
	 *  tear down
	 */
	Tone.Effect.prototype.dispose = function(){
		this.dryWet.dispose();
		this.input.disconnect();
		this.output.disconnect();
		this.effectSend.disconnect();
		this.effectReturn.disconnect();
		this.dryWet = null;
		this.input = null;
		this.output = null;
		this.effectSend = null;
		this.effectReturn = null;
	};

	return Tone.Effect;
});