define(["helper/Offline", "Tone/signal/Subtract", "helper/Basic", 
	"Test", "Tone/source/Oscillator", "Tone/signal/Signal"], 
	function (Offline, Subtract, Basic, Test, Oscillator, Signal) {

	describe("Subtract", function(){

		Basic(Subtract);

		context("Subtraction", function(){

			it("handles input and output connections", function(){
				var subtract = new Subtract();
				Test.connect(subtract, 0);
				Test.connect(subtract, 1);
				subtract.connect(Test);
				subtract.dispose();
			});

			it("correctly subtracts a signal and a number", function(done){
				var signal, sub;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0);
					sub = new Subtract(3);
					signal.connect(sub);
					sub.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(-3);
				});
				offline.after(function(){
					signal.dispose();
					sub.dispose();
					done();
				});
				offline.run();
			});

			it("can set the scalar value after construction", function(done){
				var signal, sub;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(-2);
					sub = new Subtract(0);
					sub.value = 4;
					signal.connect(sub);
					sub.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(-6);
				});
				offline.after(function(){
					signal.dispose();
					sub.dispose();
					done();
				});
				offline.run();
			});

			it("can handle negative values", function(done){
				var signal, sub;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(4);
					sub = new Subtract(-2);
					signal.connect(sub);
					sub.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(6);
				});
				offline.after(function(){
					signal.dispose();
					sub.dispose();
					done();
				});
				offline.run();
			});

			it("can subtract two signals", function(done){
				var sigA, sigB, sub;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(1);
					sigB = new Signal(4);
					sub = new Subtract();
					sigA.connect(sub, 0, 0);
					sigB.connect(sub, 0, 1);
					sub.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(-3);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					sub.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});