define(["../core/Tone"], function(Tone){
	if (Tone.supported){

		if (!Tone.global.hasOwnProperty("OfflineAudioContext") && Tone.global.hasOwnProperty("webkitOfflineAudioContext")){
			Tone.global.OfflineAudioContext = Tone.global.webkitOfflineAudioContext;
		}

		//returns promise?
		var context = new OfflineAudioContext(1, 1, 44100);
		var ret = context.startRendering();
		if (!(ret && Tone.isFunction(ret.then))){
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
