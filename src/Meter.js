///////////////////////////////////////////////////////////////////////////////
//
//  METER
//
//	get the rms of the input signal with some averaging
///////////////////////////////////////////////////////////////////////////////

WebAudio.Meter = function(){
	//extends Unit
	WebAudio.Unit.call(this);

	this.jsNode = WebAudio.createScriptProcessor(WebAudio.bufferSize, 1, 1);
	this.jsNode.onaudioprocess = this.onprocess.bind(this);

	this.volume = 0;

	//signal just passes
	this.input.connect(this.output);
	this.input.connect(this.jsNode);
	this.jsNode.connect(WebAudio.output);
}

WebAudio.extend(WebAudio.Meter, WebAudio.Unit);


WebAudio.Meter.prototype.getVolume = function(){
	if (this.volume < .001){
		return 0;
	} else {
		return this.volume;
	}
}

WebAudio.Meter.prototype.getDb = function(){
	var db = WebAudio.gainToDb(this.volume);
	if (db < -100){
		return -Infinity;
	} else {
		return db;
	}
}

//get the max value
WebAudio.Meter.prototype.onprocess = function(event){
	var input = event.inputBuffer.getChannelData(0);
	var bufferSize = WebAudio.bufferSize;
	var sum = 0;
	var x;
	for (var i = 0; i < bufferSize; i++){
		x = input[i];
    	sum += x * x;
	}
	var rms = Math.sqrt(sum / bufferSize);
	this.volume = Math.max(rms, this.volume * .8);
}