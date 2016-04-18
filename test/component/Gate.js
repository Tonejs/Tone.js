define(["Tone/component/Gate", "helper/Basic", "helper/Offline", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "Tone/type/Type", "helper/Supports"], 
function (Gate, Basic, Offline, Test, Signal, PassAudio, Tone, Supports) {
	describe("Gate", function(){

		Basic(Gate);

		context("Signal Gating", function(){

			it("handles input and output connections", function(){
				var gate = new Gate();
				Test.connect(gate);
				gate.connect(Test);
				gate.dispose();
			});

			it("handles getter/setter as Object", function(){
				var gate = new Gate();
				var values = {
					"attack" : 0.2,
					"release" : 0.4,
					"threshold" : -20
				};
				gate.set(values);
				expect(gate.get().attack).to.be.closeTo(0.2, 0.001);
				expect(gate.get().release).to.be.closeTo(0.4, 0.001);
				expect(gate.get().threshold).to.be.closeTo(-20, 0.1);
				gate.dispose();
			});

			it("can be constructed with an object", function(){
				var gate = new Gate({
					"release" : 0.3,
					"threshold" : -5
				});
				expect(gate.release).to.be.closeTo(0.3, 0.001);
				expect(gate.threshold).to.be.closeTo(-5, 0.1);
				gate.dispose();
			});

			if (Supports.WAVESHAPER_0_POSITION){

				it("gates the incoming signal when below the threshold", function(done){
					var gate, sig;
					var offline = new Offline(); 
					offline.before(function(dest){
						gate = new Gate(-9);
						sig = new Signal(-10, Tone.Type.Decibels);
						sig.connect(gate);
						gate.connect(dest);
					}); 
					offline.test(function(sample){
						expect(sample).to.equal(0);
					}); 
					offline.after(function(){
						gate.dispose();
						sig.dispose();
						done();
					});
					offline.run();
				});
			}

			it("passes the incoming signal when above the threshold", function(done){
				var gate, sig;
				var offline = new Offline(); 
				offline.before(function(dest){
					gate = new Gate(-11);
					sig = new Signal(-10, Tone.Type.Decibels);
					sig.connect(gate);
					gate.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.above(0);
				}); 
				offline.after(function(){
					gate.dispose();
					sig.dispose();
					done();
				});
				offline.run();
			});


		});
	});
});