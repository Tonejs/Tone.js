define(["Tone/core/Tone", "Tone/effect/MidSideEffect", "Tone/signal/Signal",
	"Tone/signal/Multiply", "Tone/signal/Subtract"], function(Tone){

	"use strict";

	/**
	 *  @class Applies a width factor to the mid/side seperation.
	 *         0 is all mid and 1 is all side.
	 *         Algorithm found in [kvraudio forums](http://www.kvraudio.com/forum/viewtopic.php?t=212587).
	 *         <br><br>
	 *         <code>
	 *         Mid *= 2*(1-width)<br>
	 *         Side *= 2*width
	 *         </code>
	 *
	 *  @extends {Tone.MidSideEffect}
	 *  @constructor
	 *  @param {NormalRange|Object} [width] The stereo width. A width of 0 is mono and 1 is stereo. 0.5 is no change.
	 */
	Tone.StereoWidener = function(){

		var options = Tone.defaults(arguments, ["width"], Tone.StereoWidener);
		Tone.MidSideEffect.call(this, options);

		/**
		 *  The width control. 0 = 100% mid. 1 = 100% side. 0.5 = no change.
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.width = new Tone.Signal(options.width, Tone.Type.NormalRange);
		this._readOnly(["width"]);

		/**
		 * Two times the (1-width) for the mid channel
		 * @type {Tone.Multiply}
		 * @private
		 */
		this._twoTimesWidthMid = new Tone.Multiply(2);

		/**
		 * Two times the width for the side channel
		 * @type {Tone.Multiply}
		 * @private
		 */
		this._twoTimesWidthSide = new Tone.Multiply(2);

		/**
		 *  Mid multiplier
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._midMult = new Tone.Multiply();
		this._twoTimesWidthMid.connect(this._midMult, 0, 1);
		this.midSend.chain(this._midMult, this.midReturn);

		/**
		 * 1 - width
		 * @type {Tone}
		 */
		this._oneMinusWidth = new Tone.Subtract();
		this._oneMinusWidth.connect(this._twoTimesWidthMid);
		this.context.getConstant(1).connect(this._oneMinusWidth, 0, 0);
		this.width.connect(this._oneMinusWidth, 0, 1);

		/**
		 *  Side multiplier
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._sideMult = new Tone.Multiply();
		this.width.connect(this._twoTimesWidthSide);
		this._twoTimesWidthSide.connect(this._sideMult, 0, 1);
		this.sideSend.chain(this._sideMult, this.sideReturn);
	};

	Tone.extend(Tone.StereoWidener, Tone.MidSideEffect);

	/**
	 *  the default values
	 *  @static
	 *  @type {Object}
	 */
	Tone.StereoWidener.defaults = {
		"width" : 0.5
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.StereoWidener} this
	 */
	Tone.StereoWidener.prototype.dispose = function(){
		Tone.MidSideEffect.prototype.dispose.call(this);
		this._writable(["width"]);
		this.width.dispose();
		this.width = null;
		this._midMult.dispose();
		this._midMult = null;
		this._sideMult.dispose();
		this._sideMult = null;
		this._twoTimesWidthMid.dispose();
		this._twoTimesWidthMid = null;
		this._twoTimesWidthSide.dispose();
		this._twoTimesWidthSide = null;
		this._oneMinusWidth.dispose();
		this._oneMinusWidth = null;
		return this;
	};

	return Tone.StereoWidener;
});
