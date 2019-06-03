import Signal from "Tone/signal/Signal";
import Merge from "Tone/component/Merge";
export default function(l, r){
	var merge = new Merge();
	var left = new Signal(l).connect(merge, 0, 0);
	var right = new Signal(r).connect(merge, 0, 1);
	return merge;
}

