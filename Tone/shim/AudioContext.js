define(["Tone/core/Tone", "Tone/shim/OfflineAudioContext"], function(Tone){

	if (Tone.supported){
		if (!window.hasOwnProperty("AudioContext") && window.hasOwnProperty("webkitAudioContext")){
			window.AudioContext = window.webkitAudioContext;
		}

		//not functionally equivalent, but only an API placeholder
		if (!AudioContext.prototype.close){
			AudioContext.prototype.close = function(){
				if (Tone.isFunction(this.suspend)){
					this.suspend();
				}
				return Promise.resolve();
			};
		}

		//not functionally equivalent
		if (!AudioContext.prototype.resume){
			AudioContext.prototype.resume = function(){
				return Promise.resolve();
			};
		}

		//createGain
		if (!AudioContext.prototype.createGain && AudioContext.prototype.createGainNode){
			AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
		}

		//createDelay
		if (!AudioContext.prototype.createDelay && AudioContext.prototype.createDelayNode){
			AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
		}

		//test decodeAudioData returns a promise
		// https://github.com/mohayonao/web-audio-api-shim/blob/master/src/AudioContext.js
		// MIT License (c) 2015 @mohayonao
		var decodeAudioDataPromise = false;
		var offlineContext = new OfflineAudioContext(1, 1, 44100);
		var audioData = new Uint32Array([1179011410, 48, 1163280727, 544501094, 16, 131073, 44100, 176400, 1048580, 1635017060, 8, 0, 0, 0, 0]).buffer;
		try {
			var ret = offlineContext.decodeAudioData(audioData);
			if (ret instanceof Promise){
				decodeAudioDataPromise = true;
			}
		} catch (e){
			decodeAudioDataPromise = false;
		}

		if (!decodeAudioDataPromise){
			AudioContext.prototype._native_decodeAudioData = AudioContext.prototype.decodeAudioData;
			AudioContext.prototype.decodeAudioData = function(audioData){
				return new Promise(function(success, error){
					this._native_decodeAudioData(audioData, success, error);
				}.bind(this));
			};
		}
	}
});
