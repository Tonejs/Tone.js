define(["Tone/core/Tone"], function(Tone){

	/**
	 *  Multiply the incoming signal by some factor
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} value constant value to multiple
	 */
	Tone.Multiply = function(value){
		/**
		 *  the input node is the same as the output node
		 *  it is also the GainNode which handles the scaling of incoming signal
		 *  
		 *  @type {GainNode}
		 */
		this.input = this.output = this.context.createGain();
		
		//apply the inital scale factor
		this.input.gain.value = this.defaultArg(value, 1);
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

	/**
	 *  clean up
	 */
	Tone.Multiply.prototype.dispose = function(){
		this.input.disconnect();
		this.input = null;
	}; 

	return Tone.Multiply;
});
