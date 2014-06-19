define(["Tone/core/Tone", "Tone/component/DryWet"], function(Tone){
	/**
	 * Effect allows you to connect it to the effectSend and to the effectReturn
	 */
	Tone.Effect = function(){
		//extends Unit
		Tone.call(this);

		//components
		this.dryWet = new Tone.DryWet();
		this.effectSend = this.context.createGain();
		this.effectReturn = this.context.createGain();

		//connections
		this.input.connect(this.dryWet.dry);
		this.input.connect(this.effectSend);
		this.effectReturn.connect(this.dryWet.wet);
		this.dryWet.connect(this.output);
		
		//setup
		this.setDry(0);
	};

	Tone.extend(Tone.Effect, Tone);

	/**
	 * setDry adjusts the dry / wet balance
	 * dryness is -1 (100% wet) to 1 (100% dry)
	 * 
	 * @param {number} dryness
	 * @param {number=} rampTime
	 */
	Tone.Effect.prototype.setDry = function(dryness, rampTime){
		this.dryWet.setDry(dryness, rampTime);
	};

	/**
	 * setWet also adjusts the dry / wet balance
	 * wetVal is -1 (100% dry) to 1 (100% wet)
	 * 
	 * @param {number} wetness
	 * @param {number=} rampTime
	 */
	Tone.Effect.prototype.setWet = function(wetVal, rampTime){
		this.setDry(-wetVal, rampTime);
	};

	Tone.Effect.prototype.bypass = function(){
		this.setDry(1, 0);
	};

	Tone.Effect.prototype.connectEffect = function(effect){
		this.chain(this.effectSend, effect, this.effectReturn);
	};

	return Tone.Effect;
});