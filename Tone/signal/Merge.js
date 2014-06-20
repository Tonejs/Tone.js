define(["Tone/core/Tone"], function(Tone){

	/**
	 *  merge a left and a right channel into a single stereo channel
	 *
	 *  instead of connecting to the input, connect to either the left, or right input
	 *
	 *  default input for connect is left input
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Merge = function(){

		Tone.call(this);

		/**
		 *  the left input channel
		 *  also an alias for the input
		 *  @type {GainNode}
		 */
		this.left = this.input;
		/**
		 *  the right input channel
		 *  @type {GainNode}
		 */
		this.right = this.context.createGain();
		/**
		 *  the merger node for the two channels
		 *  @type {ChannelMergerNode}
		 */
		this.merger = this.context.createChannelMerger(2);

		//connections
		this.left.connect(this.merger, 0, 0);
		this.right.connect(this.merger, 0, 1);
		this.merger.connect(this.output);
	};

	Tone.extend(Tone.Merge);

	/**
	 *  clean up
	 */
	Tone.Merge.prototype.dispose = function(){
		this.input.disconnect();
		this.right.disconnect();
		this.merger.disconnect();
		this.input = null;
		this.right = null;
		this.merger = null;
	}; 

	return Tone.Merge;
});
