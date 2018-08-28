define(["../core/Tone"], function(Tone){

	/**
	 *  AudioBuffer.copyTo/FromChannel polyfill
	 *  @private
	 */
	if (Tone.supported){
		if (!AudioBuffer.prototype.copyToChannel){
			AudioBuffer.prototype.copyToChannel = function(src, chanNum, start){
				var channel = this.getChannelData(chanNum);
				start = start || 0;
				for (var i = 0; i < channel.length; i++){
					channel[i+start] = src[i];
				}
			};
			AudioBuffer.prototype.copyFromChannel = function(dest, chanNum, start){
				var channel = this.getChannelData(chanNum);
				start = start || 0;
				for (var i = 0; i < dest.length; i++){
					dest[i] = channel[i+start];
				}
			};
		}
	}

});
