define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Expr", "Tone/signal/EqualPowerGain"], function(Tone){

	"use strict";

	/**
	 * @class  Equal power fading control values:<br>
	 * 	       0 = 100% input 0<br>
	 * 	       1 = 100% input 1<br>
	 *
	 * @constructor
	 * @extends {Tone}
	 * @param {number} [initialFade=0.5]
	 * @example
	 * var crossFade = new Tone.CrossFade(0.5);
	 * effectA.connect(crossFade, 0, 0);
	 * effectB.connect(crossFade, 0, 1);
	 * crossFade.fade.value = 0;
	 * // ^ only effectA is output
	 * crossFade.fade.value = 1;
	 * // ^ only effectB is output
	 * crossFade.fade.value = 0.5;
	 * // ^ the two signals are mixed equally. 
	 */		
	Tone.CrossFade = function(initialFade){

		Tone.call(this, 2, 1);

		/**
		 *  the first input. input "a".
		 *  @type {GainNode}
		 */
		this.a = this.input[0] = this.context.createGain();

		/**
		 *  the second input. input "b"
		 *  @type {GainNode}
		 */
		this.b = this.input[1] = this.context.createGain();

		/**
		 *  0 is 100% signal `a` (input 0) and 1 is 100% signal `b` (input 1).
		 *  Values between 0-1.
		 *  
		 *  @type {Tone.Signal}
		 */
		this.fade = new Tone.Signal(this.defaultArg(initialFade, 0.5), Tone.Signal.Units.Normal);

		/**
		 *  equal power gain cross fade
		 *  @private
		 *  @type {Tone.EqualPowerGain}
		 */
		this._equalPowerA = new Tone.EqualPowerGain();

		/**
		 *  equal power gain cross fade
		 *  @private
		 *  @type {Tone.EqualPowerGain}
		 */
		this._equalPowerB = new Tone.EqualPowerGain();
		
		/**
		 *  invert the incoming signal
		 *  @private
		 *  @type {Tone}
		 */
		this._invert = new Tone.Expr("1 - $0");

		//connections
		this.a.connect(this.output);
		this.b.connect(this.output);
		this.fade.chain(this._equalPowerB, this.b.gain);
		this.fade.chain(this._invert, this._equalPowerA, this.a.gain);
	};

	Tone.extend(Tone.CrossFade);

	/**
	 *  clean up
	 *  @returns {Tone.CrossFade} `this`
	 */
	Tone.CrossFade.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._equalPowerA.dispose();
		this._equalPowerA = null;
		this._equalPowerB.dispose();
		this._equalPowerB = null;
		this.fade.dispose();
		this.fade = null;
		this._invert.dispose();
		this._invert = null;
		this.a.disconnect();
		this.a = null;
		this.b.disconnect();
		this.b = null;
		return this;
	};

	return Tone.CrossFade;
});
