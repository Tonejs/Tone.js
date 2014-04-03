///////////////////////////////////////////////////////////////////////////////
//
//  METER
//
//	get the rms of the input signal with some averaging
//
//	inspired by https://github.com/cwilso/volume-meter/blob/master/volume-meter.js
//	The MIT License (MIT) Copyright (c) 2014 Chris Wilson
///////////////////////////////////////////////////////////////////////////////

//@param {number=} channels
Tone.Meter = function(channels){
	//extends Unit
	Tone.call(this);

	this.channels = this.defaultArg(channels, 1);
	this.volume = new Array(this.channels);
	this.values = new Array(this.channels);
	//zero out the volume array
	for (var i = 0; i < this.channels; i++){
		this.volume[i] = 0;
		this.values[i] = 0;
	}
	this.clipTime = 0;
	
	//components
	this.jsNode = this.context.createScriptProcessor(this.bufferSize, this.channels, this.channels);
	this.jsNode.onaudioprocess = this.onprocess.bind(this);

	//signal just passes
	this.input.connect(this.output);
	this.input.connect(this.jsNode);
	this.toMaster(this.jsNode);
}

Tone.extend(Tone.Meter, Tone);


//@param {number=} channel
//@returns {number}
Tone.Meter.prototype.getLevel = function(channel){
	channel = this.defaultArg(channel, 0);
	var vol = this.volume[channel];
	if (vol < .00001){
		return 0;
	} else {
		return vol;
	}
}

//@param {number=} channel
//@returns {number}
Tone.Meter.prototype.getValue = function(channel){
	channel = this.defaultArg(channel, 0);
	return this.values[channel];
}

//@param {number=} channel
//@returns {number} the channel volume in decibels
Tone.Meter.prototype.getDb = function(channel){
	return this.gainToDb(this.getLevel(channel));
}

// @returns {boolean} if the audio has clipped in the last 500ms
Tone.Meter.prototype.isClipped = function(){
	return Date.now() - this.clipTime < 500;
}

//get the max value
Tone.Meter.prototype.onprocess = function(event){
	var bufferSize = this.jsNode.bufferSize;
	for (var channel = 0; channel < this.channels; channel++){
		var input = event.inputBuffer.getChannelData(channel);
		var sum = 0;
		var total = 0;
		var x;
		var clipped = false;
		for (var i = 0; i < bufferSize; i++){
			x = input[i];
			if (!clipped && x > .95){
				clipped = true;
				this.clipTime = Date.now();
			}
			total += x;
	    	sum += x * x;
		}
		var average = total / bufferSize;
		var rms = Math.sqrt(sum / bufferSize);
		this.volume[channel] = Math.max(rms, this.volume[channel] * .8);
		this.values[channel] = average;
	}
}