define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/component/MidSideSplit", "Tone/component/MidSideMerge"], 
	function(Tone){

	"use strict";

	/**
	 *  @class Mid/Side processing separates the the 'mid' signal 
	 *         (which comes out of both the left and the right channel) 
	 *         and the 'side' (which only comes out of the the side channels) 
	 *         and effects them separately before being recombined. <br>
	 *         Applies a Mid/Side seperation and recombination. <br>
	 *         http://musicdsp.org/showArchiveComment.php?ArchiveID=173<br>
	 *         http://www.kvraudio.com/forum/viewtopic.php?t=212587<br>
	 *         M = (L+R)/sqrt(2);   // obtain mid-signal from left and right<br>
	 *         S = (L-R)/sqrt(2);   // obtain side-signal from left and righ<br>
	 *         // amplify mid and side signal seperately:<br>
	 *         M/S send/return<br>
	 *         L = (M+S)/sqrt(2);   // obtain left signal from mid and side<br>
	 *         R = (M-S)/sqrt(2);   // obtain right signal from mid and side<br>
	 *
	 *  @extends {Tone.Effect}
	 *  @constructor
	 */
	Tone.MidSideEffect = function(){
		Tone.Effect.call(this);

		/**
		 *  The mid/side split
		 *  @type  {Tone.MidSideSplit}
		 *  @private
		 */
		this._midSideSplit = new Tone.MidSideSplit();

		/**
		 *  The mid/side merge
		 *  @type  {Tone.MidSideMerge}
		 *  @private
		 */
		this._midSideMerge = new Tone.MidSideMerge();

		/**
		 *  The mid send. Connect to mid processing
		 *  @type {Tone.Expr}
		 */
		this.midSend = this._midSideSplit.mid;

		/**
		 *  The side send. Connect to side processing
		 *  @type {Tone.Expr}
		 */
		this.sideSend = this._midSideSplit.side;

		/**
		 *  The mid return connection
		 *  @type {GainNode}
		 */
		this.midReturn = this._midSideMerge.mid;

		/**
		 *  The side return connection
		 *  @type {GainNode}
		 */
		this.sideReturn = this._midSideMerge.side;

		//the connections
		this.effectSend.connect(this._midSideSplit);
		this._midSideMerge.connect(this.effectReturn);
	};

	Tone.extend(Tone.MidSideEffect, Tone.Effect);

	/**
	 *  clean up
	 *  @returns {Tone.MidSideEffect} this
	 */
	Tone.MidSideEffect.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._midSideSplit.dispose();
		this._midSideSplit = null;
		this._midSideMerge.dispose();
		this._midSideMerge = null;
		this.midSend = null;
		this.sideSend = null;
		this.midReturn = null;
		this.sideReturn = null;
		return this;
	};

	return Tone.MidSideEffect;
});