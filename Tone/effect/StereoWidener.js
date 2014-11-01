define(["Tone/core/Tone", "Tone/effect/MidSide", "Tone/signal/Signal", 
	"Tone/signal/Multiply", "Tone/signal/Expr"], 
	function(Tone){

	"use strict";

	/**
	 *  @class Applies a width factor (0-1) to the mid/side seperation. 
	 *         0 is all mid and 1 is all side. 
	 *         http://musicdsp.org/showArchiveComment.php?ArchiveID=173
	 *         http://www.kvraudio.com/forum/viewtopic.php?t=212587
	 *         M *= 2*(1-width);
	 *         S *= 2*width
	 *
	 *  @extends {Tone.MidSide}
	 *  @constructor
	 *  @param {number|Object=} width the stereo width
	 */
	Tone.StereoWidener = function(){

		var options = this.optionsObject(arguments, ["width"], Tone.StereoWidener.defaults);
		Tone.MidSide.call(this, options);

		/**
		 *  the width control
		 *  @type {Tone.Signal}
		 */
		this.width = new Tone.Signal(0.5);

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
		this.chain(this.midSend, this._midMult, this.midReturn);
		this.chain(this.sideSend, this._sideMult, this.sideReturn);
	};

	Tone.extend(Tone.StereoWidener, Tone.MidSide);

	/**
	 *  the default values
	 *  @static
	 *  @type {Object}
	 */
	Tone.StereoWidener.defaults = {
		"width" : 0.5
	};

	/**
	 *  set the stereo width. 0 = 100% mid. 1 = 100% side. 
	 *  @param {number} width
	 */
	Tone.StereoWidener.prototype.setWidth = function(width){
		this.width.setValue(width);
	};

	/**
	 *  set the parameters with JSON
	 *  @param {Object} params 
	 */
	Tone.StereoWidener.prototype.set = function(params){
		if (!this.isUndef(params.width)) this.setWidth(params.width);
		Tone.MidSide.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.StereoWidener.prototype.dispose = function(){
		Tone.MidSide.prototype.dispose.call(this);
		this.width.dispose();
		this.width = null;
		this._midMult.dispose();
		this._midMult = null;
		this._sideMult.dispose();
		this._sideMult = null;
		this._two.dispose();
		this._two = null;
	};

	return Tone.StereoWidener;
});