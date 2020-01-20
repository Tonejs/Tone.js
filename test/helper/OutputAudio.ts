import { expect } from "chai";
import { Offline } from "./Offline";

export function OutputAudio(callback): Promise<void> {
	return Offline(callback, 0.1).then((buffer) => {
		expect(buffer.isSilent(), "no audio").to.equal(false);
	});
}
