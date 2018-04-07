define(["helper/Offline"], function (Offline) {

	var OutputAudioStereo = function(callback){
		return Offline(callback, 0.1, 2).then(function(buffer){
			return !buffer.isSilent();
		});
	};

	return OutputAudioStereo;
});
