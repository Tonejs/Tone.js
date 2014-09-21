define(["Tone/core/Tone", "Tone/component/Merge"], function(Tone){

	"use strict";

	/**
	 *  @class Transform the incoming mono or stereo signal into mono
	 *
	 *  @extends {Tone}
	 *  @constructor
	 */
	Tone.Mono = function(){
		Tone.call(this);

		/**
		 *  merge the signal
		 *  @type {Tone.Merge}
		 *  @private
		 */
		this._merge = new Tone.Merge();

		this.input.connect(this._merge, 0, 0);
		this.input.connect(this._merge, 0, 1);
		this.input.gain.value = this.dbToGain(-10);
		this._merge.connect(this.output);
	};

	Tone.extend(Tone.Mono);

	/**
	 *  clean up
	 */
	Tone.Mono.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._merge.dispose();
		this._merge = null;
	};

	return Tone.Mono;
});