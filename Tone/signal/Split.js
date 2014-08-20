define(["Tone/core/Tone"], function(Tone){

	/**
	 *	@class  Split the incoming signal into left and right channels
	 *	
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Split = function(){
		
		/**
		 *  the input node
		 *  @type {GainNode}
		 */
		this.input = this.context.createGain();

		/**
		 *  the output nodes
		 *  @type {Array.<GainNode>}
		 */
		this.output = new Array(2);

		/** 
		 *  @type {ChannelSplitterNode}
		 */
		this.splitter = this.context.createChannelSplitter(2);

		/** 
		 *  left channel output
		 *  alais for the first output
		 *  @type {GainNode}
		 */
		this.left = this.output[0] = this.context.createGain();

		/**
		 *  the right channel output
		 *  alais for the second output
		 *  @type {GainNode}
		 */
		this.right = this.output[1] = this.context.createGain();
		
		//connections
		this.input.connect(this.splitter);
		this.splitter.connect(this.left, 0, 0);
		this.splitter.connect(this.right, 1, 0);
	};

	Tone.extend(Tone.Split);

	/**
	 *  dispose method
	 */
	Tone.Split.prototype.dispose = function(){
		this.splitter.disconnect();
		this.input.disconnect();
		this.left.disconnect();
		this.right.disconnect();
		this.left = null;
		this.right = null;
		this.splitter = null;
		this.input = null;
		this.output = null;
	}; 

	return Tone.Split;
});