define(["Tone/core/Tone"], function(Tone){

	if (Tone.supported){
		if (!window.hasOwnProperty("AudioContext") && window.hasOwnProperty("webkitAudioContext")){
			window.AudioContext = window.webkitAudioContext;
		}

		//not functionally equivalent, but only an API placeholder
		if (!AudioContext.prototype.close){
			AudioContext.prototype.close = function(){
				if (Tone.isFunction(this.suspend)) {
					return this.suspend();
				} else {
					return Promise.resolve();
				}
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
	}
});
