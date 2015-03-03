define(["Tone/core/Tone", "Tone/effect/StereoEffect"], function(Tone){

	"use strict";

	/**
	 *  @class Applies a Mid/Side seperation and recombination
	 *         http://musicdsp.org/showArchiveComment.php?ArchiveID=173
	 *         http://www.kvraudio.com/forum/viewtopic.php?t=212587
	 *         M = (L+R)/sqrt(2);   // obtain mid-signal from left and right
	 *         S = (L-R)/sqrt(2);   // obtain side-signal from left and righ
	 *         // amplify mid and side signal seperately:
	 *         M/S send/return
	 *         L = (M+S)/sqrt(2);   // obtain left signal from mid and side
	 *         R = (M-S)/sqrt(2);   // obtain right signal from mid and side
	 *
	 *  @extends {Tone.StereoEffect}
	 *  @constructor
	 */
	Tone.MidSideEffect = function(){
		Tone.StereoEffect.call(this);

		/**
		 *  a constant signal equal to 1 / sqrt(2)
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._sqrtTwo = new Tone.Signal(1 / Math.sqrt(2));

		/**
		 *  the mid send.
		 *  connect to mid processing
		 *  @type {Tone.Expr}
		 */
		this.midSend = new Tone.Expr("($0 + $1) * $2");

		/**
		 *  the side send.
		 *  connect to side processing
		 *  @type {Tone.Expr}
		 */
		this.sideSend = new Tone.Expr("($0 - $1) * $2");

		/**
		 *  recombine the mid/side into Left
		 *  @type {Tone.Expr}
		 *  @private
		 */
		this._left = new Tone.Expr("($0 + $1) * $2");

		/**
		 *  recombine the mid/side into Right
		 *  @type {Tone.Expr}
		 *  @private
		 */
		this._right = new Tone.Expr("($0 - $1) * $2");

		/**
		 *  the mid return connection
		 *  @type {GainNode}
		 */
		this.midReturn = this.context.createGain();

		/**
		 *  the side return connection
		 *  @type {GainNode}
		 */
		this.sideReturn = this.context.createGain();

		//connections
		this.effectSendL.connect(this.midSend, 0, 0);
		this.effectSendR.connect(this.midSend, 0, 1);
		this.effectSendL.connect(this.sideSend, 0, 0);
		this.effectSendR.connect(this.sideSend, 0, 1);
		this._left.connect(this.effectReturnL);
		this._right.connect(this.effectReturnR);
		this.midReturn.connect(this._left, 0, 0);
		this.sideReturn.connect(this._left, 0, 1);
		this.midReturn.connect(this._right, 0, 0);
		this.sideReturn.connect(this._right, 0, 1);
		this._sqrtTwo.connect(this.midSend, 0, 2);
		this._sqrtTwo.connect(this.sideSend, 0, 2);
		this._sqrtTwo.connect(this._left, 0, 2);
		this._sqrtTwo.connect(this._right, 0, 2);
	};

	Tone.extend(Tone.MidSideEffect, Tone.StereoEffect);

	/**
	 *  clean up
	 *  @returns {Tone.MidSideEffect} `this`
	 */
	Tone.MidSideEffect.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		this._sqrtTwo.dispose();
		this._sqrtTwo = null;
		this.midSend.dispose();
		this.midSend = null;
		this.sideSend.dispose();
		this.sideSend = null;
		this._left.dispose();
		this._left = null;
		this._right.dispose();
		this._right = null;
		this.midReturn.disconnect();
		this.midReturn = null;
		this.sideReturn.disconnect();
		this.sideReturn = null;
		return this;
	};

	return Tone.MidSideEffect;
});