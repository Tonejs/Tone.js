define(["helper/Offline", "Tone/signal/Normalize", "helper/Basic", 
	"Test", "Tone/source/Oscillator", "Tone/signal/Signal"], 
	function (Offline, Normalize, Basic, Test, Oscillator, Signal) {

	describe("Normalize", function(){

		Basic(Normalize);

		context("Normalizing", function(){

			it("handles input and output connections", function(){
				var norm = new Normalize();
				Test.connect(norm);
				norm.connect(Test);
				norm.dispose();
			});

			it("normalizes an oscillator to 0,1", function(done){
				//make an oscillator to drive the signal
				var osc, norm;
				var offline = new Offline();
				offline.before(function(dest){
					osc = new Oscillator(1000);
					norm = new Normalize(-1, 1);
					osc.connect(norm);
					norm.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.within(0, 1);
				});
				offline.after(function(){
					osc.dispose();
					norm.dispose();
					done();
				});
				offline.run();
			});

			it("normalizes an input at the max range to 1", function(done){
				//make an oscillator to drive the signal
				var sig, norm;
				var offline = new Offline();
				offline.before(function(dest){
					sig = new Signal(1000);
					norm = new Normalize(0, 1000);
					sig.connect(norm);
					norm.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(1, 0.001);
				});
				offline.after(function(){
					sig.dispose();
					norm.dispose();
					done();
				});
				offline.run();
			});

			it("normalizes an input at the min range to 0", function(done){
				//make an oscillator to drive the signal
				var sig, norm;
				var offline = new Offline();
				offline.before(function(dest){
					sig = new Signal(-10);
					norm = new Normalize(-10, 1000);
					sig.connect(norm);
					norm.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0, 0.001);
				});
				offline.after(function(){
					sig.dispose();
					norm.dispose();
					done();
				});
				offline.run();
			});

			it("can set the min and max", function(done){
				//make an oscillator to drive the signal
				var sig, norm;
				var offline = new Offline();
				offline.before(function(dest){
					sig = new Signal(10);
					norm = new Normalize(0, 1);
					norm.min = 5;
					norm.max = 15;
					sig.connect(norm);
					norm.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.5, 0.001);
				});
				offline.after(function(){
					sig.dispose();
					norm.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});