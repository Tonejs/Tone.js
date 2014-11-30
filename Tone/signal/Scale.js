define(["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Multiply", "Tone/signal/Signal"], function(Tone){

	"use strict";
	
	/**
	 *  @class  performs a linear scaling on an input signal.
	 *          Scales a normal gain input range [0,1] to between
	 *          outputMin and outputMax
	 *
	 *  @constructor
	 *  @extends {Tone}
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

	Tone.extend(Tone.Scale);

	/**
	 *  set the minimum output value
	 *  @param {number} min the minimum output value
	 */
	Tone.Scale.prototype.setMin = function(min){
		this._outputMin = min;
		this._setRange();
	};

	/**
	 *  set the minimum output value
	 *  @param {number} min the minimum output value
	 */
	Tone.Scale.prototype.setMax = function(max){
		this._outputMax = max;
		this._setRange();
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
	 *  borrows connect from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Scale.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Scale.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._add.dispose();
		this._add = null;
		this._scale.dispose();
		this._scale = null;
	}; 


	return Tone.Scale;
});
