define(["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Multiply", "Tone/signal/Signal"], function(Tone){

	"use strict";
	
	/**
	 *  @class  Performs a linear scaling on an input signal.
	 *          Scales a normal gain input range [0,1] to between
	 *          outputMin and outputMax
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {number} [outputMin=0]
	 *  @param {number} [outputMax=1]
	 *  @example
	 *  var scale = new Tone.Scale(50, 100);
	 *  var signal = new Tone.Signal(0.5).connect(scale);
	 *  //the output of scale equals 75
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
	 * The minimum output value.
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
	 * The maximum output value.
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
	Tone.Scale.prototype._setRange = function() {
		this._add.value = this._outputMin;
		this._scale.value = this._outputMax - this._outputMin;
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

	return Tone.Scale;
});
