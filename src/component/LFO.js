///////////////////////////////////////////////////////////////////////////////
//
//  LFO
//
///////////////////////////////////////////////////////////////////////////////

Tone.LFO = function(rate, outputMin, outputMax){
	//extends Unit
	Tone.call(this);

	//defaults
	rate = this.defaultArg(rate, 1);
	min = this.defaultArg(outputMin, -1);
	max = this.defaultArg(outputMax, 1);

	//the components
	this.oscillator = new Tone.Oscillator(rate, "sine");
	this.scaler = new Tone.Scale(min, max);

	//connect it up
	this.chain(this.oscillator, this.scaler, this.output);
}

Tone.extend(Tone.LFO, Tone);


//start the lfo
Tone.LFO.prototype.start = function(time){
	this.oscillator.start(time);
}

//stop
Tone.LFO.prototype.stop = function(time){
	this.oscillator.stop(time);
}


//set the params
Tone.LFO.prototype.setRate = function(rate){
	this.oscillator.setFrequency(rate);
}

//set the params
Tone.LFO.prototype.setMin = function(min){
	this.scaler.setMin(min);
}

//set the params
Tone.LFO.prototype.setMax = function(max){
	this.scaler.setMax(max);
}

//set the waveform of the LFO
//@param {string | number} type ('sine', 'square', 'sawtooth', 'triangle', 'custom');
Tone.LFO.prototype.setType = function(type){
	this.oscillator.setType(type);
}