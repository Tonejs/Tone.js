import Test from "helper/Test";
import TransportRepeatEvent from "Tone/core/TransportRepeatEvent";
import Tone from "Tone/core/Tone";
import Offline from "helper/Offline";
import PassAudio from "helper/PassAudio";
import Oscillator from "Tone/source/Oscillator";
import AudioNode from "Tone/core/AudioNode";

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

