/* global mocha*/

import Tone from "Tone/core/Tone";
import chai from "chai";
import Context from "Tone/core/Context";
import Transport from "Tone/core/Transport";
import Buffer from "Tone/core/Buffer";
import babelPolyfill from "@babel/polyfill";

//add a chai test
chai.Assertion.addMethod("percentageFrom", function(val, percent){
	new chai.Assertion(this._obj).to.be.closeTo(val, val * percent);
});

//silence the logging
window.TONE_SILENCE_LOGGING = true;

//testing setup
window.expect = chai.expect;
mocha.setup({
	ui : "bdd",
	// make this very long cause sometimes the travis CI server is slow
	timeout : 30000
});

//point to the relative path of the audio files
if (window.__karma__){
	Buffer.baseUrl = "/base/test/";
} else {
	Buffer.baseUrl = "../test/";
}

beforeEach(function(){
	if (Tone.Transport.bpm.value !== 120){
		Tone.Transport.bpm.value = 120;
	}
	if (Tone.Transport.timeSignature !== 4){
		Tone.Transport.timeSignature = 4;
	}
});

Context.on("init", function(){
	Test.input = Tone.context.createGain();
});

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
			typeof member !== "undefined" &&
			prop !== "preset" &&
			!(member instanceof AudioContext) &&
			!obj.constructor.prototype[prop]){
			if (member !== null){
				throw Error("property was not completely disposed: "+prop);
			}
		}
	}
};

Test.connect = function(node, inputNumber){
	Tone.connect(this.input, node, 0, inputNumber);
	this.input.disconnect();
};

Test.whenBetween = function(value, start, stop, callback){
	if (value >= start && value < stop){
		callback();
	}
};

//invoked only once
Test.atTime = function(when, callback){
	var wasInvoked = false;
	return function(time){
		if (time >= when && !wasInvoked){
			callback(time);
			wasInvoked = true;
		}
	};
};

export default Test;

