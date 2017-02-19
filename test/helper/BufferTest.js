define(["Tone/core/Tone"], function (Tone) {
	return {
		isSilent : function(buffer, channelNum){
			if (Tone.prototype.isUndef(channelNum)){
				return this.isSilent(buffer.toMono(), 0);
			} else {
				var array = buffer.toArray(channelNum);
				for (var i = 0; i < array.length; i++){
					if (array[i] !== 0){
						return false;
					}
				}
				return true;
			}
		},
		getRMS : function(buffer){

		},
		//return the time when the buffer is no longer silent
		getFirstSoundTime : function(buffer, channelNum){
			if (Tone.prototype.isUndef(channelNum)){
				return this.getFirstSoundTime(buffer.toMono(), 0);
			} else {
				var array = buffer.toArray(channelNum);
				for (var i = 0; i < array.length; i++){
					if (array[i] !== 0){
						return i / buffer.context.sampleRate;
					}
				}
				return -1;
			}
		},
		getSilenceTime : function(buffer){

		},
		//stops and returns value if callback does
		forEach : function(buffer, callback){
			var i, len, ret;
			if (buffer.numberOfChannels === 2){
				var arrayL = buffer.toArray(0);
				var arrayR = buffer.toArray(1);
				for (i = 0, len = arrayL.length; i < len; i++){
					ret = callback(arrayL[i], arrayR[i], i/len * buffer.duration);
					if (typeof ret !== "undefined"){
						return ret;
					}
				}
				
			} else {
				var array = buffer.toArray();
				for (i = 0, len = array.length; i < len; i++){
					ret = callback(array[i], i/len * buffer.duration);
					if (typeof ret !== "undefined"){
						return ret;
					}
				}
			}
		},
	};
});