define(["helper/Offline"], function (Offline) {

	return function(callback, duration, channels){

		return Offline(callback, duration, channels).then(function(buffer){
			var blockTime = 512/buffer.sampleRate;
			var rms = buffer.getRMS(512);
			rms.forEach = function(callback){
				for (var i = 0; i < rms.length; i++){
					var level = rms[i];
					callback(level, blockTime * i);
				}
			};
			return rms;
		});
	};
});