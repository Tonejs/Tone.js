///////////////////////////////////////////////////////////////////////////////
//
//  INVERT
//
//	accepts normal range signal (-1 to 1) and inverts the output
///////////////////////////////////////////////////////////////////////////////


Tone.Invert = function(){
	Tone.call(this);

	//components
	this.inverter = Tone.context.createWaveShaper();

	//connections
	this.chain(this.input, this.inverter, this.output);
	
	//setup
	this._inverterCurve();
}

//extend StereoSplit
Tone.extend(Tone.Invert);

//generates the values for the waveshaper
Tone.Invert.prototype._inverterCurve = function(){
	var len = this.bufferSize;
	var curve = new Float32Array(len);
	for (var i = 0; i < len; i++){
		//values between -1 to 1
		var baseline = (i / (len - 1)) * 2 - 1;
		//scale it by amount
		curve[i] = -baseline;
	}
	this.inverter.curve = curve;
}