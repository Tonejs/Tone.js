///////////////////////////////////////////////////////////////////////////////
//
//  ADD
//
//	adds a value to the incoming signal
//	can sum two signals or a signal and a constant
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	//@param {Tone.Signal|number} value
	Tone.Add = function(value){
		Tone.call(this);

		if (typeof value === "number"){
			this.value = new Tone.Signal(value);
		} else {
			this.value = value;
		}

		//connections
		this.chain(this.value, this.input, this.output);
	};

	Tone.extend(Tone.Add);

	//set the constant value
	//@param {number} value
	Tone.Add.prototype.setValue = function(value){
		this.value.setValue(value);
	};

	return Tone.Add;
});