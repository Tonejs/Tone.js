import Panner from "Tone/component/Panner";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import PassAudio from "helper/PassAudio";
import PassAudioStereo from "helper/PassAudioStereo";
import Merge from "Tone/component/Merge";
import Tone from "Tone/core/Tone";
import AudioNode from "Tone/core/AudioNode";
import Supports from "helper/Supports";

describe("Panner", function(){

	Basic(Panner);

	context("Panning", function(){

		it("handles input and output connections", function(){
			var panner = new Panner();
			Test.connect(panner);
			panner.connect(Test);
			panner.dispose();
		});

		it("can be constructed with the panning value", function(){
			var panner = new Panner(0.3);
			expect(panner.pan.value).to.be.closeTo(0.3, 0.001);
			panner.dispose();
		});

		it("can be constructed with an options object", function(){
			var panner = new Panner({
				"pan" : 0.5
			});
			expect(panner.pan.value).to.be.closeTo(0.5, 0.001);
			panner.dispose();
		});

		it("passes the incoming signal through", function(){
			return PassAudio(function(input){
				var panner = new Panner().toMaster();
				input.connect(panner);
			});
		});

		it("passes the incoming stereo signal through", function(){
			return PassAudioStereo(function(input){
				var panner = new Panner().toMaster();
				input.connect(panner);
			});
		});

		it("pans hard left when the pan is set to -1", function(){
			return Offline(function(){
				var panner = new Panner(-1).toMaster();
				new Signal(1).connect(panner);
			}, 0.1, 2).then(function(buffer){
				buffer.forEach(function(l, r){
					expect(l).to.be.closeTo(1, 0.01);
					expect(r).to.be.closeTo(0, 0.01);
				});
			});
		});

		it("pans hard right when the pan is set to 1", function(){
			return Offline(function(){
				var panner = new Panner(1).toMaster();
				new Signal(1).connect(panner);
			}, 0.1, 2).then(function(buffer){
				buffer.forEach(function(l, r){
					expect(l).to.be.closeTo(0, 0.01);
					expect(r).to.be.closeTo(1, 0.01);
				});
			});
		});

		it("mixes the signal in equal power when panned center", function(){
			return Offline(function(){
				var panner = new Panner(0).toMaster();
				new Signal(1).connect(panner);
			}, 0.1, 2).then(function(buffer){
				buffer.forEach(function(l, r){
					expect(l).to.be.closeTo(0.707, 0.01);
					expect(r).to.be.closeTo(0.707, 0.01);
				});
			});
		});
	});
});

