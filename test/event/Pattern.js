import Basic from "helper/Basic";
import Pattern from "Tone/event/Pattern";
import Tone from "Tone/core/Tone";
import Transport from "Tone/core/Transport";
import Offline from "helper/Offline";
import Time from "Tone/type/Time";

describe("Pattern", function(){

	Basic(Pattern);

	context("Constructor", function(){

		it("takes a callback, an array of values and a pattern name", function(){
			return Offline(function(){
				var callback = function(){};
				var pattern = new Pattern(callback, [0, 1, 2, 3], "down");
				expect(pattern.callback).to.equal(callback);
				expect(pattern.values).to.deep.equal([0, 1, 2, 3]);
				expect(pattern.pattern).to.equal("down");
				pattern.dispose();
			});
		});

		it("can be constructed with no arguments", function(){
			return Offline(function(){
				var pattern = new Pattern();
				pattern.dispose();
			});
		});

		it("can pass in arguments in options object", function(){
			return Offline(function(){
				var callback = function(){};
				var pattern = new Pattern({
					"callback" : callback,
					"iterations" : 4,
					"probability" : 0.3,
					"interval" : "8t",
					"values" : [1, 2, 3],
					"pattern" : "upDown"
				});
				expect(pattern.callback).to.equal(callback);
				expect(pattern.interval.valueOf()).to.equal(Time("8t").valueOf());
				expect(pattern.iterations).to.equal(4);
				expect(pattern.values).to.deep.equal([1, 2, 3]);
				expect(pattern.probability).to.equal(0.3);
				expect(pattern.pattern).to.equal("upDown");
				pattern.dispose();
			});
		});
	});

	context("Get/Set", function(){

		it("can set values with object", function(){
			return Offline(function(){
				var callback = function(){};
				var pattern = new Pattern();
				pattern.set({
					"callback" : callback,
					"values" : ["a", "b", "c"],
					"index" : 2
				});
				expect(pattern.callback).to.equal(callback);
				expect(pattern.values).to.deep.equal(["a", "b", "c"]);
				expect(pattern.index).to.equal(2);
				pattern.dispose();
			});
		});

		it("can set get a the values as an object", function(){
			return Offline(function(){
				var callback = function(){};
				var pattern = new Pattern({
					"callback" : callback,
					"pattern" : "random",
					"probability" : 0.3,
				});
				var values = pattern.get();
				expect(values.pattern).to.equal("random");
				values.pattern = "upDown";
				expect(values.pattern).to.equal("upDown");
				expect(values.probability).to.equal(0.3);
				pattern.dispose();
			});
		});
	});

	context("Callback", function(){

		it("is invoked after it's started", function(){
			var invoked = false;
			return Offline(function(Transport){
				var index = 0;
				var pattern = new Pattern(function(){
					invoked = true;
					expect(pattern.value).to.equal(index);
					index++;
				}, [0, 1, 2]).start(0);
				Transport.start();
			}, 0.2).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("passes in the scheduled time and pattern index to the callback", function(){
			var invoked = false;
			return Offline(function(Transport){
				var startTime = 0.05;
				var pattern = new Pattern(function(time, note){
					expect(time).to.be.a.number;
					expect(time - startTime).to.be.closeTo(0.3, 0.01);
					expect(note).to.be.equal("a");
					invoked = true;
				}, ["a"], "up");
				Transport.start(startTime);
				pattern.start(0.3);
			}, 0.4).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("passes in the next note of the pattern", function(){
			var counter = 0;
			return Offline(function(Transport){
				var pattern = new Pattern(function(time, note){
					expect(note).to.equal(counter % 3);
					counter++;
				}, [0, 1, 2], "up").start(0);
				pattern.interval = "16n";
				Transport.start(0);
			}, 0.7).then(function(){
				expect(counter).to.equal(6);
			});
		});
	});

});

