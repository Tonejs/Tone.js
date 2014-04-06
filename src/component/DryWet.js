///////////////////////////////////////////////////////////////////////////////
//
//  DRY/WET KNOB
//
// 	equal power fading
//	control values:
// 	   -1 = 100% dry
//		1 = 100% wet
///////////////////////////////////////////////////////////////////////////////

define(["core/Tone", "signal/Signal", "signal/Scale"], function(Tone){

	Tone.DryWet = function(initialDry){
		Tone.call(this);

		//components
		this.dry = this.context.createGain();
		this.wet = this.context.createGain();
		//control signal
		this.control = new Tone.Signal();
		this.invert = new Tone.Scale(1, -1);
		this.equalPowerD = new Tone.Scale(0, 1, "equalPower");
		this.equalPowerW = new Tone.Scale(0, 1, "equalPower");

		//connections
		this.dry.connect(this.output);
		this.wet.connect(this.output);
		//wet control
		this.chain(this.control, this.invert, this.equalPowerD, this.wet.gain);
		//dry control
		this.chain(this.control, this.equalPowerW, this.dry.gain);

		//setup
		this.dry.gain.value = 0;
		this.wet.gain.value = 0;
		this.setDry(0);
	}

	Tone.extend(Tone.DryWet);

	Tone.DryWet.prototype.setDry = function(val, rampTime){
		rampTime = this.defaultArg(rampTime, 0);
		this.control.linearRampToValueAtTime(val, rampTime);
	}

	Tone.DryWet.prototype.setWet = function(val, rampTime){
		this.setDry(-val, rampTime);
	}

	return Tone.DryWet;
});
