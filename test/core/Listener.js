import Test from "helper/Test";
import Listener from "Tone/core/Listener";
import Tone from "Tone/core/Tone";

describe("Listener", function(){

	afterEach(function(){
		Tone.Listener.setPosition(0, 0, 0);
		Tone.Listener.setOrientation(0, 0, 0, 0, 0, 0, 0);
	});

	it("exists", function(){
		expect(Tone.Listener).to.exist;
	});

	it("can get/set the position individually", function(){
		Tone.Listener.positionX = 10;
		expect(Tone.Listener.positionX).to.equal(10);
		Tone.Listener.positionY = 20;
		expect(Tone.Listener.positionY).to.equal(20);
		Tone.Listener.positionZ = -1;
		expect(Tone.Listener.positionZ).to.equal(-1);
	});

	it("can get/set the forward/up individually", function(){
		Tone.Listener.forwardX = 2;
		expect(Tone.Listener.forwardX).to.equal(2);
		Tone.Listener.forwardY = 4;
		expect(Tone.Listener.forwardY).to.equal(4);
		Tone.Listener.forwardZ = -3;
		expect(Tone.Listener.forwardZ).to.equal(-3);
		Tone.Listener.upX = 1;
		expect(Tone.Listener.upX).to.equal(1);
		Tone.Listener.upY = 0.2;
		expect(Tone.Listener.upY).to.equal(0.2);
		Tone.Listener.upZ = -0.3;
		expect(Tone.Listener.upZ).to.equal(-0.3);
	});

	it("can get/set the position through setPosition", function(){
		Tone.Listener.setPosition(2, -10, 0);
		expect(Tone.Listener.positionX).to.equal(2);
		expect(Tone.Listener.positionY).to.equal(-10);
		expect(Tone.Listener.positionZ).to.equal(0);
	});

	it("can get/set the orientation through setOrientation", function(){
		Tone.Listener.setOrientation(2, -1, 0.5, 0.1, 0.3, 0.2);
		expect(Tone.Listener.forwardX).to.equal(2);
		expect(Tone.Listener.forwardY).to.equal(-1);
		expect(Tone.Listener.forwardZ).to.equal(0.5);
		expect(Tone.Listener.upX).to.equal(0.1);
		expect(Tone.Listener.upY).to.equal(0.3);
		expect(Tone.Listener.upZ).to.equal(0.2);
	});
		
});

