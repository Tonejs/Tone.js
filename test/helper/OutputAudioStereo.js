define(["helper/Offline"], function (Offline) {

	var OutputAudioStereo = function(before, after){
		var duration = 0.5;
		var offline = new Offline(duration, 2);
		var audioLeft = false;
		var audioRight = false;
		offline.before(function(dest){
			before(dest);
		});
		offline.after(function(){
			if (!(audioLeft && audioRight)){
				throw new Error("node outputs silence");
			} else if (!audioLeft){
				throw new Error("node outputs silence in left channel");
			} else if (!audioRight){
				throw new Error("node outputs silence in right channel");
			} 
			after();
		});
		offline.test(function(sampleL, sampleR){
			if (Math.abs(sampleL) > 0.01){
				audioLeft = true;
			}
			if (Math.abs(sampleR) > 0.01){
				audioRight = true;
			}
		});
		offline.run();
	};

	return OutputAudioStereo;
});