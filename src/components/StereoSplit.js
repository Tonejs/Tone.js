///////////////////////////////////////////////////////////////////////////////
//
//  STEREO Split
//
//	splits left/right, gives leftSend/Return and rightSend/Return
///////////////////////////////////////////////////////////////////////////////


WebAudio.StereoSplit = function(){
	//extends Unit
	WebAudio.Unit.call(this);

	this.merger = WebAudio.createChannelMerger(2);
	this.leftSend = WebAudio.createGain();
	this.leftReturn = WebAudio.createGain();
	this.rightSend = WebAudio.createGain();
	this.rightReturn = WebAudio.createGain();

	//connect it up
	this.input.connect(this.leftSend);
	this.input.connect(this.rightSend);
	this.leftReturn.connect(this.merger, 0, 0);
	this.rightReturn.connect(this.merger, 0, 1);
	this.merger.connect(this.output);
}

WebAudio.extend(WebAudio.StereoSplit, WebAudio.Unit);

WebAudio.StereoSplit.prototype.connectLeft = function(unit){
	this.chain([this.leftSend, unit, this.leftReturn]);
}

WebAudio.StereoSplit.prototype.connectRight = function(unit){
	this.chain([this.rightSend, unit, this.rightReturn]);
}