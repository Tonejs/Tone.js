define(["Tone/core/Tone"], function(Tone){

	/**
	 *  buses are another way of routing audio
	 *
	 *  augments Tone.prototype to include send and recieve
	 */

	 /**
	  *  All of the routes
	  *  
	  *  @type {Object}
	  */
	var Buses = {};

	/**
	 *  send signal to a channel name
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
		this.chain(this.output, sendKnob, Buses[channelName]);
		return sendKnob;		
	};

	/**
	 *  recieve the input from the desired channelName to the input gain of 'this' node.
	 *
	 *  @param  {string} channelName 
	 */
	Tone.prototype.receive = function(channelName){
		if (!Buses.hasOwnProperty(channelName)){
			Buses[channelName] = this.context.createGain();	
		}
		Buses[channelName].connect(this.input);
	};

	Tone.Buses = Buses;

	return Buses;
});