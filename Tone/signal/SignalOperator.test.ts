import { BasicTests } from "../../test/helper/Basic.js";
import { SignalConnectAndDisconnect } from "../../test/helper/SignalTests.js";
import { Signal } from "./Signal.js";
import { SignalOperator, SignalOperatorOptions } from "./SignalOperator.js";

describe("SignalOperator", () => {
	class TestSignalOperator extends SignalOperator<SignalOperatorOptions> {
		name = "TestSignalOperator";

		input: Signal;
		output: Signal;

		constructor(options: SignalOperatorOptions) {
			super(options);
			this.input = this.output = new Signal({
				context: this.context,
			});
		}
	}

	BasicTests(TestSignalOperator);
	SignalConnectAndDisconnect(TestSignalOperator);
});
