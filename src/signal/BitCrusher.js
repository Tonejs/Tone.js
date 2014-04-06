///////////////////////////////////////////////////////////////////////////////
//
// 	BIT CRUSHER
//
// 	downsample incoming signal
// 	inspiration from https://github.com/jaz303/bitcrusher/blob/master/index.js
///////////////////////////////////////////////////////////////////////////////

define(["core/Tone"], function(Tone){

	//@param {number=} bits
	//@param {number=} frequency
	//@param {number=} channels
	Tone.BitCrusher = function(bits, frequency, channels){
		Tone.call(this);

		//the math
		this.bits = this.defaultArg(bits, 8);
		this.frequency = this.defaultArg(frequency, .5);
		this.step = 2 * Math.pow(0.5, this.bits);
		this.invStep = 1/this.step;
		this.phasor = 0;
		this.last = 0;
		this.channels = this.defaultArg(channels, 1);
		
		//the node
		this.crusher = this.context.createScriptProcessor(this.bufferSize, this.channels, this.channels);
		this.crusher.onaudioprocess = this.audioprocess.bind(this);

		//connect it up
		this.chain(this.input, this.crusher, this.output);
	}

	Tone.extend(Tone.BitCrusher);

	Tone.BitCrusher.prototype.audioprocess = function(event){
		var bufferSize = this.crusher.bufferSize;
		var phasor = this.phasor;
		var freq = this.frequency;
		var invStep = this.invStep;
		var floor = Math.floor;
		var last = this.last;
		var step = this.step;
		var channel = 0;
		var input = event.inputBuffer.getChannelData(channel);
		var output = event.outputBuffer.getChannelData(channel);
		for (var i = 0, len = output.length; i < len; i++) {
			phasor += freq;
		    if (phasor >= 1) {
		        phasor -= 1;
		        last = step * floor((input[i] * invStep) + 0.5);
		    }
		    output[i] = last;
		}
		/*for (var channel = 0; channel < channels; channel++){
		}*/
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

	return Tone.BitCrusher;
});