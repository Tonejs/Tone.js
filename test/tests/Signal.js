/* global it, describe, maxTimeout */

define(["tests/Core", "chai", "Tone/signal/Signal", "Tone/source/Oscillator", 
	"Tone/signal/Switch", "Tone/signal/Route", "Tone/signal/Select", "tests/Common",
	"Tone/signal/NOT", "Tone/signal/AND", "Tone/signal/OR", "Tone/signal/IfThenElse", "Tone/signal/WaveShaper"], 
function(core, chai, Signal, Oscillator, Switch, Route, Select, Test, NOT, AND, OR, IfThenElse, WaveShaper){

	var expect = chai.expect;

	describe("Tone.Signal", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var s = new Signal();
			s.dispose();
			Test.wasDisposed(s);
		});

		it("can start with a value initially", function(){
			var signal = new Signal(0);
			expect(signal.value).to.equal(0);
			signal.dispose();
		});

		it("can set a value", function(){
			var signal = new Signal(0);
			signal.value = 10;
			expect(signal.value).to.equal(10);
			signal.dispose();
		});

		it("can set a value in the future with sample accurate timing", function(done){
			var sig;
			Test.offlineTest(0.1, function(dest){
				sig = new Signal(10);
				sig.setValueAtTime(100, "+0.1");
				expect(sig.value).to.equal(10);
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

		it("can ramp from the current value", function(done){
			var sig;
			Test.offlineTest(0.1, function(dest){
				sig = new Signal(0);
				sig.value = -10;
				sig.linearRampToValueNow(1, "+0.1");
				expect(sig.value).to.equal(-10);
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

	describe("Tone.Switch", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var sw = new Switch();
			sw.dispose();
			Test.wasDisposed(sw);
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
			Test.wasDisposed(r);
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
			Test.wasDisposed(s);
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

	describe("Tone.IfThenElse", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var ite = new IfThenElse();
			ite.dispose();
			Test.wasDisposed(ite);
		});

		it("selects the second input (then) when input 0 (if) is 1", function(done){
			var signal0, signal1, signal2, ite;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(1);
				signal1 = new Signal(10);
				signal2 = new Signal(20);
				ite = new IfThenElse();
				signal0.connect(ite, 0, 0);
				signal1.connect(ite, 0, 1);
				signal2.connect(ite, 0, 2);
				ite.connect(dest);
			}, function(sample){
				expect(sample).to.equal(10);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				signal2.dispose();
				ite.dispose();
				done();
			});
		});

		it("selects the third input (else) when input 0 (if) is not 1", function(done){
			var signal0, signal1, signal2, ite;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(0);
				signal1 = new Signal(11);
				signal2 = new Signal(21);
				ite = new IfThenElse();
				signal0.connect(ite.if);
				signal1.connect(ite.then);
				signal2.connect(ite.else);
				ite.connect(dest);
			}, function(sample){
				expect(sample).to.equal(21);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				signal2.dispose();
				ite.dispose();
				done();
			});
		});
	});

	describe("Tone.NOT", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var n = new NOT();
			n.dispose();
			Test.wasDisposed(n);
		});

		it("outputs 0 when the input is 1", function(done){
			var signal, not;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(1);
				not = new NOT();
				signal.connect(not);
				not.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				not.dispose();
				done();
			});
		});

		it("outputs 1 when the input is 0", function(done){
			var signal, not;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0);
				not = new NOT();
				signal.connect(not);
				not.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal.dispose();
				not.dispose();
				done();
			});
		});

		it("outputs 0 when the input is not 0", function(done){
			var signal, not;
			Test.offlineTest(0.2, function(dest){
				signal = new Signal(0.3);
				not = new NOT();
				signal.connect(not);
				not.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal.dispose();
				not.dispose();
				done();
			});
		});
	});

	describe("Tone.AND", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var a = new AND();
			a.dispose();
			Test.wasDisposed(a);
		});

		it("outputs 1 when both inputs are 1", function(done){
			var signal0, signal1, and;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(1);
				signal1 = new Signal(1);
				and = new AND(2);
				signal0.connect(and);
				signal1.connect(and);
				and.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				and.dispose();
				done();
			});
		});

		it("outputs 0 when only one input is 1", function(done){
			var signal0, signal1, and;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(1);
				signal1 = new Signal(0);
				and = new AND(2);
				signal0.connect(and);
				signal1.connect(and);
				and.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				and.dispose();
				done();
			});
		});

		it("outputs 0 when only the inputs are 0", function(done){
			var signal0, signal1, and;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(0);
				signal1 = new Signal(0);
				and = new AND(2);
				signal0.connect(and);
				signal1.connect(and);
				and.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				and.dispose();
				done();
			});
		});

		it("works with three signals", function(done){
			var signal0, signal1, signal2, and;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(1);
				signal1 = new Signal(1);
				signal2 = new Signal(1);
				and = new AND(3);
				signal0.connect(and);
				signal1.connect(and);
				signal2.connect(and);
				and.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				signal2.dispose();
				and.dispose();
				done();
			});
		});
	});

	describe("Tone.OR", function(){
		this.timeout(maxTimeout);

		it("can be created or disposed", function(){
			var a = new OR();
			a.dispose();
			Test.wasDisposed(a);
		});

		it("outputs 1 when at least one input is 1", function(done){
			var signal0, signal1, or;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(1);
				signal1 = new Signal(1);
				or = new OR(2);
				signal0.connect(or, 0, 0);
				signal1.connect(or, 0, 1);
				or.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				or.dispose();
				done();
			});
		});

		it("outputs 1 when only one input is 1", function(done){
			var signal0, signal1, or;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(0);
				signal1 = new Signal(1);
				or = new OR(2);
				signal0.connect(or, 0, 0);
				signal1.connect(or, 0, 1);
				or.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				or.dispose();
				done();
			});
		});

		it("outputs 0 when all the inputs are 0", function(done){
			var signal0, signal1, or;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(0);
				signal1 = new Signal(0);
				or = new OR(2);
				signal0.connect(or, 0, 0);
				signal1.connect(or, 0, 1);
				or.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				or.dispose();
				done();
			});
		});

		it("works with three signals", function(done){
			var signal0, signal1, signal2, or;
			Test.offlineTest(0.2, function(dest){
				signal0 = new Signal(0);
				signal1 = new Signal(0);
				signal2 = new Signal(1);
				or = new OR(3);
				signal0.connect(or, 0, 0);
				signal1.connect(or, 0, 1);
				signal2.connect(or, 0, 2);
				or.connect(dest);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				signal0.dispose();
				signal1.dispose();
				signal2.dispose();
				or.dispose();
				done();
			});
		});
	});

	describe("Tone.WaveShaper", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var ws = new WaveShaper(function(val){
				return val;
			});
			ws.dispose();
			Test.wasDisposed(ws);
		});
	});
});