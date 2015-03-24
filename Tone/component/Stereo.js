define(["Tone/core/Tone", "Tone/component/Merge"], function(Tone){

	"use strict";

	/**
	 *  @class Coerces the incoming mono signal into a stereo signal
	 *         where both left and right channels have the same value. 
	 *
	 *  @extends {Tone}
	 *  @constructor
	 */
	Tone.Stereo = function(){
		Tone.call(this, 1, 0);

		/**
		 *  merge the signal
		 *  @type {Tone.Merge}
		 *  @private
		 */
		this._merge = this.output = new Tone.Merge();

		this.input.connect(this._merge, 0, 0);
		this.input.connect(this._merge, 0, 1);
	};

	Tone.extend(Tone.Stereo);

	/**
	 *  clean up
	 *  @returns {Tone.Stereo} `this`
	 */
	Tone.Stereo.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._merge.dispose();
		this._merge = null;
		return this;
	};

	return Tone.Stereo;
});