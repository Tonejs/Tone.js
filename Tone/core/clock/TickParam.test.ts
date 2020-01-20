import { Compare, Plot } from "@tonejs/plot";
import { expect } from "chai";
import { BasicTests, testAudioContext } from "test/helper/Basic";
// import { atTime, Offline } from "test/helper/Offline";
import { TickParam } from "./TickParam";

describe("TickParam", () => {

	// sanity checks
	BasicTests(TickParam, {
		context: testAudioContext,
		param: testAudioContext.createOscillator().frequency,
	});

});
