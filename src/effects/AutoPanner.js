///////////////////////////////////////////////////////////////////////////////
//
//  AUTO PANNER
//
//	not a 3d panner. just LR
//	
///////////////////////////////////////////////////////////////////////////////

define(["core/Tone", "source/Oscillator", "component/Panner", "effects/Effect"], function(Tone){


	Tone.AutoPanner = function(rate, amount){
		Tone.Effect.call(this);

		//defaults
		amount = this.defaultArg(amount, 1);
		rate = this.defaultArg(rate, 1);

		//components
		this.osc = new Tone.Oscillator(rate);
		this.amount = this.context.createGain();
		this.panner = new Tone.Panner();

		//connections
		this.connectEffect(this.panner);
		this.chain(this.osc, this.amount, this.panner.control);
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
		this.amount.gain.value = amount;
	}

	return Tone.AutoPanner;
});
