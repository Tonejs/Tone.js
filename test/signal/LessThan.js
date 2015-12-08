define(["helper/Offline", "helper/Basic", "Tone/signal/LessThan", "Tone/signal/Signal", "Test"], 
function (Offline, Basic, LessThan, Signal, Test) {
	describe("LessThan", function(){

		Basic(LessThan);

		context("Comparison", function(){

			it("handles input and output connections", function(){
				var lt = new LessThan();
				Test.connect(lt);
				Test.connect(lt, 0);
				Test.connect(lt, 1);
				lt.connect(Test);
				lt.dispose();
			});

			it("outputs 1 when signal is less than the value", function(done){
				var signal, lt;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(4);
					lt = new LessThan(20.02);
					signal.connect(lt);
					lt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					lt.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 0 when signal is equal to the value", function(done){
				var signal, lt;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(16.001);
					lt = new LessThan(16.001);
					signal.connect(lt);
					lt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					lt.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 0 value is greater than", function(done){
				var signal, lt;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(20);
					lt = new LessThan(10);
					signal.connect(lt);
					lt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					lt.dispose();
					done();
				});
				offline.run();
			});

			it("can handle negative values", function(done){
				var signal, lt;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(-8);
					lt = new LessThan(-4);
					signal.connect(lt);
					lt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					lt.dispose();
					done();
				});
				offline.run();
			});

			it("can set a new value", function(done){
				var signal, lt;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(2);
					lt = new LessThan(-100);
					lt.value = 10;
					signal.connect(lt);
					lt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					signal.dispose();
					lt.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 1 when first signal is less than second", function(done){
				var sigA, sigB, lt;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(1);
					sigB = new Signal(4);
					lt = new LessThan();
					sigA.connect(lt, 0, 0);
					sigB.connect(lt, 0, 1);
					lt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(1);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					lt.dispose();
					done();
				});
				offline.run();
			});

			it("outputs 0 when first signal is greater than second", function(done){
				var sigA, sigB, lt;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(8.001);
					sigB = new Signal(8);
					lt = new LessThan();
					sigA.connect(lt, 0, 0);
					sigB.connect(lt, 0, 1);
					lt.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					lt.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});