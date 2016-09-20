define(["Tone/core/Tone", "Tone/core/Gain"], function(Tone){

	"use strict";

	/**
	 *	@class  Tone.Split splits an incoming signal into left and right channels.
	 *	
	 *  @constructor
	 *  @extends {Tone}
	 *  @example
	 * var split = new Tone.Split();
	 * stereoSignal.connect(split);
	 */
	Tone.Split = function(){

		this.createInsOuts(0, 2);

		/** 
		 *  @type {ChannelSplitterNode}
		 *  @private
		 */
		this._splitter = this.input = this.context.createChannelSplitter(2);

		/** 
		 *  Left channel output. 
		 *  Alias for <code>output[0]</code>
		 *  @type {Tone.Gain}
		 */
		this.left = this.output[0] = new Tone.Gain();

		/**
		 *  Right channel output.
		 *  Alias for <code>output[1]</code>
		 *  @type {Tone.Gain}
		 */
		this.right = this.output[1] = new Tone.Gain();
		
		//connections
		this._splitter.connect(this.left, 0, 0);
		this._splitter.connect(this.right, 1, 0);
	};

	Tone.extend(Tone.Split);

	/**
	 *  Clean up. 
	 *  @returns {Tone.Split} this
	 */
	Tone.Split.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._splitter.disconnect();
		this.left.dispose();
		this.left = null;
		this.right.dispose();
		this.right = null;
		this._splitter = null;
		return this;
	}; 

	return Tone.Split;
});