define(["Tone/core/Tone"], function(Tone){

	"use strict";

	/**
	 *  @class  Base class for all Signals
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.SignalBase = function(){

	};

	Tone.extend(Tone.SignalBase);

	/**
	 *  Signals can connect to other Signals
	 *
	 *  @override
	 *  @param {AudioParam|AudioNode|Tone.Signal|Tone} node 
	 *  @param {number=} outputNumber 
	 *  @param {number=} inputNumber 
	 */
	Tone.SignalBase.prototype.connect = function(node, outputNumber, inputNumber){
		//zero it out so that the signal can have full control
		if (node instanceof Tone.Signal){
			node.setValue(0);
		} else if (node instanceof AudioParam){
			node.value = 0;
		} 
		Tone.prototype.connect.call(this, node, outputNumber, inputNumber);
	};

	/**
	 *  internal dispose method to tear down the node
	 */
	Tone.SignalBase.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
	};

	return Tone.SignalBase;
});