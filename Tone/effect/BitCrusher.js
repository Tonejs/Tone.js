define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/signal/Expr"], 
function(Tone){

	"use strict";

	/**
	 *  @class downsample incoming signal. 
	 *
	 *  The algorithm to downsample the incoming signal is to scale the input
	 *  to between [0, 2^bits) and then apply a Floor function to the scaled value, 
	 *  then scale it back to audio range [-1, 1]
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {number} bits 1-8. 
	 */
	Tone.BitCrusher = function(){

		var options = this.optionsObject(arguments, ["bits"], Tone.BitCrusher.defaults);
		Tone.Effect.call(this, options);

		var invStepSize = 1 / Math.pow(2, options.bits - 1);
		/**
		 *  floor function
		 *  @type {Tone.Expr}
		 *  @private
		 */
		this._floor = new Tone.Expr("$0 - mod($0, %, %)", invStepSize, options.bits);

		//connect it up
		this.connectEffect(this._floor);
	};

	Tone.extend(Tone.BitCrusher, Tone.Effect);

	/**
	 *  the default values
	 *  @static
	 *  @type {Object}
	 */
	Tone.BitCrusher.defaults = {
		"bits" : 4
	};

	/**
	 *  clean up
	 *  @returns {Tone.BitCrusher} `this`
	 */
	Tone.BitCrusher.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._floor.dispose();
		this._floor = null;
		return this;
	}; 

	return Tone.BitCrusher;
});