define(["helper/Offline", "Tone/signal/Pow", "helper/Basic", 
	"Test", "Tone/signal/Signal"], 
	function (Offline, Pow, Basic, Test, Signal) {

	describe("Pow", function(){

		Basic(Pow);

		context("Exponential Scaling", function(){

			it("handles input and output connections", function(){
				var pow = new Pow();
				Test.connect(pow);
				pow.connect(Test);
				pow.dispose();
			});

			it("can do powers of 2", function(done){
				var signal, pow;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0.3);
					pow = new Pow(2);
					signal.connect(pow);
					pow.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.09, 0.01);
				});
				offline.after(function(){
					signal.dispose();
					pow.dispose();
					done();
				});
				offline.run();
			});

			it("can compute negative values and powers less than 1", function(done){
				var signal, pow;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(-0.49);
					pow = new Pow(0.5);
					signal.connect(pow);
					pow.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.7, 0.01);
				});
				offline.after(function(){
					signal.dispose();
					pow.dispose();
					done();
				});
				offline.run();
			});

			it("can set a new exponent", function(done){
				var signal, pow;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0.5);
					pow = new Pow(1);
					pow.value = 3;
					signal.connect(pow);
					pow.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.125, 0.01);
				});
				offline.after(function(){
					signal.dispose();
					pow.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});