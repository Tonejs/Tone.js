define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Subtract", "Tone/signal/Add",
	"Tone/component/Merge", "Tone/core/Gain", "Tone/core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class Mid/Side processing separates the the 'mid' signal
	 *         (which comes out of both the left and the right channel)
	 *         and the 'side' (which only comes out of the the side channels).
	 *         MidSideMerge merges the mid and side signal after they've been seperated
	 *         by Tone.MidSideSplit.<br><br>
	 *         <code>
	 *         Left = (Mid+Side)/sqrt(2);   // obtain left signal from mid and side<br>
	 *         Right = (Mid-Side)/sqrt(2);   // obtain right signal from mid and side<br>
	 *         </code>
	 *
	 *  @extends {Tone.AudioNode}
	 *  @constructor
	 */
	Tone.MidSideMerge = function(){

		Tone.AudioNode.call(this);
		this.createInsOuts(2, 0);

		/**
		 *  The mid signal input. Alias for
		 *  <code>input[0]</code>
		 *  @type  {Tone.Gain}
		 */
		this.mid = this.input[0] = new Tone.Gain();

		/**
		 *  recombine the mid/side into Left
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._left = new Tone.Add();

		/**
		 * Multiply the left by sqrt(1/2)
		 * @type {Tone.Multiply}
		 */
		this._timesTwoLeft = new Tone.Multiply(Math.SQRT1_2);

		/**
		 *  The side signal input. Alias for
		 *  <code>input[1]</code>
		 *  @type  {Tone.Gain}
		 */
		this.side = this.input[1] = new Tone.Gain();

		/**
		 *  recombine the mid/side into Right
		 *  @type {Tone.Subtract}
		 *  @private
		 */
		this._right = new Tone.Subtract(/*"($0 - $1) * $2"*/);

		/**
		 * Multiply the right by sqrt(1/2)
		 * @type {Tone.Multiply}
		 */
		this._timesTwoRight = new Tone.Multiply(Math.SQRT1_2);

		/**
		 *  Merge the left/right signal back into a stereo signal.
		 *  @type {Tone.Merge}
		 *  @private
		 */
		this._merge = this.output = new Tone.Merge();

		this.mid.connect(this._left, 0, 0);
		this.side.connect(this._left, 0, 1);
		this.mid.connect(this._right, 0, 0);
		this.side.connect(this._right, 0, 1);
		this._left.connect(this._timesTwoLeft);
		this._right.connect(this._timesTwoRight);
		this._timesTwoLeft.connect(this._merge, 0, 0);
		this._timesTwoRight.connect(this._merge, 0, 1);
	};

	Tone.extend(Tone.MidSideMerge, Tone.AudioNode);

	/**
	 *  clean up
	 *  @returns {Tone.MidSideMerge} this
	 */
	Tone.MidSideMerge.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this.mid.dispose();
		this.mid = null;
		this.side.dispose();
		this.side = null;
		this._left.dispose();
		this._left = null;
		this._timesTwoLeft.dispose();
		this._timesTwoLeft = null;
		this._right.dispose();
		this._right = null;
		this._timesTwoRight.dispose();
		this._timesTwoRight = null;
		this._merge.dispose();
		this._merge = null;
		return this;
	};

	return Tone.MidSideMerge;
});
