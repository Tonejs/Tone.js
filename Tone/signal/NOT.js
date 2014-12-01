define(["Tone/core/Tone", "Tone/signal/EqualZero"], function(Tone){

	"use strict";

	/**
	 *  @class  Just an alias for EqualZero. but has the same effect as a NOT operator. 
	 *          Outputs 1 when input equals 0. 
	 *  
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 */
	Tone.NOT = Tone.EqualZero;

	return Tone.NOT;
});