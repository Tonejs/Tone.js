define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/signal/Modulo", "Tone/signal/Negate", "Tone/signal/Add"], 
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

		/**
		 *  Used for the floor function
		 *  @type {Tone.Modulo}
		 *  @private
		 */
		this._modulo = new Tone.Modulo(1, options.bits);

		/**
		 *  used for the floor function
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._neg = new Tone.Negate();

		/**
		 *  Node where the subtraction occurs for floor function
		 *  @type {GainNode}
		 *  @private
		 */
		this._sub = this.context.createGain();

		var valueRange = Math.pow(2, options.bits - 1);

		/**
		 *  scale the incoming signal to [0, valueRange)
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._scale = new Tone.Scale(-1, 1, 0, valueRange);

		/**
		 *  scale it back to the audio range [-1, 1]
		 *  @type {Tone.Scale}
		 *  @private
		 */
		this._invScale = new Tone.Scale(0, valueRange, -1, 1);

		//connect it up
		this.effectSend.connect(this._scale);
		this._scale.connect(this._invScale);
		this.chain(this._scale, this._modulo, this._neg, this._invScale, this.effectReturn);
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
	 *  set the bit rate
	 *  
	 *  @param {number} bits the number of bits in the range [1,8]
	 */
	Tone.BitCrusher.prototype.setBits = function(bits){
		bits = Math.min(bits, 8);
		var valueRange = Math.pow(2, bits - 1);
		this._scale.setOutputMax(valueRange);
		this._invScale.setInputMax(valueRange);
	};

	/**
	 *  set all of the parameters with an object
	 *  @param {Object} params 
	 */
	Tone.BitCrusher.prototype.set = function(params){
		if (!this.isUndef(params.bits)) this.setBits(params.bits);
		Tone.Effect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.BitCrusher.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._modulo.dispose();
		this._neg.dispose();
		this._sub.disconnect();
		this._scale.dispose();
		this._invScale.dispose();
		this._modulo = null;
		this._neg = null;
		this._sub = null;
		this._scale = null;
		this._invScale = null;
	}; 

	return Tone.BitCrusher;
});