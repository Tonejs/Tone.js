define(["Tone/core/Tone", "Tone/signal/LessThan", "Tone/signal/Select", "Tone/signal/Not"], function(Tone){

	"use strict";

	/**
	 *  @class Signal-rate modulo operator. Specify the modulus and the 
	 *         number of bits of the incoming signal. Because the operator is composed of many components, 
	 *         fewer bits will improve performance. 
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} modulus the modolus to apply
	 *  @param {number=} bits    optionally set the maximum bits the incoming signal can have. 
	 *                           defaults to 4 meaning that incoming values must be in the range
	 *                           0-32. (2^4 = 32);
	 */
	Tone.Modulo = function(modulus, bits){

		Tone.call(this);

		bits = this.defaultArg(bits, 4);

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

		//connect them up
		this.input.connect(this._modChain[0]);
		this.chain.apply(this, this._modChain);
		this._modChain[bits - 1].connect(this.output);
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

		Tone.call(this);

		var val = modulus * multiple;

		/**
		 *  @type {Tone.LessThan}
		 *  @private
		 */
		this._lt = new Tone.LessThan(val);

		/**
		 *  @private
		 *  @type {Tone.Not}
		 */
		this._not = new Tone.Not();

		/**
		 *  @private
		 *  @type {Tone.Add}
		 */
		this._sub = new Tone.Add(-val);

		/**
		 *  @private
		 *  @type {Tone.Select}
		 */
		this._select = new Tone.Select(2);

		//connections
		this.chain(this.input, this._lt, this._not, this._select.gate);
		this.input.connect(this._sub);
		this._sub.connect(this._select, 0, 1);
		this.input.connect(this._select, 0, 0);
		this._select.connect(this.output);
	};

	Tone.extend(ModuloSubroutine);

	 /**
	  *  internal class clean up
	  */
	ModuloSubroutine.prototype.dispose = function(){
		this._lt.dispose();
		this._not.dispose();
		this._sub.dispose();
		this._select.dispose();
		this._lt = null;
		this._not = null;
		this._sub = null;
		this._select = null;
	};

	return Tone.Modulo;
});