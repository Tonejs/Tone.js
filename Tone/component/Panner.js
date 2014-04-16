///////////////////////////////////////////////////////////////////////////////
//
//  PANNER
//
//	Equal Power Gain L/R Panner. Not 3D
//	0 = 100% Left
//	1 = 100% Right
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone", "Tone/signal/Merge", "Tone/signal/Signal", "Tone/signal/Scale"], 
function(Tone){

	Tone.Panner = function(){
		Tone.call(this);

		//components
		//incoming signal is sent to left and right
		this.left = this.context.createGain();
		this.right = this.context.createGain();
		this.control = new Tone.Signal();
		this.merge = new Tone.Merge();
		this.invert = new Tone.Scale(1, 0);
		this.normal = new Tone.Scale(0, 1);

		//connections
		this.chain(this.input, this.left, this.merge.left);
		this.chain(this.input, this.right, this.merge.right);
		this.merge.connect(this.output);
		//left channel control
		this.chain(this.control, this.invert, this.left.gain);
		//right channel control
		this.chain(this.control, this.normal, this.right.gain);


		//setup
		this.left.gain.value = 0;
		this.right.gain.value = 0;
		this.setPan(.5);
	}

	Tone.extend(Tone.Panner);

	Tone.Panner.prototype.setPan = function(val, rampTime){
		rampTime = this.defaultArg(rampTime, 0);
		//put val into -1 to 1 range
		this.control.linearRampToValueAtTime(val * 2 - 1, rampTime);
	}

	return Tone.Panner;
});;