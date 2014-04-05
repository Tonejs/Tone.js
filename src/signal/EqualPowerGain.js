///////////////////////////////////////////////////////////////////////////////
//
//  EQUAL POWER GAIN
//
//	takes an input and between -1 and 1
//	outputs values between -1 and 1 equal power gain
///////////////////////////////////////////////////////////////////////////////

Tone.EqualPowerGain = function(){
	Tone.call(this);
}

Tone.extend(Tone.EqualPowerGain);

//generates the values for the waveshaper
Tone.EqualPowerGain.prototype._equalPowerGainCurve = function(){
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