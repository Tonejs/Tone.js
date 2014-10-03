define(["Tone/core/Tone", "Tone/signal/GreaterThanZero"], function(Tone){

	"use strict";

	/**
	 *  @class OR the inputs together. True if at least one of the inputs is true. 
	 *         Simply an alias for Tone.GreaterThanZero
	 *
	 *  @extends {Tone}
	 *  @constructor
	 */
	Tone.OR = Tone.GreaterThanZero;

	return Tone.OR;
});