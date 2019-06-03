import Tone from "../core/Tone";
import "../core/Buffer";
import "../source/Source";
import "../core/Gain";
import "../core/AudioNode";

/**
 *  @class Wrapper around the native BufferSourceNode.
 *  @extends {Tone.AudioNode}
 *  @param  {AudioBuffer|Tone.Buffer}  buffer   The buffer to play
 *  @param  {Function}  onload  The callback to invoke when the
 *                               buffer is done playing.
 */
Tone.BufferSource = function(){

	var options = Tone.defaults(arguments, ["buffer", "onload"], Tone.BufferSource);
	Tone.AudioNode.call(this, options);

	/**
	 *  The callback to invoke after the
	 *  buffer source is done playing.
	 *  @type  {Function}
	 */
	this.onended = options.onended;

	/**
	 *  The time that the buffer was started.
	 *  @type  {Number}
	 *  @private
	 */
	this._startTime = -1;

	/**
	 *  An additional flag if the actual BufferSourceNode
	 *  has been started. b/c stopping an unstarted buffer
	 *  will throw it into an invalid state
	 *  @type  {Boolean}
	 *  @private
	 */
	this._sourceStarted = false;

	/**
	 *  Flag if the source has already been stopped
	 *  @type  {Boolean}
	 *  @private
	 */
	this._sourceStopped = false;

	/**
	 *  The time that the buffer is scheduled to stop.
	 *  @type  {Number}
	 *  @private
	 */
	this._stopTime = -1;

	/**
	 *  The gain node which envelopes the BufferSource
	 *  @type  {Tone.Gain}
	 *  @private
	 */
	this._gainNode = this.output = new Tone.Gain(0);

	/**
	 *  The buffer source
	 *  @type  {AudioBufferSourceNode}
	 *  @private
	 */
	this._source = this.context.createBufferSource();
	Tone.connect(this._source, this._gainNode);
	this._source.onended = this._onended.bind(this);

	/**
	 * The private buffer instance
	 * @type {Tone.Buffer}
	 * @private
	 */
	this._buffer = new Tone.Buffer(options.buffer, options.onload);

	/**
	 *  The playbackRate of the buffer
	 *  @type {Positive}
	 *  @signal
	 */
	this.playbackRate = new Tone.Param({
		param : this._source.playbackRate,
		units : Tone.Type.Positive,
		value : options.playbackRate
	});

	/**
	 *  The fadeIn time of the amplitude envelope.
	 *  @type {Time}
	 */
	this.fadeIn = options.fadeIn;

	/**
	 *  The fadeOut time of the amplitude envelope.
	 *  @type {Time}
	 */
	this.fadeOut = options.fadeOut;

	/**
	 * The curve applied to the fades, either "linear" or "exponential"
	 * @type {String}
	 */
	this.curve = options.curve;

	/**
	 * The onended timeout
	 * @type {Number}
	 * @private
	 */
	this._onendedTimeout = -1;

	//set some values initially
	this.loop = options.loop;
	this.loopStart = options.loopStart;
	this.loopEnd = options.loopEnd;
};

Tone.extend(Tone.BufferSource, Tone.AudioNode);

/**
 *  The defaults
 *  @const
 *  @type  {Object}
 */
Tone.BufferSource.defaults = {
	"onended" : Tone.noOp,
	"onload" : Tone.noOp,
	"loop" : false,
	"loopStart" : 0,
	"loopEnd" : 0,
	"fadeIn" : 0,
	"fadeOut" : 0,
	"curve" : "linear",
	"playbackRate" : 1
};

/**
 *  Returns the playback state of the source, either "started" or "stopped".
 *  @type {Tone.State}
 *  @readOnly
 *  @memberOf Tone.BufferSource#
 *  @name state
 */
Object.defineProperty(Tone.BufferSource.prototype, "state", {
	get : function(){
		return this.getStateAtTime(this.now());
	}
});

/**
 *  Get the playback state at the given time
 *  @param  {Time}  time  The time to test the state at
 *  @return  {Tone.State}  The playback state. 
 */
Tone.BufferSource.prototype.getStateAtTime = function(time){
	time = this.toSeconds(time);
	if (this._startTime !== -1 && 
		this._startTime <= time && 
		(this._stopTime === -1 || time < this._stopTime) && 
		!this._sourceStopped){
		return Tone.State.Started;
	} else {
		return Tone.State.Stopped;
	}
};

/**
 *  Start the buffer
 *  @param  {Time} [startTime=now] When the player should start.
 *  @param  {Time} [offset=0] The offset from the beginning of the sample
 *                                 to start at.
 *  @param  {Time=} duration How long the sample should play. If no duration
 *                                is given, it will default to the full length
 *                                of the sample (minus any offset)
 *  @param  {Gain}  [gain=1]  The gain to play the buffer back at.
 *  @return  {Tone.BufferSource}  this
 */
Tone.BufferSource.prototype.start = function(time, offset, duration, gain){
	this.log("start", time, offset, duration, gain);
	this.assert(this._startTime === -1, "can only be started once");
	this.assert(this.buffer.loaded, "buffer is either not set or not loaded");
	this.assert(!this._sourceStopped, "source is already stopped");

	time = this.toSeconds(time);
	//if it's a loop the default offset is the loopstart point
	if (this.loop){
		offset = Tone.defaultArg(offset, this.loopStart);
	} else {
		//otherwise the default offset is 0
		offset = Tone.defaultArg(offset, 0);
	}
	offset = this.toSeconds(offset);
	//make sure the offset is not less than 0
	offset = Math.max(offset, 0);

	gain = Tone.defaultArg(gain, 1);

	//apply a fade in envelope
	var fadeInTime = this.toSeconds(this.fadeIn);
	if (fadeInTime > 0){
		this._gainNode.gain.setValueAtTime(0, time);
		if (this.curve === "linear"){
			this._gainNode.gain.linearRampToValueAtTime(gain, time + fadeInTime);
		} else {
			this._gainNode.gain.exponentialApproachValueAtTime(gain, time, fadeInTime);
		}
	} else {
		this._gainNode.gain.setValueAtTime(gain, time);
	}

	this._startTime = time;

	//if a duration is given, schedule a stop
	if (Tone.isDefined(duration)){
		var computedDur = this.toSeconds(duration);
		//make sure it's never negative
		computedDur = Math.max(computedDur, 0);

		this.stop(time + computedDur);
	}

	//start the buffer source
	if (this.loop){
		//modify the offset if it's greater than the loop time
		var loopEnd = this.loopEnd || this.buffer.duration;
		var loopStart = this.loopStart;
		var loopDuration = loopEnd - loopStart;
		//move the offset back
		if (offset >= loopEnd){
			offset = ((offset - loopStart) % loopDuration) + loopStart;
		}
	}
	this._source.buffer = this.buffer.get();
	this._source.loopEnd = this.loopEnd || this.buffer.duration;
	if (offset < this.buffer.duration){
		this._sourceStarted = true;
		this._source.start(time, offset);
	}

	return this;
};

/**
 *  Stop the buffer. 
 *  @param  {Time=}  time         The time the buffer should stop.
 *  @return  {Tone.BufferSource}  this
 */
Tone.BufferSource.prototype.stop = function(time){
	this.log("stop", time);
	this.assert(this.buffer.loaded, "buffer is either not set or not loaded");
	this.assert(!this._sourceStopped, "source is already stopped");

	time = this.toSeconds(time);

	//if the event has already been scheduled, clear it
	if (this._stopTime !== -1){
		this.cancelStop();
	}

	//the fadeOut time
	var fadeOutTime = this.toSeconds(this.fadeOut);

	//cancel the previous curve
	this._stopTime = time + fadeOutTime;

	if (fadeOutTime > 0){
		//start the fade out curve at the given time
		if (this.curve === "linear"){
			this._gainNode.gain.linearRampTo(0, fadeOutTime, time);
		} else {
			this._gainNode.gain.targetRampTo(0, fadeOutTime, time);
		}
	} else {
		//stop any ongoing ramps, and set the value to 0
		this._gainNode.gain.cancelAndHoldAtTime(time);
		this._gainNode.gain.setValueAtTime(0, time);
	}

	Tone.context.clearTimeout(this._onendedTimeout);
	this._onendedTimeout = Tone.context.setTimeout(this._onended.bind(this), this._stopTime - this.now());

	return this;
};

/**
 *  Cancel a scheduled stop event
 *  @return  {Tone.BufferSource}  this
 */
Tone.BufferSource.prototype.cancelStop = function(){
	if (this._startTime !== -1 && !this._sourceStopped){
		//cancel the stop envelope
		var fadeInTime = this.toSeconds(this.fadeIn);
		this._gainNode.gain.cancelScheduledValues(this._startTime + fadeInTime + this.sampleTime);
		this.context.clearTimeout(this._onendedTimeout);
		this._stopTime = -1;
	}
	return this;
};

/**
 *  Internal callback when the buffer is ended.
 *  Invokes `onended` and disposes the node.
 *  @private
 */
Tone.BufferSource.prototype._onended = function(){
	if (!this._sourceStopped){
		this._sourceStopped = true;
		//allow additional time for the exponential curve to fully decay
		var additionalTail = this.curve === "exponential" ? this.fadeOut * 2 : 0;
		if (this._sourceStarted && this._stopTime !== -1){
			this._source.stop(this._stopTime + additionalTail);
		}
		this.onended(this);

		//dispose the source after it's come to a stop
		setTimeout(function(){
			//if it hasn't already been disposed
			if (this._source){
				this._source.disconnect();
				this._gainNode.disconnect();
			}
		}.bind(this), additionalTail * 1000 + 100);
	}
};

/**
 * If loop is true, the loop will start at this position.
 * @memberOf Tone.BufferSource#
 * @type {Time}
 * @name loopStart
 */
Object.defineProperty(Tone.BufferSource.prototype, "loopStart", {
	get : function(){
		return this._source.loopStart;
	},
	set : function(loopStart){
		this._source.loopStart = this.toSeconds(loopStart);
	}
});

/**
 * If loop is true, the loop will end at this position.
 * @memberOf Tone.BufferSource#
 * @type {Time}
 * @name loopEnd
 */
Object.defineProperty(Tone.BufferSource.prototype, "loopEnd", {
	get : function(){
		return this._source.loopEnd;
	},
	set : function(loopEnd){
		this._source.loopEnd = this.toSeconds(loopEnd);
	}
});

/**
 * The audio buffer belonging to the player.
 * @memberOf Tone.BufferSource#
 * @type {Tone.Buffer}
 * @name buffer
 */
Object.defineProperty(Tone.BufferSource.prototype, "buffer", {
	get : function(){
		return this._buffer;
	},
	set : function(buffer){
		this._buffer.set(buffer);
	}
});

/**
 * If the buffer should loop once it's over.
 * @memberOf Tone.BufferSource#
 * @type {Boolean}
 * @name loop
 */
Object.defineProperty(Tone.BufferSource.prototype, "loop", {
	get : function(){
		return this._source.loop;
	},
	set : function(loop){
		this._source.loop = loop;
		this.cancelStop();
	}
});

/**
 *  Clean up.
 *  @return  {Tone.BufferSource}  this
 */
Tone.BufferSource.prototype.dispose = function(){
	if (!this._wasDisposed){
		this._wasDisposed = true;
		Tone.AudioNode.prototype.dispose.call(this);
		this.onended = null;
		this._source.onended = null;
		this._source.disconnect();
		this._source = null;
		this._gainNode.dispose();
		this._gainNode = null;
		this._buffer.dispose();
		this._buffer = null;
		this._startTime = -1;
		this.playbackRate = null;
		Tone.context.clearTimeout(this._onendedTimeout);
	}
	return this;
};

export default Tone.BufferSource;

