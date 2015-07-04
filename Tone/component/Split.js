define(["Tone/core/Tone"], function(Tone){

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

		Tone.call(this, 0, 2);

		/** 
		 *  @type {ChannelSplitterNode}
		 *  @private
		 */
		this._splitter = this.input = this.context.createChannelSplitter(2);

		/** 
		 *  Left channel output. 
		 *  Alias for <code>output[0]</code>
		 *  @type {GainNode}
		 */
		this.left = this.output[0] = this.context.createGain();

		/**
		 *  Right channel output.
		 *  Alias for <code>output[1]</code>
		 *  @type {GainNode}
		 */
		this.right = this.output[1] = this.context.createGain();
		
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
		this.left.disconnect();
		this.right.disconnect();
		this.left = null;
		this.right = null;
		this._splitter = null;
		return this;
	}; 

	return Tone.Split;
});