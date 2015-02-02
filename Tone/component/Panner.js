define(["Tone/core/Tone", "Tone/component/CrossFade", "Tone/component/Merge", "Tone/component/Split"], 
function(Tone){

	"use strict";

	/**
	 *  Panner. 
	 *  
	 *  @class  Equal Power Gain L/R Panner. Not 3D. 
	 *          0 = 100% Left
	 *          1 = 100% Right
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} [initialPan=0.5] the initail panner value (defaults to 0.5 = center)
	 */
	Tone.Panner = function(initialPan){

		Tone.call(this, 1, 0);
		
		/**
		 *  the dry/wet knob
		 *  @type {Tone.CrossFade}
		 *  @private
		 */
		this._crossFade = new Tone.CrossFade();
		/**
		 *  @type {Tone.Merge}
		 *  @private
		 */
		this._merger = this.output = new Tone.Merge();
		/**
		 *  @type {Tone.Split}
		 *  @private
		 */
		this._splitter = new Tone.Split();
		/**
		 *  the pan control
		 *  @type {Tone.Signal}
		 */	
		this.pan = this._crossFade.fade;

		//CONNECTIONS:
		this.input.connect(this._splitter.left);
		this.input.connect(this._splitter.right);
		//left channel is dry, right channel is wet
		this._splitter.connect(this._crossFade, 0, 0);
		this._splitter.connect(this._crossFade, 1, 1);
		//merge it back together
		this._crossFade.a.connect(this._merger.left);
		this._crossFade.b.connect(this._merger.right);

		//initial value
		this.setPan(this.defaultArg(initialPan, 0.5));
	};

	Tone.extend(Tone.Panner);

	/**
	 *  set the l/r pan.
	 *  
	 *  0 = 100% left.
	 *  1 = 100% right.
	 *  
	 *  @param {number} pan 0-1
	 *  @param {Tone.Time=} rampTime ramp to the pan position
	 *  @returns {Tone.Panner} `this`
	 */
	Tone.Panner.prototype.setPan = function(pan, rampTime){
		this._crossFade.setFade(pan, rampTime);
		return this;
	};

	/**
	 *  clean up
	 *  @returns {Tone.Panner} `this`
	 */
	Tone.Panner.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._crossFade.dispose();
		this._crossFade = null;
		this._splitter.dispose();
		this._splitter = null;
		this._merger.dispose();
		this._merger = null;
		this.pan = null;
		return this;
	};

	return Tone.Panner;
});