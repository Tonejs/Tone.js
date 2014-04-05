///////////////////////////////////////////////////////////////////////////////
//
//	MONO
//
//	Merge a left and a right into a single left/right channel
///////////////////////////////////////////////////////////////////////////////

define(["core/Tone"], function(Tone){

	Tone.Merge = function(){
		Tone.call(this);

		//components
		this.left = this.context.createGain();
		this.right = this.context.createGain();
		this.merger = this.context.createChannelMerger(2);

		//connections
		this.left.connect(this.merger, 0, 0);
		this.right.connect(this.merger, 0, 1);
		this.merger.connect(this.output);
	}

	Tone.extend(Tone.Merge);

	return Tone.Merge;
})
