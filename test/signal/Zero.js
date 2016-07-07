define(["Test", "Tone/signal/Zero", "helper/Basic", "Tone/signal/Signal", "helper/Offline"], 
function (Test, Zero, BasicTest, Signal, Offline) {

	describe("Zero", function(){

		BasicTest(Zero);

		context("Zero", function(){

			it("handles output connections", function(){
				var abs = new Zero();
				abs.connect(Test);
				abs.dispose();
			});

			it("always outputs 0", function(done){
				var zero;
				var offline = new Offline(0.2);
				offline.before(function(dest){
					zero = new Zero();
					zero.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					zero.dispose();
					done();
				});
				offline.run();
			});

		});

	});
});