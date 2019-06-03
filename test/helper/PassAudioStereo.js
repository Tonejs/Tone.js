import Test from "helper/Test";
import Offline from "helper/Offline";
import Signal from "Tone/signal/Signal";
import Master from "Tone/core/Master";
import Merge from "Tone/component/Merge";

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

export default PassAudioStereo;

