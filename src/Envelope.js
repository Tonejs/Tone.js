///////////////////////////////////////////////////////////////////////////////
//
//	Envelope
//
//	ADR envelope generator attaches to an AudioParam
///////////////////////////////////////////////////////////////////////////////

WebAudio.Envelope = function(audioParam, minOutput, maxOutput){
	//extend Unit
	WebAudio.Unit.call(this);

	this.input.connect(this.output);
	this.param = this.defaultArgument(audioParam, this.input.gain);
	this.attack = .01;
	this.decay = .1;
	this.release = .5;
	this.sustain = .0;
	this.min = this.defaultArgument(minOutput, 0);
	this.max = this.defaultArgument(maxOutput, 1);
	//set the initial
	this.param.value = this.min;
}

WebAudio.extend(WebAudio.Envelope, WebAudio.Unit);

//attack->decay->sustain
WebAudio.Envelope.prototype.triggerAttack = function(time){
	time = this.defaultArgument(time, WebAudio.now);
	this.param.cancelScheduledValues(time);
	this.param.setValueAtTime(this.min, time);
	this.param.linearRampToValueAtTime(this.max, time + this.attack);
	var sustainVal = (this.max - this.min) * this.sustain + this.min;
	this.param.linearRampToValueAtTime(sustainVal, time + this.decay + this.attack);
}

//triggers the release portiion of the envelope
WebAudio.Envelope.prototype.triggerRelease = function(time){
	time = this.defaultArgument(time, WebAudio.now);
	this.param.cancelScheduledValues(time);
	var sustainVal = (this.max - this.min) * this.sustain + this.min;
	this.param.setValueAtTime(sustainVal, time);
	this.param.linearRampToValueAtTime(this.min, time + this.release);
}

