import Tone from "../core/Tone";
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
 *  @param {number} [outputMax=1]	The output value when the input is 1. 
 *  @example
 * var scale = new Tone.Scale(50, 100);
 * var signal = new Tone.Signal(0.5).connect(scale);
 * //the output of scale equals 75
 */
Tone.Scale = function(outputMin, outputMax){

	Tone.SignalBase.call(this);
	
	/** 
	 *  @private
	 *  @type {number}
	 */
	this._outputMin = Tone.defaultArg(outputMin, 0);

	/** 
	 *  @private
	 *  @type {number}
	 */
	this._outputMax = Tone.defaultArg(outputMax, 1);

	/** 
	 *  @private
	 *  @type {Tone.Multiply}
	 *  @private
	 */
	this._scale = this.input = new Tone.Multiply(1);
	
	/** 
	 *  @private
	 *  @type {Tone.Add}
	 *  @private
	 */
	this._add = this.output = new Tone.Add(0);

	this._scale.connect(this._add);
	this._setRange();
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
		return this._outputMin;
	},
	set : function(min){
		this._outputMin = min;
		this._setRange();
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
		return this._outputMax;
	},
	set : function(max){
		this._outputMax = max;
		this._setRange();
	}
});

/**
 *  set the values
 *  @private
 */
Tone.Scale.prototype._setRange = function(){
	this._add.value = this._outputMin;
	this._scale.value = this._outputMax - this._outputMin;
};

/**
 *  Clean up.
 *  @returns {Tone.Scale} this
 */
Tone.Scale.prototype.dispose = function(){
	Tone.SignalBase.prototype.dispose.call(this);
	this._add.dispose();
	this._add = null;
	this._scale.dispose();
	this._scale = null;
	return this;
}; 

export default Tone.Scale;

