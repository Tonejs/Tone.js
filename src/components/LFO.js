///////////////////////////////////////////////////////////////////////////////
//
//  LFO
//
///////////////////////////////////////////////////////////////////////////////

WebAudio.LFO = function(param, rate, outputMin, outputMax){
	//extends Unit
	WebAudio.Unit.call(this);
	//pass audio through
	this.input.connect(this.output);

	this.param = this.defaultArgument(param, this.input.gain);
	this.rate = this.defaultArgument(rate, 1);
	this.min = this.defaultArgument(outputMin, 0);
	this.max = this.defaultArgument(outputMax, 1);

	//the components
	this.oscillator = WebAudio.createOscillator();
	this.scalar = WebAudio.createGain();
	this.offset = WebAudio.createWaveShaper();

	//connect it up
	this.chain([this.oscillator, this.scalar, this.offset, this.param]);

	//setup the values
	this.oscillator.frequency.value = rate;
	this._createCurve();
	this._setScalar();
	this.oscillator.start(0);
	this.setType("sine");
}

WebAudio.extend(WebAudio.LFO, WebAudio.Unit);

//generates the values for the waveshaper
WebAudio.LFO.prototype._createCurve = function(){
	var len = 16;
	var curve = new Float32Array(len);
	for (var i = 0; i < len; i++){
		//values between -1 to 1
		var baseline = (i / (len - 1)) * 2 - 1;
		curve[i] = baseline + this.min;
	}
	this.offset.curve = curve;
}

//sets the gain value
WebAudio.LFO.prototype._setScalar = function(){
	this.scalar.gain.value = this.max - this.min;
}


//set the params
WebAudio.LFO.prototype.setRate = function(rate){
	this.rate = rate;
	this.rampToValue(this.oscillator.frequency, rate, .1);
}

//set the params
WebAudio.LFO.prototype.setMin = function(min){
	this.min = min;
	this._createCurve();
	this._setScalar();
}

//set the params
WebAudio.LFO.prototype.setMax = function(max){
	this.max = max;
	this._setScalar();
}

//set the waveform of the LFO
//@param {string | number} type ('sine', 'square', 'sawtooth', 'triangle', 'custom');
WebAudio.LFO.prototype.setType = function(type){
	this.oscillator.type = type;
}