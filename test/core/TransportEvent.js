define(["Test", "Tone/core/TransportEvent", "Tone/core/Tone", "helper/Offline", "helper/PassAudio", "Tone/source/Oscillator", "Tone/core/AudioNode"],
	function (Test, TransportEvent, Tone, Offline, PassAudio, Oscillator, AudioNode) {

		describe("TransportEvent", function(){

			it("can be created and disposed", function(){
				return Offline(function(Transport){
					var event = new TransportEvent(Transport, {
						"time" : 0
					});
					event.dispose();
					Test.wasDisposed(event);
				});
			});

			it("generates a unique event ID", function(){
				return Offline(function(Transport){
					var event = new TransportEvent(Transport, {
						"time" : 0
					});
					expect(event.id).to.be.a("number");
					event.dispose();
				});
			});
		});
	});
