define(["Tone/component/Gate", "helper/Basic", "helper/Offline", "Test",
	"Tone/signal/Signal", "helper/PassAudio", "Tone/type/Type"],
function (Gate, Basic, Offline, Test, Signal, PassAudio, Tone) {
	describe("Gate", function(){

		Basic(Gate);

		context("Signal Gating", function(){

			it("handles input and output connections", function(){
				var gate = new Gate();
				Test.connect(gate);
				gate.connect(Test);
				gate.dispose();
			});

			it("handles getter/setter as Object", function(){
				var gate = new Gate();
				var values = {
					"attack" : 0.2,
					"release" : 0.4,
					"threshold" : -20
				};
				gate.set(values);
				expect(gate.get().attack).to.be.closeTo(0.2, 0.001);
				expect(gate.get().release).to.be.closeTo(0.4, 0.001);
				expect(gate.get().threshold).to.be.closeTo(-20, 0.1);
				gate.dispose();
			});

			it("can be constructed with an object", function(){
				var gate = new Gate({
					"release" : 0.3,
					"threshold" : -5
				});
				expect(gate.release).to.be.closeTo(0.3, 0.001);
				expect(gate.threshold).to.be.closeTo(-5, 0.1);
				gate.dispose();
			});

			it("gates the incoming signal when below the threshold", function(){
				return Offline(function(){
					var gate = new Gate(-9);
					var sig = new Signal(-10, Tone.Type.Decibels);
					sig.connect(gate);
					gate.toMaster();
				}).then(function(buffer){
					expect(buffer.isSilent()).to.be.true;
				});
			});

			it("passes the incoming signal when above the threshold", function(){
				it("gates the incoming signal when below the threshold", function(){
					return Offline(function(){
						var gate = new Gate(-11);
						var sig = new Signal(-10, Tone.Type.Decibels);
						sig.connect(gate);
						gate.toMaster();
					}).then(function(buffer){
						expect(buffer.min()).to.be.above(0);
					});
				});
			});

		});
	});
});
