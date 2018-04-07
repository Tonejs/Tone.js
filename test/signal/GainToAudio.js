define(["helper/ConstantOutput", "Tone/signal/GainToAudio", "helper/Basic", 
	"Test", "Tone/signal/Signal", "Tone/signal/Zero"], 
function (ConstantOutput, GainToAudio, Basic, Test, Signal, Zero) {

	describe("GainToAudio", function(){

		Basic(GainToAudio);

		context("Gain To Audio", function(){

			it("handles input and output connections", function(){
				var g2a = new GainToAudio();
				Test.connect(g2a);
				g2a.connect(Test);
				g2a.dispose();
			});

			it("outputs 0 for an input value of 0.5", function(){
				return ConstantOutput(function(){
					var sig = new Signal(0.5);
					var g2a = new GainToAudio();
					sig.connect(g2a);
					g2a.toMaster();
				}, 0); 
			});

			it("outputs 1 for an input value of 1", function(){
				return ConstantOutput(function(){
					var sig = new Signal(1);
					var g2a = new GainToAudio();
					sig.connect(g2a);
					g2a.toMaster();
				}, 1); 
			});

			it("outputs -1 for an input value of 0", function(){
				return ConstantOutput(function(){
					var sig = new Zero();
					var g2a = new GainToAudio();
					sig.connect(g2a);
					g2a.toMaster();
				}, -1); 
			});
		});
	});
});
