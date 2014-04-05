///////////////////////////////////////////////////////////////////////////////
//
//  PANNER
//
//	Equal Power Gain L/R Panner. Not 3D
//	-1 = 100% Left
//	1 = 100% Right
///////////////////////////////////////////////////////////////////////////////

Tone.Panner = function(){
	Tone.call(this);

	//components
	this.mono = new Tone.Mono();
	this.split = new Tone.Stereo();
	this.control = new Tone.Signal();
	this.invert = new Tone.Invert();
	this.leftScale = new Tone.Scale(0, 1);
	this.rightScale = new Tone.Scale(0, 1);
	this.equalGain = this.context.createWaveShaper();
	this.merger = this.context.createChannelMerger(2);

	//connections
	this.chain(this.input, this.mono, this.split);
	this.split.right.connect(this.merger, 0, 0);
	this.split.left.connect(this.merger, 0, 1);
	this.merger.connect(this.output);
	//control connections
	this.control.connect(this.equalGain);
	this.chain(this.equalGain, this.leftScale, this.split.left.gain);
	this.chain(this.equalGain, this.invert, this.rightScale, this.split.right.gain);

	//setup
	this.split.left.gain.value = 0;
	this.split.right.gain.value = 0;
	this.setPan(0);
	this._equalPowerGainCurve();
}

Tone.extend(Tone.Panner);

Tone.Panner.prototype.setPan = function(val, rampTime){
	rampTime = this.defaultArg(rampTime, 0);
	this.control.linearRampToValueAtTime(val, rampTime);
}

//generates the values for the waveshaper
Tone.Panner.prototype._equalPowerGainCurve = function(){
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