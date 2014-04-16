///////////////////////////////////////////////////////////////////////////////
//
//	MULTIPLY
//
//	Multiply the incoming signal by a factor
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone"], function(Tone){

	Tone.Multiply = function(factor){
		Tone.call(this);

		this.factor = this.defaultArg(factor, 1);

		this.input.connect(this.output);

		this.input.gain.value = factor;
	}

	Tone.extend(Tone.Multiply);

	//set the constant value
	//@param {number} const
	Tone.Multiply.prototype.setFactor = function(factor){
		this.factor = factor;
		this.input.gain.value = factor;
	}

	return Tone.Multiply;
})
