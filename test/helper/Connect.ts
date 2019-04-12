import { getContext } from "../../Tone/core/Global";
import { Gain } from "../../Tone/node/Gain";

export function connectFrom(): Gain {
	return new Gain();
}

export function connectTo(): Gain {
	return new Gain();
}
