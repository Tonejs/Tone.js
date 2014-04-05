///////////////////////////////////////////////////////////////////////////////
//
//	Envelope
//
//	ADR envelope generator attaches to an AudioParam
///////////////////////////////////////////////////////////////////////////////

Tone.Envelope = function(attack, decay, sustain, release, audioParam, minOutput, maxOutput){
	//extend Unit
	Tone.call(this);

	//pass audio through
	this.input.connect(this.output);

	//set the parameters
	this.param = this.defaultArg(audioParam, this.input.gain);
	this.attack = this.defaultArg(attack, .01);
	this.decay = this.defaultArg(decay, .1);
	this.release = this.defaultArg(release, 1);
	this.sustain = this.defaultArg(.5);

	// this.setSustain(this.defaultArg(sustain, .1));
	this.min = this.defaultArg(minOutput, 0);
	this.max = this.defaultArg(maxOutput, 1);
	
	//set the initial value
	this.param.value = this.min;
}

Tone.extend(Tone.Envelope, Tone);

//attack->decay->sustain
Tone.Envelope.prototype.triggerAttack = function(time){
	var startVal = this.min;
	if (!time){
		startVal = this.param.value;
	}
	time = this.defaultArg(time, this.now());
	this.param.cancelScheduledValues(time);
	this.param.setValueAtTime(startVal, time);
	this.param.linearRampToValueAtTime(this.max, time + this.attack);
	var sustainVal = (this.max - this.min) * this.sustain + this.min;
	this.param.linearRampToValueAtTime(sustainVal, time + this.decay + this.attack);
}

//attack->decay->sustain
Tone.Envelope.prototype.triggerAttackExp = function(time){
	var startVal = this.min;
	if (!time){
		startVal = this.param.value;
	}
	time = this.defaultArg(time, this.now());
	this.param.cancelScheduledValues(time);
	this.param.setValueAtTime(startVal, time);
	this.param.exponentialRampToValueAtTime(this.max, time + this.attack);
	var sustainVal = (this.max - this.min) * this.sustain + this.min;
	this.param.exponentialRampToValueAtTime(sustainVal, time + this.decay + this.attack);
}

//triggers the release of the envelope
Tone.Envelope.prototype.triggerRelease = function(time){
	var startVal = this.param.value;
	if (time){
		startVal = (this.max - this.min) * this.sustain + this.min;
	}
	time = this.defaultArg(time, this.now());
	this.param.cancelScheduledValues(time);
	this.param.setValueAtTime(startVal, time);
	this.param.linearRampToValueAtTime(this.min, time + this.release);
}


//triggers the release of the envelope
Tone.Envelope.prototype.triggerReleaseExp = function(time){
	var startVal = this.param.value;
	if (time){
		startVal = (this.max - this.min) * this.sustain + this.min;
	}
	time = this.defaultArg(time, this.now());
	this.param.cancelScheduledValues(time);
	this.param.setValueAtTime(startVal, time);
	this.param.exponentialRampToValueAtTime(this.min, time + this.release);
}
