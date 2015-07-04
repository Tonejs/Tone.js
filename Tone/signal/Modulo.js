define(["Tone/core/Tone", "Tone/signal/WaveShaper", "Tone/signal/Multiply", "Tone/signal/Subtract"], 
function(Tone){

	"use strict";

	/**
	 *  @class Signal-rate modulo operator. Only works in AudioRange [-1, 1] and for modulus
	 *         values in the NormalRange. 
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {NormalRange} modulus The modulus to apply.
	 *  @example
	 * var mod = new Tone.Modulo(0.2)
	 * var sig = new Tone.Signal(0.5).connect(mod);
	 * //mod outputs 0.1
	 */
	Tone.Modulo = function(modulus){

		Tone.call(this, 1, 1);

		/**
		 *  A waveshaper gets the integer multiple of 
		 *  the input signal and the modulus.
		 *  @private
		 *  @type {Tone.WaveShaper}
		 */
		this._shaper = new Tone.WaveShaper(Math.pow(2, 16));

		/**
		 *  the integer multiple is multiplied by the modulus
		 *  @type  {Tone.Multiply}
		 *  @private
		 */
		this._multiply = new Tone.Multiply();

		/**
		 *  and subtracted from the input signal
		 *  @type  {Tone.Subtract}
		 *  @private
		 */
		this._subtract = this.output = new Tone.Subtract();

		/**
		 *  the modulus signal
		 *  @type  {Tone.Signal}
		 *  @private
		 */
		this._modSignal = new Tone.Signal(modulus);

		//connections
		this.input.fan(this._shaper, this._subtract);
		this._modSignal.connect(this._multiply, 0, 0);
		this._shaper.connect(this._multiply, 0, 1);
		this._multiply.connect(this._subtract, 0, 1);
		this._setWaveShaper(modulus);
	};

	Tone.extend(Tone.Modulo, Tone.SignalBase);

	/**
	 *  @param  {number}  mod  the modulus to apply
	 *  @private
	 */
	Tone.Modulo.prototype._setWaveShaper = function(mod){
		this._shaper.setMap(function(val){
			var multiple = Math.floor((val + 0.0001) / mod);
			return multiple;
		});
	};

	/**
	 * The modulus value.
	 * @memberOf Tone.Modulo#
	 * @type {NormalRange}
	 * @name value
	 */
	Object.defineProperty(Tone.Modulo.prototype, "value", {
		get : function(){
			return this._modSignal.value;
		},
		set : function(mod){
			this._modSignal.value = mod;
			this._setWaveShaper(mod);
		}
	});

	/**
	 * clean up
	 *  @returns {Tone.Modulo} this
	 */
	Tone.Modulo.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._shaper.dispose();
		this._shaper = null;
		this._multiply.dispose();
		this._multiply = null;
		this._subtract.dispose();
		this._subtract = null;
		this._modSignal.dispose();
		this._modSignal = null;
		return this;
	};

	return Tone.Modulo;
});