define(["Tone/core/Tone", "Tone/signal/Multiply"], function(Tone){

	"use strict";

	/**
	 *  @class Signal-rate modulo operator. Specify the modulus and the 
	 *         number of bits of the incoming signal. Because the operator is composed of many components, 
	 *         fewer bits will improve performance. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} modulus the modolus to apply
	 *  @param {number} [bits=8]	optionally set the maximum bits the incoming signal can have. 
	 *                           	defaults to 8 meaning that incoming values must be in the range
	 *                            	[-255,255]. (2^8 = 256);
	 */
	Tone.Modulo = function(modulus, bits){

		Tone.call(this);

		bits = this.defaultArg(bits, 8);

		/**
		 *  the array of Modulus Subroutine objects
		 *  @type {Array.<ModulusSubroutine>}
		 *  @private
		 */
		this._modChain = [];

		//create all of the subroutines
		for (var i = bits - 1; i >= 0; i--){
			var mod = new ModuloSubroutine(modulus, Math.pow(2, i));
			this._modChain.push(mod);
		}
		this.chain.apply(this, this._modChain);
		this.input.connect(this._modChain[0]);
		this._modChain[this._modChain.length - 1].connect(this.output);
	};

	Tone.extend(Tone.Modulo);

	Tone.Modulo.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		for (var i = 0; i < this._modChain.length; i++) {
			this._modChain[i].dispose();
			this._modChain[i] = null;
		}
		this._modChain = null;
	};

	/**
	 *  @class applies a modolus at a single bit depth. 
	 *         uses this operation: http://stackoverflow.com/a/14842954
	 *
	 *  
	 *  @internal helper class for modulo
	 *  @constructor
	 *  @extends {Tone}
	 */
	var ModuloSubroutine = function(modulus, multiple){

		var val = modulus * multiple;

		/**
		 *  the input node
		 */
		this.input = this.context.createGain();

		/**
		 *  divide the incoming signal so it's on a 0 to 1 scale
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._div = new Tone.Multiply(1 / val);

		/**
		 *  apply the equation logic
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._operator = this.context.createWaveShaper();

		//connect it up
		this.chain(this.input, this._div, this._operator);
		this._makeCurve(val);
	};

	Tone.extend(ModuloSubroutine);

	/**
	 * make the operator curve
	 * @param {number} val
	 * @private 
	 */
	ModuloSubroutine.prototype._makeCurve = function(val){
		var arrayLength = Math.pow(2, 18);
		var curve = new Float32Array(arrayLength);
		for (var i = 0; i < curve.length; i++) {
			if (i === arrayLength - 1){
				curve[i] = -val;
			} else if (i === 0){
				curve[i] = val;
			} else {
				curve[i] = 0;
			}
		}
		this._operator.curve = curve;
	};

	/**
	 *  @override the default connection to connect the operator and the input to the next node
	 *  @private
	 */
	ModuloSubroutine.prototype.connect = function(node){
		this._operator.connect(node);
		this.input.connect(node);
	};

	 /**
	  *  internal class clean up
	  */
	ModuloSubroutine.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._div.dispose();
		this._operator.disconnect();
		this._div = null;
		this._operator = null;
	};

	return Tone.Modulo;
});