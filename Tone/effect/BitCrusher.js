import Tone from "../core/Tone";
import "../effect/Effect";
import "../signal/Subtract";
import "../signal/Modulo";

/**
 *  @class Tone.Bitcrusher downsamples the incoming signal to a different bitdepth.
 *         Lowering the bitdepth of the signal creates distortion. Read more about Bitcrushing
 *         on [Wikipedia](https://en.wikipedia.org/wiki/Bitcrusher).
 *
 *  @constructor
 *  @extends {Tone.Effect}
 *  @param {Number} bits The number of bits to downsample the signal. Nominal range
 *                       of 1 to 8.
 *  @example
 * //initialize crusher and route a synth through it
 * var crusher = new Tone.BitCrusher(4).toMaster();
 * var synth = new Tone.MonoSynth().connect(crusher);
 */
Tone.BitCrusher = function(){

	var options = Tone.defaults(arguments, ["bits"], Tone.BitCrusher);
	Tone.Effect.call(this, options);

	var invStepSize = 1 / Math.pow(2, options.bits - 1);

	/**
	 *  Subtract the input signal and the modulus of the input signal
	 *  @type {Tone.Subtract}
	 *  @private
	 */
	this._subtract = new Tone.Subtract();

	/**
	 *  The mod function
	 *  @type  {Tone.Modulo}
	 *  @private
	 */
	this._modulo = new Tone.Modulo(invStepSize);

	/**
	 *  keeps track of the bits
	 *  @type {number}
	 *  @private
	 */
	this._bits = options.bits;

	//connect it up
	this.effectSend.fan(this._subtract, this._modulo);
	this._modulo.connect(this._subtract, 0, 1);
	this._subtract.connect(this.effectReturn);
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
 * The bit depth of the effect. Nominal range of 1-8.
 * @memberOf Tone.BitCrusher#
 * @type {number}
 * @name bits
 */
Object.defineProperty(Tone.BitCrusher.prototype, "bits", {
	get : function(){
		return this._bits;
	},
	set : function(bits){
		this._bits = bits;
		var invStepSize = 1 / Math.pow(2, bits - 1);
		this._modulo.value = invStepSize;
	}
});

/**
 *  Clean up.
 *  @returns {Tone.BitCrusher} this
 */
Tone.BitCrusher.prototype.dispose = function(){
	Tone.Effect.prototype.dispose.call(this);
	this._subtract.dispose();
	this._subtract = null;
	this._modulo.dispose();
	this._modulo = null;
	return this;
};

export default Tone.BitCrusher;

