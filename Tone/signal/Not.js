define(["Tone/core/Tone", "Tone/signal/EqualZero"], function(Tone){

	"use strict";

	/**
	 *  @class  Just an alias for EqualZero. but has the same effect as a NOT operator. 
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Not = Tone.EqualZero;

	return Tone.Not;
});