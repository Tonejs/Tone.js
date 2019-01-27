import OutputAudio from "helper/OutputAudio";
import Oscillator from "Tone/source/Oscillator";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Tone from "Tone/core/Tone";

export default function(Constr, args){

	context("Oscillator Tests", function(){

		it("can be created with an options object", function(){
			var instance = new Constr({
				"frequency" : 200,
				"detune" : -20
			});
			expect(instance.frequency.value).to.equal(200);
			expect(instance.detune.value).to.equal(-20);
			instance.dispose();
		});

		it("can set/set the frequency", function(){
			var instance = new Constr(args);
			instance.frequency.value = 110;
			expect(instance.frequency.value).to.equal(110);
			instance.start();
			instance.frequency.value = 220;
			expect(instance.frequency.value).to.equal(220);
			instance.dispose();
		});

		it("can set/set the detune", function(){
			var instance = new Constr(args);
			instance.detune.value = -50;
			expect(instance.detune.value).to.equal(-50);
			instance.start();
			instance.detune.value = 92;
			expect(instance.detune.value).to.equal(92);
			instance.dispose();
		});

		it("can connect to detune and frequency", function(){
			var instance = new Constr(args);
			Test.connect(instance.frequency);
			Test.connect(instance.detune);
			instance.dispose();
		});

		it("can get/set the phase", function(){
			var osc = new Constr({
				"phase" : 180,
			});
			expect(osc.phase).to.be.closeTo(180, 0.001);
			osc.phase = 270;
			expect(osc.phase).to.be.closeTo(270, 0.001);
			osc.dispose();
		});

		it("has a restart method", function(){
			var osc = new Constr();
			expect(osc.restart).to.exist;
			expect(osc.restart).is.not.equal(Tone.noOp);
			osc.dispose();
		});

		it("does not clip in volume", function(){
			return Offline(function(){
				new Constr(args).toMaster().start(0);
			}).then(function(buffer){
				expect(buffer.max()).to.be.at.most(1);
			});
		});

	});

}

