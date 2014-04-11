///////////////////////////////////////////////////////////////////////////////
//
//  SPLIT
//
//	splits the incoming signal into left and right outputs
//	 one input two outputs
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone"], function(Tone){

	Tone.Split = function(){
		Tone.call(this);

		//components
		this.splitter = this.context.createChannelSplitter(2);
		this.left = this.context.createGain();
		this.right = this.context.createGain();
		
		//connections
		this.input.connect(this.splitter);
		this.splitter.connect(this.left, 1, 0);
		this.splitter.connect(this.right, 0, 0);
	}

	Tone.extend(Tone.Split);

	return Tone.Split;
});