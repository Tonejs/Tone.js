define(["Tone/core/Tone"], function(Tone){

	/**
	 *	split the incoming signal into left and right channels
	 *
	 *  the left channel is the default output
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Split = function(){
		Tone.call(this);

		/** @type {ChannelSplitterNode} */
		this.splitter = this.context.createChannelSplitter(2);
		/** 
		 *  left channel output
		 *  @alias for the default output
		 *  @type {GainNode}
		 */
		this.left = this.output;
		/**
		 *  the right channel output
		 *  @type {GainNode}
		 */
		this.right = this.context.createGain();
		
		//connections
		this.input.connect(this.splitter);
		this.splitter.connect(this.left, 0, 0);
		this.splitter.connect(this.right, 1, 0);
	};

	Tone.extend(Tone.Split);

	return Tone.Split;
});