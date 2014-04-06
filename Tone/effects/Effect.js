///////////////////////////////////////////////////////////////////////////////
//
//  EFFECTS UNIT
//
// 	connect the effect to the effectSend and to the effectReturn
//	setDry(-1) = 100% Wet
//	setDry(1) = 100% Dry
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone", "Tone/component/DryWet"], function(Tone){

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
	}

	Tone.extend(Tone.Effect, Tone);

	//adjust the dry/wet balance
	//dryness -1 to 1
	// 1 = 100% dry
	//-1 = 100% wet
	//@param {number} dryness
	//@param {number=} rampTime
	Tone.Effect.prototype.setDry = function(dryness, rampTime){
		this.dryWet.setDry(dryness, rampTime)
	}

	//@param {number} dryness
	//@param {number=} rampTime
	Tone.Effect.prototype.setWet = function(wetVal, rampTime){
		this.setDry(-wetVal, rampTime);
	}

	Tone.Effect.prototype.bypass = function(){
		this.setDry(1, 0);
	}

	Tone.Effect.prototype.connectEffect = function(effect){
		this.chain(this.effectSend, effect, this.effectReturn);
	}

	return Tone.Effect;
});