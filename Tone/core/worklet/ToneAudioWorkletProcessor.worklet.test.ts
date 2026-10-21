import { expect } from "chai";

import {
	AudioParamDescriptor,
	parameterDescriptorsToDefaults,
	ToneAudioWorkletProcessor,
	ToneWorkletProcessorOptions,
	workletDeepMerge,
} from "./ToneAudioWorkletProcessor.worklet.js";

class DummyProcessor extends ToneAudioWorkletProcessor {
	get publicDisposed() {
		return this.disposed;
	}

	get publicBlockSize() {
		return this.blockSize;
	}

	get publicSampleRate() {
		return this.sampleRate;
	}

	get publicOptions() {
		return this.options;
	}

	process(): boolean {
		return !this.disposed;
	}
}

interface CustomProcessorOptions extends ToneWorkletProcessorOptions {
	processorOptions?: {
		freq?: number;
		custom?: string;
	};
}

class CustomProcessor extends ToneAudioWorkletProcessor<CustomProcessorOptions> {
	static get parameterDescriptors(): AudioParamDescriptor[] {
		return [
			{
				name: "freq",
				defaultValue: 440,
			},
		];
	}

	static getDefaults(): CustomProcessorOptions {
		return workletDeepMerge(super.getDefaults(), {
			processorOptions: {
				custom: "defaultCustom",
			},
		});
	}

	get publicOptions() {
		return this.options;
	}

	process(): boolean {
		return true;
	}
}

describe("ToneAudioWorkletProcessor", () => {
	it("exposes blockSize, sampleRate, and disposed through public getters", () => {
		const proc = new DummyProcessor();
		expect(proc.publicBlockSize).to.equal(128);
		expect(proc.publicSampleRate).to.equal(44100);
	});

	it("sets disposed to true when receiving a dispose message", () => {
		const proc = new DummyProcessor();
		expect(proc.publicDisposed).to.equal(false);
		proc.port.onmessage?.({ data: "dispose" } as MessageEvent);
		expect(proc.publicDisposed).to.equal(true);
		expect(proc.process()).to.equal(false);
	});

	it("extracts defaults from parameterDescriptors", () => {
		const descriptors: AudioParamDescriptor[] = [
			{ name: "a", defaultValue: 10 },
			{ name: "b", defaultValue: 20 },
		];
		expect(parameterDescriptorsToDefaults(descriptors)).to.deep.equal({
			a: 10,
			b: 20,
		});
		expect(parameterDescriptorsToDefaults(undefined)).to.deep.equal({});
	});

	it("merges objects recursively with workletDeepMerge without mutating sources", () => {
		const base = { a: 1, nested: { x: 10, y: 20 } };
		const override = { b: 2, nested: { y: 30 } };
		const result = workletDeepMerge({}, base, override);

		expect(result).to.deep.equal({
			a: 1,
			b: 2,
			nested: { x: 10, y: 30 },
		});
		expect(base.nested.y).to.equal(20);
	});

	it("returns default options from ToneAudioWorkletProcessor.getDefaults()", () => {
		const defaults = ToneAudioWorkletProcessor.getDefaults();
		expect(defaults).to.deep.equal({
			numberOfInputs: 1,
			numberOfOutputs: 1,
			processorOptions: {},
		});
	});

	it("derives processorOptions from parameterDescriptors in subclass getDefaults()", () => {
		const defaults = CustomProcessor.getDefaults();
		expect(defaults).to.deep.equal({
			numberOfInputs: 1,
			numberOfOutputs: 1,
			processorOptions: {
				freq: 440,
				custom: "defaultCustom",
			},
		});
	});

	it("merges constructor options with getDefaults into this.options", () => {
		const proc = new CustomProcessor({
			processorOptions: {
				freq: 880,
			},
		});

		expect(proc.publicOptions).to.deep.equal({
			numberOfInputs: 1,
			numberOfOutputs: 1,
			processorOptions: {
				freq: 880,
				custom: "defaultCustom",
			},
		});
	});
});
