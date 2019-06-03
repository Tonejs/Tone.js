import Tone from "../core/Tone";
import "../signal/Add";
import "../signal/Negate";
import "../signal/Signal";
import "../core/Gain";

/**
 *  @class Subtract the signal connected to <code>input[1]</code> from the signal connected 
 *         to <code>input[0]</code>. If an argument is provided in the constructor, the 
 *         signals <code>.value</code> will be subtracted from the incoming signal.
 *
 *  @extends {Tone.Signal}
 *  @constructor
 *  @param {number=} value The value to subtract from the incoming signal. If the value
 *                         is omitted, it will subtract the second signal from the first.
 *  @example
 * var sub = new Tone.Subtract(1);
 * var sig = new Tone.Signal(4).connect(sub);
 * //the output of sub is 3. 
 *  @example
 * var sub = new Tone.Subtract();
 * var sigA = new Tone.Signal(10);
 * var sigB = new Tone.Signal(2.5);
 * sigA.connect(sub, 0, 0);
 * sigB.connect(sub, 0, 1);
 * //output of sub is 7.5
 */
Tone.Subtract = function(value){

	Tone.Signal.call(this);
	this.createInsOuts(2, 0);

	/**
	 *  the summing node
	 *  @type {GainNode}
	 *  @private
	 */
	this._sum = this.input[0] = this.output = new Tone.Gain();

	/**
	 *  negate the input of the second input before connecting it
	 *  to the summing node.
	 *  @type {Tone.Negate}
	 *  @private
	 */
	this._neg = new Tone.Negate();

	/**
	 *  the node where the value is set
	 *  @private
	 *  @type {Tone.Signal}
	 */
	this._param = this.input[1] = new Tone.Signal(value);
	this._param.chain(this._neg, this._sum);
};

Tone.extend(Tone.Subtract, Tone.Signal);

/**
 *  Clean up.
 *  @returns {Tone.SignalBase} this
 */
Tone.Subtract.prototype.dispose = function(){
	Tone.Signal.prototype.dispose.call(this);
	this._neg.dispose();
	this._neg = null;
	this._sum.disconnect();
	this._sum = null;
	return this;
};

export default Tone.Subtract;

