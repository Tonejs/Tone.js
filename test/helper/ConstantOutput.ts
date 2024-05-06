import { expect } from "chai";
import { OfflineContext } from "../../Tone/core/context/OfflineContext.js";
import { Offline } from "./Offline.js";

/**
 * Test that the output of the callback is a constant value
 */
export async function ConstantOutput(
	callback: (context: OfflineContext) => Promise<void> | void,
	value: number,
	threshold = 0.01
): Promise<void> {
	const buffer = await Offline(callback, 0.01, 1);
	expect(buffer.value()).to.be.closeTo(value, threshold);
}
