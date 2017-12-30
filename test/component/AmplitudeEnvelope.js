define(["Tone/component/AmplitudeEnvelope", "helper/Basic", "helper/Offline", 
	"Tone/component/Envelope", "Test", "Tone/signal/Signal"], 
function (AmplitudeEnvelope, Basic, Offline, Envelope, Test, Signal) {
	describe("AmplitudeEnvelope", function(){

		Basic(AmplitudeEnvelope);

		context("Envelope", function(){

			it("handles input and output connections", function(){
				var ampEnv = new AmplitudeEnvelope();
				Test.connect(ampEnv);
				ampEnv.connect(Test);
				ampEnv.dispose();
			});

			it("extends envelope", function(){
				var ampEnv = new AmplitudeEnvelope();
				expect(ampEnv).to.be.instanceOf(Envelope);
				ampEnv.dispose();
			});

			it("passes no signal before being triggered", function(){
				return Offline(function(){
					var ampEnv = new AmplitudeEnvelope().toMaster();
					new Signal(1).connect(ampEnv);
				}).then(function(buffer){
					expect(buffer.isSilent()).to.be.true;
				});
			});

			it("passes signal once triggered", function(){
				return Offline(function(){
					var ampEnv = new AmplitudeEnvelope().toMaster();
					new Signal(1).connect(ampEnv);
					ampEnv.triggerAttack(0.1);
				}, 0.2).then(function(buffer){
					expect(buffer.getFirstSoundTime()).to.be.closeTo(0.1, 0.001);
				});
			});
		});
	});
});
