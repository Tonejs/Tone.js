define(["Tone/core/Tone", "Tone/core/OfflineContext"], function(Tone){

	if (Tone.supported){

		var ua = navigator.userAgent.toLowerCase();
		var isMobileSafari = ua.includes("safari") && !ua.includes("chrome") && ua.includes("mobile");
		if (isMobileSafari){
			//mobile safari has a bizarre bug with the offline context
			//when a BufferSourceNode is started, it starts the offline context
			//
			//deferring all BufferSource starts till the last possible moment
			//reduces the likelihood of this happening
			Tone.OfflineContext.prototype.createBufferSource = function(){
				var bufferSource = this._context.createBufferSource();
				var _native_start = bufferSource.start;
				bufferSource.start = function(time){
					this.setTimeout(function(){
						_native_start.call(bufferSource, time);
					}.bind(this), 0);
				}.bind(this);
				return bufferSource;
			};
		}
	}

});
