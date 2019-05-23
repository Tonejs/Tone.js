import { Gain } from "Tone/core/context/Gain";

export function connectFrom(): Gain {
	return new Gain();
}

export function connectTo(): Gain {
	return new Gain();
}
