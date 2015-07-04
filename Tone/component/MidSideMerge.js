define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Expr", "Tone/component/Merge"], 
	function(Tone){

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
	 *  @extends {Tone.StereoEffect}
	 *  @constructor
	 */
	Tone.MidSideMerge = function(){
		Tone.call(this, 2, 0);

		/**
		 *  The mid signal input. Alias for
		 *  <code>input[0]</code>
		 *  @type  {GainNode}
		 */
		this.mid = this.input[0] = this.context.createGain();

		/**
		 *  recombine the mid/side into Left
		 *  @type {Tone.Expr}
		 *  @private
		 */
		this._left = new Tone.Expr("($0 + $1) * $2");

		/**
		 *  The side signal input. Alias for
		 *  <code>input[1]</code>
		 *  @type  {GainNode}
		 */
		this.side = this.input[1] = this.context.createGain();

		/**
		 *  recombine the mid/side into Right
		 *  @type {Tone.Expr}
		 *  @private
		 */
		this._right = new Tone.Expr("($0 - $1) * $2");

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
		this._left.connect(this._merge, 0, 0);
		this._right.connect(this._merge, 0, 1);
		sqrtTwo.connect(this._left, 0, 2);
		sqrtTwo.connect(this._right, 0, 2);
	};

	Tone.extend(Tone.MidSideMerge);

	/**
	 *  A constant signal equal to 1 / sqrt(2).
	 *  @type {Number}
	 *  @signal
	 *  @private
	 *  @static
	 */
	var sqrtTwo = null;

	Tone._initAudioContext(function(){
		sqrtTwo = new Tone.Signal(1 / Math.sqrt(2));
	});

	/**
	 *  clean up
	 *  @returns {Tone.MidSideMerge} this
	 */
	Tone.MidSideMerge.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.mid.disconnect();
		this.mid = null;
		this.side.disconnect();
		this.side = null;
		this._left.dispose();
		this._left = null;
		this._right.dispose();
		this._right = null;
		this._merge.dispose();
		this._merge = null;
		return this;
	};

	return Tone.MidSideMerge;
});