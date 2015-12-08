define(["Tone/core/Tone"], function (Tone) {

	//hold onto the current context
	var onlineContext = Tone.context;

	/**
	 *  OFFLINE TESTING
	 */
	var Meter = function(duration){
		duration = duration || 1;
		var sampleRate = 44100;
		//dummy functions
		this._before = Tone.noOp;
		this._after = Tone.noOp;
		this._test = Tone.noOp;
		var rmsFrame = 256;
		//offline rendering context
		this.context = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
		this.context.oncomplete = function(e){
			var buffer = e.renderedBuffer.getChannelData(0);
			for (var j = 0; j < buffer.length; j++){
				var sum = 0;
				if (j >= rmsFrame){
					for (var k = j - rmsFrame; k < j; k++){
						sum += buffer[k] * buffer[k];
					}
					try {
						this._test(Math.sqrt(sum / rmsFrame), j / sampleRate);
					} catch (e){
						Tone.setContext(onlineContext);
						throw new Error(e);									
					}
				}
			}
			this._after();
			//reset the old context
			Tone.setContext(onlineContext);
		}.bind(this);
	};

	Meter.prototype.run = function(){
		Tone.setContext(this.context);
		this._before(this.context.destination);
		this.context.startRendering();
	};

	Meter.prototype.before = function(cb){
		this._before = cb;
	};

	Meter.prototype.after = function(cb){
		this._after = cb;
	};

	Meter.prototype.test = function(cb){
		this._test = cb;
	};

	return Meter;
});