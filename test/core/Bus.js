import Test from "helper/Test";
import Bus from "Tone/core/Bus";
import Tone from "Tone/core/Tone";
import Offline from "helper/Offline";
import PassAudio from "helper/PassAudio";
import Signal from "Tone/signal/Signal";
import Gain from "Tone/core/Gain";
import Merge from "Tone/component/Merge";

describe("Bus", function(){
	it("provides a send and receive method", function(){
		expect(Tone.prototype.send).is.a("function");
		expect(Tone.prototype.receive).is.a("function");
	});

	it("passes audio from a send to a receive with the same name", function(){
		return PassAudio(function(input){
			//make them pass through nodes
			var send = new Gain();
			var recv = new Gain().toMaster();
			input.connect(send);
			send.send("test");
			recv.receive("test");
		});
	});

	it("can create the recieve before the send", function(){
		return PassAudio(function(input){
			//make them pass through nodes
			var send = new Gain();
			var recv = new Gain().toMaster();
			input.connect(send);
			recv.receive("test");
			send.send("test");
		});
	});

	it("passes audio from a send to a receive at the given level", function(){
		return Offline(function(){
			var sig = new Signal(1);
			var recv = new Gain().toMaster();
			sig.send("test", -12);
			recv.receive("test");
		}, 0.05).then(function(buffer){
			buffer.forEach(function(sample){
				expect(sample).to.be.closeTo(0.25, 0.1);
			});
		});
	});

	it("can receive from a specific channel", function(){
		return Offline(function(){
			var sig = new Signal(2);
			var recv = new Merge().toMaster();
			sig.send("test");
			recv.receive("test", 1);
		}, 0.05, 2).then(function(buffer){
			buffer.forEach(function(l, r){
				expect(l).to.be.closeTo(0, 0.01);
				expect(r).to.be.closeTo(2, 0.01);
			});
		});
	});
});

