///////////////////////////////////////////////////////////////////////////////
//
//	Envelope
//
//	ADR envelope generator attaches to an AudioParam
///////////////////////////////////////////////////////////////////////////////

AudioUnit.Envelope = function(attack, decay, sustain, release, audioParam, minOutput, maxOutput){
	//extend Unit
	AudioUnit.call(this);

	//pass audio through
	this.input.connect(this.output);

	//set the parameters
	this.param = this.defaultArg(audioParam, this.input.gain);
	this.attack = this.defaultArg(attack, .01);
	this.decay = this.defaultArg(decay, .1);
	this.release = this.defaultArg(release, 1);
	// this.sustain = this.defaultArg(this.gainToPowScale(sustain), .1);
	this.setSustain(this.defaultArg(sustain, .1));
	this.min = this.defaultArg(minOutput, 0);
	this.max = this.defaultArg(maxOutput, 1);
	
	//set the initial value
	this.param.value = this.min;
}

AudioUnit.extend(AudioUnit.Envelope, AudioUnit);

//attack->decay->sustain
AudioUnit.Envelope.prototype.triggerAttack = function(time){
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

//triggers the release of the envelope
AudioUnit.Envelope.prototype.triggerRelease = function(time){
	var startVal = this.param.value;
	if (time){
		startVal = (this.max - this.min) * this.sustain + this.min;
	}
	time = this.defaultArg(time, this.now());
	this.param.cancelScheduledValues(time);
	this.param.setValueAtTime(startVal, time);
	this.param.linearRampToValueAtTime(this.min, time + this.release);
}

///////////////////////////////////////////////////////////////////////////////
//  SET VALUES
///////////////////////////////////////////////////////////////////////////////

//@param {number} attack (seconds)
AudioUnit.Envelope.prototype.setAttack = function(attack){
	this.attack = attack;
}

//@param {number} decay (seconds)
AudioUnit.Envelope.prototype.setDecay = function(decay){
	this.decay = decay;
}

//@param {number} release (seconds)
AudioUnit.Envelope.prototype.setRelease = function(release){
	this.release = release;
}

//@param {number} sustain as a percentage (0-1);
AudioUnit.Envelope.prototype.setSustain = function(sustain){
	this.sustain = this.gainToPowScale(sustain);
}

//@param {number} min
AudioUnit.Envelope.prototype.setMin = function(min){
	this.min = min;
}

//@param {number} max
AudioUnit.Envelope.prototype.setMax = function(max){
	this.max = max;
}

