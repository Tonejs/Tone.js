define(["Tone/component/AmplitudeEnvelope", "helper/Basic", "helper/Offline", 
	"Tone/component/Envelope", "Test", "Tone/signal/Signal", "helper/Supports"], 
function (AmplitudeEnvelope, Basic, Offline, Envelope, Test, Signal, Supports) {
	describe("AmplitudeEnvelope", function(){

		Basic(AmplitudeEnvelope);

		context("Envelope", function(){


			it("handles input and output connections", function(){
				var ampEnv = new AmplitudeEnvelope();
				Test.connect(ampEnv);
				ampEnv.connect(Test);
				ampEnv.dispose();
			});

			it ("extends envelope", function(){
				var ampEnv = new AmplitudeEnvelope();
				expect(ampEnv).to.be.instanceOf(Envelope);
				ampEnv.dispose();
			});

			it ("passes no signal before being triggered", function(done){
				var ampEnv, signal;
				var offline = new Offline(0.1);
				offline.before(function(dest){
					ampEnv = new AmplitudeEnvelope().connect(dest);
					signal = new Signal(1).connect(ampEnv);
				});
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0, 0.001);
				});
				offline.after(function(){
					signal.dispose();
					ampEnv.dispose();
					done();
				});
				offline.run();
			});

			if (Supports.ACCURATE_SIGNAL_SCHEDULING){

				it ("passes signal once triggered", function(done){
					var ampEnv, signal;
					var offline = new Offline(0.2);
					offline.before(function(dest){
						ampEnv = new AmplitudeEnvelope().connect(dest);
						signal = new Signal(1).connect(ampEnv);
						ampEnv.triggerAttack(0.1);
					});
					offline.test(function(sample, time){
						if (time <= 0.1){
							expect(sample).to.be.closeTo(0, 0.001);
						} else {
							expect(sample).to.be.above(0);
						}
					});
					offline.after(function(){
						signal.dispose();
						ampEnv.dispose();
						done();
					});
					offline.run();
				});
			}
			
		});
	});
});