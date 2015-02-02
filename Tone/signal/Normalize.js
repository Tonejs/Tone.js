define(["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Multiply"], function(Tone){

	"use strict";

	/**
	 *  @class Normalize takes an input min and max and maps it linearly to [0,1]
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 */
	Tone.Normalize = function(inputMin, inputMax){

		/**
		 *  the min input value
		 *  @type {number}
		 *  @private
		 */
		this._inputMin = this.defaultArg(inputMin, 0);

		/**
		 *  the max input value
		 *  @type {number}
		 *  @private
		 */
		this._inputMax = this.defaultArg(inputMax, 1);

		/**
		 *  subtract the min from the input
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._sub = this.input = new Tone.Add(0);

		/**
		 *  divide by the difference between the input and output
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._div = this.output = new Tone.Multiply(1);

		this._sub.connect(this._div);
		this._setRange();
	};

	Tone.extend(Tone.Normalize, Tone.SignalBase);

	/**
	 *  set the minimum input value
	 *  @param {number} min the minimum input value
	 *  @returns {Tone.Normalize} `this`
	 */
	Tone.Normalize.prototype.setMin = function(min){
		this._inputMin = min;
		this._setRange();
		return this;
	};

	/**
	 *  set the minimum input value
	 *  @param {number} min the minimum input value
	 *  @returns {Tone.Normalize} `this`
	 */
	Tone.Normalize.prototype.setMax = function(max){
		this._inputMax = max;
		this._setRange();
		return this;
	};

	/**
	 *  set the values
	 *  @private
	 */
	Tone.Normalize.prototype._setRange = function() {
		this._sub.setValue(-this._inputMin);
		this._div.setValue(1 / (this._inputMax - this._inputMin));
	};

	/**
	 *  clean up
	 *  @returns {Tone.Normalize} `this`
	 */
	Tone.Normalize.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._sub.dispose();
		this._sub = null;
		this._div.dispose();
		this._div = null;
		return this;
	};

	return Tone.Normalize;
});