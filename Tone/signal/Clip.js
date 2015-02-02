define(["Tone/core/Tone", "Tone/signal/Max", "Tone/signal/Min", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 * 	@class  Clip the incoming signal so that the output is always between min and max
	 * 	
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {number} min the minimum value of the outgoing signal
	 *  @param {number} max the maximum value of the outgoing signal
	 */
	Tone.Clip = function(min, max){
		//make sure the args are in the right order
		if (min > max){
			var tmp = min;
			min = max;
			max = tmp;
		}
		
		/**
		 *  the min clipper
		 *  @type {Tone.Min}
		 *  @private
		 */
		this._min = this.input = new Tone.Min(max);

		/**
		 *  the max clipper
		 *  @type {Tone.Max}
		 *  @private
		 */
		this._max = this.output = new Tone.Max(min);

		this._min.connect(this._max);
	};

	Tone.extend(Tone.Clip, Tone.SignalBase);

	/**
	 *  set the minimum value
	 *  @param {number} min the new min value
	 *  @returns {Tone.Clip} `this`
	 */
	Tone.Clip.prototype.setMin = function(min){
		this._min.setMin(min);
		return this;
	};

	/**
	 *  set the maximum value
	 *  @param {number} max the new max value
	 *  @returns {Tone.Clip} `this`
	 */
	Tone.Clip.prototype.setMax = function(max){
		this._max.setMax(max);	
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.Clip} `this`
	 */
	Tone.Clip.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._min.dispose();
		this._min = null;
		this._max.dispose();
		this._max = null;
		return this;
	};

	return Tone.Clip;
});