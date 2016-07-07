define(["helper/Offline", "Tone/signal/GainToAudio", "helper/Basic", 
	"Test", "Tone/signal/Signal", "Tone/signal/Zero"], 
	function (Offline, GainToAudio, Basic, Test, Signal, Zero) {

	describe("GainToAudio", function(){

		Basic(GainToAudio);

		context("Gain To Audio", function(){

			it("handles input and output connections", function(){
				var g2a = new GainToAudio();
				Test.connect(g2a);
				g2a.connect(Test);
				g2a.dispose();
			});

			it("outputs 0 for an input value of 0.5", function(done){
				//make an oscillator to drive the signal
				var sig, g2a;
				var offline = new Offline();
				offline.before(function(dest){
					sig = new Signal(0.5);
					g2a = new GainToAudio();
					sig.connect(g2a);
					g2a.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0, 0.01);
				});
				offline.after(function(){
					sig.dispose();
					g2a.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 1 for an input value of 1", function(done){
				//make an oscillator to drive the signal
				var sig, g2a;
				var offline = new Offline();
				offline.before(function(dest){
					sig = new Signal(1);
					g2a = new GainToAudio();
					sig.connect(g2a);
					g2a.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(1, 0.01);
				});
				offline.after(function(){
					sig.dispose();
					g2a.dispose();
					done();
				});
				offline.run();
			});

			it("outputs -1 for an input value of 0", function(done){
				//make an oscillator to drive the signal
				var sig, g2a;
				var offline = new Offline();
				offline.before(function(dest){
					sig = new Zero();
					g2a = new GainToAudio();
					sig.connect(g2a);
					g2a.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(-1, 0.01);
				});
				offline.after(function(){
					sig.dispose();
					g2a.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});