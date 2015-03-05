define(["Tone/core/Tone"], function(Tone){

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
	 *  send signal to a channel name
	 *  defined in "Tone/core/Bus"
	 *
	 *  @param  {string} channelName 
	 *  @param  {number} amount      
	 *  @return {GainNode}             
	 */
	Tone.prototype.send = function(channelName, amount){
		if (!Buses.hasOwnProperty(channelName)){
			Buses[channelName] = this.context.createGain();
		}
		var sendKnob = this.context.createGain();
		sendKnob.gain.value = this.defaultArg(amount, 1);
		this.output.chain(sendKnob, Buses[channelName]);
		return sendKnob;		
	};

	/**
	 *  recieve the input from the desired channelName to the input
	 *  defined in "Tone/core/Bus"
	 *
	 *  @param  {string} channelName 
	 *  @param {AudioNode} [input=this.input] if no input is selected, the
	 *                                         input of the current node is
	 *                                         chosen. 
	 *  @returns {Tone} `this`
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

	return Tone;
});