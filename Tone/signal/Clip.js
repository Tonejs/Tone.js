define(["Tone/core/Tone", "Tone/signal/Max", "Tone/signal/Min"], function(Tone){

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
		
		/**
		 *  the min clipper
		 *  @private
		 */
		this._min = new Tone.Min(max);

		/**
		 *  the max clipper
		 *  @private
		 */
		this._max = new Tone.Max(min);

		//connect it up
		this.chain(this.input, this._min, this._max, this.output);
	};

	Tone.extend(Tone.Clip);

	return Tone.Clip;
});