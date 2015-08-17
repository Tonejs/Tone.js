/* global mocha, chai*/

define(["Tone/core/Tone"], function (Tone) {

	//testing setup
	window.expect = chai.expect;
	mocha.setup("bdd");


	/**
	 *  The Test object
	 */
	var Test = {
		input : Tone.context.createGain()
	};

	Test.run = function(){
		mocha.run(); 
	};

	Test.wasDisposed = function(obj){
		for (var prop in obj){
			var member = obj[prop];
			if (typeof member !== "function" && 
				typeof member !== "string" && 
				typeof member !== "number" &&
				typeof member !== "boolean" &&
				prop !== "preset" && 
				!(member instanceof AudioContext)){
				if (member !== null){
					throw Error("property was not completely disposed: "+prop);
				}
			}
		}
	};

	Test.connect = function(node, inputNumber){
		this.input.connect(node, 0, inputNumber);
		this.input.disconnect();
	};

	return Test;
});