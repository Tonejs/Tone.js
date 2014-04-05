///////////////////////////////////////////////////////////////////////////////
//
//  PANNER
//
//	Equal Power Gain L/R Panner. Not 3D
//	-1 = 100% Left
//	1 = 100% Right
///////////////////////////////////////////////////////////////////////////////

define(["core/Tone", "signal/Merge", "signal/Signal", "signal/Scale", "signal/Subtract"], 
function(Tone){

	Tone.Panner = function(){
		Tone.call(this);

		//components
		//incoming signal is sent to left and right
		this.left = this.context.createGain();
		this.right = this.context.createGain();
		this.control = new Tone.Signal();
		this.merge = new Tone.Merge();
		this.invert = new Tone.Scale(1, -1);
		this.equalPowerL = new Tone.Scale(0, 1, "equalPower");
		this.equalPowerR = new Tone.Scale(0, 1, "equalPower");

		//connections
		this.chain(this.input, this.left, this.merge.left);
		this.chain(this.input, this.right, this.merge.right);
		this.merge.connect(this.output);
		//left channel control
		this.chain(this.control, this.invert, this.equalPowerL, this.left.gain);
		//right channel control
		this.chain(this.control, this.equalPowerR, this.right.gain);


		//setup
		this.left.gain.value = 0;
		this.right.gain.value = 0;
		this.setPan(0);
	}

	Tone.extend(Tone.Panner);

	Tone.Panner.prototype.setPan = function(val, rampTime){
		rampTime = this.defaultArg(rampTime, 0);
		this.control.linearRampToValueAtTime(val, rampTime);
	}

	return Tone.Panner;
});;