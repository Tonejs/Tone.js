define(["Tone/core/Tone", "Tone/signal/Threshold", "Tone/signal/Add", "Tone/signal/Signal", "Tone/signal/Not"], function(Tone){

	"use strict";

	/**
	 *  @class  Output 1 if the signal is less than the value, otherwise outputs 0
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [value=0] the value to compare to the incoming signal
	 */
	Tone.LessThan = function(value){

		/**
		 *  subtract the value from the incoming signal
		 *  
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._adder = new Tone.Add(this.defaultArg(-value, 0));

		/**
		 *  @type {Tone.Threshold}
		 *  @private
		 */
		this._thresh = new Tone.Threshold(0);

		/**
		 *  @type {Tone.Not}
		 *  @private
		 */
		this._not = new Tone.Not();

		/**
	 	 *  alias for the adder
		 *  @type {Tone.Add}
		 */
		this.input = this._adder;

		/**
		 *  alias for the thresh
		 *  @type {Tone.Threshold}
		 */
		this.output = this._not;

		//connect
		this.chain(this._adder, this._thresh, this._not);
	};

	Tone.extend(Tone.LessThan);

	/**
	 *  set the value to compare to
	 *  
	 *  @param {number} value
	 */
	Tone.LessThan.prototype.setValue = function(value){
		this._adder.setValue(-value);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.LessThan.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.LessThan.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._adder.disconnect();
		this._thresh.dispose();
		this._not.dispose();
		this._adder = null;
		this._thresh = null;
		this._not = null;
	};

	return Tone.LessThan;
});