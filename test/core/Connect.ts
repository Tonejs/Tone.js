import { PassesAudio } from "@tonejs/plot";
import { expect } from "chai";
import { connect, disconnect } from "../../Tone/core/Connect";
import { Gain } from "../../Tone/node/Gain";

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
			expect(await PassesAudio((context, input, output) => {
				const gain = new Gain({
					context,
				});
				connect(input, gain);
				connect(gain, output);
			})).to.equal(true);
		});

		it("can disconnect a node", async () => {
			expect(await PassesAudio((context, input, output) => {
				const gain = new Gain({
					context,
				});
				connect(input, gain);
				connect(gain, output);
				connect(gain, output);
				disconnect(gain);
			})).to.equal(false);
		});

		it("can disconnect a node explicitly", async () => {
			expect(await PassesAudio((context, input, output) => {
				const gain = new Gain({
					context,
				});
				connect(input, gain);
				connect(gain, output);
				connect(gain, output);
				disconnect(gain, output);
			})).to.equal(false);
		});
	});

});
