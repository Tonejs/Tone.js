define(["Tone/core/Tone", "Tone/signal/WaveShaper", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class AudioToGain converts an input range of -1,1 to 0,1
	 *
	 *  @extends {Tone}
	 *  @constructor
	 */
	Tone.AudioToGain = function(){

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._norm = this.input = this.output = new Tone.WaveShaper([0,1]);
	};

	Tone.extend(Tone.AudioToGain);

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.AudioToGain.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.AudioToGain.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._norm.disconnect();
		this._norm = null;
	};

	return Tone.AudioToGain;
});