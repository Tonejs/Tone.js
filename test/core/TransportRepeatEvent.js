define(["Test", "Tone/core/TransportRepeatEvent", "Tone/core/Tone", "helper/Offline", "helper/PassAudio", "Tone/source/Oscillator", "Tone/core/AudioNode"],
	function (Test, TransportRepeatEvent, Tone, Offline, PassAudio, Oscillator, AudioNode) {

		describe("TransportRepeatEvent", function(){

			it("can be created and disposed", function(){
				return Offline(function(Transport){
					var event = new TransportRepeatEvent(Transport, {
						"time" : 0
					});
					event.dispose();
					Test.wasDisposed(event);
				});
			});

			it("generates a unique event ID", function(){
				return Offline(function(Transport){
					var event = new TransportRepeatEvent(Transport, {
						"time" : 0
					});
					expect(event.id).to.be.a("number");
					event.dispose();
				});
			});

			it("is removed from the Transport when disposed", function(){
				return Offline(function(Transport){
					var event = new TransportRepeatEvent(Transport, {
						"time" : 0
					});
					event.dispose();
					expect(Transport._timeline.length).to.equal(0);
				});
			});

		});
	});
