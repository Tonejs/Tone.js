define(["Tone/component/Panner", "helper/Basic", "helper/Offline", "Test", "Tone/signal/Signal",
	"helper/PassAudio", "helper/PassAudioStereo", "Tone/component/Merge",
	"Tone/core/Tone", "Tone/core/AudioNode", "helper/Supports"],
function (Panner, Basic, Offline, Test, Signal, PassAudio, PassAudioStereo, Merge, Tone, AudioNode, Supports) {

	describe("Panner", function(){

		Basic(Panner);

		context("Panning", function(){

			it("handles input and output connections", function(){
				var panner = new Panner();
				Test.connect(panner);
				panner.connect(Test);
				panner.dispose();
			});

			it("can be constructed with the panning value", function(){
				var panner = new Panner(0.3);
				expect(panner.pan.value).to.be.closeTo(0.3, 0.001);
				panner.dispose();
			});

			it("passes the incoming signal through", function(){
				return PassAudio(function(input){
					var panner = new Panner().toMaster();
					input.connect(panner);
				});
			});

			it("passes the incoming stereo signal through", function(){
				return PassAudioStereo(function(input){
					var panner = new Panner().toMaster();
					input.connect(panner);
				});
			});

			it("pans hard left when the pan is set to -1", function(){
				return Offline(function(){
					var panner = new Panner(-1).toMaster();
					new Signal(1).connect(panner);
				}, 0.1, 2).then(function(buffer){
					buffer.forEach(function(l, r){
						expect(l).to.be.closeTo(1, 0.01);
						expect(r).to.be.closeTo(0, 0.01);
					});
				});
			});

			it("pans hard right when the pan is set to 1", function(){
				return Offline(function(){
					var panner = new Panner(1).toMaster();
					new Signal(1).connect(panner);
				}, 0.1, 2).then(function(buffer){
					buffer.forEach(function(l, r){
						expect(l).to.be.closeTo(0, 0.01);
						expect(r).to.be.closeTo(1, 0.01);
					});
				});
			});

			if (Supports.EQUAL_POWER_PANNER){
				it("mixes the signal in equal power when panned center", function(){
					return Offline(function(){
						var panner = new Panner(0).toMaster();
						new Signal(1).connect(panner);
					}, 0.1, 2).then(function(buffer){
						buffer.forEach(function(l, r){
							expect(l).to.be.closeTo(0.707, 0.01);
							expect(r).to.be.closeTo(0.707, 0.01);
						});
					});
				});
			}
		});
	});
});
