///////////////////////////////////////////////////////////////////////////////
//
//  DRY/WET KNOB
//
// 	equal power fading
///////////////////////////////////////////////////////////////////////////////

Tone.DryWet = function(initialDry){
	Tone.call(this);

	//components
	this.dry = this.context.createGain();
	this.wet = this.context.createGain();
	this.output = this.context.createGain();

	//alias
	this.input = this.dry;

	//connections
	this.dry.connect(this.output);
	this.wet.connect(this.output);
	
	//control signal
	this.control = new Tone.Signal();
	this.invert = new Tone.Invert();
	this.control.connect(this.dry);
	this.control.connect(this.invert);
	this.invert.connect(this.wet);
}

Tone.extend(Tone.DryWet);

Tone.DryWet.prototype.setDry = function(val){
	this.dry.gain.value = this.equalPowerGain(val);
	this.wet.gain.value = this.equalPowerGain(1 - val);
}

Tone.DryWet.prototype.setWet = function(val){
	this.setDry(1 - val);
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
	}
	this.equalGain.curve = curve;
}