define(["../core/Tone", "../effect/Effect", "../component/MidSideSplit", "../component/MidSideMerge"], function(Tone){

	"use strict";

	/**
	 *  @class Mid/Side processing separates the the 'mid' signal
	 *         (which comes out of both the left and the right channel)
	 *         and the 'side' (which only comes out of the the side channels)
	 *         and effects them separately before being recombined.
	 *         Applies a Mid/Side seperation and recombination.
	 *         Algorithm found in [kvraudio forums](http://www.kvraudio.com/forum/viewtopic.php?t=212587).
	 *         <br><br>
	 *         This is a base-class for Mid/Side Effects.
	 *
	 *  @extends {Tone.Effect}
	 *  @constructor
	 */
	Tone.MidSideEffect = function(){

		Tone.Effect.apply(this, arguments);

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
		 *  @type {Tone}
		 *  @private
		 */
		this.midSend = this._midSideSplit.mid;

		/**
		 *  The side send. Connect to side processing
		 *  @type {Tone}
		 *  @private
		 */
		this.sideSend = this._midSideSplit.side;

		/**
		 *  The mid return connection
		 *  @type {GainNode}
		 *  @private
		 */
		this.midReturn = this._midSideMerge.mid;

		/**
		 *  The side return connection
		 *  @type {GainNode}
		 *  @private
		 */
		this.sideReturn = this._midSideMerge.side;

		//the connections
		this.effectSend.connect(this._midSideSplit);
		this._midSideMerge.connect(this.effectReturn);
	};

	Tone.extend(Tone.MidSideEffect, Tone.Effect);

	/**
	 *  Clean up.
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
