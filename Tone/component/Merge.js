define(["Tone/core/Tone"], function(Tone){

	"use strict";

	/**
	 *  @class  merge a left and a right channel into a single stereo channel
	 *          instead of connecting to the input, connect to either the left, or right input.
	 *          default input for connect is left input.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Merge = function(){

		/**
		 *  the output node
		 *  @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the two input nodes
		 *  @type {Array.<GainNode>}
		 */
		this.input = new Array(2);

		/**
		 *  the left input channel
		 *  alias for input 0
		 *  @type {GainNode}
		 */
		this.left = this.input[0] = this.context.createGain();

		/**
		 *  the right input channel
		 *  alias for input 1
		 *  @type {GainNode}
		 */
		this.right = this.input[1] = this.context.createGain();

		/**
		 *  the merger node for the two channels
		 *  @type {ChannelMergerNode}
		 *  @private
		 */
		this._merger = this.context.createChannelMerger(2);

		//connections
		this.left.connect(this._merger, 0, 0);
		this.right.connect(this._merger, 0, 1);
		this._merger.connect(this.output);
	};

	Tone.extend(Tone.Merge);

	/**
	 *  clean up
	 */
	Tone.Merge.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.left.disconnect();
		this.right.disconnect();
		this._merger.disconnect();
		this.left = null;
		this.right = null;
		this._merger = null;
	}; 

	return Tone.Merge;
});
