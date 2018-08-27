define(["../core/Tone", "../component/CrossFade", "../component/Merge", "../component/Split", "../shim/StereoPannerNode",
	"../signal/Signal", "../signal/AudioToGain", "../signal/Zero", "../core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Panner is an equal power Left/Right Panner and does not
	 *          support 3D. Panner uses the StereoPannerNode when available.
	 *
	 *  @constructor
	 *  @extends {Tone.AudioNode}
	 *  @param {NormalRange} [initialPan=0] The initail panner value (center).
	 *  @example
	 *  //pan the input signal hard right.
	 *  var panner = new Tone.Panner(1);
	 */
	Tone.Panner = function(initialPan){

		Tone.AudioNode.call(this);
		/**
		*  the panner node
		*  @type {StereoPannerNode}
		*  @private
		*/
		this._panner = this.input = this.output = this.context.createStereoPanner();

		/**
		*  The pan control. -1 = hard left, 1 = hard right.
		*  @type {AudioRange}
		*  @signal
		*/
		this.pan = this._panner.pan;

		//initial value
		this.pan.value = Tone.defaultArg(initialPan, 0);
		this._readOnly("pan");
	};

	Tone.extend(Tone.Panner, Tone.AudioNode);

	/**
	 *  Clean up.
	 *  @returns {Tone.Panner} this
	 */
	Tone.Panner.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._writable("pan");
		this._panner.disconnect();
		this._panner = null;
		this.pan = null;
		return this;
	};

	return Tone.Panner;
});
