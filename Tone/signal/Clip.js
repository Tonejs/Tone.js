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
	 * The minimum value which Clip will output.
	 * @memberOf Tone.Clip#
	 * @type {number}
	 * @name min
	 */
	Object.defineProperty(Tone.Clip.prototype, "min", {
		get : function(){
			return this._min.value;
		},
		set : function(min){
			this._min.value = min;
		}
	});

	/**
	 * The maximum value which Clip will output.
	 * @memberOf Tone.Clip#
	 * @type {number}
	 * @name max
	 */
	Object.defineProperty(Tone.Clip.prototype, "max", {
		get : function(){
			return this._max.value;
		},
		set : function(max){
			this._max.value = max;
		}
	});

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