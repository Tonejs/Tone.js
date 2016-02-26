define(["helper/Offline", "Tone/signal/ScaleExp", "helper/Basic", 
	"Test", "Tone/source/Oscillator", "Tone/signal/Signal"], 
	function (Offline, ScaleExp, Basic, Test, Oscillator, Signal) {

	describe("ScaleExp", function(){

		Basic(ScaleExp);

		context("Scaling", function(){

			it("handles input and output connections", function(){
				var scale = new ScaleExp(0, 100, 2);
				Test.connect(scale);
				scale.connect(Test);
				scale.dispose();
			});

			it("can set the min and max values", function(){
				var scale = new ScaleExp(-20, 10, 2);
				scale.min = -0.01;
				expect(scale.min).to.be.closeTo(-0.01, 0.001);
				scale.max = 1000;
				expect(scale.max).to.be.closeTo(1000, 0.001);
				scale.dispose();
			});

			it("can set the exponent value", function(){
				var scale = new ScaleExp(0, 100, 2);
				expect(scale.exponent).to.be.closeTo(2, 0.001);
				scale.exponent = 3;
				expect(scale.exponent).to.be.closeTo(3, 0.001);
				scale.dispose();
			});

			it("scales a signal exponentially", function(done){
				var signal, scale;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0.5);
					scale = new ScaleExp(0, 1, 2);
					signal.connect(scale);
					scale.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.25, 0.01);
				});
				offline.after(function(){
					signal.dispose();
					scale.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});