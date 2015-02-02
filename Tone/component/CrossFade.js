define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Expr", "Tone/signal/EqualPowerGain"], function(Tone){

	"use strict";

	/**
	 * @class  Equal power fading control values:
	 * 	       0 = 100% input 0
	 * 	       1 = 100% input 1
	 *
	 * @constructor
	 * @extends {Tone}
	 * @param {number} [initialFade=0.5]
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
		 *  controls the amount of wet signal 
		 *  which is mixed into the dry signal
		 *  
		 *  @type {Tone.Signal}
		 */
		this.fade = new Tone.Signal();

		/**
		 *  equal power gain cross fade
		 *  @private
		 *  @type {Tone.EqualPowerGain}
		 */
		this._equalPower = new Tone.EqualPowerGain();
		
		/**
		 *  invert the incoming signal
		 *  @private
		 *  @type {Tone}
		 */
		this._invert = new Tone.Expr("1 - $0");

		//connections
		this.a.connect(this.output);
		this.b.connect(this.output);
		this.fade.connect(this._equalPower);
		this._equalPower.chain(this.b.gain);
		this._equalPower.chain(this._invert, this.a.gain);
		this.setFade(this.defaultArg(initialFade, 0.5));
	};

	Tone.extend(Tone.CrossFade);

	/**
	 * Set the wet value
	 * 
	 * @param {number} val
	 * @param {Tone.Time=} rampTime
	 * @returns {Tone.CrossFade} `this`
	 */
	Tone.CrossFade.prototype.setFade = function(val, rampTime){
		if (rampTime){
			this.fade.linearRampToValueNow(val, rampTime);
		} else {
			this.fade.setValue(val);
		}
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.CrossFade} `this`
	 */
	Tone.CrossFade.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._equalPower.dispose();
		this._equalPower = null;
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
