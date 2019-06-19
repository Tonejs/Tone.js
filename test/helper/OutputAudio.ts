import { expect } from "chai";
import { Offline } from "./Offline";

export function OutputAudio(callback) {
	return Offline(callback, 0.1).then((buffer) => {
		expect(buffer.isSilent()).to.equal(false);
	});
}
