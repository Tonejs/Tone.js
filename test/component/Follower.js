import Follower from "Tone/component/Follower";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import PassAudio from "helper/PassAudio";
import PassAudioStereo from "helper/PassAudioStereo";
describe("Follower", function(){

	Basic(Follower);

	context("Envelope Following", function(){

		it("handles input and output connections", function(){
			var follower = new Follower();
			Test.connect(follower);
			follower.connect(Test);
			follower.dispose();
		});

		it("handles getter/setter as Object", function(){
			var foll = new Follower();
			var values = {
				"smoothing" : 0.2,
			};
			foll.set(values);
			expect(foll.get()).to.have.keys(["smoothing"]);
			expect(foll.get().smoothing).to.be.closeTo(0.2, 0.001);
			foll.dispose();
		});

		it("can be constructed with an object", function(){
			var follower = new Follower({
				"smoothing" : 0.5,
			});
			expect(follower.smoothing).to.be.closeTo(0.5, 0.001);
			follower.dispose();
		});

		it("smoothes the incoming signal at 0.1", function(){
			return Offline(function(){
				var foll = new Follower(0.1).toMaster();
				var sig = new Signal(0);
				sig.connect(foll);
				sig.setValueAtTime(1, 0.1);
				sig.setValueAtTime(0, 0.3);
			}, 0.41).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.1)).to.be.closeTo(0.0, 0.01);
				expect(buffer.getValueAtTime(0.15)).to.be.closeTo(0.5, 0.2);
				expect(buffer.getValueAtTime(0.2)).to.be.closeTo(1, 0.2);
				expect(buffer.getValueAtTime(0.3)).to.be.closeTo(1, 0.2);
				expect(buffer.getValueAtTime(0.35)).to.be.closeTo(0.5, 0.2);
				expect(buffer.getValueAtTime(0.4)).to.be.closeTo(0, 0.2);
			});
		});

		it("smoothes the incoming signal at 0.05", function(){
			return Offline(function(){
				var foll = new Follower(0.05).toMaster();
				var sig = new Signal(0);
				sig.connect(foll);
				sig.setValueAtTime(1, 0.1);
				sig.setValueAtTime(0, 0.3);
			}, 0.41).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.1)).to.be.closeTo(0.0, 0.01);
				expect(buffer.getValueAtTime(0.125)).to.be.closeTo(0.5, 0.2);
				expect(buffer.getValueAtTime(0.15)).to.be.closeTo(1, 0.2);
				expect(buffer.getValueAtTime(0.3)).to.be.closeTo(1, 0.2);
				expect(buffer.getValueAtTime(0.325)).to.be.closeTo(0.5, 0.2);
				expect(buffer.getValueAtTime(0.35)).to.be.closeTo(0, 0.2);
			});
		});

		it("smoothes the incoming signal at 0.2", function(){
			return Offline(function(){
				var foll = new Follower(0.2).toMaster();
				var sig = new Signal(0);
				sig.connect(foll);
				sig.setValueAtTime(1, 0.1);
				sig.setValueAtTime(0, 0.3);
			}, 0.51).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.1)).to.be.closeTo(0.0, 0.01);
				expect(buffer.getValueAtTime(0.2)).to.be.closeTo(0.5, 0.2);
				expect(buffer.getValueAtTime(0.3)).to.be.closeTo(1, 0.2);
				expect(buffer.getValueAtTime(0.4)).to.be.closeTo(0.5, 0.2);
				expect(buffer.getValueAtTime(0.5)).to.be.closeTo(0, 0.2);
			});
		});

		/*it("smoothes the incoming signal at 0.5", function(){
			return Offline(function(){
				var foll = new Follower(0.5).toMaster();
				var sig = new Signal(0);
				sig.connect(foll);
				sig.setValueAtTime(1, 0.1);
				sig.setValueAtTime(0, 0.6);
			}, 1.11).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.1)).to.be.closeTo(0.0, 0.01);
				expect(buffer.getValueAtTime(0.35)).to.be.closeTo(0.5, 0.2);
				expect(buffer.getValueAtTime(0.6)).to.be.closeTo(1, 0.2);
				expect(buffer.getValueAtTime(0.85)).to.be.closeTo(0.5, 0.2);
				expect(buffer.getValueAtTime(1.1)).to.be.closeTo(0, 0.2);
			});
		});*/

		it("passes the incoming signal through", function(){
			var follower;
			return PassAudio(function(input){
				follower = new Follower().toMaster();
				input.connect(follower);
			});
		});

	});
});

