define(["Test", "helper/Offline", "Tone/signal/Signal", "Tone/core/Master"], 
	function (Test, Offline, Signal, Master) {

		var PassAudioStereo = function(before){

			var duration = 0.2;
			return Offline(function(){
				var sig = new Signal(0);
				before(sig);
				sig.setValueAtTime(1, duration / 2);
			}, duration, 2).then(function(buffer){
				var silent = true;
				buffer.forEach(function(l, r, time){
					if (time >= duration / 2 && l !== 0 && r !== 0){
						silent = false;
						return;
					} else if (time < duration / 2) {
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
