import Offline from "helper/Offline";

export default function(callback, duration, channels){

	return Offline(callback, duration, channels).then(function(buffer){
		var rms = buffer.getRMS(512);
		rms.forEach = function(callback){
			for (var i = 0; i < rms.length; i++){
				var level = rms[i];
				callback(level, i * buffer.sampleTime);
			}
		};
		rms.getValueAtTime = function(time){
			return rms[Math.floor(time * buffer.context.sampleRate)];
		};
		return rms;
	});
}

