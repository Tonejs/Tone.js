import Tone from "../core/Tone";
import "../core/Buffer";
import "../source/Source";
import "../core/Gain";
import "../core/AudioNode";
import "../shim/OscillatorNode";

/**
 *  @class Wrapper around the native fire-and-forget OscillatorNode. Adds the
 *     ability to reschedule the stop method. ***[Tone.Oscillator](Oscillator) is better 
 *     for most use-cases***
 *  @extends {Tone.AudioNode}
 *  @param  {AudioBuffer|Tone.Buffer}  buffer   The buffer to play
 *  @param  {Function}  onload  The callback to invoke when the
 *                               buffer is done playing.
 */
Tone.OscillatorNode = function(){

	var options = Tone.defaults(arguments, ["frequency", "type"], Tone.OscillatorNode);
	Tone.AudioNode.call(this, options);

	/**
	 *  The callback to invoke after the
	 *  buffer source is done playing.
	 *  @type  {Function}
	 */
	this.onended = options.onended;

	/**
	 *  The oscillator start time
	 *  @type  {Number}
	 *  @private
	 */
	this._startTime = -1;

	/**
	 *  The oscillator stop time
	 *  @type  {Number}
	 *  @private
	 */
	this._stopTime = -1;

	/**
	 *  The gain node which envelopes the OscillatorNode
	 *  @type  {Tone.Gain}
	 *  @private
	 */
	this._gainNode = this.output = new Tone.Gain(0);

	/**
	 *  The oscillator
	 *  @type  {OscillatorNode}
	 *  @private
	 */
	this._oscillator = this.context.createOscillator();
	Tone.connect(this._oscillator, this._gainNode);
	this.type = options.type;

	/**
	 *  The frequency of the oscillator
	 *  @type {Frequency}
	 *  @signal
	 */
	this.frequency = new Tone.Param({
		param : this._oscillator.frequency, 
		units : Tone.Type.Frequency,
		value : options.frequency
	});

	/**
	 *  The detune of the oscillator
	 *  @type {Frequency}
	 *  @signal
	 */
	this.detune = new Tone.Param({
		param : this._oscillator.detune,
		units : Tone.Type.Cents,
		value : options.detune
	});

	/**
	 *  The value that the buffer ramps to
	 *  @type {Gain}
	 *  @private
	 */
	this._gain = 1;
};

Tone.extend(Tone.OscillatorNode, Tone.AudioNode);

/**
 *  The defaults
 *  @const
 *  @type  {Object}
 */
Tone.OscillatorNode.defaults = {
	"frequency" : 440,
	"detune" : 0,
	"type" : "sine",
	"onended" : Tone.noOp
};

/**
 *  Returns the playback state of the oscillator, either "started" or "stopped".
 *  @type {Tone.State}
 *  @readOnly
 *  @memberOf Tone.OscillatorNode#
 *  @name state
 */
Object.defineProperty(Tone.OscillatorNode.prototype, "state", {
	get : function(){
		return this.getStateAtTime(this.now());
	}
});

/**
 *  Get the playback state at the given time
 *  @param  {Time}  time  The time to test the state at
 *  @return  {Tone.State}  The playback state. 
 */
Tone.OscillatorNode.prototype.getStateAtTime = function(time){
	time = this.toSeconds(time);
	if (this._startTime !== -1 && time >= this._startTime && (this._stopTime === -1 || time <= this._stopTime)){
		return Tone.State.Started;
	} else {
		return Tone.State.Stopped;
	}
};

/**
     * Start the oscillator node at the given time
     * @param  {Time=} time When to start the oscillator
     * @return {OscillatorNode}      this
     */
Tone.OscillatorNode.prototype.start = function(time){
	this.log("start", time);
	if (this._startTime === -1){
		this._startTime = this.toSeconds(time);
		this._startTime = Math.max(this._startTime, this.context.currentTime);
		this._oscillator.start(this._startTime);
		this._gainNode.gain.setValueAtTime(1, this._startTime);
	} else {
		throw new Error("cannot call OscillatorNode.start more than once");
	}
	return this;
};

/**
     * Sets an arbitrary custom periodic waveform given a PeriodicWave.
     * @param  {PeriodicWave} periodicWave PeriodicWave should be created with context.createPeriodicWave
     * @return {OscillatorNode} this
     */
Tone.OscillatorNode.prototype.setPeriodicWave = function(periodicWave){
	this._oscillator.setPeriodicWave(periodicWave);
	return this;
};

/**
     * Stop the oscillator node at the given time
     * @param  {Time=} time When to stop the oscillator
     * @return {OscillatorNode}      this
     */
Tone.OscillatorNode.prototype.stop = function(time){
	this.log("stop", time);
	this.assert(this._startTime !== -1, "'start' must be called before 'stop'");
	//cancel the previous stop
	this.cancelStop();
	//reschedule it
	this._stopTime = this.toSeconds(time);
	this._stopTime = Math.max(this._stopTime, this.context.currentTime);
	if (this._stopTime > this._startTime){
		this._gainNode.gain.setValueAtTime(0, this._stopTime);
		this.context.clearTimeout(this._timeout);
		this._timeout = this.context.setTimeout(function(){
			this._oscillator.stop(this.now());
			this.onended();
			//disconnect the object when it's ended
			setTimeout(function(){
				if (this._oscillator){
					this._oscillator.disconnect();
					this._gainNode.disconnect();
				}
			}.bind(this), 100);
		}.bind(this), this._stopTime - this.context.currentTime);
	} else {
		//cancel the stop envelope
		this._gainNode.gain.cancelScheduledValues(this._startTime);
	}
	return this;
};

/**
 *  Cancel a scheduled stop event
 *  @return  {Tone.OscillatorNode}  this
 */
Tone.OscillatorNode.prototype.cancelStop = function(){
	if (this._startTime !== -1){
		//cancel the stop envelope
		this._gainNode.gain.cancelScheduledValues(this._startTime+this.sampleTime);
		this.context.clearTimeout(this._timeout);
		this._stopTime = -1;
	}
	return this;
};

/**
 * The oscillator type. Either 'sine', 'sawtooth', 'square', or 'triangle'
 * @memberOf Tone.OscillatorNode#
 * @type {Time}
 * @name type
 */
Object.defineProperty(Tone.OscillatorNode.prototype, "type", {
	get : function(){
		return this._oscillator.type;
	},
	set : function(type){
		this._oscillator.type = type;
	}
});

/**
 *  Clean up.
 *  @return  {Tone.OscillatorNode}  this
 */
Tone.OscillatorNode.prototype.dispose = function(){
	if (!this._wasDisposed){
		this._wasDisposed = true;
		this.context.clearTimeout(this._timeout);
		Tone.AudioNode.prototype.dispose.call(this);
		this.onended = null;
		this._oscillator.disconnect();
		this._oscillator = null;
		this._gainNode.dispose();
		this._gainNode = null;
		this.frequency.dispose();
		this.frequency = null;
		this.detune.dispose();
		this.detune = null;
	}
	return this;
};

export default Tone.OscillatorNode;

