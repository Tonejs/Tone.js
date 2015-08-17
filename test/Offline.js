define(["Test", "Tone/core/Tone"], function (Test, Tone) {

	//hold onto the current context
	var onlineContext = Tone.context;

	/**
	 *  OFFLINE TESTING
	 */
	var Offline = function(duration, stereo){
		duration = duration || 1;
		var sampleRate = 44100;
		//dummy functions
		this._before = Tone.noOp;
		this._after = Tone.noOp;
		this._test = Tone.noOp;
		var channels = stereo ? 2 : 1;
		//offline rendering context
		this.context = new OfflineAudioContext(channels, sampleRate * duration, sampleRate);
		this.context.oncomplete = function(e){
			if (channels === 2){
				var bufferL = e.renderedBuffer.getChannelData(0);
				var bufferR = e.renderedBuffer.getChannelData(1);
				for (var i = 0; i < bufferL.length; i++){
					this._test(bufferL[i], bufferR[i], i / sampleRate);
				}
			} else {
				var buffer = e.renderedBuffer.getChannelData(0);
				for (var j = 0; j < buffer.length; j++){
					this._test(buffer[j], j / sampleRate);
				}
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