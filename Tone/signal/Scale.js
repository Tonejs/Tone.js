define(["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Multiply", "Tone/signal/Signal"], function(Tone){

	"use strict";
	
	/**
	 *  @class  performs a linear scaling on an input signal.
	 *          Scales a normal gain input range [0,1] to between
	 *          outputMin and outputMax
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {number} [outputMin=0]
	 *  @param {number} [outputMax=1]
	 */
	Tone.Scale = function(outputMin, outputMax){

		/** 
		 *  @private
		 *  @type {number}
		 */
		this._outputMin = this.defaultArg(outputMin, 0);

		/** 
		 *  @private
		 *  @type {number}
		 */
		this._outputMax = this.defaultArg(outputMax, 1);


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
	 *  set the minimum output value
	 *  @param {number} min the minimum output value
	 *  @returns {Tone.Scale} `this`
	 */
	Tone.Scale.prototype.setMin = function(min){
		this._outputMin = min;
		this._setRange();
		return this;
	};

	/**
	 *  @returns {number} the minimum output value
	 */
	Tone.Scale.prototype.getMin = function(){
		return this._outputMin;
	};

	/**
	 *  set the minimum output value
	 *  @param {number} min the minimum output value
	 *  @returns {Tone.Scale} `this`
	 */
	Tone.Scale.prototype.setMax = function(max){
		this._outputMax = max;
		this._setRange();
		return this;
	};

	/**
	 *  @returns {number} the maximum output value
	 */
	Tone.Scale.prototype.getMax = function(){
		return this._outputMax;
	};

	/**
	 *  set the values
	 *  @private
	 */
	Tone.Scale.prototype._setRange = function() {
		this._add.setValue(this._outputMin);
		this._scale.setValue(this._outputMax - this._outputMin);
	};

	/**
	 *  clean up
	 *  @returns {Tone.Scale} `this`
	 */
	Tone.Scale.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._add.dispose();
		this._add = null;
		this._scale.dispose();
		this._scale = null;
		return this;
	}; 

	/**
	 * the miniumum output of the scale
	 * @memberOf Tone.Scale#
	 * @type {number}
	 * @name min
	 */
	Tone._defineGetterSetter(Tone.Scale, "min");

	/**
	 * the maximum output of the scale
	 * @memberOf Tone.Scale#
	 * @type {number}
	 * @name max
	 */
	Tone._defineGetterSetter(Tone.Scale, "max");

	return Tone.Scale;
});
