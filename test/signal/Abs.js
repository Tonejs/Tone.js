define(["Test", "Tone/signal/Abs", "helper/Basic", "Tone/signal/Signal", "helper/ConstantOutput"],
	function (Test, Abs, BasicTest, Signal, ConstantOutput) {

		describe("Abs", function(){

			BasicTest(Abs);

			context("Absolute Value", function(){

				it("handles input and output connections", function(){
					var abs = new Abs();
					Test.connect(abs);
					abs.connect(Test);
					abs.dispose();
				});

				it("outputs the same value for positive values", function(){
					return ConstantOutput(function(){
						var signal = new Signal(0.4);
						var abs = new Abs();
						signal.connect(abs);
						abs.toMaster();
					}, 0.4);
				});

				it("outputs 0 when the input is 0", function(){
					return ConstantOutput(function(){
						var signal = new Signal(0);
						var abs = new Abs();
						signal.connect(abs);
						abs.toMaster();
					}, 0);
				});

				it("outputs the absolute value for negative numbers", function(){
					return ConstantOutput(function(){
						var signal = new Signal(-0.3);
						var abs = new Abs();
						signal.connect(abs);
						abs.toMaster();
					}, 0.3);
				});

			});

		});
	});
