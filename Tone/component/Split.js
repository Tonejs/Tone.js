define(["Tone/core/Tone"], function(Tone){

	"use strict";

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
		 *  @private
		 */
		this._splitter = this.context.createChannelSplitter(2);

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
		this.input.connect(this._splitter);
		this._splitter.connect(this.left, 0, 0);
		this._splitter.connect(this.right, 1, 0);
	};

	Tone.extend(Tone.Split);

	/**
	 *  dispose method
	 */
	Tone.Split.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._splitter.disconnect();
		this.left.disconnect();
		this.right.disconnect();
		this.left = null;
		this.right = null;
		this._splitter = null;
	}; 

	return Tone.Split;
});