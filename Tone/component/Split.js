import Tone from "../core/Tone";
import "../core/Gain";
import "../core/AudioNode";

/**
 *	@class  Tone.Split splits an incoming signal into left and right channels.
 *
 *  @constructor
 *  @extends {Tone.AudioNode}
 *  @param {number} [channels=2] The number of channels to merge.
 *  @example
 * var split = new Tone.Split();
 * stereoSignal.connect(split);
 */
Tone.Split = function(channels){

	//defaults to 2 channels
	channels = Tone.defaultArg(channels, 2);

	Tone.AudioNode.call(this);
	this.createInsOuts(0, channels);

	/**
	 *  @type {ChannelSplitterNode}
	 *  @private
	 */
	this._splitter = this.input = this.context.createChannelSplitter(channels);

	//connections
	for (var i = 0; i < channels; i++){
		this.output[i] = new Tone.Gain();
		Tone.connect(this._splitter, this.output[i], i, 0);
		this.output[i].channelCount = 1;
		this.output[i].channelCountMode = "explicit";
	}

	/**
	 *  Left channel output.
	 *  Alias for <code>output[0]</code>
	 *  @type {Tone.Gain}
	 */
	this.left = this.output[0];

	/**
	 *  Right channel output.
	 *  Alias for <code>output[1]</code>
	 *  @type {Tone.Gain}
	 */
	this.right = this.output[1];
};

Tone.extend(Tone.Split, Tone.AudioNode);

/**
 *  Clean up.
 *  @returns {Tone.Split} this
 */
Tone.Split.prototype.dispose = function(){
	this.output.forEach(function(output){
		output.dispose();
	});
	Tone.AudioNode.prototype.dispose.call(this);
	this._splitter.disconnect();
	this.left = null;
	this.right = null;
	this._splitter = null;
	return this;
};

export default Tone.Split;

