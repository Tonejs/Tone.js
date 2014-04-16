///////////////////////////////////////////////////////////////////////////////
//
//	BUS
//
//	buses are another way of routing audio
//
//	adds: 	send(channelName, amount)
//			receive(channelName) 
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone"], function(Tone){

	var Buses = {}

	//@param {string} channelName
	//@param {number=} amount
	//@returns {GainNode} the send
	Tone.prototype.send = function(channelName, amount){
		if (!Buses.hasOwnProperty(channelName)){
			Buses[channelName] = this.context.createGain();
		}
		var sendKnob = this.context.createGain();
		sendKnob.gain.value = this.defaultArg(amount, 1);
		this.chain(this.output, sendKnob, Buses[channelName]);
		return sendKnob;		
	}

	//@param {string} channelName
	Tone.prototype.receive = function(channelName){
		if (!Buses.hasOwnProperty(channelName)){
			Buses[channelName] = this.context.createGain();	
		}
		Buses[channelName].connect(this.input);
	}

	Tone.Buses = Buses;

	return Tone.Buses;
});