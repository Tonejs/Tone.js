define(["helper/Test", "Tone/signal/Zero", "helper/Basic", "Tone/signal/Signal", "helper/ConstantOutput"], 
	function(Test, Zero, BasicTest, Signal, ConstantOutput){

		describe("Zero", function(){

			BasicTest(Zero);

			context("Zero", function(){

				it("handles output connections", function(){
					var abs = new Zero();
					abs.connect(Test);
					abs.dispose();
				});

				it("always outputs 0", function(){
					return ConstantOutput(function(){
						new Zero().toMaster();
					}, 0, 0);
				});

			});

		});
	});
