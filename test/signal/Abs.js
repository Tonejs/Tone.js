define(["Test", "Tone/signal/Abs", "helper/Basic", "Tone/signal/Signal", "helper/Offline"], 
function (Test, Abs, BasicTest, Signal, Offline) {

	describe("Abs", function(){

		BasicTest(Abs);

		context("Absolute Value", function(){

			it("handles input and output connections", function(){
				var abs = new Abs();
				Test.connect(abs);
				abs.connect(Test);
				abs.dispose();
			});

			it("outputs the same value for positive values", function(done){
				var signal, abs;
				var offline = new Offline(0.2);
				offline.before(function(dest){
					signal = new Signal(0.4);
					abs = new Abs();
					signal.connect(abs);
					abs.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.4, 0.01);
				});
				offline.after(function(){
					signal.dispose();
					abs.dispose();
					done();
				});
				offline.run();
			});

			it("outputs the absolute value for negative numbers", function(done){
				var signal, abs;
				var offline = new Offline(0.2);
				offline.before(function(dest){
					signal = new Signal(-0.3);
					abs = new Abs();
					signal.connect(abs);
					abs.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.3, 0.01);
				});
				offline.after(function(){
					signal.dispose();
					abs.dispose();
					done();
				});
				offline.run();
			});

		});

	});
});