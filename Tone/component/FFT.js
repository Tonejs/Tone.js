import Tone from "../core/Tone";
import "../component/Analyser";
import "../core/AudioNode";

/**
 *  @class  Get the current frequency data of the connected audio source
 *          using a fast Fourier transform.
 *  @extends {Tone.AudioNode}
 *  @param {Number=} size The size of the FFT. Value must be a power of
 *                       two in the range 16 to 16384.
 */
Tone.FFT = function(){

	var options = Tone.defaults(arguments, ["size"], Tone.FFT);
	options.type = Tone.Analyser.Type.FFT;
	Tone.AudioNode.call(this);

	/**
	 *  The analyser node.
	 *  @private
	 *  @type {Tone.Analyser}
	 */
	this._analyser = this.input = this.output = new Tone.Analyser(options);
};

Tone.extend(Tone.FFT, Tone.AudioNode);

/**
 *  The default values.
 *  @type {Object}
 *  @const
 */
Tone.FFT.defaults = {
	"size" : 1024
};

/**
 *  Gets the current frequency data from the connected audio source. 
 *  Returns the frequency data of length [size](#size) as a Float32Array of decibel values. 
 *  @returns {TypedArray}
 */
Tone.FFT.prototype.getValue = function(){
	return this._analyser.getValue();
};

/**
 *  The size of analysis. This must be a power of two in the range 16 to 16384.
 *  Determines the size of the array returned by [getValue](#getvalue) (i.e. the number of
 *  frequency bins). Large FFT sizes may be costly to compute.
 *  @memberOf Tone.FFT#
 *  @type {Number}
 *  @name size
 */
Object.defineProperty(Tone.FFT.prototype, "size", {
	get : function(){
		return this._analyser.size;
	},
	set : function(size){
		this._analyser.size = size;
	}
});

/**
 *  Clean up.
 *  @return  {Tone.FFT}  this
 */
Tone.FFT.prototype.dispose = function(){
	Tone.AudioNode.prototype.dispose.call(this);
	this._analyser.dispose();
	this._analyser = null;
};

export default Tone.FFT;

