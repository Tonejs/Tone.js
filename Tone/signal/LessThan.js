define(["Tone/core/Tone", "Tone/signal/GreaterThan"], function(Tone){

	/**
	 *  @class  Output 1 if the signal is less than the value, otherwise outputs 0
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} value the value to compare the incoming signal to
	 */
	Tone.LessThan = function(value){
		/**
		 *  
		 *  @type {Tone.GreaterThan}
		 *  @private
		 */
		this._gt = new Tone.GreaterThan(-value);

		/**
		 *  @type {Tone.GreaterThan}
		 */
		this.input = this.output = this._gt;
	};

	Tone.extend(Tone.LessThan);

	/**
	 *  @param {number} value
	 */
	Tone.LessThan.prototype.setValue = function(value){
		this._gt.setValue(-value);
	};

	/**
	 *  dispose method
	 */
	Tone.LessThan.prototype.dispose = function(){
		this._gt.dispose();
		this._gt = null;
	};

	return Tone.GreaterThan;
});