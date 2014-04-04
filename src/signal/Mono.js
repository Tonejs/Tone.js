///////////////////////////////////////////////////////////////////////////////
//
//	MONO
//
//	Sum a stereo channel into a mono channel
///////////////////////////////////////////////////////////////////////////////

Tone.Mono = function(){
	Tone.call(this);

	//components
	this.splitter = this.context.createChannelSplitter();
	
	//connections
	this.input.connect(this.splitter);
	this.splitter.connect(this.output, 0, 0);
	this.splitter.connect(this.output, 1, 0);
}

Tone.extend(Tone.Mono, Tone);
