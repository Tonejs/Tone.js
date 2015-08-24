define(["helper/Offline", "Tone/signal/Min", "helper/Basic", 
	"Test", "Tone/signal/Signal"], 
	function (Offline, Min, Basic, Test, Signal) {

	describe("Min", function(){

		Basic(Min);

		context("Minimum", function(){

			it("handles input and output connections", function(){
				var min = new Min();
				Test.connect(min, 0);
				Test.connect(min, 1);
				min.connect(Test);
				min.dispose();
			});

			it("outputs the set value when greater than the incoming signal", function(done){
				var signal, min;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(4);
					min = new Min(2);
					signal.connect(min);
					min.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(2);
				});
				offline.after(function(){
					signal.dispose();
					min.dispose();
					done();
				});
				offline.run();
			});

			it("outputs the incoming signal when less than the min", function(done){
				var signal, min;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(-12);
					min = new Min(-4);
					signal.connect(min);
					min.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(-12);
				});
				offline.after(function(){
					signal.dispose();
					min.dispose();
					done();
				});
				offline.run();
			});

			it("can be set to a new value", function(done){
				var signal, min;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(3);
					min = new Min(-4);
					signal.connect(min);
					min.value = 4;
					min.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(3);
				});
				offline.after(function(){
					signal.dispose();
					min.dispose();
					done();
				});
				offline.run();
			});

			it("can use two signals", function(done){
				var sigA, sigB, min;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(3);
					sigB = new Signal(5);
					min = new Min();
					sigA.connect(min, 0, 0);
					sigB.connect(min, 0, 1);
					min.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(3);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					min.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});