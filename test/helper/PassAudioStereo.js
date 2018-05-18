define(["helper/Test", "helper/Offline", "Tone/signal/Signal", "Tone/core/Master", "Tone/component/Merge"],
	function(Test, Offline, Signal, Master, Merge){

		var PassAudioStereo = function(before){

			var duration = 0.2;
			return Offline(function(){
				var merge = new Merge();
				var sigL = new Signal(0);
				sigL.connect(merge, 0, 0);
				var sigR = new Signal(0);
				sigR.connect(merge, 0, 1);
				before(merge);
				sigL.setValueAtTime(1, duration / 2);
				sigR.setValueAtTime(1, duration / 2);
			}, duration, 2).then(function(buffer){
				var silent = true;
				buffer.forEach(function(l, r, time){
					if (time >= duration / 2 && l !== 0 && r !== 0){
						silent = false;
						return;
					} else if (time < duration / 2){
						expect(l).to.be.closeTo(0, 0.001);
						expect(r).to.be.closeTo(0, 0.001);
					}
				});
				if (silent){
					throw new Error("node outputs silence");
				}
			});
		};

		return PassAudioStereo;
	});
