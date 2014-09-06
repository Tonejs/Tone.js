define(["Tone/core/Tone", "Tone/signal/Max", "Tone/signal/Min", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 * 	@class  Clip the incoming signal so that the output is always between min and max
	 * 	
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} min the minimum value of the outgoing signal
	 *  @param {number} max the maximum value of the outgoing signal
	 */
	Tone.Clip = function(min, max){
		Tone.call(this);

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
		this._min = new Tone.Min(max);

		/**
		 *  the max clipper
		 *  @type {Tone.Max}
		 *  @private
		 */
		this._max = new Tone.Max(min);

		//connect it up
		this.chain(this.input, this._min, this._max, this.output);
	};

	Tone.extend(Tone.Clip);

	/**
	 *  set the minimum value
	 *  @param {number} min the new min value
	 */
	Tone.Clip.prototype.setMin = function(min){
		this._min.setMin(min);
	};

	/**
	 *  set the maximum value
	 *  @param {number} max the new max value
	 */
	Tone.Clip.prototype.setMax = function(max){
		this._max.setMax(max);	
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Clip.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Clip.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._min.dispose();
		this._max.dispose();
		this._min = null;
		this._max = null;
	};

	return Tone.Clip;
});