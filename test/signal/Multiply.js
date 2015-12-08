define(["helper/Offline", "Tone/signal/Multiply", "helper/Basic", 
	"Test", "Tone/source/Oscillator", "Tone/signal/Signal"], 
	function (Offline, Multiply, Basic, Test, Oscillator, Signal) {

	describe("Multiply", function(){

		Basic(Multiply);

		describe("Multiplication", function(){

			it("handles input and output connections", function(){
				var mult = new Multiply();
				Test.connect(mult, 0);
				Test.connect(mult, 1);
				mult.connect(Test);
				mult.dispose();
			});

			it("correctly multiplys a signal and a scalar", function(done){
				var signal, mult;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(2);
					mult = new Multiply(10);
					signal.connect(mult);
					mult.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(20);
				});
				offline.after(function(){
					signal.dispose();
					mult.dispose();
					done();
				});
				offline.run();
			});

			it("can multiply two signals", function(done){
				var sigA, sigB, mult;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(3);
					sigB = new Signal(5);
					mult = new Multiply();
					sigA.connect(mult, 0, 0);
					sigB.connect(mult, 0, 1);
					mult.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(15);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					mult.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});