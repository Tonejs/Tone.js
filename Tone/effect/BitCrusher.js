define(["Tone/core/Tone", "Tone/effect/Effect"], function(Tone){

	"use strict";

	/**
	 *  @class downsample incoming signal
	 *  inspiration from https://github.com/jaz303/bitcrusher/blob/master/index.js
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {number|Object=} bits   
	 *  @param {number=} frequency 
	 */
	Tone.BitCrusher = function(){

		var options = this.optionsObject(arguments, ["bits", "frequency"], Tone.BitCrusher.defaults);
		Tone.Effect.call(this, options);

		/** 
		 * @private 
		 * @type {number}
		 */
		this._bits = this.defaultArg(options.bits, 8);
		
		/** 
		 * @private 
		 * @type {number}
		 */
		this._frequency = this.defaultArg(options.frequency, 0.5);
		
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
		this.connectEffect(this._crusher);
	};

	Tone.extend(Tone.BitCrusher, Tone.Effect);

	/**
	 *  the default values
	 *  @static
	 *  @type {Object}
	 */
	Tone.BitCrusher.defaults = {
		"bits" : 8,
		"frequency" : 0.5
	};

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
	 *  set all of the parameters with an object
	 *  @param {Object} params 
	 */
	Tone.BitCrusher.prototype.set = function(params){
		if (!this.isUndef(params.frequency)) this.setFrequency(params.frequency);
		if (!this.isUndef(params.bits)) this.setBits(params.bits);
		Tone.Effect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.BitCrusher.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._crusher.disconnect();
		this._crusher = null;
	}; 

	return Tone.BitCrusher;
});