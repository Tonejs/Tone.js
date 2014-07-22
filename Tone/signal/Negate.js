define(["Tone/core/Tone", "Tone/signal/Multiply"], function(Tone){

	/**
	 *  @class Negate the incoming signal. i.e. an input signal of 10 will output -10
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Negate = function(){
		/**
		 *  negation is done by multiplying by -1
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._multiply = new Tone.Multiply(-1);

		/**
		 *  the input and output
		 */
		this.input = this.output = this._multiply;
	};

	Tone.extend(Tone.Negate);

	/**
	 *  clean up
	 */
	Tone.Negate.prototype.dispose = function(){
		this.input.disconnect();
		this.input = null;
	}; 

	return Tone.Negate;
});