define(["Tone/core/Tone"], function(Tone){

	/**
	 *  @class downsample incoming signal
	 *  inspiration from https://github.com/jaz303/bitcrusher/blob/master/index.js
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} bits   
	 *  @param {number=} frequency 
	 */
	Tone.BitCrusher = function(bits, frequency){

		Tone.call(this);

		/** 
		 * @private 
		 * @type {number}
		 */
		this._bits = this.defaultArg(bits, 8);
		
		/** 
		 * @private 
		 * @type {number}
		 */
		this._frequency = this.defaultArg(frequency, 0.5);
		
		/** 
		 * @private 
		 * @type {number}
		 */
		this._step = 2 * Math.pow(0.5, this._bits);
		
		/** 
		 * @private 
		 * @type {number}
		 */
		this._invStep = 1/this._step;
		
		/** 
		 * @private 
		 * @type {number}
		 */
		this._phasor = 0;
		
		/** 
		 * @private 
		 * @type {number}
		 */
		this._last = 0;
		
		/** 
		 * @private 
		 * @type {ScriptProcessorNode}
		 */
		this._crusher = this.context.createScriptProcessor(this.bufferSize, 1, 1);
		this._crusher.onaudioprocess = this._audioprocess.bind(this);

		//connect it up
		this.chain(this.input, this._crusher, this.output);
	};

	Tone.extend(Tone.BitCrusher);

	/**
	 *  @private
	 *  @param  {AudioProcessingEvent} event
	 */
	Tone.BitCrusher.prototype._audioprocess = function(event){
		//cache the values used in the loop
		var phasor = this._phasor;
		var freq = this._frequency;
		var invStep = this._invStep;
		var last = this._last;
		var step = this._step;
		var input = event.inputBuffer.getChannelData(0);
		var output = event.outputBuffer.getChannelData(0);
		for (var i = 0, len = output.length; i < len; i++) {
			phasor += freq;
		    if (phasor >= 1) {
		        phasor -= 1;
		        last = step * ((input[i] * invStep) | 0 + 0.5);
		    }
		    output[i] = last;
		}
		//set the values for the next loop
		this._phasor = phasor;
		this._last = last;
	};

	/**
	 *  set the bit rate
	 *  
	 *  @param {number} bits 
	 */
	Tone.BitCrusher.prototype.setBits = function(bits){
		this._bits = bits;
		this._step = 2 * Math.pow(0.5, this._bits);
		this._invStep = 1/this._step;
	};

	/**
	 *  set the frequency
	 *  @param {number} freq 
	 */
	Tone.BitCrusher.prototype.setFrequency = function(freq){
		this._frequency = freq;
	};

	/**
	 *  clean up
	 */
	Tone.BitCrusher.prototype.dispose = function(){
		this.input.disconnect();
		this.output.disconnect();
		this._crusher.disconnect();
		this.input = null;
		this.output = null;
		this._crusher = null;
	}; 

	return Tone.BitCrusher;
});