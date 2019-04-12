import { Gain } from "../node/Gain";
import { isUndef } from "./Util";

export function fromContext(context) {
	const Tone: any = {};
	if (isUndef(Gain.prototype.defaultContext)) {
		Tone.Gain = class extends Gain {
			get defaultContext() {
				return context;
			}
		};
	}
	return Tone;
}
