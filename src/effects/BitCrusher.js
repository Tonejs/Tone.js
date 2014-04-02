///////////////////////////////////////////////////////////////////////////////
//
// 	BIT CRUSHER
//
// 	downsample incoming signal
// 	some inspiration from https://github.com/jaz303/bitcrusher/blob/master/index.js
///////////////////////////////////////////////////////////////////////////////

//@param {number=} bits
//@param {number=} frequency
Tone.BitCrusher = function(bits, frequency){
	Tone.Effect.call(this);

	//the node
	this.crusher = this.context.createScriptProcessor(this.bufferSize, 1, 1);
	this.crusher.onaudioprocess = this.audioprocess.bind(this);

	//the math
	this.bits = this.defaultArg(bits, 8);
	this.frequency = this.defaultArg(frequency, .5);
	this.step = 2 * Math.pow(0.5, this.bits);
	this.invStep = 1/this.step;
	this.phasor = 0;
	this.last = 0;

	//connect it up
	this.chain(this.effectSend, this.crusher, this.effectReturn);
}

Tone.extend(Tone.BitCrusher, Tone.Effect);

Tone.BitCrusher.prototype.audioprocess = function(event){
	var bufferSize = this.crusher.bufferSize;
	var phasor = this.phasor;
	var freq = this.frequency;
	var invStep = this.invStep;
	var floor = Math.floor;
	var last = this.last;
	var step = this.step;
	var input = event.inputBuffer.getChannelData(0);
	var output = event.outputBuffer.getChannelData(0);
	for (var i = 0, len = output.length; i < len; i++) {
		phasor += freq;
	    if (phasor >= 1) {
	        phasor -= 1;
	        last = step * floor((input[i] * invStep) + 0.5);
	    }
	    output[i] = last;
	}
	this.phasor = phasor;
	this.last = last;
}

Tone.BitCrusher.prototype.setBits = function(bits){
	this.bits = bits;
	this.step = 2 * Math.pow(0.5, this.bits);
	this.invStep = 1/this.step;
}

Tone.BitCrusher.prototype.setFrequency = function(freq){
	this.frequency = freq;
}