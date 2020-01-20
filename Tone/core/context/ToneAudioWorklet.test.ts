import { expect } from "chai";
import { ToneAudioWorklet, ToneAudioWorkletOptions } from "./ToneAudioWorklet";
import { getContext } from "../Global";

class TestAudioWorklet extends ToneAudioWorklet<ToneAudioWorkletOptions> {
	input: undefined;
	output: undefined;
	private _loadedPromise: Promise<void>
	private _readyCallback;
	constructor(options) {
		super(options);
		this._loadedPromise = new Promise(done => this._readyCallback = done);
	}

	_audioWorklet() {
		return /* javascript */` 
			registerProcessor("${this._audioWorkletName()}", class extends AudioWorkletProcessor {
			
				process(inputs, outputs, parameters) {
					// do nothing
				}
			});
		`;
	}
	_audioWorkletName() {
		return "worklet-test";
	}

	loaded() {
		return this._loadedPromise;
	}

	onReady(_node) {
		this._readyCallback();
	}
}

class TestErrorAudioWorklet extends TestAudioWorklet {

	_audioWorklet() {
		return /* javascript */` 
			registerProcessor("${this._audioWorkletName()}", class extends AudioWorkletProcessor {
			
				process() {
					throw new Error("nope!")
				}
			});
		`;
	}
	_audioWorkletName() {
		return "error-worklet-test";
	}
}

describe("ToneAudioWorklet", () => {
	
	it("can be created and disposed", async () => {
		const worklet = new TestAudioWorklet({
			context: getContext(),
		});
		await worklet.loaded();
		worklet.dispose();
	});

	it("throws an error on processing", (done) => {
		const errorTest = new TestErrorAudioWorklet({
			context: getContext(),
		});
		errorTest.onprocessorerror = () => done();
	});
});
