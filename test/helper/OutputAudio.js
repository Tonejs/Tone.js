define(["helper/Offline", "Test"], function (Offline, Test) {

	var OutputAudio = function(callback){
		return Offline(callback, 0.1).then(function(buffer){
			return !buffer.isSilent();
		});
	};

	return OutputAudio;
});
