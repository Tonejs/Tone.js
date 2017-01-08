define(["Tone/core/Tone", "Tone/core/Clock"], function (Tone, Clock) {

	//hold onto the current context
	var onlineContext = Tone.context;


	/**
	 *  OFFLINE TESTING
	 */
	var Offline = function(duration, channels){
		duration = duration || 0.7;
		var sampleRate = 44100;
		//dummy functions
		this._before = Tone.noOp;
		this._after = Tone.noOp;
		this._test = Tone.noOp;

		this._currentTime = 0;
		channels = channels || 1;
		duration = Math.floor(duration * sampleRate);
		//offline rendering context
		this.context = new OfflineAudioContext(channels, duration, sampleRate);

		var oldNowFunc = Tone.prototype.now;

		var originalTargetLookAhead = Tone.Clock._lookAhead;
		var originalUpdateInterval = Tone.Clock._updateInterval;
		Tone.Clock._lookAhead = 1 / sampleRate;
		Tone.Clock._updateInterval = 1 / sampleRate;

		Tone.prototype.now = function(){
			return this._currentTime;
		}.bind(this);

		Tone.now = function(){
			return this._currentTime;
		}.bind(this);

		var event = new Event("message");

		this.context.oncomplete = function(e){

			var error;

			for (var i = 0; i < duration; i++){

				var ret = [];
				for (var channel = 0; channel < channels; channel++){
					var buffer = e.renderedBuffer.getChannelData(channel);
					ret[channel] = buffer[i];
				}
				if (channels === 1)	{
					ret = ret[0];
				}
				try {
					Clock._worker.dispatchEvent(event);
					this._currentTime = i / sampleRate;
					this._test(ret, i / sampleRate);
				} catch (err){
					error = err;
				}
			}
			this._after();
			Tone.Clock._lookAhead = originalTargetLookAhead;
			Tone.Clock._updateInterval = originalUpdateInterval;
			//return the old 'now' method
			Tone.now = oldNowFunc;
			Tone.prototype.now = oldNowFunc;
			//reset the old context
			Tone.setContext(onlineContext);
			//throw an error if there was one
			if (error){
				throw new Error(error);
			}
		}.bind(this);
	};

	Offline.prototype.run = function(){
		Tone.setContext(this.context);
		this._before(this.context.destination);
		this.context.startRendering();
		return this;
	};

	Offline.prototype.before = function(cb){
		this._before = cb;
		return this;
	};

	Offline.prototype.after = function(cb){
		this._after = cb;
		return this;
	};

	Offline.prototype.test = function(cb){
		this._test = cb;
		return this;
	};

	return Offline;
});