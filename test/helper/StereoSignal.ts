import { Merge } from "../../Tone/component/channel/Merge";
import { Signal } from "../../Tone/signal/Signal";

export function StereoSignal(l: number, r: number): Merge {
	const merge = new Merge();
	new Signal(l).connect(merge, 0, 0);
	new Signal(r).connect(merge, 0, 1);
	return merge;
}
