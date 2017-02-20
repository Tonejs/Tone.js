define(["Tone/core/Tone"], function (Tone) {

	var isUndef = Tone.prototype.isUndef;

	//augment the built in functions
	return function(buffer){

		buffer.isSilent = function(channelNum){
			if (isUndef(channelNum)){
				return buffer.toMono().isSilent(0);
			} else {
				var array = buffer.toArray(channelNum);
				for (var i = 0; i < array.length; i++){
					if (array[i] !== 0){
						return false;
					}
				}
				return true;
			}
		};

		//return the time when the buffer is no longer silent
		buffer.getFirstSoundTime = function(channelNum){
			if (Tone.prototype.isUndef(channelNum)){
				return buffer.toMono().getFirstSoundTime(0);
			} else {
				var array = buffer.toArray(channelNum);
				for (var i = 0; i < array.length; i++){
					if (array[i] !== 0){
						return i / buffer.context.sampleRate;
					}
				}
				return -1;
			}
		};

		//stops and returns value if callback does
		buffer.forEach = function(callback, start, end){
			var i, ret;
			start = start || 0;
			end = end || buffer.duration;
			start = Math.floor((start / buffer.duration) * buffer.length);
			end = Math.floor((end / buffer.duration) * buffer.length);
			if (buffer.numberOfChannels === 2){
				var arrayL = buffer.toArray(0);
				var arrayR = buffer.toArray(1);
				for (i = start; i < end; i++){
					ret = callback(arrayL[i], arrayR[i], (i/buffer.length) * buffer.duration);
					if (typeof ret !== "undefined"){
						return ret;
					}
				}
				
			} else {
				var array = buffer.toArray();
				for (i = start; i < end; i++){
					ret = callback(array[i], (i/array.length) * buffer.duration);
					if (typeof ret !== "undefined"){
						return ret;
					}
				}
			}
		};
	};
});