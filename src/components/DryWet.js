///////////////////////////////////////////////////////////////////////////////
//
//  DRY/WET KNOB
//
// 	equal power fading
//	control values:
// 	-1 = 100% dry
//	1 = 100% wet
///////////////////////////////////////////////////////////////////////////////

Tone.DryWet = function(initialDry){
	Tone.call(this);

	//components
	this.dry = this.context.createGain();
	this.wet = this.context.createGain();
	this.output = this.context.createGain();
	this.equalGain = this.context.createWaveShaper();
	//control signal
	this.control = new Tone.Signal();
	this.invert = new Tone.Invert();
	this.dryScale = new Tone.Scale(0, 1);
	this.wetScale = new Tone.Scale(0, 1);

	//alias
	this.input = this.dry;

	//connections
	this.dry.connect(this.output);
	this.wet.connect(this.output);
	//control signal connections
	this.control.connect(this.equalGain);
	//wet chain
	this.chain(this.equalGain, this.wetScale, this.wet.gain);
	//dry chain
	this.chain(this.equalGain, this.invert, this.dryScale, this.dry.gain);

	//setup
	this._equalPowerGainCurve();
	this.dry.gain.value = 0;
	this.wet.gain.value = 0;
	this.setDry(0);
}

Tone.extend(Tone.DryWet);

Tone.DryWet.prototype.setDry = function(val, rampTime){
	rampTime = this.defaultArg(rampTime, 0);
	this.control.linearRampToValueAtTime(val, rampTime);
}

Tone.DryWet.prototype.setWet = function(val, rampTime){
	this.setDry(-val, rampTime);
}

//generates the values for the waveshaper
Tone.DryWet.prototype._equalPowerGainCurve = function(){
	var len = this.bufferSize;
	var curve = new Float32Array(len);
	for (var i = 0; i < len; i++){
		//values between -1 to 1
		var baseline = (i / (len - 1)) * 2 - 1;
		// scale it by amount
		curve[i] = this.equalPowerGain(baseline);
		// curve[i] = baseline;
	}
	this.equalGain.curve = curve;
}