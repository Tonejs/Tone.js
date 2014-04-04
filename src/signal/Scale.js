///////////////////////////////////////////////////////////////////////////////
//
//  SCALE
//
//	scales the input in normal range (-1 to 1) to the output between min and max
///////////////////////////////////////////////////////////////////////////////

Tone.Scale = function(min, max){
	Tone.call(this);

	//vals
	this.min = min;
	this.max = max;

	//components
	this.scaler = Tone.context.createWaveShaper();

	//connections
	this.chain(this.input, this.scaler, this.output);

	//setup
	this._scaleCurve();
}

//extend StereoSplit
Tone.extend(Tone.Scale);

//generates the values for the waveshaper
Tone.Scale.prototype._scaleCurve = function(){
	var len = 512;
	var curve = new Float32Array(len);
	var min = this.min;
	var max = this.max;
	for (var i = 0; i < len; i++){
		//values between 0 and 1
		var terp = (i / (len - 1));
		curve[i] = terp * (max - min) + min;
	}
	//console.log(curve);
	this.scaler.curve = curve;
}

Tone.Scale.prototype.setMax = function(max){
	this.max = max;
	this._scaleCurve();
}

Tone.Scale.prototype.setMin = function(min){
	this.min = min;
	this._scaleCurve();
}
