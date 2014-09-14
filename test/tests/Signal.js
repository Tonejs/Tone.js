/* global it, describe, maxTimeout */

define(["tests/Core", "chai", "Tone/signal/Signal", "Tone/source/Oscillator", 
	"Tone/signal/Threshold", "Tone/signal/Switch", "Tone/signal/Route", "Tone/signal/Select", "tests/Common"], 
function(core, chai, Signal, Oscillator, Threshold, Switch, Route, Select, Test){

	var expect = chai.expect;

	describe("Tone.Signal", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var s = new Signal();
			s.dispose();
			Test.wasDisposed(s, expect);
		});

		it("can start with a value initially", function(){
			var signal = new Signal(0);
			expect(signal.getValue()).to.equal(0);
			signal.dispose();
		});

		it("can set a value", function(){
			var signal = new Signal(0);
			signal.setValue(10);
			expect(signal.getValue()).to.equal(10);
			signal.dispose();
		});

		it("can set a value in the future with sample accurate timing", function(done){
			var sig;
			Test.offlineTest(0.1, function(dest){
				sig = new Signal(10);
				sig.setValueAtTime(100, "+0.1");
				expect(sig.getValue()).to.equal(10);
				sig.connect(dest);
			}, function(sample, time){
				if (sample === 100){
					expect(time).is.closeTo(0.1, 0.001);
				}
			}, function(){
				sig.dispose();
				done();
			});
		});

		it("can sync to another signal", function(done){
			var syncTo, signalSync;
			Test.offlineTest(0.1, function(dest){
				syncTo = new Signal(1);
				signalSync = new Signal(2);
				signalSync.sync(syncTo);
				syncTo.setValue(2);
				signalSync.connect(dest);
			}, function(sample){
				expect(sample).to.equal(4);
			}, function(){
				syncTo.dispose();
				signalSync.dispose();
				done();
			});
		});	

		it("can ramp from the current value", function(done){
			var sig;
			Test.offlineTest(0.1, function(dest){
				sig = new Signal(0);
				sig.setValue(-10);
				sig.linearRampToValueNow(1, "+0.1");
				expect(sig.getValue()).to.equal(-10);
				sig.connect(dest);
			}, function(sample, time){
				if (sample === 1){
					expect(time).is.closeTo(0.1, 0.001);
				}
			}, function(){
				sig.dispose();
				done();
			});
		});
		it("can ramp exponentially from the current value now", function(){
			var sig = new Signal(1);
			sig.exponentialRampToValueNow(10, 0.5);
			sig.dispose();
		});

		it("can ramp exponentially from the current value in the future", function(){
			var sig = new Signal(1);
			sig.exponentialRampToValueAtTime(10, 0.5);
			sig.dispose();
		});
	});

	describe("Tone.Threshold", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var thresh = new Threshold();
			thresh.dispose();
			Test.wasDisposed(thresh, expect);
		});

		it("thresholds an incoming signal to 0 when it is below the thresh", function(done){
			var signal, thresh;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.1);
				thresh = new Threshold(0.5);
				signal.connect(thresh);
				thresh.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				thresh.dispose();
				done();
			});
		});

		it("thresholds an incoming signal to 1 when it is above the thresh", function(done){
			var signal, thresh;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.8);
				thresh = new Threshold(0.75);
				signal.connect(thresh);
				thresh.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				thresh.dispose();
				done();
			});
		});

		it("outputs 1 when the values are the same", function(done){
			var signal, thresh;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.8);
				thresh = new Threshold(0.8);
				signal.connect(thresh);
				thresh.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				thresh.dispose();
				done();
			});
		});
	});

	describe("Tone.Switch", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var sw = new Switch();
			sw.dispose();
			Test.wasDisposed(sw, expect);
		});

		it("can stop a signal from passing through", function(done){
			var signal, gate;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(10);
				gate = new Switch();
				signal.connect(gate);
				gate.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				gate.dispose();
				done();
			});
		});

		it("can allow a signal to pass through", function(done){
			var signal, gate;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(10);
				gate = new Switch();
				signal.connect(gate);
				gate.open();
				gate.connect(dest);
			}, function(sample){
				expect(sample).to.equal(10);
			}, function(){
				signal.dispose();
				gate.dispose();
				done();
			});
		});
	});

	describe("Tone.Route", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var r = new Route();
			r.dispose();
			Test.wasDisposed(r, expect);
		});

		it("can route a signal to first output", function(done){
			var signal, route;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(10);
				route = new Route();
				signal.connect(route);
				route.select(0);
				route.connect(dest, 0, 0);
			}, function(sample){
				expect(sample).to.equal(10);
			}, function(){
				signal.dispose();
				route.dispose();
				done();
			});
		});

		it("can route a signal to first output and not the second one", function(done){
			var signal, route;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(10);
				route = new Route();
				signal.connect(route);
				route.select(0);
				route.connect(dest, 1, 0);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				route.dispose();
				done();
			});
		});

		it("can route a signal to second output", function(done){
			var signal, route;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(20);
				route = new Route();
				signal.connect(route);
				route.select(1);
				route.connect(dest, 1, 0);
			}, function(sample){
				expect(sample).to.equal(20);
			}, function(){
				signal.dispose();
				route.dispose();
				done();
			});
		});

		it("can route a signal to second output and not the first one", function(done){
			var signal, route;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(20);
				route = new Route();
				signal.connect(route);
				route.select(1);
				route.connect(dest, 0, 0);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				route.dispose();
				done();
			});
		});
	});

	describe("Tone.Select", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var s = new Select();
			s.dispose();
			Test.wasDisposed(s, expect);
		});

		it("can select the first signal", function(done){
			var signal0, signal1, select;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(10);
				signal1 = new Signal(20);
				select = new Select();
				signal0.connect(select, 0, 0);
				signal1.connect(select, 0, 1);
				select.select(0);
				select.connect(dest);
			}, function(sample){
				expect(sample).to.equal(10);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				select.dispose();
				done();
			});
		});

		it("can select the second signal", function(done){
			var signal0, signal1, select;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(11);
				signal1 = new Signal(21);
				select = new Select();
				signal0.connect(select, 0, 0);
				signal1.connect(select, 0, 1);
				select.select(1);
				select.connect(dest);
			}, function(sample){
				expect(sample).to.equal(21);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				select.dispose();
				done();
			});
		});
	});

});