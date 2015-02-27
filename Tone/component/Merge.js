define(["Tone/core/Tone"], function(Tone){

	"use strict";

	/**
	 *  @class  Merge a left and a right channel into a single stereo channel.
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @example
	 *  var merge = new Tone.Merge();
	 *  sigLeft.connect(merge.left);
	 *  sigRight.connect(merge.right);
	 */
	Tone.Merge = function(){

		Tone.call(this, 2, 1);

		/**
		 *  The left input channel.
		 *  Alias for input 0
		 *  @type {GainNode}
		 */
		this.left = this.input[0] = this.context.createGain();

		/**
		 *  The right input channel.
		 *  Alias for input 1.
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
	 *  @returns {Tone.Merge} `this`
	 */
	Tone.Merge.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.left.disconnect();
		this.right.disconnect();
		this._merger.disconnect();
		this.left = null;
		this.right = null;
		this._merger = null;
		return this;
	}; 

	return Tone.Merge;
});
