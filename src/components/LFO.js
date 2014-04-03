///////////////////////////////////////////////////////////////////////////////
//
//  LFO
//
///////////////////////////////////////////////////////////////////////////////

Tone.LFO = function(rate, outputMin, outputMax, param){
	//extends Unit
	Tone.call(this);
	//pass audio through
	this.input.connect(this.output);

	this.rate = this.defaultArg(rate, 1);
	this.min = this.defaultArg(outputMin, 0);
	this.max = this.defaultArg(outputMax, 1);
	this.type = "sine";

	//the components
	this.oscillator = this.context.createOscillator();
	this.scaler = this.context.createWaveShaper();

	//connect it up
	this.chain(this.oscillator, this.scaler, this.output);

	//setup the values
	this.oscillator.frequency.value = rate;
	this._createCurve();
	this.setType(this.type);
}

Tone.extend(Tone.LFO, Tone);

//generates the values for the waveshaper
Tone.LFO.prototype._createCurve = function(){
	var len = 512;
	var curve = new Float32Array(len);
	for (var i = 0; i < len; i++){
		//values between -1 to 1
		var baseline = (i / (len - 1)) * 2 - 1;
		curve[i] = baseline * (this.max - this.min) + this.min;
	}
	//console.log(curve);
	this.scaler.curve = curve;
}

//start the lfo
Tone.LFO.prototype.start = function(time){
	time = this.defaultArg(time, this.now());
	this.oscillator = this.context.createOscillator();
	this.setRate(this.rate);
	this.setType(this.type);
	this.oscillator.connect(this.scaler);
	this.oscillator.start(time);
}

//stop
Tone.LFO.prototype.stop = function(time){
	time = this.defaultArg(time, this.now());
	this.oscillator.stop(time);
	this.oscillator.disconnect();
	this.oscillator = null;
}


//set the params
Tone.LFO.prototype.setRate = function(rate){
	this.rate = rate;
	this.oscillator.frequency.value = rate;
}

//set the params
Tone.LFO.prototype.setMin = function(min){
	this.min = min;
	this._createCurve();
}

//set the params
Tone.LFO.prototype.setMax = function(max){
	this.max = max;
	this._createCurve();
}

//set the waveform of the LFO
//@param {string | number} type ('sine', 'square', 'sawtooth', 'triangle', 'custom');
Tone.LFO.prototype.setType = function(type){
	this.type = type;
	this.oscillator.type = type;
}