///////////////////////////////////////////////////////////////////////////////
//
//  STEREO
//
//	splits the incoming signal into left and right outputs
///////////////////////////////////////////////////////////////////////////////

Tone.Stereo = function(){
	Tone.call(this);

	//components
	this.splitter = this.context.createChannelSplitter();
	this.left = this.context.createGain();
	this.right = this.context.createGain();
	
	//connections
	this.input.connect(this.splitter);
	this.splitter.connect(this.left, 0, 0);
	this.splitter.connect(this.right, 1, 0);
}

Tone.extend(Tone.Stereo);