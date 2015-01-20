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

			this._bits = options.bits;

			var invStepSize = 1 / Math.pow(2, this._bits - 1);
			/**
			 *  floor function
			 *  @type {Tone.Expr}
			 *  @private
			 */
			this._floor = new Tone.Expr("$0 - mod($0, %, %)", invStepSize, this._bits);

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
		 *  set the bit rate
		 *  @param {number} bits 1-8
		 */
		Tone.BitCrusher.prototype.setBits = function(bits){
			this._bits = bits;
			var invStepSize = 1 / Math.pow(2, bits - 1);
			this._floor.dispose();
			this._floor = null;
			this._floor = new Tone.Expr("$0 - mod($0, %, %)", invStepSize, bits);
			this.connectEffect(this._floor);
		};

		/**
		 * @return {number} current bits
		 */
		Tone.BitCrusher.prototype.getBits = function(){
			return this._bits;
		};

		/**
		 *  set multiple parameters at once with an object
		 *  @param {Object} params the parameters as an object
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
			this._floor.dispose();
			this._floor = null;
		};

		return Tone.BitCrusher;
	});