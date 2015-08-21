define(["helper/Offline", "Test", "Tone/signal/Signal"], function (Offline, Test, Signal) {

	var PassAudio = function(before, after){
		var duration = 0.5;
		var offline = new Offline(duration);
		var sig;
		var passedAudio = false;
		offline.before(function(dest){
			sig = new Signal(0);
			before(sig, dest);
			sig.setValueAtTime(1, duration / 2);
		});
		offline.after(function(){
			if (!passedAudio){
				throw new Error("node outputs silence");
			} 
			after();
		});
		offline.test(function(sample, time){
			if (time >= duration / 2 && sample !== 0){
				passedAudio = true;
			} else if (time < duration / 2) {
				expect(sample).to.be.closeTo(0, 0.001);
			}
		});
		offline.run();
	};

	return PassAudio;
});