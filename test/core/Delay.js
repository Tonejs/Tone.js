import Test from "helper/Test";
import Tone from "Tone/core/Tone";
import Delay from "Tone/core/Delay";
import PassAudio from "helper/PassAudio";

describe("Delay", function(){

	it("can be created and disposed", function(){
		var delay = new Delay();
		delay.dispose();
		Test.wasDisposed(delay);
	});

	it("handles input and output connections", function(){
		var delay = new Delay();
		delay.connect(Test);
		Test.connect(delay);
		Test.connect(delay.delayTime);
		delay.dispose();
	});

	it("can set delay time", function(){
		var delay = new Delay();
		delay.delayTime.value = 0.2;
		expect(delay.delayTime.value).to.be.closeTo(0.2, 0.001);
		delay.dispose();
	});

	it("can be constructed with an options object", function(){
		var delay = new Delay({
			"delayTime" : 0.3,
			"maxDelay" : 2
		});
		expect(delay.delayTime.value).to.be.closeTo(0.3, 0.001);
		expect(delay.maxDelay).to.equal(2);
		delay.dispose();
	});

	it("if the constructor delay time is greater than maxDelay, use that as the maxDelay time", function(){
		var delay = new Delay(3);
		expect(delay.delayTime.value).to.be.closeTo(3, 0.001);
		delay.dispose();
	});

	it("can returns state from 'get' method", function(){
		var delay = new Delay({
			"delayTime" : 0.4,
			"maxDelay" : 2
		});
		var values = delay.get();
		expect(values.delayTime).to.be.closeTo(0.4, 0.001);
		delay.dispose();
	});

	it("accepts Time in constructor", function(){
		var delay = new Delay("4n");
		expect(delay.delayTime.value).to.be.closeTo(delay.toSeconds("4n"), 0.001);
		delay.dispose();
	});

	it("accepts Time in options object", function(){
		var delay = new Delay({
			"delayTime" : "8t"
		});
		expect(delay.delayTime.value).to.be.closeTo(delay.toSeconds("8t"), 0.001);
		delay.dispose();
	});

	it("can set Time", function(){
		var delay = new Delay();
		delay.delayTime.value = "16n";
		expect(delay.delayTime.value).to.be.closeTo(delay.toSeconds("16n"), 0.001);
		delay.dispose();
	});

	it("passes audio through", function(){
		return PassAudio(function(input){
			var delay = new Delay(0).toMaster();
			input.connect(delay);
		});
	});

});

