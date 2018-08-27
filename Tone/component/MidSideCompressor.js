define(["../core/Tone", "../component/MidSideSplit", "../component/MidSideMerge",
	"../component/Compressor", "../core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.MidSideCompressor applies two different compressors to the mid
	 *         and side signal components. See Tone.MidSideSplit.
	 *
	 *  @extends {Tone.AudioNode}
	 *  @param {Object} options The options that are passed to the mid and side
	 *                          compressors.
	 *  @constructor
	 */
	Tone.MidSideCompressor = function(options){

		Tone.AudioNode.call(this);
		options = Tone.defaultArg(options, Tone.MidSideCompressor.defaults);

		/**
		 *  the mid/side split
		 *  @type  {Tone.MidSideSplit}
		 *  @private
		 */
		this._midSideSplit = this.input = new Tone.MidSideSplit();

		/**
		 *  the mid/side recombination
		 *  @type  {Tone.MidSideMerge}
		 *  @private
		 */
		this._midSideMerge = this.output = new Tone.MidSideMerge();

		/**
		 *  The compressor applied to the mid signal
		 *  @type  {Tone.Compressor}
		 */
		this.mid = new Tone.Compressor(options.mid);

		/**
		 *  The compressor applied to the side signal
		 *  @type  {Tone.Compressor}
		 */
		this.side = new Tone.Compressor(options.side);

		this._midSideSplit.mid.chain(this.mid, this._midSideMerge.mid);
		this._midSideSplit.side.chain(this.side, this._midSideMerge.side);
		this._readOnly(["mid", "side"]);
	};

	Tone.extend(Tone.MidSideCompressor, Tone.AudioNode);

	/**
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.MidSideCompressor.defaults = {
		"mid" : {
			"ratio" : 3,
			"threshold" : -24,
			"release" : 0.03,
			"attack" : 0.02,
			"knee" : 16
		},
		"side" : {
			"ratio" : 6,
			"threshold" : -30,
			"release" : 0.25,
			"attack" : 0.03,
			"knee" : 10
		}
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.MidSideCompressor} this
	 */
	Tone.MidSideCompressor.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this._writable(["mid", "side"]);
		this.mid.dispose();
		this.mid = null;
		this.side.dispose();
		this.side = null;
		this._midSideSplit.dispose();
		this._midSideSplit = null;
		this._midSideMerge.dispose();
		this._midSideMerge = null;
		return this;
	};

	return Tone.MidSideCompressor;
});
