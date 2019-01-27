import Offline from "helper/Offline";
import Basic from "helper/Basic";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import Tone from "Tone/type/Type";
import Transport from "Tone/core/Transport";
import ConstantOutput from "helper/ConstantOutput";
import Gain from "Tone/core/Gain";

describe("Signal", function(){

	Basic(Signal);

	context("Signal Rate Value", function(){

		it("handles input and output connections", function(){
			var signal = new Signal();
			Test.connect(signal);
			signal.connect(Test);
			signal.dispose();
		});

		it("can be created with an options object", function(){
			var signal = new Signal({
				"value" : 0.2,
				"units" : Tone.Type.Positive
			});
			expect(signal.value).to.be.closeTo(0.2, 0.001);
			expect(signal.units).to.equal(Tone.Type.Positive);
			signal.dispose();
		});

		it("can start with a value initially", function(){
			var signal = new Signal(2);
			expect(signal.value).to.equal(2);
			signal.dispose();
		});

		it("can set a value", function(){
			var signal = new Signal(0);
			signal.value = 10;
			expect(signal.value).to.equal(10);
			signal.dispose();
		});

		it("takes on another signal's value when connected", function(){
			return ConstantOutput(function(){
				var sigA = new Signal(0).toMaster();
				new Signal(3).connect(sigA);
			}, 3);
		});

		it("takes the first signals value when many values are chained", function(){
			return ConstantOutput(function(){
				var sigA = new Signal(3).toMaster();
				var sigB = new Signal(1).connect(sigA);
				var sigC = new Signal(2).connect(sigB);
			}, 2);
		});
	});

	context("Scheduling", function(){

		it("can be scheduled to set a value in the future", function(){
			return Offline(function(){
				var sig = new Signal(0).toMaster();
				sig.setValueAtTime(2, 0.2);
			}, 0.3).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time < 0.19){
						expect(sample).to.be.closeTo(0, 0.001);
					} else if (time > 0.2){
						expect(sample).to.be.closeTo(2, 0.001);
					}
				});
			});
		});

		it("can linear ramp from the current value to another value in the future", function(){
			return Offline(function(){
				var sig = new Signal(0).toMaster();
				sig.setValueAtTime(0, 0);
				sig.linearRampToValueAtTime(1, 1);
			}, 1).then(function(buffer){
				buffer.forEach(function(sample, time){
					expect(sample).to.be.closeTo(time, 0.001);
				});
			});
		});

		it("can schedule an exponential ramp", function(){
			var sig = new Signal(1);
			sig.exponentialRampToValueAtTime(3, "+1");
			sig.dispose();
		});

		it("can approach a target value", function(){
			var sig = new Signal(1);
			sig.setTargetAtTime(0.2, "+1", 2);
			sig.dispose();
		});

		it("can set a ramp point at the current value", function(){
			var sig = new Signal(1);
			sig.setRampPoint();
			sig.dispose();
		});

		it("can schedule multiple automations", function(){
			return Offline(function(){
				var sig = new Signal(0).toMaster();
				sig.setValueAtTime(0, 0);
				sig.linearRampToValueAtTime(0.5, 0.5);
				sig.linearRampToValueAtTime(0, 1);
			}, 1).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time < 0.5){
						expect(sample).to.be.closeTo(time, 0.01);
					} else {
						expect(sample).to.be.closeTo(1 - time, 0.01);
					}
				});
			});
		});

		it("can schedule multiple automations from a connected signal", function(){
			return Offline(function(){
				var output = new Signal(1).toMaster();
				var sig = new Signal(0).connect(output);
				sig.setValueAtTime(0, 0);
				sig.linearRampToValueAtTime(0.5, 0.5);
				sig.linearRampToValueAtTime(0, 1);
			}, 1).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time < 0.5){
						expect(sample).to.be.closeTo(time, 0.01);
					} else {
						expect(sample).to.be.closeTo(1 - time, 0.01);
					}
				});
			});
		});

		it("can disconnect from all the connected notes", function(){
			return Offline(function(){
				var output0 = new Signal(1).toMaster();
				var output1 = new Signal(1).toMaster();
				var sig = new Signal(0).fan(output0, output1);
				sig.disconnect();
				sig.setValueAtTime(0, 0);
				sig.linearRampToValueAtTime(0.5, 0.5);
				sig.linearRampToValueAtTime(0, 1);
			}, 1).then(function(buffer){
				expect(buffer.value()).to.equal(0);
			});
		});

		it("can disconnect from a specific node", function(){
			return Offline(function(){
				var output = new Signal(1).toMaster();
				var sig = new Signal(0).connect(output);
				sig.disconnect(output);
				sig.setValueAtTime(0, 0);
				sig.linearRampToValueAtTime(0.5, 0.5);
				sig.linearRampToValueAtTime(0, 1);
			}, 1).then(function(buffer){
				expect(buffer.value()).to.equal(0);
			});
		});

		it("can schedule multiple automations from a connected signal through a multiple nodes", function(){
			return Offline(function(){
				var output = new Signal(0).toMaster();
				var proxy = new Signal(0).connect(output);
				var gain = new Gain(1).connect(proxy);
				var sig = new Signal(0).connect(gain);
				sig.setValueAtTime(0, 0);
				sig.linearRampToValueAtTime(0.5, 0.5);
				sig.linearRampToValueAtTime(0, 1);
			}, 1).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time < 0.5){
						expect(sample).to.be.closeTo(time, 0.01);
					} else {
						expect(sample).to.be.closeTo(1 - time, 0.01);
					}
				});
			});
		});

		it("can cancel an automation", function(){
			return ConstantOutput(function(){
				var sig = new Signal(1).toMaster();
				sig.setValueAtTime(4, 0.1);
				sig.exponentialRampToValueAtTime(3, 0.2);
				sig.cancelScheduledValues(0);
			}, 1);
		});

		it("can cancel and hold a linear automation curve", function(){
			return Offline(function(){
				var sig = new Signal(0).toMaster();
				sig.linearRampTo(2, 1);
				sig.cancelAndHoldAtTime(0.5);
			}, 1).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.1);
				expect(buffer.getValueAtTime(0.25)).to.be.closeTo(0.5, 0.1);
				expect(buffer.getValueAtTime(0.5)).to.be.closeTo(1, 0.1);
				expect(buffer.getValueAtTime(0.75)).to.be.closeTo(1, 0.1);
			});
		});

		it("can cancel and hold an exponential automation curve", function(){
			return Offline(function(){
				var sig = new Signal(1).toMaster();
				sig.exponentialRampTo(2, 1);
				sig.cancelAndHoldAtTime(0.5);
			}, 1).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(1, 0.1);
				expect(buffer.getValueAtTime(0.25)).to.be.closeTo(1.2, 0.1);
				expect(buffer.getValueAtTime(0.5)).to.be.closeTo(1.4, 0.1);
				expect(buffer.getValueAtTime(0.75)).to.be.closeTo(1.4, 0.1);
			});
		});

		it("can set a linear ramp from the current time", function(){
			return Offline(function(){
				var sig = new Signal(0).toMaster();
				sig.linearRampTo(2, 0.3);
			}, 0.5).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time > 0.3){
						expect(sample).to.be.closeTo(2, 0.02);
					}
				});
			});
		});

		it("can set an linear ramp in the future", function(){
			return Offline(function(){
				var sig = new Signal(1).toMaster();
				sig.linearRampTo(50, 0.3, 0.2);
			}, 0.7).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time >= 0.6){
						expect(sample).to.be.closeTo(50, 0.5);
					} else if (time < 0.2){
						expect(sample).to.closeTo(1, 0.01);
					}
				});
			});
		});

		it("can set a exponential approach ramp from the current time", function(){
			return Offline(function(){
				var sig = new Signal(0).toMaster();
				sig.targetRampTo(1, 0.3);
			}, 0.5).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.below(0.0001);
				expect(buffer.getValueAtTime(0.3)).to.be.closeTo(1, 0.02);
			});
		});

		it("can set an exponential approach ramp in the future", function(){
			return Offline(function(){
				var sig = new Signal(1).toMaster();
				sig.targetRampTo(50, 0.3, 0.2);
			}, 0.7).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(1, 0.0001);
				expect(buffer.getValueAtTime(0.2)).to.be.closeTo(1, 0.0001);
				expect(buffer.getValueAtTime(0.6)).to.be.closeTo(50, 0.5);
			});
		});

		it("can set an exponential ramp from the current time", function(){
			return Offline(function(){
				var sig = new Signal(1).toMaster();
				sig.exponentialRampTo(50, 0.4);
			}, 0.6).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time >= 0.4){
						expect(sample).to.be.closeTo(50, 0.5);
					} else if (time < 0.39){
						expect(sample).to.be.lessThan(50);
					}
				});
			});
		});

		it("can set an exponential ramp in the future", function(){
			return Offline(function(){
				var sig = new Signal(1).toMaster();
				sig.exponentialRampTo(50, 0.3, 0.2);
			}, 0.8).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time >= 0.6){
						expect(sample).to.be.closeTo(50, 0.5);
					} else if (time < 0.2){
						expect(sample).to.equal(1);
					}
				});
			});
		});

		it("rampTo ramps from the current value", function(){
			return Offline(function(){
				var sig = new Signal(3).toMaster();
				sig.rampTo(0.2, 0.1);
			}, 0.4).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time >= 0.1){
						expect(sample).to.be.closeTo(0.2, 0.1);
					} else {
						expect(sample).to.be.greaterThan(0.2);
					}
				});
			});
		});

		it("rampTo ramps from the current value at a specific time", function(){
			return Offline(function(){
				var sig = new Signal(0).toMaster();
				sig.rampTo(2, 0.1, 0.4);
			}, 0.6).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time < 0.4){
						expect(sample).to.be.closeTo(0, 0.1);
					} else if (time > 0.5){
						expect(sample).to.be.closeTo(2, 0.1);
					}
				});
			});
		});

		it("can set a value curve", function(){
			return Offline(function(){
				var sig = new Signal(0).toMaster();
				sig.setValueCurveAtTime([0, 1, 0.5, 0.2], 0, 1);
			}, 1).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.33/2)).to.be.closeTo(0.5, 0.01);
				expect(buffer.getValueAtTime(0.33)).to.be.closeTo(1, 0.02);
				expect(buffer.getValueAtTime(0.66)).to.be.closeTo(0.5, 0.02);
				expect(buffer.getValueAtTime(0.99)).to.be.closeTo(0.2, 0.02);
			});
		});

		it("can set a value curve in the future", function(){
			return Offline(function(){
				var sig = new Signal(0).toMaster();
				sig.setValueCurveAtTime([0, 1, 0.5, 0.2], 0.5, 1);
			}, 1.5).then(function(buffer){
				expect(buffer.getValueAtTime(0 + 0.5)).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.33/2 + 0.5)).to.be.closeTo(0.5, 0.01);
				expect(buffer.getValueAtTime(0.33 + 0.5)).to.be.closeTo(1, 0.02);
				expect(buffer.getValueAtTime(0.66 + 0.5)).to.be.closeTo(0.5, 0.02);
				expect(buffer.getValueAtTime(0.99 + 0.5)).to.be.closeTo(0.2, 0.02);
			});
		});

		it("can set an exponential approach", function(){
			return Offline(function(){
				var sig = new Signal(0).toMaster();
				sig.exponentialApproachValueAtTime(2, 0.1, 0.5);
			}, 1).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.1)).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.4)).to.be.closeTo(1.9, 0.1);
				expect(buffer.getValueAtTime(0.6)).to.be.closeTo(2, 0.01);
			});
		});

	});

	context("Units", function(){

		it("can be created with specific units", function(){
			var signal = new Signal(0, Tone.Type.BPM);
			expect(signal.units).to.equal(Tone.Type.BPM);
			signal.dispose();
		});

		it("can evaluate the given units", function(){
			var signal = new Signal(2, Tone.Type.Time);
			signal.value = "4n";
			expect(signal.value).to.be.closeTo(0.5, 0.001);
			signal.dispose();
		});

		it("converts the given units when passed in the constructor", function(){
			return ConstantOutput(function(){
				var signal = new Signal({
					"value" : -10,
					"units" : Tone.Type.Decibels,
				}).toMaster();
			}, 0.315);
		});

		it("can be set to not convert the given units", function(){
			return ConstantOutput(function(){
				var signal = new Signal({
					"value" : -10,
					"units" : Tone.Type.Decibels,
					"convert" : false
				}).toMaster();
			}, -10);
		});

		it("converts Frequency units", function(){
			var signal = new Signal("50hz", Tone.Type.Frequency);
			expect(signal.value).to.be.closeTo(50, 0.01);
			signal.dispose();
		});

		it("converts Time units", function(){
			var signal = new Signal("4n", Tone.Type.Time);
			expect(signal.value).to.be.closeTo(0.5, 0.01);
			signal.dispose();
		});

		it("converts NormalRange units", function(){
			var signal = new Signal(2, Tone.Type.NormalRange);
			expect(signal.value).to.be.closeTo(1, 0.01);
			signal.dispose();
		});

		it("converts AudioRange units", function(){
			var signal = new Signal(-2, Tone.Type.AudioRange);
			expect(signal.value).to.be.closeTo(-1, 0.01);
			signal.dispose();
		});

		it("converts Positive units", function(){
			var signal = new Signal(-2, Tone.Type.Positive);
			expect(signal.value).to.be.closeTo(0, 0.01);
			signal.dispose();
		});

	});

	context("Transport Syncing", function(){

		it("maintains its original value after being synced to the transport", function(){
			return ConstantOutput(function(Transport){
				var sig = new Signal(3).toMaster();
				Transport.syncSignal(sig);
			}, 3);
		});

		it("keeps the ratio when the bpm changes", function(){
			return ConstantOutput(function(Transport){
				Transport.bpm.value = 120;
				var sig = new Signal(5).toMaster();
				Transport.syncSignal(sig);
				Transport.bpm.value = 240;
			}, 10);
		});

		it("can ramp along with the bpm", function(){
			return Offline(function(Transport){
				Transport.bpm.value = 120;
				var sig = new Signal(2).toMaster();
				Transport.syncSignal(sig);
				Transport.bpm.rampTo(240, 0.5);
			}).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time >= 0.5){
						expect(sample).to.be.closeTo(4, 0.04);
					} else if (time < 0.4){
						expect(sample).to.be.within(1.95, 3);
					}
				});
			});
		});

		it("returns to the original value when unsynced", function(){
			return ConstantOutput(function(Transport){
				Transport.bpm.value = 120;
				var sig = new Signal(5).toMaster();
				Transport.syncSignal(sig);
				Transport.bpm.value = 240;
				Transport.unsyncSignal(sig);
			}, 5);
		});
	});

});

