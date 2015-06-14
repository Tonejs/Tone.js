define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	"use strict";
	
	/**
	 *  @class  a sample accurate clock built on an oscillator.
	 *          Invokes the tick method at the set rate
	 *
	 * 	@constructor
	 * 	@extends {Tone}
	 * 	@param {Frequency} frequency the rate of the callback
	 * 	@param {function} callback the callback to be invoked with the time of the audio event
	 * 	@example
	 * //the callback will be invoked approximately once a second
	 * //and will print the time exactly once a second apart.
	 * var clock = new Tone.Clock(1, function(time){
	 * 	console.log(time);
	 * });
	 */
	Tone.Clock = function(frequency, callback){

		/**
		 *  the oscillator
		 *  @type {OscillatorNode}
		 *  @private
		 */
		this._oscillator = null;

		/**
		 *  the script processor which listens to the oscillator
		 *  @type {ScriptProcessorNode}
		 *  @private
		 */
		this._jsNode = this.context.createScriptProcessor(this.bufferSize, 1, 1);
		this._jsNode.onaudioprocess = this._processBuffer.bind(this);

		/**
		 *  the rate control signal
		 *  @type {Frequency}
		 *  @signal
		 */
		this.frequency = new Tone.Signal(frequency, Tone.Type.Frequency);

		/**
		 *  whether the tick is on the up or down
		 *  @type {boolean}
		 *  @private
		 */
		this._upTick = false;

		/**
		 *  the callback which is invoked on every tick
		 *  with the time of that tick as the argument
		 *  @type {function(number)}
		 */
		this.tick = callback;

		/**
		 * Callback is invoked when the clock is stopped.
		 * @type {function}
		 * @example
		 *  clock.onended = function(){
		 *  	console.log("the clock is stopped");
		 *  }
		 */
		this.onended = function(){};

		//setup
		this._jsNode.noGC();
	};

	Tone.extend(Tone.Clock);

	/**
	 *  start the clock
	 *  @param {Time} [time=now] the time when the clock should start
	 *  @returns {Tone.Clock} this
	 *  @example
	 * clock.start();
	 */
	Tone.Clock.prototype.start = function(time){
		if (!this._oscillator){
			this._oscillator = this.context.createOscillator();
			this._oscillator.type = "square";
			this._oscillator.connect(this._jsNode);
			//connect it up
			this.frequency.connect(this._oscillator.frequency);
			this._upTick = false;
			var startTime = this.toSeconds(time);
			this._oscillator.start(startTime);
		}
		return this;
	};

	/**
	 *  stop the clock
	 *  @param {Time} [time=now] The time when the clock should stop.
	 *  @returns {Tone.Clock} this
	 *  @example
	 * clock.stop();
	 */
	Tone.Clock.prototype.stop = function(time){
		if (this._oscillator){
			var now = this.now();
			var stopTime = this.toSeconds(time, now);
			this._oscillator.stop(stopTime);
			this._oscillator = null;
			if (time){
				//set a timeout for when it stops
				setTimeout(this.onended, (stopTime - now) * 1000);
			} else {
				this.onended();
			}
		}
		return this;
	};

	/**
	 *  @private
	 *  @param  {AudioProcessingEvent} event
	 */
	Tone.Clock.prototype._processBuffer = function(event){
		var now = this.defaultArg(event.playbackTime, this.now());
		var bufferSize = this._jsNode.bufferSize;
		var incomingBuffer = event.inputBuffer.getChannelData(0);
		var upTick = this._upTick;
		var self = this;
		for (var i = 0; i < bufferSize; i++){
			var sample = incomingBuffer[i];
			if (sample > 0 && !upTick){
				upTick = true;	
				//get the callback out of audio thread
				setTimeout(function(){
					//to account for the double buffering
					var tickTime = now + self.samplesToSeconds(i + bufferSize * 2);
					return function(){
						if (self.tick){
							self.tick(tickTime);
						}
					};
				}(), 0); // jshint ignore:line
			} else if (sample < 0 && upTick){
				upTick = false;
			}
		}
		this._upTick = upTick;
	};

	/**
	 *  clean up
	 *  @returns {Tone.Clock} this
	 */
	Tone.Clock.prototype.dispose = function(){
		this._jsNode.disconnect();
		this.frequency.dispose();
		this.frequency = null;
		if (this._oscillator){
			this._oscillator.disconnect();
			this._oscillator = null;
		}
		this._jsNode.onaudioprocess = function(){};
		this._jsNode = null;
		this.tick = null;
		this.onended = function(){};
		return this;
	};

	return Tone.Clock;
});