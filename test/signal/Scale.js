define(["helper/Offline", "Tone/signal/Scale", "helper/Basic", 
	"Test", "Tone/source/Oscillator", "Tone/signal/Signal"], 
	function (Offline, Scale, Basic, Test, Oscillator, Signal) {

	describe("Scale", function(){

		Basic(Scale);

		context("Scaling", function(){

			it("handles input and output connections", function(){
				var scale = new Scale(0, 100);
				Test.connect(scale);
				scale.connect(Test);
				scale.dispose();
			});

			it("can set the min and max values", function(){
				var scale = new Scale(0, 100);
				scale.min = -0.01;
				expect(scale.min).to.be.closeTo(-0.01, 0.001);
				scale.max = 1000;
				expect(scale.max).to.be.closeTo(1000, 0.001);
				scale.dispose();
			});

			it("scales to the min when the input is 0", function(done){
				//make an signalillator to drive the signal
				var signal, scale;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0);
					scale = new Scale(-10, 8);
					signal.connect(scale);
					scale.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(-10, 0.001);
				});
				offline.after(function(){
					signal.dispose();
					scale.dispose();
					done();
				});
				offline.run();
			});

			it("scales to the max when the input is 1", function(done){
				//make an signalillator to drive the signal
				var signal, scale;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(1);
					scale = new Scale(-10, 0);
					scale.max = 8;
					signal.connect(scale);
					scale.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(8, 0.001);
				});
				offline.after(function(){
					signal.dispose();
					scale.dispose();
					done();
				});
				offline.run();
			});

			it("scales an input of 0.5 to 15 (10, 20)", function(done){
				//make an signalillator to drive the signal
				var signal, scale;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0.5);
					scale = new Scale(10, 20);
					signal.connect(scale);
					scale.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(15, 0.001);
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