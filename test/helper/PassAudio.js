define(["Test", "Tone/core/Offline", "Tone/signal/Signal"], function (Test, Offline, Signal) {

	var PassAudio = function(before){

		var duration = 0.2;
		return Offline(function(){
			var sig = new Signal(0);
			before(sig);
			sig.setValueAtTime(1, duration / 2);
		}, duration).then(function(buffer){
			var array = buffer.toMono().toArray();
			for (var i = 0; i < array.length; i++){
				var time = (i / array.length) * duration;
				var sample = array[i];
				if (time >= duration / 2 && sample !== 0){
					return true;
				} else if (time < duration / 2) {
					expect(sample).to.be.closeTo(0, 0.001);
				} else {
					throw new Error("node outputs silence");
				}
			}
		});
	};

	return PassAudio;
});