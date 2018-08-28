define(["../core/Tone", "../signal/Signal", "../core/Gain"], function(Tone){

	"use strict";

	/**
	 *  @class Add a signal and a number or two signals. When no value is
	 *         passed into the constructor, Tone.Add will sum <code>input[0]</code>
	 *         and <code>input[1]</code>. If a value is passed into the constructor, 
	 *         the it will be added to the input.
	 *  
	 *  @constructor
	 *  @extends {Tone.Signal}
	 *  @param {number=} value If no value is provided, Tone.Add will sum the first
	 *                         and second inputs. 
	 *  @example
	 * var signal = new Tone.Signal(2);
	 * var add = new Tone.Add(2);
	 * signal.connect(add);
	 * //the output of add equals 4
	 *  @example
	 * //if constructed with no arguments
	 * //it will add the first and second inputs
	 * var add = new Tone.Add();
	 * var sig0 = new Tone.Signal(3).connect(add, 0, 0);
	 * var sig1 = new Tone.Signal(4).connect(add, 0, 1);
	 * //the output of add equals 7. 
	 */
	Tone.Add = function(value){

		Tone.Signal.call(this);
		this.createInsOuts(2, 0);

		/**
		 *  the summing node
		 *  @type {GainNode}
		 *  @private
		 */
		this._sum = this.input[0] = this.input[1] = this.output = new Tone.Gain();

		/**
		 *  @private
		 *  @type {Tone.Signal}
		 */
		this._param = this.input[1] = new Tone.Signal(value);

		this._param.connect(this._sum);
		this.proxy = false;
	};

	Tone.extend(Tone.Add, Tone.Signal);

	/**
	 *  Clean up.
	 *  @returns {Tone.Add} this
	 */
	Tone.Add.prototype.dispose = function(){
		Tone.Signal.prototype.dispose.call(this);
		this._sum.dispose();
		this._sum = null;
		return this;
	}; 

	return Tone.Add;
});
