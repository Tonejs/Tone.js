define(["helper/Offline", "Test"], function (Offline, Test) {

	var OutputAudio = function(before, after){
		var duration = 0.5;
		var offline = new Offline(duration, 1);
		var passedAudio = false;
		offline.before(function(dest){
			before(dest);
		});
		offline.after(function(){
			if (!passedAudio){
				throw new Error("node outputs silence");
			} 
			after();
		});
		offline.test(function(sample){
			if (Math.abs(sample) > 0.01){
				passedAudio = true;
			}
		});
		offline.run();
	};

	return OutputAudio;
});