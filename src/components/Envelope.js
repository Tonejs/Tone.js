///////////////////////////////////////////////////////////////////////////////
//
//	Envelope
//
//	ADR envelope generator attaches to an AudioParam
///////////////////////////////////////////////////////////////////////////////

WebAudio.Envelope = function(attack, decay, sustain, release, audioParam, minOutput, maxOutput){
	//extend Unit
	WebAudio.Unit.call(this);

	this.input.connect(this.output);
	this.param = this.defaultArgument(audioParam, this.input.gain);
	this.attack = this.defaultArgument(attack, .01);
	this.decay = this.defaultArgument(decay, .1);
	this.release = this.defaultArgument(release, 1);
	this.sustain = this.defaultArgument(sustain, .5);
	this.min = this.defaultArgument(minOutput, 0);
	this.max = this.defaultArgument(maxOutput, 1);
	//set the initial
	this.param.value = this.min;
}

WebAudio.extend(WebAudio.Envelope, WebAudio.Unit);

//attack->decay->sustain
WebAudio.Envelope.prototype.triggerAttack = function(time){
	var startVal = this.min;
	if (!time){
		startVal = this.param.value;
	}
	time = this.defaultArgument(time, WebAudio.now);
	this.param.cancelScheduledValues(time);
	this.param.setValueAtTime(startVal, time);
	this.param.linearRampToValueAtTime(this.max, time + this.attack);
	var sustainVal = (this.max - this.min) * this.sustain + this.min;
	this.param.linearRampToValueAtTime(sustainVal, time + this.decay + this.attack);
}

//triggers the release portiion of the envelope
WebAudio.Envelope.prototype.triggerRelease = function(time){
	var startVal = this.param.value;
	if (time){
		startVal = (this.max - this.min) * this.sustain + this.min;
	}
	time = this.defaultArgument(time, WebAudio.now);
	this.param.cancelScheduledValues(time);
	this.param.setValueAtTime(startVal, time);
	this.param.linearRampToValueAtTime(this.min, time + this.release);
}

///////////////////////////////////////////////////////////////////////////////
//  SET VALUES
///////////////////////////////////////////////////////////////////////////////

//@param {number} attack (seconds)
WebAudio.Envelope.setAttack = function(attack){
	this.attack = attack;
}

//@param {number} decay (seconds)
WebAudio.Envelope.setDecay = function(decay){
	this.decay = decay;
}

//@param {number} release (seconds)
WebAudio.Envelope.setRelease = function(release){
	this.release = release;
}

//@param {number} sustain (gain)
WebAudio.Envelope.setSustain = function(sustain){
	this.sustain = sustain;
}

//@param {number} min
WebAudio.Envelope.setMin = function(min){
	this.min = min;
}

//@param {number} max
WebAudio.Envelope.setMax = function(max){
	this.max = max;
}

