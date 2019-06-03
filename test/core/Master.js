import Test from "helper/Test";
import Master from "Tone/core/Master";
import Tone from "Tone/core/Tone";
import Offline from "helper/Offline";
import PassAudio from "helper/PassAudio";
import Oscillator from "Tone/source/Oscillator";
import AudioNode from "Tone/core/AudioNode";
import Gain from "Tone/core/Gain";

describe("Master", function(){
	it("exists", function(){
		expect(Tone.Master).to.exist;
	});

	it("provides a toMaster method", function(){
		expect(AudioNode.prototype.toMaster).is.a("function");
		var gain = new Gain();
		expect(gain.toMaster).is.a("function");
		gain.toMaster();
	});

	it("attaches itself to the context", function(){
		expect(Tone.context.master).equals(Tone.Master);
		expect(Tone.context.destination).equals(Tone.Master);
	});

	it("can be muted and unmuted", function(){
		Tone.Master.mute = false;
		expect(Tone.Master.mute).to.be.false;
		Tone.Master.mute = true;
		expect(Tone.Master.mute).to.be.true;
	});

	it("passes audio through", function(){
		return PassAudio(function(input){
			input.toMaster();
		});
	});

	it("passes no audio when muted", function(){
		return Offline(function(){
			new Oscillator().toMaster().start(0);
			Tone.Master.mute = true;
		}).then(function(buffer){
			expect(buffer.isSilent()).to.be.true;
		});
	});

	it("has a master volume control", function(){
		return Offline(function(){
			Tone.Master.volume.value = -20;
			expect(Tone.Master.volume.value).to.be.closeTo(-20, 0.1);
		});
	});

	it("can pass audio through chained nodes", function(){
		return PassAudio(function(input){
			var gain = Tone.context.createGain();
			input.connect(gain);
			Tone.Master.chain(gain);
		});
	});
});

