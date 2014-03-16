///////////////////////////////////////////////////////////////////////////////
//
//  STEREO Split
//
//	splits left/right, gives leftSend/Return and rightSend/Return
///////////////////////////////////////////////////////////////////////////////


Tone.StereoSplit = function(){
	//extends Unit
	Tone.call(this);

	this.merger = this.context.createChannelMerger(2);
	this.leftSend = this.context.createGain();
	this.leftReturn = this.context.createGain();
	this.rightSend = this.context.createGain();
	this.rightReturn = this.context.createGain();

	//connect it up
	this.input.connect(this.leftSend);
	this.input.connect(this.rightSend);
	this.leftReturn.connect(this.merger, 0, 0);
	this.rightReturn.connect(this.merger, 0, 1);
	this.merger.connect(this.output);
}

Tone.extend(Tone.StereoSplit, Tone);

Tone.StereoSplit.prototype.connectLeft = function(unit){
	this.chain(this.leftSend, unit, this.leftReturn);
}

Tone.StereoSplit.prototype.connectRight = function(unit){
	this.chain(this.rightSend, unit, this.rightReturn);
}