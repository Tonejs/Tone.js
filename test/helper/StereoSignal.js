define(["Tone/signal/Signal", "Tone/component/Merge"], function(Signal, Merge) {
	return function(l, r){
		var merge = new Merge();
		var left = new Signal(l).connect(merge, 0, 0);
		var right = new Signal(r).connect(merge, 0, 1);
		return merge;
	};
});
