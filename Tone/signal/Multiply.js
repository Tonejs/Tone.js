define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	/**
	 *  Multiply the incoming signal by some factor
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} value constant value to multiple
	 */
	Tone.Multiply = function(value){
		this.input = this.context.createGain();
		this.output = this.input;
		this.input.gain.value = value;
	};

	Tone.extend(Tone.Multiply);

	/**
	 *  set the constant multiple
	 *  	
	 *  @param {number} value 
	 */
	Tone.Multiply.prototype.setValue = function(value){
		this.input.gain.value = value;
	};

	return Tone.Multiply;
});
