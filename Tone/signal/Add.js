define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	/**
	 *  Adds a value to an incoming signal
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} value
	 */
	Tone.Add = function(value){
		Tone.call(this);

		/**
		 *  @private
		 *  @type {Tone}
		 */
		this._value = new Tone.Signal(value);

		//connections
		this.chain(this._value, this.input, this.output);
	};

	Tone.extend(Tone.Add);

	/**
	 *  set the constant
	 *  
	 *  @param {number} value 
	 */
	Tone.Add.prototype.setValue = function(value){
		this._value.setValue(value);
	}; 

	/**
	 *  dispose method
	 */
	Tone.Add.prototype.dispose = function(){
		this._value.dispose();
		this.input.disconnect();
		this.output.disconnect();
		this._value = null;
		this.input = null;
		this.output = null;
	}; 

	return Tone.Add;
});