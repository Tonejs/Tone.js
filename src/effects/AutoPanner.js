///////////////////////////////////////////////////////////////////////////////
//
//  AUTO PANNER
//
//	not a 3d panner. just LR
//	
///////////////////////////////////////////////////////////////////////////////

Tone.AutoPanner = function(rate, amount){
	Tone.Effect.call(this);

	//defaults
	amount = this.defaultArg(amount, 1);
	rate = this.defaultArg(rate, 1);

	//components
	this.osc = new Tone.LFO(rate, -amount, amount);
	this.panner = new Tone.Panner();

	//connections
	this.connectEffect(this.panner);
	this.osc.connect(this.panner.control);
}

//extend Effect
Tone.extend(Tone.AutoPanner, Tone.Effect);

Tone.AutoPanner.prototype.start = function(time){
	this.osc.start(time);
}

Tone.AutoPanner.prototype.stop = function(time){
	this.osc.stop(time);
}

Tone.AutoPanner.prototype.setType = function(type){
	this.osc.setType(type);
}

Tone.AutoPanner.prototype.setRate = function(rate){
	this.osc.setRate(rate);
}

Tone.AutoPanner.prototype.setAmount = function(amount){
	this.osc.setMin(-amount);
	this.osc.setMax(amount)
}


