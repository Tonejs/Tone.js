define(["helper/Offline", "helper/Basic", "Test", "Tone/signal/Signal", 
	"Tone/type/Type", "Tone/core/Transport", "helper/Offline2", "Tone/component/LFO"], 
	function (Offline, Basic, Test, Signal, Tone, Transport, Offline2, LFO) {

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

			it("takes on another signal's value when connected", function(done){
				var sigA, sigB;
				var offline = new Offline(0.2);
				offline.before(function(dest){
					sigA = new Signal(0).connect(dest);
					sigB = new Signal(3).connect(sigA);
				});
				offline.test(function(sample){
					expect(sample).to.be.closeTo(3, 0.001);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					done();
				});
				offline.run();
			});
		});

		context("Scheduling", function(){

			it ("can be scheduled to set a value in the future", function(done){
				var sig;
				var offline = new Offline();
				offline.before(function(dest){
					sig = new Signal(0).connect(dest);
					sig.setValueAtTime(2, 0.2);
				});
				offline.test(function(sample, time){
					if (time < 0.2){
						expect(sample).to.be.closeTo(0, 0.001);
					} else if (time > 0.21){
						expect(sample).to.be.closeTo(2, 0.001);
					}
				});
				offline.after(function(){
					sig.dispose();
					done();
				});
				offline.run();
			});

			it ("can linear ramp from the current value to another value in the future", function(done){
				var sig;
				var offline = new Offline(1);
				offline.before(function(dest){
					sig = new Signal(0).connect(dest);
					sig.setValueAtTime(0, 0);
					sig.linearRampToValueAtTime(1, 1);
				});
				offline.test(function(sample, time){
					expect(sample).to.be.closeTo(time, 0.001);
				});
				offline.after(function(){
					sig.dispose();
					done();
				});
				offline.run();
			});

			it ("can schedule an exponential ramp", function(){
				var sig = new Signal(1);
				sig.exponentialRampToValueAtTime(3, 1);
				sig.dispose();
			});

			it ("can approach a target value", function(){
				var sig = new Signal(1);
				sig.setTargetAtTime(0.2, 1, 2);
				sig.dispose();
			});

			it ("can set a ramp point at the current value", function(){
				var sig = new Signal(1);
				sig.setRampPoint();
				sig.dispose();
			});

			it ("can schedule multiple automations", function(done){
				var sig;
				var offline = new Offline(1);
				offline.before(function(dest){
					sig = new Signal(0).connect(dest);
					sig.setValueAtTime(0, 0);
					sig.linearRampToValueAtTime(0.5, 0.5);
					sig.linearRampToValueAtTime(0, 1);
				});
				offline.test(function(sample, time){
					if (time < 0.5){
						expect(sample).to.be.closeTo(time, 0.01);
					} else {
						expect(sample).to.be.closeTo(1 - time, 0.01);
					}
				});
				offline.after(function(){
					sig.dispose();
					done();
				});
				offline.run();
			});

			it ("can cancel an automation", function(done){
				Offline2(function(output, test, after){

					var sig = new Signal(1).connect(output);
					sig.setValueAtTime(4, 0.1);
					sig.exponentialRampToValueAtTime(3, 0.2);
					sig.cancelScheduledValues(0);

					test(function(){
						expect(sig.value).to.equal(1);
					});

					after(function(){
						expect(sig.value).to.equal(1);
						sig.dispose();
						done();
					});

				}, 0.4);
			});

			it ("can set a linear ramp from the current time", function(done){
				var sig;
				var offline = new Offline(0.5);
				offline.before(function(dest){
					sig = new Signal(0).connect(dest);
					sig.linearRampToValue(2, 0.3);
				});
				offline.test(function(sample, time){
					if (time > 0.3){
						expect(sample).to.be.closeTo(2, 0.02);
					}
				});
				offline.after(function(){
					sig.dispose();
					done();
				});
				offline.run();
			});

			it ("can set an linear ramp in the future", function(done){
				var sig;
				var offline = new Offline(0.6);
				offline.before(function(dest){
					sig = new Signal(1).connect(dest);
					sig.linearRampToValue(50, 0.3, 0.2);
				});
				offline.test(function(sample, time){
					if (time >= 0.6){
						expect(sample).to.be.closeTo(50, 0.5);
					} else if (time < 0.2){
						expect(sample).to.equal(1);
					}
				});
				offline.after(function(){
					sig.dispose();
					done();
				});
				offline.run();
			});


			it ("can set an exponential ramp from the current time", function(done){
				var sig;
				var offline = new Offline(0.5);
				offline.before(function(dest){
					sig = new Signal(1).connect(dest);
					sig.exponentialRampToValue(50, 0.4);
				});
				offline.test(function(sample, time){
					if (time >= 0.4){
						expect(sample).to.be.closeTo(50, 0.5);
					} else {
						expect(sample).to.be.lessThan(50);
					}
				});
				offline.after(function(){
					sig.dispose();
					done();
				});
				offline.run();
			});

			it ("can set an exponential ramp in the future", function(done){
				var sig;
				var offline = new Offline(0.6);
				offline.before(function(dest){
					sig = new Signal(1).connect(dest);
					sig.exponentialRampToValue(50, 0.3, 0.2);
				});
				offline.test(function(sample, time){
					if (time >= 0.6){
						expect(sample).to.be.closeTo(50, 0.5);
					} else if (time < 0.2){
						expect(sample).to.equal(1);
					}
				});
				offline.after(function(){
					sig.dispose();
					done();
				});
				offline.run();
			});

			it ("rampTo ramps from the current value", function(done){
				var sig;
				var offline = new Offline(0.5);
				offline.before(function(dest){
					sig = new Signal(3).connect(dest);
					sig.rampTo(0.2, 0.1);
				});
				offline.test(function(sample, time){
					if (time >= 0.1){
						expect(sample).to.be.closeTo(0.2, 0.1);
					} else {
						expect(sample).to.be.greaterThan(0.2);
					}
				});
				offline.after(function(){
					sig.dispose();
					done();
				});
				offline.run();
			});

			it ("rampTo ramps from the current value at a specific time", function(done){
				var sig;
				var offline = new Offline(0.6);
				offline.before(function(dest){
					sig = new Signal(0).connect(dest);
					sig.rampTo(2, 0.1, 0.4);
				});
				offline.test(function(sample, time){
					if (time <= 0.4){
						expect(sample).to.be.closeTo(0, 0.1);
					} else if (time > 0.5){
						expect(sample).to.be.closeTo(2, 0.1);
					}
				});
				offline.after(function(){
					sig.dispose();
					done();
				});
				offline.run();
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

			it("converts the given units when passed in the constructor", function(done){
				var signal;
				var offline = new Offline(0.2);
				offline.before(function(dest){
					signal = new Signal({
						"value" : -10,
						"units" : Tone.Type.Decibels,
					}).connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.315, 0.01);
				});
				offline.after(function(){
					signal.dispose();
					done();
				});
				offline.run();
			});

			it("can be set to not convert the given units", function(done){
				var signal;
				var offline = new Offline(0.2);
				offline.before(function(dest){
					signal = new Signal({
						"value" : -10,
						"units" : Tone.Type.Decibels,
						"convert" : false
					}).connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.be.closeTo(-10, 0.01);
				});
				offline.after(function(){
					signal.dispose();
					done();
				});
				offline.run();
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

			it("maintains its original value after being synced to the transport", function(done){
				var sig;
				var offline = new Offline(0.2);
				offline.before(function(dest){
					sig = new Signal(3).connect(dest);
					Transport.syncSignal(sig);
				});
				offline.test(function(sample){
					expect(sample).to.be.closeTo(3, 0.01);
				});
				offline.after(function(){
					sig.dispose();
					done();
				});
				offline.run();
			});

			it("keeps the ratio when the bpm changes", function(done){
				var sig;
				var offline = new Offline(0.2);
				offline.before(function(dest){
					Transport.bpm.value = 120;
					sig = new Signal(5).connect(dest);
					Transport.syncSignal(sig);
					Transport.bpm.value = 240;
				});
				offline.test(function(sample){
					expect(sample).to.be.closeTo(10, 0.01);
				});
				offline.after(function(){
					sig.dispose();
					Transport.bpm.value = 120;
					done();
				});
				offline.run();
			});

			it("can ramp along with the bpm", function(done){
				var sig;
				var offline = new Offline(0.7);
				offline.before(function(dest){
					Transport.bpm.value = 120;
					sig = new Signal(2).connect(dest);
					Transport.syncSignal(sig);
					Transport.bpm.rampTo(240, 0.5);
				});
				offline.test(function(sample, time){
					if (time >= 0.5){
						expect(sample).to.be.closeTo(4, 0.04);
					}
				});
				offline.after(function(){
					sig.dispose();
					Transport.bpm.value = 120;
					done();
				});
				offline.run();
			});

			it("returns to the original value when unsynced", function(done){
				var sig;
				var offline = new Offline(0.2);
				offline.before(function(dest){
					Transport.bpm.value = 120;
					sig = new Signal(5).connect(dest);
					Transport.syncSignal(sig);
					Transport.bpm.value = 240;
					Transport.unsyncSignal(sig);
				});
				offline.test(function(sample){
					expect(sample).to.be.closeTo(5, 0.01);
				});
				offline.after(function(){
					sig.dispose();
					Transport.bpm.value = 120;
					done();
				});
				offline.run();
			});
		});

		context("LFO", function(){

			it ("can create an LFO from the constructor", function(){

				var sig = new Signal({
					"lfo" : {
						"min" : -20,
						"max" : 20
					}
				});

				expect(sig.lfo).to.be.instanceOf(Tone.LFO);
				expect(sig.lfo.min).to.be.closeTo(-20, 0.1);
				expect(sig.lfo.max).to.be.closeTo(20, 0.1);
			});

			it ("can set an LFO as the .value", function(){

				var sig = new Signal();

				sig.value = {
					"min" : 20,
					"max" : -20
				};

				expect(sig.lfo).to.be.instanceOf(Tone.LFO);
				expect(sig.lfo.min).to.be.closeTo(20, 0.1);
				expect(sig.lfo.max).to.be.closeTo(-20, 0.1);
			});

			it ("outputs a modulated signal", function(done){


				Offline2(function(output, test, after){

					var sig = new Signal({
						"lfo" : {
							"min" : 10,
							"max" : 20
						}
					}).connect(output);

					test(function(val){
						expect(val).to.be.within(10, 20);
					});

					after(function(){
						sig.dispose();
						done();
					});

				}, 0.4);
			});

			it ("can handle multiple levels of lfo", function(done){

				Offline2(function(output, test, after){

					var sig = new Signal({
						"lfo" : {
							"min" : 10,
							"max" : 20,
							"type" : "square",
							"frequency" : {
								"lfo" : {
									"min" : 2,
									"max" : 3,
									"frequency" : 10,
								}
							},
							"amplitude" : {
								"lfo" : {
									"min" : 0,
									"max" : 1,
									"frequency" : {
										"lfo" : {
											"min" : 2,
											"max" : 3,
											"frequency" : 10,
										}
									},
								}	
							}
						}
					}).connect(output);

					test(function(val){
						expect(val).to.be.within(10, 20);
					});

					after(function(){
						sig.dispose();
						done();
					});

				}, 0.4);
			});
		});
	});
});