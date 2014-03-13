///////////////////////////////////////////////////////////////////////////////
//
//  EFFECTS UNIT
//
// 	connect the effect to the effectSend and to the effectReturn
///////////////////////////////////////////////////////////////////////////////


AudioUnit.Effect = function(){
	//extends Unit
	AudioUnit.call(this);

	//components
	this.dry = this.context.createGain();
	this.effectSend = this.context.createGain();
	this.effectReturn = this.context.createGain();
	this.feedback = this.context.createGain();
	this.feedback.gain.value = 0;

	//connections
	this.input.connect(this.dry);
	this.dry.connect(this.output);
	this.input.connect(this.effectSend);
	this.effectReturn.connect(this.output);
	//feedback loop
	this.chain(this.effectReturn, this.feedback, this.effectSend);

	//some initial values
	this.setDry(.5);
}

AudioUnit.extend(AudioUnit.Effect, AudioUnit);

//adjust the dry/wet balance
//dryness 0-1
AudioUnit.Effect.prototype.setDry = function(dryness, duration){
	duration = this.defaultArg(duration, this.fadeTime);
	var dryGain = this.equalPowerGain(dryness);
	var wetGain = this.equalPowerGain(1 - dryness);
	this.rampToValue(this.dry.gain, dryGain, duration);
	this.rampToValue(this.effectSend.gain, wetGain, duration);
}

//adjust the wet/dry balance
AudioUnit.Effect.prototype.setWet = function(wetness, duration){
	this.setDry(1 - wetness);
}

AudioUnit.Effect.prototype.bypass = function(){
	this.setDry(1);
}

AudioUnit.Effect.prototype.setFeedback = function(fback){
	this.rampToValue(this.feedback.gain, fback);
}

AudioUnit.Effect.prototype.connectEffect = function(effect){
	this.chain(this.effectSend, effect, this.effectReturn);
}