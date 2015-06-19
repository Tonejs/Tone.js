define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/GreaterThanZero", "Tone/signal/WaveShaper"], 
function(Tone){

	"use strict";

	/**
	 *  @class  EqualZero outputs 1 when the input is equal to 
	 *          0 and outputs 0 otherwise. 
	 *  
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @example
	 * var eq0 = new Tone.EqualZero();
	 * var sig = new Tone.Signal(0).connect(eq0);
	 * //the output of eq0 is 1. 
	 */
	Tone.EqualZero = function(){

		/**
		 *  scale the incoming signal by a large factor
		 *  @private
		 *  @type {Tone.Multiply}
		 */
		this._scale = this.input = new Tone.Multiply(10000);
		
		/**
		 *  @type {Tone.WaveShaper}
		 *  @private
		 */
		this._thresh = new Tone.WaveShaper(function(val){
			if (val === 0){
				return 1;
			} else {
				return 0;
			}
		}, 128);

		/**
		 *  threshold the output so that it's 0 or 1
		 *  @type {Tone.GreaterThanZero}
		 *  @private
		 */
		this._gtz = this.output = new Tone.GreaterThanZero();

		//connections
		this._scale.chain(this._thresh, this._gtz);
	};

	Tone.extend(Tone.EqualZero, Tone.SignalBase);

	/**
	 *  Clean up.
	 *  @returns {Tone.EqualZero} this
	 */
	Tone.EqualZero.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._gtz.dispose();
		this._gtz = null;
		this._scale.dispose();
		this._scale = null;
		this._thresh.dispose();
		this._thresh = null;
		return this;
	};

	return Tone.EqualZero;
});