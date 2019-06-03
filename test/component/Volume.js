import Volume from "Tone/component/Volume";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import PassAudio from "helper/PassAudio";
import PassAudioStereo from "helper/PassAudioStereo";
describe("Volume", function(){

	Basic(Volume);

	context("Volume", function(){

		it("handles input and output connections", function(){
			var vol = new Volume();
			Test.connect(vol);
			vol.connect(Test);
			vol.dispose();
		});

		it("can be constructed with volume value", function(){
			var vol = new Volume(-12);
			expect(vol.volume.value).to.be.closeTo(-12, 0.1);
			vol.dispose();
		});

		it("can be constructed with an options object", function(){
			var vol = new Volume({
				"volume" : 2
			});
			expect(vol.volume.value).to.be.closeTo(2, 0.1);
			vol.dispose();
		});

		it("can be constructed with an options object and muted", function(){
			var vol = new Volume({
				"mute" : true
			});
			expect(vol.mute).to.be.true;
			vol.dispose();
		});

		it("can set/get with an object", function(){
			var vol = new Volume();
			vol.set({
				"volume" : -10
			});
			expect(vol.get().volume).to.be.closeTo(-10, 0.1);
			vol.dispose();
		});

		it("unmuting returns to previous volume", function(){
			var vol = new Volume(-10);
			vol.mute = true;
			expect(vol.mute).to.be.true;
			expect(vol.volume.value).to.equal(-Infinity);
			vol.mute = false;
			//returns the volume to what it was
			expect(vol.volume.value).to.be.closeTo(-10, 0.1);
			vol.dispose();
		});

		it("passes the incoming signal through", function(){
			return PassAudio(function(input){
				var vol = new Volume().toMaster();
				input.connect(vol);
			});
		});

		it("passes the incoming stereo signal through", function(){
			return PassAudioStereo(function(input){
				var vol = new Volume().toMaster();
				input.connect(vol);
			});
		});

		it("can lower the volume", function(){
			return Offline(function(){
				var vol = new Volume(-10).toMaster();
				new Signal(1).connect(vol);
			}).then(function(buffer){
				buffer.getRMS().forEach(function(level){
					expect(level).to.be.closeTo(0.315, 0.01);
				});
			});
		});

		it("can mute the volume", function(){
			return Offline(function(){
				var vol = new Volume(0).toMaster();
				new Signal(1).connect(vol);
				vol.mute = true;
			}).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("muted when volume is set to -Infinity", function(){
			return Offline(function(){
				var vol = new Volume(-Infinity).toMaster();
				new Signal(1).connect(vol);
				expect(vol.mute).to.be.true;
			}).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("setting the volume unmutes it and reports itself as unmuted", function(){
			var vol = new Volume(0).toMaster();
			vol.mute = true;
			expect(vol.mute).to.be.true;
			vol.volume.value = 0;
			expect(vol.mute).to.be.false;
			vol.dispose();
		});

		it("multiple calls to mute still return the vol to the original", function(){
			var vol = new Volume(-20);
			vol.mute = true;
			vol.mute = true;
			expect(vol.mute).to.be.true;
			expect(vol.volume.value).to.equal(-Infinity);
			vol.mute = false;
			vol.mute = false;
			expect(vol.volume.value).to.be.closeTo(-20, 0.5);
			vol.dispose();
		});

	});
});

