import BasicTests from "helper/Basic";
import OscillatorNode from "Tone/source/OscillatorNode";
import Offline from "helper/Offline";
import Frequency from "Tone/type/Frequency";
import Test from "helper/Test";
import Meter from "helper/Meter";
import Supports from "helper/Supports";
import CompareToFile from "helper/CompareToFile";

describe("OscillatorNode", function(){

	BasicTests(OscillatorNode);

	it("matches a file", function(){
		return CompareToFile(function(){
			var osc = new OscillatorNode().toMaster();
			osc.start(0.5);
		}, "oscillatorNode.wav");
	});

	context("Constructor", function(){

		it("can be constructed with a frequency and type", function(){
			var osc0 = new OscillatorNode(330, "square");
			expect(osc0.frequency.value).to.equal(330);
			osc0.dispose();
			var osc1 = new OscillatorNode(Frequency(550), "sawtooth");
			expect(osc1.frequency.value).to.equal(550);
			osc1.dispose();
			var osc2 = new OscillatorNode("A3", "triangle");
			expect(osc2.frequency.value).to.equal(220);
			osc2.dispose();
		});

		it("can be constructed with no arguments", function(){
			var osc = new OscillatorNode();
			expect(osc.frequency.value).to.equal(440);
			expect(osc.detune.value).to.equal(0);
			expect(osc.type).to.equal("sine");
			osc.dispose();
		});

		it("can be constructed with an options object", function(){
			var osc = new OscillatorNode({
				type : "square",
				detune : -20,
				frequency : 123
			});
			expect(osc.frequency.value).to.equal(123);
			expect(osc.detune.value).to.equal(-20);
			expect(osc.type).to.equal("square");
			osc.dispose();
		});

	});

	context("Type", function(){

		it("can get and set the type", function(){
			var osc = new OscillatorNode();
			osc.type = "triangle";
			expect(osc.type).to.equal("triangle");
			osc.dispose();
		});

		it("can set a periodic wave", function(){
			var osc = new OscillatorNode();
			var periodicWave = osc.context.createPeriodicWave(Float32Array.from([1, 0]), Float32Array.from([1, 0]));
			osc.setPeriodicWave(periodicWave);
			expect(osc.type).to.equal("custom");
			osc.dispose();
		});

	});

	context("onended", function(){

		if (Supports.ONLINE_TESTING){

			it("invokes the onended callback in the online context", function(done){
				var osc = new OscillatorNode();
				osc.start();
				osc.stop("+0.3");
				var now = osc.now();
				osc.onended = function(){
					expect(osc.now() - now).to.be.within(0.25, 0.5);
					osc.dispose();
					done();
				};
			});

			it("invokes the onended callback only once in the online context", function(done){
				var osc = new OscillatorNode();
				osc.start();
				osc.stop("+0.1");
				osc.stop("+0.2");
				osc.stop("+0.3");
				var now = osc.now();
				osc.onended = function(){
					expect(osc.now() - now).to.be.within(0.25, 0.5);
					osc.dispose();
					done();
				};
			});
		}

		it("invokes the onended callback in the offline context", function(done){
			Offline(function(){
				var osc = new OscillatorNode();
				osc.start(0);
				osc.stop(0.2);
				osc.onended = function(){
					expect(osc.now() - 0.2).to.be.closeTo(0, 0.05);
					osc.dispose();
					done();
				};
			}, 0.3);
		});

		it("invokes the onended callback only once in offline context", function(done){
			Offline(function(){
				var osc = new OscillatorNode();
				osc.start(0);
				osc.stop(0.1);
				osc.stop(0.2);
				osc.stop(0.3);
				osc.onended = function(){
					expect(osc.now() - 0.3).to.be.closeTo(0, 0.05);
					osc.dispose();
					done();
				};
			}, 0.4);
		});
	});

	context("Scheduling", function(){

		it("throw an error if start is called multiple time", function(){
			var osc = new OscillatorNode();
			osc.start();
			expect(function(){
				osc.start();
			}).to.throw();
			osc.dispose();
		});

		it("can play for a specific duration", function(){
			return Meter(function(){
				var osc = new OscillatorNode().toMaster();
				osc.start(0).stop(0.1);
			}, 0.4).then(function(level){
				expect(level.getValueAtTime(0)).to.be.above(0);
				expect(level.getValueAtTime(0.09)).to.be.above(0);
				expect(level.getValueAtTime(0.1)).to.equal(0);
			});
		});

		it("can call stop multiple times and takes the last value", function(){
			return Meter(function(){
				var osc = new OscillatorNode().toMaster();
				osc.start(0).stop(0.1).stop(0.2);
			}, 0.4).then(function(level){
				expect(level.getValueAtTime(0)).to.be.above(0);
				expect(level.getValueAtTime(0.1)).to.be.above(0);
				expect(level.getValueAtTime(0.19)).to.be.above(0);
				expect(level.getValueAtTime(0.2)).to.equal(0);
			});
		});

		if (Supports.ONLINE_TESTING){

			it("clamps start time to the currentTime", function(){
				var osc = new OscillatorNode();
				osc.start(0);
				var currentTime = osc.context.currentTime;
				expect(osc.getStateAtTime(0)).to.equal("stopped");
				expect(osc.getStateAtTime(currentTime)).to.equal("started");
				osc.dispose();
			});

			it("clamps stop time to the currentTime", function(done){
				var osc = new OscillatorNode();
				osc.start(0);
				var currentTime = osc.context.currentTime;
				expect(osc.getStateAtTime(0)).to.equal("stopped");
				expect(osc.getStateAtTime(currentTime)).to.equal("started");
				setTimeout(function(){
					currentTime = osc.context.currentTime;
					osc.stop(0);
					expect(osc.getStateAtTime(currentTime + 0.01)).to.equal("stopped");
					osc.dispose();
					done();
				}, 100);
			});
		}
	});

	context("State", function(){

		it("reports the right state", function(){

			return Offline(function(){
				var osc = new OscillatorNode();
				osc.start(0);
				osc.stop(0.05);
				return function(time){
					Test.whenBetween(time, 0, 0.05, function(){
						expect(osc.state).to.equal("started");
					});
					Test.whenBetween(time, 0.05, 0.1, function(){
						expect(osc.state).to.equal("stopped");
					});
				};
			}, 0.1);
		});

		it("can call stop multiple times, takes the last value", function(){

			return Offline(function(){
				var osc = new OscillatorNode();
				osc.start(0);
				osc.stop(0.05);
				osc.stop(0.1);
				return function(time){
					Test.whenBetween(time, 0, 0.1, function(){
						expect(osc.state).to.equal("started");
					});
					Test.whenBetween(time, 0.1, 0.2, function(){
						expect(osc.state).to.equal("stopped");
					});
				};
			}, 0.2);
		});
	});
});

