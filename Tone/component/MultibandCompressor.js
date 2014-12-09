define(["Tone/core/Tone", "Tone/component/MultibandSplit", "Tone/component/Compressor"], function(Tone){

	"use strict";

	/**
	 *  @class A compressor with seperate controls over low/mid/high dynamics
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {Object} options the low/mid/high compressor settings in a single object
	 */
	Tone.MultibandCompressor = function(options){

		options = this.defaultArg(arguments, Tone.MultibandCompressor.defaults);

		/**
		 *  split the incoming signal into high/mid/low
		 *  @type {Tone.MultibandSplit}
		 *  @private
		 */
		this._splitter = new Tone.MultibandSplit({
			"lowFrequency" : options.lowFrequency,
			"highFrequency" : options.highFrequency
		});

		/**
		 *  low/mid crossover frequency
		 *  @type {Tone.Signal}
		 */
		this.lowFrequency = this._splitter.lowFrequency;

		/**
		 *  mid/high crossover frequency
		 *  @type {Tone.Signal}
		 */
		this.highFrequency = this._splitter.highFrequency;

		/**
		 *  the input
		 */
		this.input = this._splitter;

		/**
		 *  the output
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the low compressor
		 *  @type {Tone.Compressor}
		 */
		this.low = new Tone.Compressor(options.low);

		/**
		 *  the mid compressor
		 *  @type {Tone.Compressor}
		 */
		this.mid = new Tone.Compressor(options.mid);

		/**
		 *  the high compressor
		 *  @type {Tone.Compressor}
		 */
		this.high = new Tone.Compressor(options.high);

		//connect the compressor
		this._splitter.low.chain(this.low, this.output);
		this._splitter.mid.chain(this.mid, this.output);
		this._splitter.high.chain(this.high, this.output);
	};

	Tone.extend(Tone.MultibandCompressor);

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
	 */
	Tone.MultibandCompressor.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._splitter.dispose();
		this.low.dispose();
		this.mid.dispose();
		this.high.dispose();
		this._splitter = null;
		this.low = null;
		this.mid = null;
		this.high = null;
		this.lowFrequency = null;
		this.highFrequency = null;
	};

	return Tone.MultibandCompressor;
});