///////////////////////////////////////////////////////////////////////////////
//
//  EFFECTS UNIT
//
//  A WebAudio.Unit with dry/wet controls
// 	connect the effect to the effectSend and to the effectReturn
///////////////////////////////////////////////////////////////////////////////


WebAudio.Effect = function(){
	//extends Unit
	WebAudio.Unit.call(this);
	//member vars
	this.dry = WebAudio.createGain();
	this.effectSend = WebAudio.createGain();
	this.effectReturn = WebAudio.createGain();
	this.feedback = WebAudio.createGain();
	this.feedback.gain.value = 0;
	//connections
	this.input.connect(this.dry);
	this.dry.connect(this.output);
	this.input.connect(this.effectSend);
	this.effectReturn.connect(this.output);
	this.effectReturn.connect(this.feedback);
	this.feedback.connect(this.effectSend);
}

WebAudio.extend(WebAudio.Effect, WebAudio.Unit);

//adjust the dry/wet balance
//dryness 0-1
WebAudio.Effect.prototype.setDry = function(dryness, duration){
	duration = this.defaultArgument(duration, WebAudio.fadeTime);
	this.rampToValue(this.dry.gain, dryness, duration);
	this.rampToValue(this.effectSend.gain, 1 - dryness, duration);
}

//adjust the wet/dry balance
WebAudio.Effect.prototype.setWet = function(wetness, duration){
	this.setDry(1 - wetness);
}

WebAudio.Effect.prototype.bypass = function(){
	this.setDry(1);
}

WebAudio.Effect.prototype.setFeedback = function(fback){
	this.rampToValue(this.feedback.gain, fback);
}

WebAudio.Effect.prototype.setEffect = function(effect){
	this.chain([this.effectSend, effect, this.effectReturn]);
}