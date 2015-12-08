define(["helper/Offline", "helper/Basic", "Tone/signal/Add", "Tone/signal/Signal", "Test"], 
function (Offline, Basic, Add, Signal, Test) {
	describe("Add", function(){

		Basic(Add);

		context("Addition", function(){

			it("handles input and output connections", function(){
				var add = new Add();
				Test.connect(add);
				Test.connect(add, 0);
				Test.connect(add, 1);
				add.connect(Test);
				add.dispose();
			});

			it("correctly sums a signal and a number", function(done){
				var signal, adder;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(0);
					adder = new Add(3);
					signal.connect(adder);
					adder.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.closeTo(3, 0.01);
				});
				offline.after(function(){
					signal.dispose();
					adder.dispose();
					done();
				});
				offline.run();
			});

			it("can handle negative values", function(done){
				var signal, adder;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(10);
					adder = new Add(-1);
					signal.connect(adder);
					adder.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.closeTo(9, 0.01);
				});
				offline.after(function(){
					signal.dispose();
					adder.dispose();
					done();
				});
				offline.run();
			});

			it("can sum two signals", function(done){
				var sigA, sigB, adder;
				var offline = new Offline();
				offline.before(function(dest){
					sigA = new Signal(1);
					sigB = new Signal(4);
					adder = new Add();
					sigA.connect(adder, 0, 0);
					sigB.connect(adder, 0, 1);
					adder.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.closeTo(5, 0.01);
				});
				offline.after(function(){
					sigA.dispose();
					sigB.dispose();
					adder.dispose();
					done();
				});
				offline.run();
			});
		});
	})
});