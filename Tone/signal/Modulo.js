define(["Tone/core/Tone", "Tone/signal/Multiply", "Tone/signal/WaveShaper"], function(Tone){

	"use strict";

	/**
	 *  @class Signal-rate modulo operator. Specify the modulus and the 
	 *         number of bits of the incoming signal. Because the operator is composed of many components, 
	 *         fewer bits will improve performance. 
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {number} modulus the modulus to apply
	 *  @param {number} [bits=8]	optionally set the maximum bits the incoming signal can have. 
	 *                           	defaults to 8 meaning that incoming values must be in the range
	 *                            	[-255,255].
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
		this.connectSeries.apply(this, this._modChain);
		this.input.connect(this._modChain[0]);
		this._modChain[this._modChain.length - 1].connect(this.output);
	};

	Tone.extend(Tone.Modulo, Tone.SignalBase);

	/**
	 * clean up
	 *  @returns {Tone.Modulo} `this`
	 */
	Tone.Modulo.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		for (var i = 0; i < this._modChain.length; i++) {
			this._modChain[i].dispose();
			this._modChain[i] = null;
		}
		this._modChain = null;
		return this;
	};

	/**
	 *  @class applies a modolus at a single bit depth. 
	 *         uses this operation: http://stackoverflow.com/a/14842954
	 *
	 *  
	 *  @private
	 *  @constructor
	 *  @extends {Tone}
	 */
	var ModuloSubroutine = function(modulus, multiple){

		var val = modulus * multiple;
		var arrayLength = 1024;

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
		 *  the curve that the waveshaper uses
		 *  @type {Float32Array}
		 *  @private
		 */
		this._curve = new Float32Array(1024);

		/**
		 *  apply the equation logic
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._operator = new Tone.WaveShaper(function(norm, pos){
			if (pos === arrayLength - 1){
				return -val;
			} else if (pos === 0){
				return val;
			} else {
				return 0;
			}
		}, arrayLength);

		//connect it up
		this.input.chain(this._div, this._operator);
	};

	Tone.extend(ModuloSubroutine);

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
		this._div = null;
		this._operator.disconnect();
		this._operator = null;
		this._curve = null;
	};

	return Tone.Modulo;
});