import Tone from "Tone/core/Tone";

//augment the built in functions
export default function(buffer){

	buffer.isSilent = function(channelNum){
		if (Tone.isUndef(channelNum)){
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

	/**
	 *  Get the RMS levels for the buffer, returned as an array
	 *  @param  {blockSize}  [blockSize=512]
	 */
	buffer.getRMS = function(blockSize){
		blockSize = blockSize || 512;
		var rms = [];
		var array = buffer.toMono().toArray();
		for (var j = 0; j < array.length; j++){
			var sum = 0;
			if (j >= blockSize){
				for (var k = j - blockSize; k < j; k++){
					sum += array[k] * array[k];
				}
				rms.push(Math.sqrt(sum / blockSize));
			}
		}
		return rms;
	};

	//get the rms at the given time
	buffer.getRmsAtTime = function(time){
		var rms = this.getRMS();
		var sample = Math.floor(time * this.context.sampleRate);
		return rms[sample];
	};

	//return the time when the buffer is no longer silent
	buffer.getFirstSoundTime = function(channelNum){
		if (Tone.isUndef(channelNum)){
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

	//returns the value at the given time
	buffer.getValueAtTime = function(time){
		var ret = [];
		var sample = Math.round(time * buffer.context.sampleRate);
		for (var i = 0; i < buffer.numberOfChannels; i++){
			ret[i] = buffer.getChannelData(i)[sample];
		}
		if (ret.length === 1){
			return ret[0];
		} else {
			return ret;
		}
	};

	//return the time when the buffer is silent to the remainer of the buffer
	buffer.getLastSoundTime = function(channelNum){
		if (Tone.isUndef(channelNum)){
			return buffer.toMono().getLastSoundTime(0);
		} else {
			var array = buffer.toArray(channelNum);
			for (var i = array.length - 1; i >= 0; i--){
				if (array[i] !== 0){
					return i / buffer.context.sampleRate;
				}
			}
			return 0;
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

	/**
	 *  Returns the max value in the buffer
	 *  @return  {Number}
	 */
	buffer.max = function(){
		var max = -Infinity;
		buffer.toMono().forEach(function(sample){
			max = Math.max(sample, max);
		});
		return max;
	};

	/**
	 *  Returns the min value in the buffer
	 *  @return  {Number}
	 */
	buffer.min = function(){
		var min = Infinity;
		buffer.toMono().forEach(function(sample){
			min = Math.min(sample, min);
		});
		return min;
	};

	/**
	 *  returns the value if there is a single value the entire buffer
	 */
	buffer.value = function(){
		var val;
		buffer.toMono().forEach(function(sample){
			if (typeof val === "undefined"){
				val = sample;
			} else if (Math.abs(val - sample) > 0.0001){
				throw new Error("multiple values in buffer");
			}
		});
		return val;
	};
}

