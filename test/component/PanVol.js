import PanVol from "Tone/component/PanVol";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import PassAudio from "helper/PassAudio";
import PassAudioStereo from "helper/PassAudioStereo";
import Merge from "Tone/component/Merge";
describe("PanVol", function(){

	Basic(PanVol);

	context("Pan and Volume", function(){

		it("handles input and output connections", function(){
			var panVol = new PanVol();
			Test.connect(panVol);
			panVol.connect(Test);
			panVol.dispose();
		});

		it("can be constructed with the panning and volume value", function(){
			var panVol = new PanVol(0.3, -12);
			expect(panVol.pan.value).to.be.closeTo(0.3, 0.001);
			expect(panVol.volume.value).to.be.closeTo(-12, 0.1);
			panVol.dispose();
		});

		it("can be constructed with an options object", function(){
			var panVol = new PanVol({
				"pan" : 0.2,
				"mute" : true
			});
			expect(panVol.pan.value).to.be.closeTo(0.2, 0.001);
			expect(panVol.mute).to.be.true;
			panVol.dispose();
		});

		it("can set/get with an object", function(){
			var panVol = new PanVol();
			panVol.set({
				"volume" : -10
			});
			expect(panVol.get().volume).to.be.closeTo(-10, 0.1);
			panVol.dispose();
		});

		it("passes the incoming signal through", function(){
			return PassAudio(function(input){
				var panVol = new PanVol().toMaster();
				input.connect(panVol);
			});
		});

		it("passes the incoming stereo signal through", function(){
			return PassAudioStereo(function(input){
				var panVol = new PanVol().toMaster();
				input.connect(panVol);
			});
		});

		it("can mute the volume", function(){
			return Offline(function(){
				var vol = new PanVol(0).toMaster();
				new Signal(1).connect(vol);
				vol.mute = true;
			}).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

	});
});

