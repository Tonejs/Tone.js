define(["helper/Offline", "Test", "Tone/signal/Signal", "Tone/component/Merge"], 
	function (Offline, Test, Signal, Merge) {

	var PassAudioStereo = function(before, after){
		var duration = 0.5;
		var offline = new Offline(duration, 2);
		var sigL, sigR, merge;
		var audioLeft = false;
		var audioRight = false;
		offline.before(function(dest){
			sigL = new Signal(0);
			sigR = new Signal(0);
			merge = new Merge();
			sigL.connect(merge.left);
			sigR.connect(merge.right);
			before(merge, dest);
			sigL.setValueAtTime(1, duration / 2);
			sigR.setValueAtTime(1, duration / 2);
		});
		offline.after(function(){
			sigL.dispose();
			sigR.dispose();
			merge.dispose();
			if (!audioLeft){
				throw new Error("node outputs silence in left channel");
			} else if (!audioRight){
				throw new Error("node outputs silence in right channel");
			} else if (!audioLeft && !audioRight){
				throw new Error("node outputs silence");
			}
			after();
		});
		offline.test(function(samples, time){
			if (time >= duration/2){
				if (Math.abs(samples[0]) > 0.01){
					audioLeft = true;
				}
				if (Math.abs(samples[1]) > 0.01){
					audioRight = true;
				}
			} else {
				expect(samples[0]).to.be.closeTo(0, 0.001);
				expect(samples[1]).to.be.closeTo(0, 0.001);
			}
		});
		offline.run();
	};

	return PassAudioStereo;
});