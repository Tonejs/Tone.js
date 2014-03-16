///////////////////////////////////////////////////////////////////////////////
//
//  EFFECTS UNIT
//
// 	connect the effect to the effectSend and to the effectReturn
///////////////////////////////////////////////////////////////////////////////


Tone.Effect = function(){
	//extends Unit
	Tone.call(this);

	//components
	this.dry = this.context.createGain();
	this.effectSend = this.context.createGain();
	this.effectReturn = this.context.createGain();

	//connections
	this.input.connect(this.dry);
	this.dry.connect(this.output);
	this.input.connect(this.effectSend);
	this.effectReturn.connect(this.output);
	
	//some initial values
	this.setDry(.5);
}

Tone.extend(Tone.Effect, Tone);

//adjust the dry/wet balance
//dryness 0-1
Tone.Effect.prototype.setDry = function(dryness, duration){
	duration = this.defaultArg(duration, this.fadeTime);
	var dryGain = this.equalPowerGain(dryness);
	var wetGain = this.equalPowerGain(1 - dryness);
	this.rampToValue(this.dry.gain, dryGain, duration);
	this.rampToValue(this.effectSend.gain, wetGain, duration);
}

//adjust the wet/dry balance
Tone.Effect.prototype.setWet = function(wetness, duration){
	this.setDry(1 - wetness);
}

Tone.Effect.prototype.bypass = function(){
	this.setDry(1);
}

Tone.Effect.prototype.connectEffect = function(effect){
	this.chain(this.effectSend, effect, this.effectReturn);
}