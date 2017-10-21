define(["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Subtract", "Tone/signal/Signal",
	"Tone/component/Split", "Tone/core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class Mid/Side processing separates the the 'mid' signal
	 *         (which comes out of both the left and the right channel)
	 *         and the 'side' (which only comes out of the the side channels). <br><br>
	 *         <code>
	 *         Mid = (Left+Right)/sqrt(2);   // obtain mid-signal from left and right<br>
	 *         Side = (Left-Right)/sqrt(2);   // obtain side-signal from left and righ<br>
	 *         </code>
	 *
	 *  @extends {Tone.AudioNode}
	 *  @constructor
	 */
	Tone.MidSideSplit = function(){

		Tone.AudioNode.call(this);
		this.createInsOuts(0, 2);

		/**
		 *  split the incoming signal into left and right channels
		 *  @type  {Tone.Split}
		 *  @private
		 */
		this._split = this.input = new Tone.Split();

		/**
		 *  The mid send. Connect to mid processing. Alias for
		 *  <code>output[0]</code>
		 *  @type {Tone.Add}
		 */
		this._midAdd = new Tone.Add();

		/**
		 * Multiply the _midAdd by sqrt(1/2)
		 * @type {Tone.Multiply}
		 */
		this.mid = this.output[0] = new Tone.Multiply(Math.SQRT1_2);

		/**
		 *  The side output. Connect to side processing. Also Output 1
		 *  @type {Tone.Subtract}
		 */
		this._sideSubtract = new Tone.Subtract();

		/**
		 * Multiply the _midAdd by sqrt(1/2)
		 * @type {Tone.Multiply}
		 */
		this.side = this.output[1] = new Tone.Multiply(Math.SQRT1_2);

		this._split.connect(this._midAdd, 0, 0);
		this._split.connect(this._midAdd, 1, 1);
		this._split.connect(this._sideSubtract, 0, 0);
		this._split.connect(this._sideSubtract, 1, 1);
		this._midAdd.connect(this.mid);
		this._sideSubtract.connect(this.side);
	};

	Tone.extend(Tone.MidSideSplit, Tone.AudioNode);

	/**
	 *  clean up
	 *  @returns {Tone.MidSideSplit} this
	 */
	Tone.MidSideSplit.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this.mid.dispose();
		this.mid = null;
		this.side.dispose();
		this.side = null;
		this._midAdd.dispose();
		this._midAdd = null;
		this._sideSubtract.dispose();
		this._sideSubtract = null;
		this._split.dispose();
		this._split = null;
		return this;
	};

	return Tone.MidSideSplit;
});
