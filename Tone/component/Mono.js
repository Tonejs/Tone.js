define(["Tone/core/Tone", "Tone/component/Merge"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.Mono coerces the incoming mono or stereo signal into a mono signal
	 *         where both left and right channels have the same value. This can be useful 
	 *         for [stereo imaging](https://en.wikipedia.org/wiki/Stereo_imaging).
	 *
	 *  @extends {Tone}
	 *  @constructor
	 */
	Tone.Mono = function(){
		this.createInsOuts(1, 0);

		/**
		 *  merge the signal
		 *  @type {Tone.Merge}
		 *  @private
		 */
		this._merge = this.output = new Tone.Merge();

		this.input.connect(this._merge, 0, 0);
		this.input.connect(this._merge, 0, 1);
		this.input.gain.value = this.dbToGain(-10);
	};

	Tone.extend(Tone.Mono);

	/**
	 *  clean up
	 *  @returns {Tone.Mono} this
	 */
	Tone.Mono.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._merge.dispose();
		this._merge = null;
		return this;
	};

	return Tone.Mono;
});