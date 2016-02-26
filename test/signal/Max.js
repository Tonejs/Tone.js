define(["helper/Offline", "Tone/signal/Max", "helper/Basic", 
	"Test", "Tone/signal/Signal"], 
	function (Offline, Max, Basic, Test, Signal) {

	describe("Max", function(){

		Basic(Max);

		context("Maximum", function(){

			it("handles input and output connections", function(){
				var max = new Max();
				Test.connect(max, 0);
				Test.connect(max, 1);
				max.connect(Test);
				max.dispose();
			});

			it("outputs the set value when less than the incoming signal", function(done){
				var signal, max;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(1);
					max = new Max(2);
					signal.connect(max);
					max.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(2);
				});
				offline.after(function(){
					signal.dispose();
					max.dispose();
					done();
				});
				offline.run();
			});

			it("outputs the incoming signal when greater than the max", function(done){
				var signal, max;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(10);
					max = new Max(-1);
					signal.connect(max);
					max.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(10);
				});
				offline.after(function(){
					signal.dispose();
					max.dispose();
					done();
				});
				offline.run();
			});

			it("can be set to a new value", function(done){
				var signal, max;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(10);
					max = new Max(-1);
					signal.connect(max);
					max.value = 12;
					max.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(12);
				});
				offline.after(function(){
					signal.dispose();
					max.dispose();
					done();
				});
				offline.run();
			});

			it("can use two signals", function(done){
				var sigA, sigB, max;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(3);
					sigB = new Signal(50);
					max = new Max();
					sigA.connect(max, 0, 0);
					sigB.connect(max, 0, 1);
					max.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(50);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					max.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});