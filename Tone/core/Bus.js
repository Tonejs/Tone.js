define(["Tone/core/Tone", "Tone/core/Gain"], function(Tone){

	"use strict";

	/**
	 *  buses are another way of routing audio
	 *
	 *  augments Tone.prototype to include send and recieve
	 */

	 /**
	  *  All of the routes
	  *  
	  *  @type {Object}
	  *  @static
	  *  @private
	  */
	var Buses = {};

	/**
	 *  Send this signal to the channel name. 
	 *  @param  {string} channelName A named channel to send the signal to.
	 *  @param  {Decibels} amount The amount of the source to send to the bus. 
	 *  @return {GainNode} The gain node which connects this node to the desired channel. 
	 *                     Can be used to adjust the levels of the send.
	 *  @example
	 * source.send("reverb", -12);
	 */
	Tone.prototype.send = function(channelName, amount){
		if (!Buses.hasOwnProperty(channelName)){
			Buses[channelName] = this.context.createGain();
		}
		amount = this.defaultArg(amount, 0);
		var sendKnob = new Tone.Gain(amount, Tone.Type.Decibels);
		this.output.chain(sendKnob, Buses[channelName]);
		return sendKnob;		
	};

	/**
	 *  Recieve the input from the desired channelName to the input
	 *
	 *  @param  {string} channelName A named channel to send the signal to.
	 *  @param {AudioNode} [input] If no input is selected, the
	 *                                         input of the current node is
	 *                                         chosen. 
	 *  @returns {Tone} this
	 *  @example
	 * reverbEffect.receive("reverb");
	 */
	Tone.prototype.receive = function(channelName, input){
		if (!Buses.hasOwnProperty(channelName)){
			Buses[channelName] = this.context.createGain();	
		}
		if (this.isUndef(input)){
			input = this.input;
		}
		Buses[channelName].connect(input);
		return this;
	};

	//remove all the send/receives when a new audio context is passed in
	Tone._initAudioContext(function(){
		Buses = {};
	});

	return Tone;
});