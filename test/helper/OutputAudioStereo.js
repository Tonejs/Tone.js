import Offline from "helper/Offline";

var OutputAudioStereo = function(callback){
	return Offline(callback, 0.1, 2).then(function(buffer){
		return !buffer.isSilent();
	});
};

export default OutputAudioStereo;

