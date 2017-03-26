/* global mocha*/

define(["Tone/core/Tone", "deps/chai", "Tone/core/Context"], function (Tone, chai, Context) {

	//add a chai test
	chai.Assertion.addMethod("percentageFrom", function(val, percent){
		new chai.Assertion(this._obj).to.be.closeTo(val, val * percent);
	});

	//testing setup
	window.expect = chai.expect;
	mocha.setup({
		ui: "bdd",
		// make this very long cause sometimes the travis CI server is slow
		timeout : 5000
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
		this.input.connect(node, 0, inputNumber);
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

	return Test;
});