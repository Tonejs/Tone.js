import Test from "helper/Test";
import Tone from "Tone/core/Tone";
import AudioNode from "Tone/core/AudioNode";
import PassAudio from "helper/PassAudio";
import Gain from "Tone/core/Gain";
import Oscillator from "Tone/source/Oscillator";
import Merge from "Tone/component/Merge";
import Split from "Tone/component/Split";
import Filter from "Tone/component/Filter";
import Offline from "helper/Offline";
import Signal from "Tone/signal/Signal";
import Supports from "helper/Supports";
import StereoSignal from "helper/StereoSignal";
import PanVol from "Tone/component/PanVol";
import EQ3 from "Tone/component/EQ3";

describe("AudioNode", function(){

	it("can be created and disposed", function(){
		var node = new AudioNode();
		node.dispose();
		Test.wasDisposed(node);
	});

	it("handles input and output connections", function(){
		var node = new AudioNode();
		node.createInsOuts(1, 1);
		node.connect(Test);
		Test.connect(node);
		node.dispose();
	});

	if (Supports.AUDIO_CONTEXT_CLOSE_RESOLVES){
		it("can be constructed with an options object", function(){
			var context = new AudioContext();
			var node = new AudioNode({
				"context" : context,
			});
			expect(node.context).to.be.equal(context);
			node.dispose();
			return context.close();
		});
	}

	it("reports its inputs and outputs", function(){
		var node0 = new AudioNode();
		node0.createInsOuts(3, 2);
		expect(node0.numberOfInputs).to.equal(3);
		expect(node0.numberOfOutputs).to.equal(2);
		node0.dispose();

		var node1 = new AudioNode();
		node1.createInsOuts(0, 1);
		expect(node1.numberOfInputs).to.equal(0);
		expect(node1.numberOfOutputs).to.equal(1);
		node1.dispose();

		var node2 = new AudioNode();
		node2.createInsOuts(1, 0);
		expect(node2.numberOfInputs).to.equal(1);
		expect(node2.numberOfOutputs).to.equal(0);
		node2.dispose();
	});

	it("is able to get and set the channelCount, channelCountMode and channelInterpretation", function(){
		var node0 = new AudioNode();
		node0.createInsOuts(1, 1);
		expect(node0.channelCount).to.equal(2);
		node0.channelCount = 1;
		expect(node0.channelCount).to.equal(1);
		node0.dispose();

		var node1 = new AudioNode();
		node1.createInsOuts(1, 1);
		expect(node1.channelCountMode).to.equal("max");
		node1.channelCountMode = "explicit";
		expect(node1.channelCountMode).to.equal("explicit");
		node1.dispose();

		var node2 = new AudioNode();
		node2.createInsOuts(1, 1);
		expect(node2.channelInterpretation).to.equal("speakers");
		node2.channelInterpretation = "discrete";
		expect(node2.channelInterpretation).to.equal("discrete");
		node2.dispose();
	});

	context("connections", function(){

		if (Supports.NODE_DISCONNECT){

			it("can disconnect with args", function(){
				var nodeA = Tone.context.createGain();
				var nodeB = Tone.context.createGain();
				nodeA.connect(nodeB, 0, 0);
				nodeA.disconnect(nodeB, 0, 0);
			});

			it("Tone nodes can disconnect with args", function(){
				var osc = new Oscillator();
				var gain = Tone.context.createGain();
				osc.connect(gain, 0, 0);
				osc.disconnect(gain, 0, 0);
				osc.dispose();
			});

			it("Tone nodes can disconnect from other Tone nodes with args", function(){
				var osc = new Oscillator();
				var filter = new Filter();
				osc.connect(filter, 0, 0);
				osc.disconnect(filter, 0, 0);
				osc.dispose();
			});

			it("can disconnect from a specific connection", function(){
				return PassAudio(function(input){
					var node = new Gain().toMaster();
					input.connect(node);
					input.disconnect(node);
				}).then(function(){
					return false;
				}).catch(function(){
					return true;
				});
			});

			it("can disconnect from a specific note and connection number", function(){
				return Offline(function(){
					var merge = new Merge().toMaster();
					var sig = new Signal(2).connect(merge, 0, 0);
					sig.connect(merge, 0, 1);
					sig.disconnect(merge, 0, 0);
				}, 0.05, 2).then(function(buffer){
					buffer.forEach(function(l, r){
						expect(l).to.equal(0);
						expect(r).to.equal(2);
					});
				});
			});

			it("can disconnect based on output number", function(){
				return Offline(function(){
					var merge = new Merge().toMaster();
					var split = new Split();
					split.connect(merge, 0, 0);
					split.connect(merge, 1, 1);
					var sig = new Signal(3).connect(split);
					split.disconnect(merge, 1);
				}, 0.05, 2).then(function(buffer){
					buffer.forEach(function(l, r){
						expect(l).to.equal(3);
						expect(r).to.equal(0);
					});
				});
			});

			it("can disconnect based on node name and output number", function(){
				return Offline(function(){
					var merge = new Merge().toMaster();
					var split = new Split().connect(merge, 0, 0);
					split.connect(merge, 1, 1);
					var sig = StereoSignal(3, 3).connect(split);
					split.disconnect(merge, 0, 0);
				}, 0.05, 2).then(function(buffer){
					buffer.forEach(function(l, r){
						expect(l).to.equal(0);
						expect(r).to.equal(3);
					});
				});
			});

			it("can disconnect from input node 2 levels deep in PanVol", function(){
				return Offline(function(){
					var merge = new Merge().toMaster();
					var split = new Split().connect(merge, 0, 0);
					split.connect(merge, 1, 1);
 					var panvol = new PanVol().connect(split);
					var sig = new Signal(3).connect(panvol);
					sig.disconnect(panvol);
 				}, 0.05, 2).then(function(buffer){
					buffer.forEach(function(l, r){
						expect(l).to.equal(0);
						expect(r).to.equal(0);
					});
				});
			});

 			it("can disconnect from input node 3 levels deep in EQ3", function(){
				return Offline(function(){
					var merge = new Merge().toMaster();
					var split = new Split().connect(merge, 0, 0);
					split.connect(merge, 1, 1);
 					var eq3 = new EQ3().connect(split);
					var sig = new Signal(3).connect(eq3);
					sig.disconnect(eq3);
 				}, 0.05, 2).then(function(buffer){
					buffer.forEach(function(l, r){
						expect(l).to.equal(0);
						expect(r).to.equal(0);
					});
				});
			});
		}

		it("'connect' returns the node connecting to", function(){
			var nodeA = Tone.context.createGain();
			var nodeB = Tone.context.createGain();
			expect(nodeA.connect(nodeB)).to.equal(nodeB);
		});

		it("connects two nodes", function(){
			return PassAudio(function(input){
				var node = new Gain().toMaster();
				input.connect(node);
			});
		});

		it("can chain connections", function(){
			return PassAudio(function(input){
				var node0 = new Gain();
				var node1 = new Gain().toMaster();
				input.chain(node0, node1);
			});
		});

		it("can fan connections", function(){
			return PassAudio(function(input){
				var node0 = new Gain().toMaster();
				var node1 = new Gain().toMaster();
				input.fan(node0, node1);
			});
		});
	});

});

