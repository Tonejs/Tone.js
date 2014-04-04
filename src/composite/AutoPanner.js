///////////////////////////////////////////////////////////////////////////////
//
//  AUTO PANNER
//
//	not a 3d panner. just LR
//	
// 	@dependency components/Tone.StereoSplit components/LFO components/Mono
///////////////////////////////////////////////////////////////////////////////

Tone.AutoPanner = function(rate, amount){
	Tone.StereoSplit.call(this);

	//defaults
	this.amount = this.defaultArg(amount, 1);
	this.rate = this.defaultArg(rate, 1);

	//components
	this.lfo = new Tone.LFO(rate);
	this.inverter = Tone.context.createWaveShaper();
	this.equalGain = Tone.context.createWaveShaper();

	//connections
	this.leftSend.connect(this.leftReturn);
	this.rightSend.connect(this.rightReturn);	
	this.lfo.connect(this.equalGain);
	this.equalGain.connect(this.leftSend.gain);
	this.chain(this.equalGain, this.inverter, this.rightSend.gain);

	//setup
	this._inverterCurve();
	this._equalPowerGainCurve();

}

//extend StereoSplit
Tone.extend(Tone.AutoPanner, Tone.StereoSplit);

//generates the values for the waveshaper
Tone.AutoPanner.prototype._inverterCurve = function(){
	var len = 16;
	var curve = new Float32Array(len);
	for (var i = 0; i < len; i++){
		//values between -1 to 1
		var baseline = (i / (len - 1)) * 2 - 1;
		//scale it by amount
		curve[i] = -baseline;
	}
	this.inverter.curve = curve;
}

//generates the values for the waveshaper
Tone.AutoPanner.prototype._equalPowerGainCurve = function(){
	var len = 16;
	var curve = new Float32Array(len);
	for (var i = 0; i < len; i++){
		//values between -1 to 1
		var baseline = (i / (len - 1)) * 2 - 1;
		// curve[i] = baseline;
		// scale it by amount
		curve[i] = this.equalPowerGain(baseline) * this.amount;
	}
	this.equalGain.curve = curve;
}

Tone.AutoPanner.prototype.start = function(time){
	this.lfo.start(time);
}

Tone.AutoPanner.prototype.stop = function(time){
	this.lfo.stop();
	this.leftSend.gain.value = this.equalPowerGain(.5);
	this.rightSend.gain.value = this.equalPowerGain(.5);
}

Tone.AutoPanner.prototype.setType = function(type){
	this.lfo.setType(type);
}

Tone.AutoPanner.prototype.setRate = function(rate){
	this.lfo.setRate(rate);
}

Tone.AutoPanner.prototype.setAmount = function(amount){
	this.amount = amount;
	this._equalPowerGainCurve();
}

