define(["Tone/core/Tone", "Tone/core/Context"], function (Tone) {


	/**
	 *  shim
	 *  @private
	 */
	if (!window.hasOwnProperty("OfflineAudioContext") && window.hasOwnProperty("webkitOfflineAudioContext")){
		window.OfflineAudioContext = window.webkitOfflineAudioContext;
	}

	/**
	 *  @class Wrapper around the OfflineAudioContext
	 *  @extends {Tone.Context}
	 *  @param  {Number}  channels  The number of channels to render
	 *  @param  {Number}  duration  The duration to render in samples
	 *  @param {Number} sampleRate the sample rate to render at
	 */
	Tone.OfflineContext = function(channels, duration, sampleRate){
		
		/**
		 *  The offline context
		 *  @private
		 *  @type  {OfflineAudioContext}
		 */
		var offlineContext = new OfflineAudioContext(channels, duration * sampleRate, sampleRate);

		//wrap the methods/members
		Tone.Context.call(this, {
			"context" : offlineContext,
			"clockSource" : "offline",
			"lookAhead" : 0,
			"updateInterval" : 128 / sampleRate
		});

		/**
		 *  A private reference to the duration
		 *  @private
		 *  @type  {Number}
		 */
		this._duration = duration;

		/**
		 *  An artificial clock source
		 *  @type  {Number}
		 *  @private
		 */
		this._currentTime = 0;
	};

	Tone.extend(Tone.OfflineContext, Tone.Context);

	/**
	 *  Override the now method to point to the internal clock time
	 *  @return  {Number}
	 */
	Tone.OfflineContext.prototype.now = function(){
		return this._currentTime;
	};

	/**
	 *  Render the output of the OfflineContext
	 *  @return  {Promise}
	 */
	Tone.OfflineContext.prototype.render = function(){
		while(this._duration - this._currentTime >= 0){
			//invoke all the callbacks on that time
			this.emit("tick");
			//increment the clock
			this._currentTime += this.blockTime;
		}

		//promise returned is not yet implemented in all browsers
		return new Promise(function(done){
			this._context.oncomplete = function(e){
				done(e.renderedBuffer);
			};
			this._context.startRendering();
		}.bind(this));
	};

	/**
	 *  Close the context
	 *  @return  {Number}
	 */
	Tone.OfflineContext.prototype.close = function(){
		this._context = null;
	};

	return Tone.OfflineContext;
});