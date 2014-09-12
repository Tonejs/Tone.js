define(["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Multiply", "Tone/signal/Signal"], function(Tone){

	"use strict";
	
	/**
	 *  @class  performs a linear scaling on an input signal.
	 *          Scales from the input range of inputMin to inputMax 
	 *          to the output range of outputMin to outputMax.
	 *
	 *  @description If only two arguments are provided, the inputMin and inputMax are set to -1 and 1
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} inputMin  
	 *  @param {number} inputMax  
	 *  @param {number=} outputMin 
	 *  @param {number=} outputMax 
	 */
	Tone.Scale = function(inputMin, inputMax, outputMin, outputMax){
		Tone.call(this);

		//if there are only two args
		if (arguments.length == 2){
			outputMin = inputMin;
			outputMax = inputMax;
			inputMin = -1;
			inputMax = 1;
		}

		/** @private 
			@type {number} */
		this._inputMin = inputMin;
		/** @private 
			@type {number} */
		this._inputMax = inputMax;
		/** @private 
			@type {number} */
		this._outputMin = outputMin;
		/** @private 
			@type {number} */
		this._outputMax = outputMax;


		/** @private 
			@type {Tone.Add} */
		this._plusInput = new Tone.Add(0);
		/** @private 
			@type {Tone.Multiply} */
		this._scale = new Tone.Multiply(1);
		/** @private 
			@type {Tone.Add} */
		this._plusOutput = new Tone.Add(0);

		//connections
		this.chain(this.input, this._plusInput, this._scale, this._plusOutput, this.output);

		//set the scaling values
		this._setScalingParameters();
	};

	Tone.extend(Tone.Scale);

	/**
	 *  set the scaling parameters
	 *  
	 *  @private
	 */
	Tone.Scale.prototype._setScalingParameters = function(){
		//components
		this._plusInput.setValue(-this._inputMin);
		this._scale.setValue((this._outputMax - this._outputMin)/(this._inputMax - this._inputMin));
		this._plusOutput.setValue(this._outputMin);
	};

	/**
	 *  set the input min value
	 *  @param {number} val 
	 */
	Tone.Scale.prototype.setInputMin = function(val){
		this._inputMin = val;
		this._setScalingParameters();
	};

	/**
	 *  set the input max value
	 *  @param {number} val 
	 */
	Tone.Scale.prototype.setInputMax = function(val){
		this._inputMax = val;
		this._setScalingParameters();
	};

	/**
	 *  set the output min value
	 *  @param {number} val 
	 */
	Tone.Scale.prototype.setOutputMin = function(val){
		this._outputMin = val;
		this._setScalingParameters();
	};

	/**
	 *  set the output max value
	 *  @param {number} val 
	 */
	Tone.Scale.prototype.setOutputMax = function(val){
		this._outputMax = val;
		this._setScalingParameters();
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
		this._plusInput.dispose();
		this._plusOutput.dispose();
		this._scale.dispose();
		this._plusInput = null;
		this._plusOutput = null;
		this._scale = null;
	}; 


	return Tone.Scale;
});
