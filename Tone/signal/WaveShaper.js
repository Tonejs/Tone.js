import Tone from "../core/Tone";
import "../signal/SignalBase";
import "../shim/WaveShaperNode";

/**
 *  @class Wraps the native Web Audio API
 *         [WaveShaperNode](http://webaudio.github.io/web-audio-api/#the-waveshapernode-interface).
 *
 *  @extends {Tone.SignalBase}
 *  @constructor
 *  @param {function|Array|Number} mapping The function used to define the values.
 *                                    The mapping function should take two arguments:
 *                                    the first is the value at the current position
 *                                    and the second is the array position.
 *                                    If the argument is an array, that array will be
 *                                    set as the wave shaping function. The input
 *                                    signal is an AudioRange [-1, 1] value and the output
 *                                    signal can take on any numerical values.
 *
 *  @param {Number} [bufferLen=1024] The length of the WaveShaperNode buffer.
 *  @example
 * var timesTwo = new Tone.WaveShaper(function(val){
 * 	return val * 2;
 * }, 2048);
 *  @example
 * //a waveshaper can also be constructed with an array of values
 * var invert = new Tone.WaveShaper([1, -1]);
 */
Tone.WaveShaper = function(mapping, bufferLen){

	Tone.SignalBase.call(this);

	/**
	 *  the waveshaper
	 *  @type {WaveShaperNode}
	 *  @private
	 */
	this._shaper = this.input = this.output = this.context.createWaveShaper();

	/**
	 *  the waveshapers curve
	 *  @type {Float32Array}
	 *  @private
	 */
	this._curve = null;

	if (Array.isArray(mapping)){
		this.curve = mapping;
	} else if (isFinite(mapping) || Tone.isUndef(mapping)){
		this._curve = new Float32Array(Tone.defaultArg(mapping, 1024));
	} else if (Tone.isFunction(mapping)){
		this._curve = new Float32Array(Tone.defaultArg(bufferLen, 1024));
		this.setMap(mapping);
	}
};

Tone.extend(Tone.WaveShaper, Tone.SignalBase);

/**
 *  Uses a mapping function to set the value of the curve.
 *  @param {function} mapping The function used to define the values.
 *                            The mapping function take two arguments:
 *                            the first is the value at the current position
 *                            which goes from -1 to 1 over the number of elements
 *                            in the curve array. The second argument is the array position.
 *  @returns {Tone.WaveShaper} this
 *  @example
 * //map the input signal from [-1, 1] to [0, 10]
 * shaper.setMap(function(val, index){
 * 	return (val + 1) * 5;
 * })
 */
Tone.WaveShaper.prototype.setMap = function(mapping){
	var array = new Array(this._curve.length);
	for (var i = 0, len = this._curve.length; i < len; i++){
		var normalized = (i / (len - 1)) * 2 - 1;
		array[i] = mapping(normalized, i);
	}
	this.curve = array;
	return this;
};

/**
 * The array to set as the waveshaper curve. For linear curves
 * array length does not make much difference, but for complex curves
 * longer arrays will provide smoother interpolation.
 * @memberOf Tone.WaveShaper#
 * @type {Array}
 * @name curve
 */
Object.defineProperty(Tone.WaveShaper.prototype, "curve", {
	get : function(){
		return this._shaper.curve;
	},
	set : function(mapping){
		this._curve = new Float32Array(mapping);
		this._shaper.curve = this._curve;
	}
});

/**
 * Specifies what type of oversampling (if any) should be used when
 * applying the shaping curve. Can either be "none", "2x" or "4x".
 * @memberOf Tone.WaveShaper#
 * @type {string}
 * @name oversample
 */
Object.defineProperty(Tone.WaveShaper.prototype, "oversample", {
	get : function(){
		return this._shaper.oversample;
	},
	set : function(oversampling){
		if (["none", "2x", "4x"].includes(oversampling)){
			this._shaper.oversample = oversampling;
		} else {
			throw new RangeError("Tone.WaveShaper: oversampling must be either 'none', '2x', or '4x'");
		}
	}
});

/**
 *  Clean up.
 *  @returns {Tone.WaveShaper} this
 */
Tone.WaveShaper.prototype.dispose = function(){
	Tone.SignalBase.prototype.dispose.call(this);
	this._shaper.disconnect();
	this._shaper = null;
	this._curve = null;
	return this;
};

export default Tone.WaveShaper;

