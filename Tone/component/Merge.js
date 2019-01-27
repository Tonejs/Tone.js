import Tone from "../core/Tone";
import "../core/AudioNode";

/**
 *  @class  Tone.Merge brings two signals into the left and right
 *          channels of a single stereo channel.
 *
 *  @constructor
 *  @extends {Tone.AudioNode}
 *  @param {number} [channels=2] The number of channels to merge. 
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
Tone.Merge = function(channels){

	//defaults to 2 channels
	channels = Tone.defaultArg(channels, 2);
	
	Tone.AudioNode.call(this);
	this.createInsOuts(channels, 0);

	/**
	 *  the merger node for the two channels
	 *  @type {ChannelMergerNode}
	 *  @private
	 */
	this._merger = this.output = this.context.createChannelMerger(channels);

	//connections
	for (var i = 0; i < channels; i++){
		this.input[i] = new Tone.Gain();
		this.input[i].connect(this._merger, 0, i);
		this.input[i].channelCount = 1;
		this.input[i].channelCountMode = "explicit";
	}

	/**
	 *  The left input channel.
	 *  Alias for <code>input[0]</code>
	 *  @type {GainNode}
	 */
	this.left = this.input[0];

	/**
	 *  The right input channel.
	 *  Alias for <code>input[1]</code>.
	 *  @type {GainNode}
	 */
	this.right = this.input[1];
};

Tone.extend(Tone.Merge, Tone.AudioNode);

/**
 *  Clean up.
 *  @returns {Tone.Merge} this
 */
Tone.Merge.prototype.dispose = function(){
	this.input.forEach(function(input){
		input.dispose();
	});
	Tone.AudioNode.prototype.dispose.call(this);
	this.left = null;
	this.right = null;
	this._merger.disconnect();
	this._merger = null;
	return this;
};

export default Tone.Merge;

