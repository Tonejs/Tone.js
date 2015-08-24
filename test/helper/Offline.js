define(["Tone/core/Tone"], function (Tone) {

	//hold onto the current context
	var onlineContext = Tone.context;

	/**
	 *  OFFLINE TESTING
	 */
	var Offline = function(duration, channels, rms){
		duration = duration || 1;
		var sampleRate = 44100;
		//dummy functions
		this._before = Tone.noOp;
		this._after = Tone.noOp;
		this._test = Tone.noOp;
		channels = channels || 1;
		//offline rendering context
		this.context = new OfflineAudioContext(channels, sampleRate * duration, sampleRate);
		this.context.oncomplete = function(e){

			for (var i = 0; i < sampleRate * duration; i++){

				var ret = [];
				for (var channel = 0; channel < channels; channel++){
					var buffer = e.renderedBuffer.getChannelData(channel);
					ret[channel] = buffer[i];
				}
				if (channels === 1)	{
					ret = ret[0];
				}
				this._test(ret, i / sampleRate);
			}
			this._after();
			//reset the old context
			Tone.setContext(onlineContext);
		}.bind(this);
	};

	Offline.prototype.run = function(){
		Tone.setContext(this.context);
		this._before(this.context.destination);
		this.context.startRendering();
	};

	Offline.prototype.before = function(cb){
		this._before = cb;
	};

	Offline.prototype.after = function(cb){
		this._after = cb;
	};

	Offline.prototype.test = function(cb){
		this._test = cb;
	};

	return Offline;
});