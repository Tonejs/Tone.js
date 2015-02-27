define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Add a signal and a number or two signals. <br><br>
	 *         input 0: augend. input 1: addend. <br><br>
	 *         Add can be used in two ways, either constructed with a value,
	 *         or constructed with no initial value and with signals connected
	 *         to each of its two inputs. 
	 *
	 *  @constructor
	 *  @extends {Tone.Signal}
	 *  @param {number=} value if no value is provided, Tone.Add will sum the first
	 *                         and second inputs. 
	 *  @example
	 *  var signal = new Tone.Signal(2);
	 *  var add = new Tone.Add(2);
	 *  signal.connect(add);
	 *  //the output of add equals 4
	 *
	 *  //if constructed with no arguments
	 *  //it will add the first and second inputs
	 *  var add = new Tone.Add();
	 *  var sig0 = new Tone.Signal(3).connect(add, 0, 0);
	 *  var sig1 = new Tone.Signal(4).connect(add, 0, 1);
	 *  //the output of add equals 7. 
	 */
	Tone.Add = function(value){

		Tone.call(this, 2, 0);

		/**
		 *  the summing node
		 *  @type {GainNode}
		 *  @private
		 */
		this._sum = this.input[0] = this.input[1] = this.output = this.context.createGain();

		/**
		 *  @private
		 *  @type {Tone.Signal}
		 */
		this._value = this.input[1] = new Tone.Signal(value);

		this._value.connect(this._sum);
	};

	Tone.extend(Tone.Add, Tone.Signal);
	
	/**
	 *  dispose method
	 *  @returns {Tone.Add} `this`
	 */
	Tone.Add.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._sum.disconnect();
		this._sum = null;
		this._value.dispose();
		this._value = null;
		return this;
	}; 

	return Tone.Add;
});