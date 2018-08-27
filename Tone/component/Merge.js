define(["../core/Tone", "../core/AudioNode"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Merge brings two signals into the left and right
	 *          channels of a single stereo channel.
	 *
	 *  @constructor
	 *  @extends {Tone.AudioNode}
	 *  @example
	 * var merge = new Tone.Merge().toMaster();
	 * //routing a sine tone in the left channel
	 * //and noise in the right channel
	 * var osc = new Tone.Oscillator().connect(merge.left);
	 * var noise = new Tone.Noise().connect(merge.right);
	 * //starting our oscillators
	 * noise.start();
	 * osc.start();
	 */
	Tone.Merge = function(){

		Tone.AudioNode.call(this);
		this.createInsOuts(2, 0);

		/**
		 *  The left input channel.
		 *  Alias for <code>input[0]</code>
		 *  @type {GainNode}
		 */
		this.left = this.input[0] = new Tone.Gain();

		/**
		 *  The right input channel.
		 *  Alias for <code>input[1]</code>.
		 *  @type {GainNode}
		 */
		this.right = this.input[1] = new Tone.Gain();

		/**
		 *  the merger node for the two channels
		 *  @type {ChannelMergerNode}
		 *  @private
		 */
		this._merger = this.output = this.context.createChannelMerger(2);

		//connections
		this.left.connect(this._merger, 0, 0);
		this.right.connect(this._merger, 0, 1);

		this.left.channelCount = 1;
		this.right.channelCount = 1;
		this.left.channelCountMode = "explicit";
		this.right.channelCountMode = "explicit";
	};

	Tone.extend(Tone.Merge, Tone.AudioNode);

	/**
	 *  Clean up.
	 *  @returns {Tone.Merge} this
	 */
	Tone.Merge.prototype.dispose = function(){
		Tone.AudioNode.prototype.dispose.call(this);
		this.left.dispose();
		this.left = null;
		this.right.dispose();
		this.right = null;
		this._merger.disconnect();
		this._merger = null;
		return this;
	};

	return Tone.Merge;
});
