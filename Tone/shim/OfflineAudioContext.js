define(["Tone/core/Tone"], function(Tone){
	if (Tone.supported){

		if (!window.hasOwnProperty("OfflineAudioContext") && window.hasOwnProperty("webkitOfflineAudioContext")){
			window.OfflineAudioContext = window.webkitOfflineAudioContext;
		}

		//returns promise?
		var context = new OfflineAudioContext(1, 1, 44100);
		var ret = context.startRendering();
		if (!(ret instanceof Promise)){
			OfflineAudioContext.prototype._native_startRendering = OfflineAudioContext.prototype.startRendering;
			OfflineAudioContext.prototype.startRendering = function(){
				return new Promise(function(done){
					this.oncomplete = function(e){
						done(e.renderedBuffer);
					};
					this._native_startRendering();
				}.bind(this));
			};
		}
	}
});
