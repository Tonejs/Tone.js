define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	/**
	 *  Adds a value to an incoming signal
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} value
	 */
	Tone.Add = function(value){
		/**
		 *  @private
		 *  @type {Tone}
		 */
		this._value = new Tone.Signal(value);

		/**
		 *  @type {GainNode}
		 */
		this.input = this.output = this.context.createGain();

		//connections
		this._value.connect(this.output);
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
		this.output.disconnect();
		this._value = null;
		this.output = null;
	}; 

	return Tone.Add;
});