import { PassesAudio } from "@tonejs/plot";
import { expect } from "chai";
import { Offline } from "test/helper/Offline";
import { Oscillator } from "../source/oscillator/Oscillator";
import { connect, disconnect } from "./Connect";
import { Gain } from "./context/Gain";

describe("Connect", () => {

	context("native node", () => {

		it("can create a connection", async () => {
			expect(await PassesAudio((context, input, output) => {
				connect(input, output);
			})).to.equal(true);
		});

		it("can disconnect two nodes", async () => {
			expect(await PassesAudio((context, input, output) => {
				connect(input, output);
				disconnect(input, output);
			})).to.equal(false);
		});

		it("can disconnect a node", async () => {
			expect(await PassesAudio((context, input, output) => {
				connect(input, output);
				disconnect(input);
			})).to.equal(false);
		});

		it("can connect one channel to another", async () => {
			expect(await PassesAudio((context, input, output) => {
				const merge = context.createChannelMerger(2);
				const split = context.createChannelSplitter(2);
				connect(input, merge, 0, 1);
				connect(merge, split, 0, 0);
				connect(split, output, 1, 0);
			})).to.equal(true);
		});

		it("can disconnect from an explicit channel", async () => {
			expect(await PassesAudio((context, input, output) => {
				const merge = context.createChannelMerger(2);
				const split = context.createChannelSplitter(2);
				connect(input, merge, 0, 1);
				connect(merge, split, 0, 0);
				connect(split, output, 1, 0);
				disconnect(split, output, 1, 0);
			})).to.equal(false);
		});

		it("throws an error if things aren't connected", async () => {
			let threwError = false;
			await PassesAudio((context, input, output) => {
				disconnect(input, output);
			}).catch(() => threwError = true);
			expect(threwError).to.equal(true);
		});

		it ("throws an error if the destination has no input", () => {
			const source = new Oscillator();
			const gain = new Gain();
			expect(() => {
				gain.connect(source);
			}).to.throw(Error);
			gain.dispose();
			source.dispose();
		});

		it("throws an error if things aren't connected to a specific channel", async () => {
			let threwError = false;
			await PassesAudio((context, input, output) => {
				const merge = context.createChannelMerger(2);
				const split = context.createChannelSplitter(2);
				connect(input, merge, 0, 1);
				connect(merge, split, 0, 0);
				connect(split, output, 1, 0);
				disconnect(split, output, 0, 0);
			}).catch(() => threwError = true);
			expect(threwError).to.equal(true);
		});
	});

	context("ToneAudioNode", () => {
		it("can create a connection", async () => {
			await Offline((context) => {
				const input = new Gain();
				const output = new Gain();
				const gain = new Gain();
				connect(input, gain);
				connect(gain, output);
			});
		});

		it("can disconnect a node", async () => {
			await Offline((context) => {
				const input = new Gain();
				const output = new Gain();
				const gain = new Gain();
				connect(input, gain);
				connect(gain, output);
				disconnect(gain);
			});
		});

		it("can disconnect a node explicitly", async () => {
			await Offline((context) => {
				const input = new Gain();
				const output = new Gain();
				const gain = new Gain();
				connect(input, gain);
				connect(gain, output);
				disconnect(gain, output);
			});
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
