import { expect } from "chai";
import { Merge } from "Tone/component";
import { Split } from "Tone/component/channel/Split";
import { Oscillator } from "Tone/source";
import { Gain } from "./Gain";

describe("ToneAudioNode", () => {

	context("constructor", () => {
		it("can be created and disposed", () => {
			const node = new Gain();
			node.dispose();
		});
	});

	context("properties", () => {

		it("reports its inputs and outputs", () => {
			const node = new Gain();
			expect(node.numberOfInputs).to.equal(1);
			expect(node.numberOfOutputs).to.equal(1);
			node.dispose();
		});

		it("get/set channelCount", () => {
			const node = new Gain();
			expect(node.channelCount).to.equal(2);
			node.channelCount = 1;
			expect(node.channelCount).to.equal(1);
			node.dispose();
		});

		it("get/set channelCountMode", () => {
			const node = new Gain();
			expect(node.channelCountMode).to.equal("max");
			node.channelCountMode = "explicit";
			expect(node.channelCountMode).to.equal("explicit");
			node.dispose();
		});

		it("get/set channelInterpretation", () => {
			const node = new Gain();
			expect(node.channelInterpretation).to.equal("speakers");
			node.channelInterpretation = "discrete";
			expect(node.channelInterpretation).to.equal("discrete");
			node.dispose();
		});

		it("reports its inputs and outputs", () => {
			const node0 = new Merge({
				channels: 4,
			});
			expect(node0.numberOfInputs).to.equal(4);
			expect(node0.numberOfOutputs).to.equal(1);
			node0.dispose();

			const node1 = new Split(4);
			expect(node1.numberOfInputs).to.equal(1);
			expect(node1.numberOfOutputs).to.equal(4);
			node1.dispose();

			const node2 = new Oscillator();
			expect(node2.numberOfInputs).to.equal(0);
			expect(node2.numberOfOutputs).to.equal(1);
			node2.dispose();
		});

		it("is able to get and set the channelCount, channelCountMode and channelInterpretation", () => {
			const gainNode = new Gain();

			expect(gainNode.channelCount).to.equal(2);
			gainNode.channelCount = 1;
			expect(gainNode.channelCount).to.equal(1);

			expect(gainNode.channelInterpretation).to.equal("speakers");
			gainNode.channelInterpretation = "discrete";
			expect(gainNode.channelInterpretation).to.equal("discrete");

			expect(gainNode.channelCountMode).to.equal("max");
			gainNode.channelCountMode = "clamped-max";
			expect(gainNode.channelCountMode).to.equal("clamped-max");
			gainNode.dispose();
		});
	});

	context("methods", () => {
		it("toDestination()", () => {
			const node = new Gain();
			node.toDestination();
			node.dispose();
		});

		it("connect()", () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			nodeA.connect(nodeB);
			nodeA.dispose();
			nodeB.dispose();
		});

		it("disconnect()", () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			nodeA.connect(nodeB);
			nodeA.disconnect(nodeB);
			nodeA.dispose();
			nodeB.dispose();
		});

		it("fan()", () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			const nodeC = new Gain();
			nodeA.fan(nodeB, nodeC);
			nodeA.dispose();
			nodeB.dispose();
			nodeC.dispose();
		});

		it("chain()", () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			const nodeC = new Gain();
			nodeA.chain(nodeB, nodeC);
			nodeA.dispose();
			nodeB.dispose();
			nodeC.dispose();
		});
	});

	context("connections", () => {
		it("can connect with args",  () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			nodeA.connect(nodeB, 0, 0);
			nodeA.dispose();
			nodeB.dispose();
		});

		it("can connect with no args", () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			nodeA.connect(nodeB);
			nodeA.dispose();
			nodeB.dispose();
		});

		it("can connect with one arg", () => {
			const nodeA = new Split(2);
			const nodeB = new Gain();
			nodeA.connect(nodeB, 1);
			nodeA.dispose();
			nodeB.dispose();
		});

		it("Tone nodes can disconnect from everything with no args",  () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			nodeA.connect(nodeB);
			nodeA.disconnect();
			nodeA.dispose();
			nodeB.dispose();
		});

		it("Tone nodes can disconnect from a specific node", () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			nodeA.connect(nodeB);
			nodeA.disconnect(nodeB);
			nodeA.dispose();
			nodeB.dispose();
		});

		it("Tone nodes can disconnect from a specific node and input/output", () => {
			const nodeA = new Gain();
			const nodeB = new Merge();
			nodeA.connect(nodeB, 0, 1);
			nodeA.disconnect(nodeB, 0, 1);
			nodeA.dispose();
			nodeB.dispose();
		});

		it("throws an error if they are not connected", () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			expect(() => {
				nodeA.disconnect(nodeB);
			}).throws(Error);
			nodeA.dispose();
			nodeB.dispose();
		});
	});

});
