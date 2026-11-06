import { expect } from "chai";

import { BasicTests, testAudioContext } from "../../../test/helper/Basic.js";
// import { atTime, Offline } from "../../../test/helper/Offline";
import { createAudioContext } from "../context/AudioContext.js";
import { Context } from "../context/Context.js";
import { TickParam } from "./TickParam.js";

describe("TickParam", () => {
	for (const [name, create] of [
		["native", () => new AudioContext()],
		["standardized", createAudioContext],
	] as const) {
		it(`retains lookAhead for a suspended ${name} tick parameter`, async () => {
			const ac = create();
			const context = new Context({ context: ac, lookAhead: 0.2 });
			const param = new TickParam({
				context,
				param: ac.createGain().gain,
				value: 100,
			});
			try {
				await ac.suspend();
				const frozen = context.immediate();
				param.value = 50;
				expect(param.value).to.equal(50);
				expect(param.getValueAtTime(frozen)).to.equal(100);
				expect(param.getValueAtTime(context.now())).to.equal(50);
				param.value = 200;
				expect(param.value).to.equal(200);
				expect(param.getValueAtTime(frozen)).to.equal(100);
				expect(param.getValueAtTime(context.now())).to.equal(200);
			} finally {
				param.dispose();
				context.dispose();
				await context.close();
			}
		});
	}

	// sanity checks
	BasicTests(TickParam, {
		context: testAudioContext,
		param: testAudioContext.createOscillator().frequency,
	});
});
