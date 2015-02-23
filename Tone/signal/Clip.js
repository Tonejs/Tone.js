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
		 *  The min clip value
		 *  @type {Tone.Signal}
		 */
		this.min = this.input = new Tone.Min(max);

		/**
		 *  The max clip value
		 *  @type {Tone.Signal}
		 */
		this.max = this.output = new Tone.Max(min);

		this.min.connect(this.max);
	};

	Tone.extend(Tone.Clip, Tone.SignalBase);

	/**
	 *  clean up
	 *  @returns {Tone.Clip} `this`
	 */
	Tone.Clip.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.min.dispose();
		this.min = null;
		this.max.dispose();
		this.max = null;
		return this;
	};

	return Tone.Clip;
});