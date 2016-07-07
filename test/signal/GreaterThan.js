define(["helper/Offline", "helper/Basic", "Tone/signal/GreaterThan", 
	"Tone/signal/Signal", "Test", "helper/Supports"], 
function (Offline, Basic, GreaterThan, Signal, Test, Supports) {
	describe("GreaterThan", function(){

		Basic(GreaterThan);

		context("Comparison", function(){

			it("handles input and output connections", function(){
				var gt = new GreaterThan();
				Test.connect(gt);
				Test.connect(gt, 0);
				Test.connect(gt, 1);
				gt.connect(Test);
				gt.dispose();
			});

			it("outputs 0 when signal is less than value", function(done){
				var signal, gt;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(1);
					gt = new GreaterThan(20);
					signal.connect(gt);
					gt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					gt.dispose();
					done();
				});
				offline.run();
			});

			if (Supports.WAVESHAPER_0_POSITION){

				it("outputs 0 when signal is equal to the value", function(done){
					var signal, gt;
					var offline = new Offline();
					offline.before(function(dest){
						signal = new Signal(10);
						gt = new GreaterThan(10);
						signal.connect(gt);
						gt.connect(dest);
					});
					offline.test(function(sample){
						expect(sample).to.equal(0);
					});
					offline.after(function(){
						signal.dispose();
						gt.dispose();
						done();
					});
					offline.run();
				});
			}

			it("outputs 1 value is greater than", function(done){
				var signal, gt;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(80);
					gt = new GreaterThan(40);
					signal.connect(gt);
					gt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					gt.dispose();
					done();
				});
				offline.run();
			});

			it("can handle negative values", function(done){
				var signal, gt;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(-2);
					gt = new GreaterThan(-4);
					signal.connect(gt);
					gt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					gt.dispose();
					done();
				});
				offline.run();
			});

			it("can set a new value", function(done){
				var signal, gt;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(2);
					gt = new GreaterThan(-100);
					gt.value = 1;
					signal.connect(gt);
					gt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					gt.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 1 when first signal is greater than second", function(done){
				var sigA, sigB, gt;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(1);
					sigB = new Signal(4);
					gt = new GreaterThan();
					sigA.connect(gt, 0, 0);
					sigB.connect(gt, 0, 1);
					gt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					gt.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 0 when first signal is less than second", function(done){
				var sigA, sigB, gt;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(5);
					sigB = new Signal(2);
					gt = new GreaterThan();
					sigA.connect(gt, 0, 0);
					sigB.connect(gt, 0, 1);
					gt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					gt.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});