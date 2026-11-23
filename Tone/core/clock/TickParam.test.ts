import { BasicTests, testAudioContext } from "@tone/test/helper/Basic.js";

import { TickParam } from "./TickParam.js";

describe("TickParam", () => {
	// sanity checks
	BasicTests(TickParam, {
		context: testAudioContext,
		param: testAudioContext.createOscillator().frequency,
	});
});
