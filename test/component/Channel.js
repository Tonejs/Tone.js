import Channel from "Tone/component/Channel";
import Basic from "helper/Basic";
import PassAudio from "helper/PassAudio";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import Offline from "helper/Offline";
describe("Channel", function(){

	Basic(Channel);

	context("Channel", function(){

		it("handles input and output connections", function(){
			var solo = new Channel();
			Test.connect(solo);
			solo.connect(Test);
			solo.dispose();
		});

		it("can pass volume and panning into the constructor", function(){
			var channel = new Channel(-10, -1);
			expect(channel.pan.value).to.be.closeTo(-1, 0.01);
			expect(channel.volume.value).to.be.closeTo(-10, 0.01);
			channel.dispose();
		});

		it("can pass in an object into the constructor", function(){
			var channel = new Channel({
				pan : 1,
				volume : 6,
				mute : false,
				solo : true
			});
			expect(channel.pan.value).to.be.closeTo(1, 0.01);
			expect(channel.volume.value).to.be.closeTo(6, 0.01);
			expect(channel.mute).to.be.false;
			expect(channel.solo).to.be.true;
			channel.dispose();
		});
			
		it("passes the incoming signal through", function(){
			return PassAudio(function(input){
				var channel = new Channel().toMaster();
				input.connect(channel);
			});
		});

		it("can mute the input", function(){
			return Offline(function(){
				var channel = new Channel(0).toMaster();
				new Signal(1).connect(channel);
				channel.mute = true;
			}).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("reports itself as muted when either muted or another channel is soloed", function(){
			var channelA = new Channel();
			var channelB = new Channel();
			channelB.solo = true;
			expect(channelA.muted).to.be.true;
			expect(channelB.muted).to.be.false;
			channelB.mute = true;
			expect(channelA.muted).to.be.true;
			expect(channelB.muted).to.be.true;
			channelA.dispose();
			channelB.dispose();
		});

	});
});

