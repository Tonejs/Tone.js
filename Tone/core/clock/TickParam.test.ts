import { expect } from "chai";

import { BasicTests, testAudioContext } from "../../../test/helper/Basic.js";
// import { atTime, Offline } from "../../../test/helper/Offline";
import { Context } from "../context/Context.js";
import { TickParam } from "./TickParam.js";

describe("TickParam", () => {
	// sanity checks
	BasicTests(TickParam, {
		context: testAudioContext,
		param: testAudioContext.createOscillator().frequency,
	});

	it("retains lookAhead for a suspended tick parameter", async () => {
		const context = new Context({ lookAhead: 0.2 });
		expect(context.state).to.equal("suspended");
		const param = new TickParam({
			context,
			param: context.createGain().gain,
			value: 100,
		});
		const frozen = context.immediate();
		param.value = 50;
		expect(param.value).to.equal(50);
		expect(param.getValueAtTime(frozen)).to.equal(100);
		expect(param.getValueAtTime(context.now())).to.equal(50);
		param.value = 200;
		expect(param.value).to.equal(200);
		expect(param.getValueAtTime(frozen)).to.equal(100);
		expect(param.getValueAtTime(context.now())).to.equal(200);
		param.dispose();
		context.dispose();
		await context.close();
	});
});
