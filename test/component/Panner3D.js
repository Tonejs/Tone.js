import Test from "helper/Test";
import Panner3D from "Tone/component/Panner3D";
import PassAudio from "helper/PassAudio";

describe("Panner3D", function(){

	it("passes the incoming signal through", function(){
		return PassAudio(function(input){
			var panner = new Panner3D().toMaster();
			input.connect(panner);
		});
	});

	it("can get/set the position individually", function(){
		var panner = new Panner3D();
		panner.positionX = 10;
		expect(panner.positionX).to.equal(10);
		panner.positionY = 20;
		expect(panner.positionY).to.equal(20);
		panner.positionZ = -1;
		expect(panner.positionZ).to.equal(-1);
		panner.dispose();
	});

	it("can get/set the orientation individually", function(){
		var panner = new Panner3D();
		panner.orientationX = 2;
		expect(panner.orientationX).to.equal(2);
		panner.orientationY = 4;
		expect(panner.orientationY).to.equal(4);
		panner.orientationZ = -3;
		expect(panner.orientationZ).to.equal(-3);
		panner.dispose();
	});

	it("can get/set the position through setPosition", function(){
		var panner = new Panner3D();
		panner.setPosition(3, -11, 2);
		expect(panner.positionX).to.equal(3);
		expect(panner.positionY).to.equal(-11);
		expect(panner.positionZ).to.equal(2);
		panner.dispose();
	});

	it("can get/set the orientation through setOrientation", function(){
		var panner = new Panner3D();
		panner.setOrientation(2, -1, 0.5);
		expect(panner.orientationX).to.equal(2);
		expect(panner.orientationY).to.equal(-1);
		expect(panner.orientationZ).to.equal(0.5);
		panner.dispose();
	});

	it("can get/set all of the other attributes", function(){
		var values = {
			"panningModel" : "HRTF",
			"maxDistance" : 10002,
			"distanceModel" : "exponential",
			"coneOuterGain" : 0.3,
			"coneOuterAngle" : 280,
			"coneInnerAngle" : 120,
			"refDistance" : 0.3,
			"rolloffFactor" : 3
		};
		var panner = new Panner3D();
		for (var v in values){
			panner[v] = values[v];
			expect(panner[v]).to.equal(values[v]);
		}
		panner.dispose();
	});
		
});

