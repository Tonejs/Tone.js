import { BasicTests } from "test/helper/Basic";
import { Noise } from "./Noise";
import {expect} from "chai";
import {SourceTests} from "test/helper/SourceTests";
import {OutputAudio} from "test/helper/OutputAudio";
import {CompareToFile} from "test/helper/CompareToFile";

describe("Noise", () => {

	// run the common tests
	BasicTests(Noise);
	SourceTests(Noise);

	it("matches a file",  () => {
		return CompareToFile(() => {
			const noise = new Noise().toMaster();
			noise.start(0.1).stop(0.2);
		}, "noise.wav", 9);
	});

	context("Get/Set", () => {

		it("can be constructed with an options object", () => {
			const noise = new Noise({
				type: "brown",
			});
			expect(noise.type).to.equal("brown");
			noise.dispose();
		});

		it("can set the playbackRate in the constructor", () => {
			const noise = new Noise({
				playbackRate: 2,
			});
			expect(noise.playbackRate).to.equal(2);
			noise.dispose();
		});

		it("can set the playbackRate after the noise is started", () => {
			return OutputAudio(() => {
				const noise = new Noise().toMaster();
				noise.start();
				noise.playbackRate = 3;
				expect(noise.playbackRate).to.equal(3);
			});
		});

	});

	context("Type", () => {

		it("can be set to 3 noise types", () => {
			const noise = new Noise();
			const types = ["white", "brown", "pink"];
			types.forEach(type => {
				// @ts-ignore
				noise.type = type;
				expect(noise.type).to.equal(type);
			});
			noise.dispose();
		});

		it("cant set invalid type", () => {
			const noise = new Noise();
			expect(() => {
				// @ts-ignore
				noise.type = "else";
			}).to.throw(Error);
			noise.dispose();
		});

		it("outputs white noise", () => {
			return OutputAudio(() => {
				const noise = new Noise("white");
				noise.toMaster();
				noise.start();
			});
		});

		it("outputs pink noise", () => {
			return OutputAudio(() => {
				const noise = new Noise("pink");
				noise.toMaster();
				noise.start();
			});
		});

		it("outputs brown noise", () => {
			return OutputAudio(() => {
				const noise = new Noise("brown");
				noise.toMaster();
				noise.start();
			});
		});

		it("can set the type after the noise is started", () => {
			return OutputAudio(() => {
				const noise = new Noise();
				noise.toMaster();
				noise.start();
				noise.type = "brown";
			});
		});
	});
});

