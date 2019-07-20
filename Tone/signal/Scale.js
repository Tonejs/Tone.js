import Tone from "../core/Tone";
import "../signal/Subtract";
import "../signal/Add";
import "../signal/Multiply";
import "../signal/Signal";

/**
 *  @class  Performs a linear scaling on an input signal.
 *          Scales a NormalRange input to between
 *          outputMin and outputMax.
 *
 *  @constructor
 *  @extends {Tone.SignalBase}
 *  @param {number} [outputMin=0] The output value when the input is 0.
 *  @param {number} [outputMax=1] The output value when the input is 1.
 *  @example
 * var scale = new Tone.Scale(50, 100);
 * var signal = new Tone.Signal(0.5).connect(scale);
 * //the output of scale equals 75
 */
Tone.Scale = function(outputMin, outputMax){

	Tone.SignalBase.call(this);
	this.createInsOuts(1, 1);

	/**
	 *  @private
	 *  @type {Tone.Signal}
	 */
	this._outputMin = new Tone.Signal(Tone.defaultArg(outputMin, 0));

	/**
	 *  @private
	 *  @type {Tone.Signal}
	 */
	this._outputMax = new Tone.Signal(Tone.defaultArg(outputMax, 1));

	/**
	 *  @private
	 *  @type {Tone.Subtract}
	 */
	this._sub = new Tone.Subtract();

	/**
	 *  @private
	 *  @type {Tone.Multiply}
	 */
	this._multiply = new Tone.Multiply();

	/**
	 *  @private
	 *  @type {Tone.Add}
	 */
	this._add = new Tone.Add(Tone.defaultArg(outputMin, 0));

	// build audio graph
	this._outputMax.connect(this._sub, 0, 0);
	this._outputMin.connect(this._sub, 0, 1);

	Tone.connect(this.input, this._multiply);
	this._sub.connect(this._multiply, 0, 1);

	this._multiply.connect(this._add);

	Tone.connect(this._add, this.output);
};

Tone.extend(Tone.Scale, Tone.SignalBase);

/**
 * The minimum output value. This number is output when
 * the value input value is 0.
 * @memberOf Tone.Scale#
 * @type {number}
 * @name min
 */
Object.defineProperty(Tone.Scale.prototype, "min", {
	get : function(){
		return this._outputMin.value;
	},
	set : function(min){
		this._outputMin.value = min;
		this._add.value = min;
	}
});

/**
 * The maximum output value. This number is output when
 * the value input value is 1.
 * @memberOf Tone.Scale#
 * @type {number}
 * @name max
 */
Object.defineProperty(Tone.Scale.prototype, "max", {
	get : function(){
		return this._outputMax.value;
	},
	set : function(max){
		this._outputMax.value = max;
	}
});

/**
 *  Clean up.
 *  @returns {Tone.Scale} this
 */
Tone.Scale.prototype.dispose = function(){
	Tone.SignalBase.prototype.dispose.call(this);
	this._outputMin.dispose();
	this._outputMin = null;
	this._outputMax.dispose();
	this._outputMax = null;
	this._sub.dispose();
	this._sub = null;
	this._add.dispose();
	this._add = null;
	this._multiply.dispose();
	this._multiply = null;
	return this;
};

export default Tone.Scale;
