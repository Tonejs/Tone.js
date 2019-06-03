import Tone from "Tone/core/Tone";
import Offline from "Tone/core/Offline";
import BufferTest from "helper/BufferTest";
import Master from "Tone/core/Master";

export default function(callback, duration, channels){
	duration = duration || 0.1;
	channels = channels || 1;
	return Offline(function(Transport){
		var testFn = callback(Transport);
		if (testFn && Tone.isFunction(testFn.then)){
			return testFn;
		} else if (Tone.isFunction(testFn)){
			Transport.context.on("tick", function(){
				testFn(Transport.now());
			});
		}
	}, duration).then(function(buffer){
		BufferTest(buffer);
		if (channels === 1){
			buffer.toMono();
		}
		return buffer;
	});
}

