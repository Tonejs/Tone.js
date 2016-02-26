define(["Tone/core/Tone", "Tone/effect/MidSideEffect", "Tone/signal/Signal", 
	"Tone/signal/Multiply", "Tone/signal/Expr"], 
	function(Tone){

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

		var options = this.optionsObject(arguments, ["width"], Tone.StereoWidener.defaults);
		Tone.MidSideEffect.call(this, options);

		/**
		 *  The width control. 0 = 100% mid. 1 = 100% side. 0.5 = no change. 
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.width = new Tone.Signal(options.width, Tone.Type.NormalRange);

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
		this._readOnly(["width"]);
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
		this._two.dispose();
		this._two = null;
		return this;
	};

	return Tone.StereoWidener;
});