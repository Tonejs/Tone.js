define(["Tone/core/Tone", "Tone/effect/MidSideEffect", "Tone/signal/Signal", 
	"Tone/signal/Multiply", "Tone/signal/Expr"], 
	function(Tone){

	"use strict";

	/**
	 *  @class Applies a width factor (0-1) to the mid/side seperation. 
	 *         0 is all mid and 1 is all side. <br><br>
	 *         http://musicdsp.org/showArchiveComment.php?ArchiveID=173<br><br>
	 *         http://www.kvraudio.com/forum/viewtopic.php?t=212587<br><br>
	 *         M *= 2*(1-width)<br><br>
	 *         S *= 2*width<br><br>
	 *
	 *  @extends {Tone.MidSideEffect}
	 *  @constructor
	 *  @param {number|Object} [width=0.5] the stereo width. A width of 0 is mono and 1 is stereo. 0.5 is no change.
	 */
	Tone.StereoWidener = function(){

		var options = this.optionsObject(arguments, ["width"], Tone.StereoWidener.defaults);
		Tone.MidSideEffect.call(this, options);

		/**
		 *  The width control. 0 = 100% mid. 1 = 100% side. 
		 *  @type {Tone.Signal}
		 */
		this.width = new Tone.Signal(0.5, Tone.Signal.Units.Normal);

		/**
		 *  Mid multiplier
		 *  @type {Tone.Expr}
		 *  @private
		 */
		this._midMult = new Tone.Expr("$0 * ($1 * (1 - $2))");

		/**
		 *  Side multiplier
		 *  @type {Tone.Expr}
		 *  @private
		 */
		this._sideMult = new Tone.Expr("$0 * ($1 * $2)");

		/**
		 *  constant output of 2
		 *  @type {Tone}
		 *  @private
		 */
		this._two = new Tone.Signal(2);

		//the mid chain
		this._two.connect(this._midMult, 0, 1);
		this.width.connect(this._midMult, 0, 2);
		//the side chain
		this._two.connect(this._sideMult, 0, 1);
		this.width.connect(this._sideMult, 0, 2);
		//connect it to the effect send/return
		this.midSend.chain(this._midMult, this.midReturn);
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
	 *  clean up
	 *  @returns {Tone.StereoWidener} `this`
	 */
	Tone.StereoWidener.prototype.dispose = function(){
		Tone.MidSideEffect.prototype.dispose.call(this);
		this.width.dispose();
		this.width = null;
		this._midMult.dispose();
		this._midMult = null;
		this._sideMult.dispose();
		this._sideMult = null;
		this._two.dispose();
		this._two = null;
		return this;
	};

	return Tone.StereoWidener;
});