import PingPongDelay from "Tone/effect/PingPongDelay";
import Basic from "helper/Basic";
import EffectTests from "helper/EffectTests";

describe("PingPongDelay", function(){

	Basic(PingPongDelay);
	EffectTests(PingPongDelay, 0.01);

	context("API", function(){

		it("can pass in options in the constructor", function(){
			var pingPong = new PingPongDelay({
				"delayTime" : 0.2,
			});
			expect(pingPong.delayTime.value).to.be.closeTo(0.2, 0.01);
			pingPong.dispose();
		});

		it("can get/set the options", function(){
			var pingPong = new PingPongDelay();
			pingPong.set({
				"delayTime" : 0.21,
			});
			expect(pingPong.get().delayTime).to.be.closeTo(0.21, 0.01);
			pingPong.dispose();
		});
	});
});

