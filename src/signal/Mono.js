///////////////////////////////////////////////////////////////////////////////
//
//	MONO
//
//	Sum a stereo channel into a mono channel
///////////////////////////////////////////////////////////////////////////////

Tone.Mono = function(){
	Tone.call(this);

	//components
	this.merger = this.context.createChannelMerger(2);
	
	//connections
	this.input.connect(this.merger, 0, 0);
	this.input.connect(this.merger, 0, 1);
	this.merger.connect(this.output);
}

Tone.extend(Tone.Mono, Tone);
