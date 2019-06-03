import Tone from "../core/Tone";
import "../core/Gain";

/**
 *  buses are another way of routing audio
 *
 *  augments Tone.prototype to include send and receive
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
 *  @param  {String} channelName A named channel to send the signal to.
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
	amount = Tone.defaultArg(amount, 0);
	var sendKnob = new Tone.Gain(amount, Tone.Type.Decibels);
	this.connect(sendKnob);
	sendKnob.connect(Buses[channelName]);
	return sendKnob;
};

/**
 *  Receive the input from the desired channelName to the input
 *
 *  @param  {String} channelName A named channel to send the signal to.
 *  @param  {Number=} channelNumber The channel to connect to
 *  @returns {Tone} this
 *  @example
 * reverbEffect.receive("reverb");
 */
Tone.prototype.receive = function(channelName, inputNum){
	if (!Buses.hasOwnProperty(channelName)){
		Buses[channelName] = this.context.createGain();
	}
	Tone.connect(Buses[channelName], this, 0, inputNum);
	return this;
};

//remove all the send/receives when a new audio context is passed in
Tone.Context.on("init", function(context){
	if (context.buses){
		Buses = context.buses;
	} else {
		Buses = {};
		context.buses = Buses;
	}
});

export default Tone;

