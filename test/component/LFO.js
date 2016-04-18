define(["Tone/component/LFO", "helper/Basic", "helper/Offline", "Test", 
	"helper/OutputAudio", "Tone/type/Type", "Tone/signal/Signal"], 
function (LFO, Basic, Offline, Test, OutputAudio, Tone, Signal) {
	describe("LFO", function(){

		Basic(LFO);

		context("API", function(){
			it ("can get the current state", function(done){
				var lfo = new LFO();
				expect(lfo.state).to.equal("stopped");
				lfo.start();
				expect(lfo.state).to.equal("started");
				lfo.dispose();
				done();
			});
		});

		context("Low Oscillations", function(){

			it("handles output connections", function(){
				var lfo = new LFO();
				lfo.connect(Test);
				lfo.dispose();
			});

			it("can be started and stopped", function(){
				var lfo = new LFO();
				lfo.start();
				lfo.stop();
				lfo.dispose();
			});

			it("can be constructed with an object", function(){
				var lfo = new LFO({
					"type" : "triangle2",
					"frequency" : 0.3
				});
				expect(lfo.type).to.equal("triangle2");
				expect(lfo.frequency.value).to.be.closeTo(0.3, 0.001);
				lfo.dispose();
			});

			it("handles getters/setters as objects", function(){
				var lfo = new LFO();
				var values = {
					"type" : "square",
					"min" : -1,
					"max" : 2,
					"phase" : 180,
					"frequency" : "8n",
				};
				lfo.set(values);
				expect(lfo.get()).to.contain.keys(Object.keys(values));
				expect(lfo.type).to.equal(values.type);
				expect(lfo.min).to.equal(values.min);
				expect(lfo.max).to.equal(values.max);
				expect(lfo.phase).to.equal(values.phase);
				lfo.dispose();
			});

			it("outputs a signal", function(done){
				var lfo;
				OutputAudio(function(dest){
					lfo = new LFO().connect(dest);
					lfo.start();
				}, function(){
					lfo.dispose();
					done();
				});
			});

			it("can be creates an oscillation in a specific range", function(done){
				var lfo;
				var offline = new Offline(0.1); 
				offline.before(function(dest){
					lfo = new LFO(100, 10, 20);
					lfo.connect(dest);
					lfo.start();
				}); 
				offline.test(function(sample){
					expect(sample).to.be.within(10, 20);
				}); 
				offline.after(function(){
					lfo.dispose();
					done();
				});
				offline.run();
			});

			it("can change the oscillation range", function(done){
				var lfo;
				var offline = new Offline(0.1); 
				offline.before(function(dest){
					lfo = new LFO(100, 10, 20);
					lfo.connect(dest);
					lfo.start();
					lfo.min = 15;
					lfo.max  = 18;
				}); 
				offline.test(function(sample){
					expect(sample).to.be.within(15, 18);
				}); 
				offline.after(function(){
					lfo.dispose();
					done();
				});
				offline.run();
			});

			it("initially outputs a signal at the center of it's phase", function(done){
				var lfo;
				var offline = new Offline(0.1); 
				offline.before(function(dest){
					lfo = new LFO(100, 10, 20);
					lfo.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(15, 0.01);
				}); 
				offline.after(function(){
					lfo.dispose();
					done();
				});
				offline.run();
			});

			it("outputs a signal at the correct phase angle", function(done){
				var lfo;
				var offline = new Offline(0.1); 
				offline.before(function(dest){
					lfo = new LFO({
						"phase" : 90,
						"min" : 0
					});
					lfo.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0, 0.01);
				}); 
				offline.after(function(){
					lfo.dispose();
					done();
				});
				offline.run();
			});

			it("outputs the right phase when setting a new phase", function(done){
				var lfo;
				var offline = new Offline(0.1); 
				offline.before(function(dest){
					lfo = new LFO({
						"phase" : 0,
						"min" : -1,
						"max" : 1
					});
					lfo.connect(dest);
					lfo.phase = 270;
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(1, 0.01);
				}); 
				offline.after(function(){
					lfo.dispose();
					done();
				});
				offline.run();
			});

			it("can convert to other units", function(done){
				var lfo;
				var offline = new Offline(0.1); 
				offline.before(function(dest){
					lfo = new LFO({
						"units" : Tone.Type.Decibels,
						"min" : -20,
						"max" : 5,
						"frequency" : 20
					});
					lfo.connect(dest);
					lfo.start();
				}); 
				offline.test(function(sample){
					expect(sample).to.be.within(lfo.dbToGain(-20) - 0.01, lfo.dbToGain(5) + 0.01);
				}); 
				offline.after(function(){
					lfo.dispose();
					done();
				});
				offline.run();
			});

			it("can converts to the units of the connecting node", function(done){
				var lfo, signal;
				var offline = new Offline(0.1); 
				offline.before(function(dest){
					lfo = new LFO(20, -35, -10);
					signal = new Signal(0, Tone.Type.Decibels);
					expect(lfo.units).to.equal(Tone.Type.Default);
					lfo.connect(dest);
					lfo.connect(signal);
					expect(lfo.units).to.equal(Tone.Type.Decibels);
					lfo.start();
				}); 
				offline.test(function(sample){
					expect(sample).to.be.within(lfo.dbToGain(-35) - 0.01, lfo.dbToGain(-10) + 0.01);
				}); 
				offline.after(function(){
					lfo.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});