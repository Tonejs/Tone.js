import Tone from "../core/Tone";
import "../effect/Effect";
import "../signal/WaveShaper";

/**
 *  @class Tone.Distortion is a simple distortion effect using Tone.WaveShaper.
 *         Algorithm from [a stackoverflow answer](http://stackoverflow.com/a/22313408).
 *
 *  @extends {Tone.Effect}
 *  @constructor
 *  @param {Number|Object} [distortion] The amount of distortion (nominal range of 0-1)
 *  @example
 * var dist = new Tone.Distortion(0.8).toMaster();
 * var fm = new Tone.SimpleFM().connect(dist);
 * //this sounds good on bass notes
 * fm.triggerAttackRelease("A1", "8n");
 */
Tone.Distortion = function(){

	var options = Tone.defaults(arguments, ["distortion"], Tone.Distortion);
	Tone.Effect.call(this, options);

	/**
	 *  @type {Tone.WaveShaper}
	 *  @private
	 */
	this._shaper = new Tone.WaveShaper(4096);

	/**
	 * holds the distortion amount
	 * @type {number}
	 * @private
	 */
	this._distortion = options.distortion;

	this.connectEffect(this._shaper);
	this.distortion = options.distortion;
	this.oversample = options.oversample;
};

Tone.extend(Tone.Distortion, Tone.Effect);

/**
 *  @static
 *  @const
 *  @type {Object}
 */
Tone.Distortion.defaults = {
	"distortion" : 0.4,
	"oversample" : "none"
};

/**
 * The amount of distortion.
 * @memberOf Tone.Distortion#
 * @type {NormalRange}
 * @name distortion
 */
Object.defineProperty(Tone.Distortion.prototype, "distortion", {
	get : function(){
		return this._distortion;
	},
	set : function(amount){
		this._distortion = amount;
		var k = amount * 100;
		var deg = Math.PI / 180;
		this._shaper.setMap(function(x){
			if (Math.abs(x) < 0.001){
				//should output 0 when input is 0
				return 0;
			} else {
				return (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
			}
		});
	} 
});

/**
 * The oversampling of the effect. Can either be "none", "2x" or "4x".
 * @memberOf Tone.Distortion#
 * @type {string}
 * @name oversample
 */
Object.defineProperty(Tone.Distortion.prototype, "oversample", {
	get : function(){
		return this._shaper.oversample;
	},
	set : function(oversampling){
		this._shaper.oversample = oversampling;
	} 
});

/**
 *  Clean up. 
 *  @returns {Tone.Distortion} this
 */
Tone.Distortion.prototype.dispose = function(){
	Tone.Effect.prototype.dispose.call(this);
	this._shaper.dispose();
	this._shaper = null;
	return this;
};

export default Tone.Distortion;

