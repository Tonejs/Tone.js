import Tone from "../core/Tone";
import "../component/MultibandSplit";
import "../component/Compressor";
import "../core/AudioNode";

/**
 *  @class A compressor with seperate controls over low/mid/high dynamics
 *
 *  @extends {Tone.AudioNode}
 *  @constructor
 *  @param {Object} options The low/mid/high compressor settings.
 *  @example
 *  var multiband = new Tone.MultibandCompressor({
 *  	"lowFrequency" : 200,
 *  	"highFrequency" : 1300
 *  	"low" : {
 *  		"threshold" : -12
 *  	}
 *  })
 */
Tone.MultibandCompressor = function(options){

	Tone.AudioNode.call(this);
	options = Tone.defaultArg(arguments, Tone.MultibandCompressor.defaults);

	/**
	 *  split the incoming signal into high/mid/low
	 *  @type {Tone.MultibandSplit}
	 *  @private
	 */
	this._splitter = this.input = new Tone.MultibandSplit({
		"lowFrequency" : options.lowFrequency,
		"highFrequency" : options.highFrequency
	});

	/**
	 *  low/mid crossover frequency.
	 *  @type {Frequency}
	 *  @signal
	 */
	this.lowFrequency = this._splitter.lowFrequency;

	/**
	 *  mid/high crossover frequency.
	 *  @type {Frequency}
	 *  @signal
	 */
	this.highFrequency = this._splitter.highFrequency;

	/**
	 *  the output
	 *  @type {Tone.Gain}
	 *  @private
	 */
	this.output = new Tone.Gain();

	/**
	 *  The compressor applied to the low frequencies.
	 *  @type {Tone.Compressor}
	 */
	this.low = new Tone.Compressor(options.low);

	/**
	 *  The compressor applied to the mid frequencies.
	 *  @type {Tone.Compressor}
	 */
	this.mid = new Tone.Compressor(options.mid);

	/**
	 *  The compressor applied to the high frequencies.
	 *  @type {Tone.Compressor}
	 */
	this.high = new Tone.Compressor(options.high);

	//connect the compressor
	this._splitter.low.chain(this.low, this.output);
	this._splitter.mid.chain(this.mid, this.output);
	this._splitter.high.chain(this.high, this.output);

	this._readOnly(["high", "mid", "low", "highFrequency", "lowFrequency"]);
};

Tone.extend(Tone.MultibandCompressor, Tone.AudioNode);

/**
 *  @const
 *  @static
 *  @type {Object}
 */
Tone.MultibandCompressor.defaults = {
	"low" : Tone.Compressor.defaults,
	"mid" : Tone.Compressor.defaults,
	"high" : Tone.Compressor.defaults,
	"lowFrequency" : 250,
	"highFrequency" : 2000
};

/**
 *  clean up
 *  @returns {Tone.MultibandCompressor} this
 */
Tone.MultibandCompressor.prototype.dispose = function(){
	Tone.AudioNode.prototype.dispose.call(this);
	this._splitter.dispose();
	this._writable(["high", "mid", "low", "highFrequency", "lowFrequency"]);
	this.low.dispose();
	this.mid.dispose();
	this.high.dispose();
	this._splitter = null;
	this.low = null;
	this.mid = null;
	this.high = null;
	this.lowFrequency = null;
	this.highFrequency = null;
	return this;
};

export default Tone.MultibandCompressor;

