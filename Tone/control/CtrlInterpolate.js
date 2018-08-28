define(["../core/Tone", "../type/Type"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.CtrlInterpolate will interpolate between given values based
	 *         on the "index" property. Passing in an array or object literal
	 *         will interpolate each of the parameters. Note (i.e. "C3")
	 *         and Time (i.e. "4n + 2") can be interpolated. All other values are
	 *         assumed to be numbers. 
	 *  @example
	 * var interp = new Tone.CtrlInterpolate([0, 2, 9, 4]);
	 * interp.index = 0.75;
	 * interp.value; //returns 1.5
	 *
	 *  @example
	 * var interp = new Tone.CtrlInterpolate([
	 * 	[2, 4, 5],
	 * 	[9, 3, 2],
	 * ]);
	 * @param {Array} values The array of values to interpolate over
	 * @param {Positive} index The initial interpolation index.
	 * @extends {Tone}
	 */
	Tone.CtrlInterpolate = function(){

		var options = Tone.defaults(arguments, ["values", "index"], Tone.CtrlInterpolate);
		Tone.call(this);

		/**
		 *  The values to interpolate between
		 *  @type  {Array}
		 */
		this.values = options.values;

		/**
		 *  The interpolated index between values. For example: a value of 1.5
		 *  would interpolate equally between the value at index 1
		 *  and the value at index 2. 
		 *  @example
		 * interp.index = 0; 
		 * interp.value; //returns the value at 0
		 * interp.index = 0.5;
		 * interp.value; //returns the value between indices 0 and 1. 
		 *  @type  {Positive}
		 */
		this.index = options.index;
	};

	Tone.extend(Tone.CtrlInterpolate);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.CtrlInterpolate.defaults = {
		"index" : 0,
		"values" : []
	};

	/**
	 *  The current interpolated value based on the index
	 *  @readOnly
	 *  @memberOf Tone.CtrlInterpolate#
	 *  @type {*}
	 *  @name value
	 */
	Object.defineProperty(Tone.CtrlInterpolate.prototype, "value", {
		get : function(){
			var index = this.index;
			index = Math.min(index, this.values.length - 1);
			var lowerPosition = Math.floor(index);
			var lower = this.values[lowerPosition];
			var upper = this.values[Math.ceil(index)];
			return this._interpolate(index - lowerPosition, lower, upper);
		}
	});

	/**
	 *  Internal interpolation routine
	 *  @param  {NormalRange}  index  The index between the lower and upper
	 *  @param  {*}  lower 
	 *  @param  {*}  upper 
	 *  @return  {*}  The interpolated value
	 *  @private
	 */
	Tone.CtrlInterpolate.prototype._interpolate = function(index, lower, upper){
		if (Tone.isArray(lower)){
			var retArray = [];
			for (var i = 0; i < lower.length; i++){
				retArray[i] = this._interpolate(index, lower[i], upper[i]);
			}
			return retArray;
		} else if (Tone.isObject(lower)){
			var retObj = {};
			for (var attr in lower){
				retObj[attr] = this._interpolate(index, lower[attr], upper[attr]);
			}
			return retObj;
		} else {
			lower = this._toNumber(lower);
			upper = this._toNumber(upper);
			return (1 - index) * lower + index * upper;
		}
	};

	/**
	 *  Convert from the given type into a number
	 *  @param  {Number|String}  value
	 *  @return  {Number}
	 *  @private
	 */
	Tone.CtrlInterpolate.prototype._toNumber = function(val){
		if (Tone.isNumber(val)){
			return val;
		} else {
			//otherwise assume that it's Time...
			return this.toSeconds(val);
		}
	};

	/**
	 *  Clean up
	 *  @return  {Tone.CtrlInterpolate}  this
	 */
	Tone.CtrlInterpolate.prototype.dispose = function(){
		this.values = null;
	};

	return Tone.CtrlInterpolate;
});
