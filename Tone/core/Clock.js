define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	"use strict";
	
	/**
	 *  @class  a sample accurate clock built on an oscillator.
	 *          Invokes the onTick method at the set rate
	 *          NB: can cause audio glitches. use sparingly. 
	 *
	 * 	@internal
	 * 	@constructor
	 * 	@extends {Tone}
	 * 	@param {number} rate the number of 
	 */
	Tone.Clock = function(rate, callback){

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
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._controlSignal = new Tone.Signal(1);

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
		this.tick = this.defaultArg(callback, function(){});

		//setup
		this._jsNode.noGC();
		this.setRate(rate);
	};

	Tone.extend(Tone.Clock);

	/**
	 *  set the rate of the clock
	 *  optionally ramp to the rate over the rampTime
	 *  @param {Tone.Time} rate 
	 *  @param {Tone.Time=} rampTime 
	 */
	Tone.Clock.prototype.setRate = function(rate, rampTime){
		//convert the time to a to frequency
		var freqVal = this.secondsToFrequency(this.toSeconds(rate));
		if (!rampTime){
			this._controlSignal.cancelScheduledValues(0);
			this._controlSignal.setValue(freqVal);
		} else {
			this._controlSignal.exponentialRampToValueNow(freqVal, rampTime);
		}
	};

	/**
	 *  return the current rate
	 *  
	 *  @return {number} 
	 */
	Tone.Clock.prototype.getRate = function(){
		return this._controlSignal.getValue();
	};

	/**
	 *  start the clock
	 *  @param {Tone.Time} time the time when the clock should start
	 */
	Tone.Clock.prototype.start = function(time){
		//reset the oscillator
		this._oscillator = this.context.createOscillator();
		this._oscillator.type = "square";
		this._oscillator.connect(this._jsNode);
		//connect it up
		this._controlSignal.connect(this._oscillator.frequency);
		this._upTick = false;
		var startTime = this.toSeconds(time);
		this._oscillator.start(startTime);
	};

	/**
	 *  stop the clock
	 *  @param {Tone.Time} time the time when the clock should stop
	 */
	Tone.Clock.prototype.stop = function(time){
		var stopTime = this.toSeconds(time);
		this._oscillator.stop(stopTime);
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
		for (var i = 0; i < bufferSize; i++){
			var sample = incomingBuffer[i];
			if (sample > 0 && !upTick){
				upTick = true;	
				this.tick(now + this.samplesToSeconds(i));
			} else if (sample < 0 && upTick){
				upTick = false;
			}
		}
		this._upTick = upTick;
	};

	/**
	 *  clean up
	 */
	Tone.Clock.prototype.dispose = function(){
		this._jsNode.disconnect();
		this._controlSignal.dispose();
		if (this._oscillator){
			this._oscillator.disconnect();
		}
		this._jsNode.onaudioprocess = function(){};
		this._jsNode = null;
		this._controlSignal = null;
		this._oscillator = null;
	};

	return Tone.Clock;
});