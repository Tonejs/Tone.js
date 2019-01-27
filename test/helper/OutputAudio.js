import Offline from "helper/Offline";
import Test from "helper/Test";

var OutputAudio = function(callback){
	return Offline(callback, 0.1).then(function(buffer){
		return !buffer.isSilent();
	});
};

export default OutputAudio;

