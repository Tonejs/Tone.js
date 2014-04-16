///////////////////////////////////////////////////////////////////////////////
//
//	MULTIPLY
//
//	Multiply the incoming signal by a factor
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	//@param {number} value
	Tone.Multiply = function(value){
		Tone.call(this);
		this.input.connect(this.output);
		this.input.gain.value = value;
	}

	Tone.extend(Tone.Multiply);

	//set the constant value
	//@param {number} value
	Tone.Multiply.prototype.setValue = function(value){
		this.input.gain.value = value;
	}

	return Tone.Multiply;
})
