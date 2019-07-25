import { expect } from "chai";
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

	// 	it("reports its inputs and outputs", () => {
	// 		const node0 = new ToneAudioNode({
	// 			numberOfInputs : 3,
	// 			numberOfOutputs : 2,
	// 		});
	// 		expect(node0.numberOfInputs).to.equal(3);
	// 		expect(node0.numberOfOutputs).to.equal(2);
	// 		node0.dispose();

	// 		const node1 = new ToneAudioNode({
	// 			numberOfInputs : 0,
	// 			numberOfOutputs : 1,
	// 		});
	// 		expect(node1.numberOfInputs).to.equal(0);
	// 		expect(node1.numberOfOutputs).to.equal(1);
	// 		node1.dispose();

	// 		const node2 = new ToneAudioNode({
	// 			numberOfInputs : 1,
	// 			numberOfOutputs : 0,
	// 		});
	// 		expect(node2.numberOfInputs).to.equal(1);
	// 		expect(node2.numberOfOutputs).to.equal(0);
	// 		node2.dispose();
	// 	});

		// it("is able to get and set the channelCount, channelCountMode and channelInterpretation", () => {
		// 	const node0 = new ToneAudioNode({
		// 		channelCount : 4,
		// 		numberOfInputs: 1,
		// 		numberOfOutputs: 1,
		// 	});
		// 	expect(node0.channelCount).to.equal(4);
		// 	node0.channelCount = 1;
		// 	expect(node0.channelCount).to.equal(1);
		// 	node0.dispose();

		// 	const node1 = new ToneAudioNode({
		// 		numberOfInputs : 1,
		// 		numberOfOutputs : 2,
		// 	});
		// 	expect(node1.channelCountMode).to.equal("max");
		// 	node1.channelCountMode = "explicit";
		// 	expect(node1.channelCountMode).to.equal("explicit");
		// 	node1.dispose();

		// 	const node2 = new ToneAudioNode({
		// 		channelInterpretation : "speakers",
		// 		numberOfInputs : 2,
		// 		numberOfOutputs : 0,
		// 	});
		// 	expect(node2.channelInterpretation).to.equal("speakers");
		// 	node2.channelInterpretation = "discrete";
		// 	expect(node2.channelInterpretation).to.equal("discrete");
		// 	node2.dispose();
		// });
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
		});

		it("disconnect()", () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			nodeA.connect(nodeB);
			nodeA.disconnect(nodeB);
			nodeA.dispose();
		});

		it("fan()", () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			nodeA.fan(nodeB);
			nodeA.dispose();
		});

		it("chain()", () => {
			const nodeA = new Gain();
			const nodeB = new Gain();
			nodeA.chain(nodeB);
			nodeA.dispose();
		});
	});

	// context("connections", () => {
	// 	it("can connect with args",  () => {
	// 		const nodeA = new ToneAudioNode({
	// 			numberOfOutputs : 1,
	// 		});
	// 		const nodeB = new ToneAudioNode({
	// 			numberOfInputs: 1,
	// 		});
	// 		nodeA.connect(nodeB, 0, 0);
	// 		nodeA.dispose();
	// 		nodeB.dispose();
	// 	});

	// 	it("can connect with no args", () => {
	// 		const nodeA = new ToneAudioNode({
	// 			numberOfOutputs: 1,
	// 		});
	// 		const nodeB = new ToneAudioNode({
	// 			numberOfInputs: 1,
	// 		});
	// 		nodeA.connect(nodeB);
	// 		nodeA.dispose();
	// 		nodeB.dispose();
	// 	});

	// 	it("can connect with one arg", () => {
	// 		const nodeA = new ToneAudioNode({
	// 			numberOfOutputs: 2,
	// 		});
	// 		const nodeB = new ToneAudioNode({
	// 			numberOfInputs: 1,
	// 		});
	// 		nodeA.connect(nodeB, 1);
	// 		nodeA.dispose();
	// 		nodeB.dispose();
	// 	});

	// 	it("Tone nodes can disconnect from everything with no args",  () => {
	// 		const nodeA = new ToneAudioNode({
	// 			numberOfOutputs: 1,
	// 		});
	// 		const nodeB = new ToneAudioNode({
	// 			numberOfInputs: 1,
	// 		});
	// 		nodeA.connect(nodeB);
	// 		nodeA.disconnect();
	// 		nodeA.dispose();
	// 		nodeB.dispose();
	// 	});

	// 	it("Tone nodes can disconnect from a specific node", () => {
	// 		const nodeA = new ToneAudioNode({
	// 			numberOfOutputs: 1,
	// 		});
	// 		const nodeB = new ToneAudioNode({
	// 			numberOfInputs: 1,
	// 		});
	// 		nodeA.connect(nodeB);
	// 		nodeA.disconnect(nodeB);
	// 		nodeA.dispose();
	// 		nodeB.dispose();
	// 	});

	// 	it("Tone nodes can disconnect from a specific node and input/output", () => {
	// 		const nodeA = new ToneAudioNode({
	// 			numberOfOutputs: 2,
	// 		});
	// 		const nodeB = new ToneAudioNode({
	// 			numberOfInputs: 2,
	// 		});
	// 		nodeA.connect(nodeB, 1, 1);
	// 		nodeA.disconnect(nodeB, 1, 1);
	// 		nodeA.dispose();
	// 		nodeB.dispose();
	// 	});

	// 	it("throws an error if they are not connected", () => {
	// 		// const nodeA = new ToneAudioNode({
	// 		// 	numberOfOutputs: 2,
	// 		// });
	// 		// const nodeB = new ToneAudioNode({
	// 		// 	numberOfInputs: 2,
	// 		// });
	// 		// nodeA.connect(nodeB, 1, 1);
	// 		// expect(() => {
	// 		// 	nodeA.disconnect(nodeB, 10, 0);
	// 		// }).throws(Error);
	// 		// nodeA.dispose();
	// 		// nodeB.dispose();
	// 	});
	// });

});
