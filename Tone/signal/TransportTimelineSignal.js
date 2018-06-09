define(["Tone/core/Tone", "Tone/core/Transport", "Tone/signal/Signal", "Tone/type/TransportTime"], function(Tone){

	/**
	 * @class Tone.TransportTimelineSignal extends Tone.Signal, but adds the ability to synchronize the signal to the signal to the Tone.Transport
	 * @extends {Tone.Signal}
	 */
	Tone.TransportTimelineSignal = function(){
		Tone.Signal.apply(this, arguments);

		/**
		 * The real signal output
		 * @type {Tone.Signal}
		 * @private
		 */
		this.output = this._outputSig = new Tone.Signal(this._initialValue);

		/**
		 * Keep track of the last value. (small optimization)
		 * @private
		 * @type {Number}
		 */
		this._lastVal = this.value;

		/**
		 * The event id of the tick update loop
		 * @private
		 * @type {Number}
		 */
		this._synced = Tone.Transport.scheduleRepeat(this._onTick.bind(this), "1i");

		/**
		 * A bound version of the anchor value methods
		 * @type {Function}
		 * @private
		 */
		this._bindAnchorValue = this._anchorValue.bind(this);
		Tone.Transport.on("start stop pause", this._bindAnchorValue);

		this._events.memory = Infinity;
	};

	Tone.extend(Tone.TransportTimelineSignal, Tone.Signal);

	/**
	 * Callback which is invoked every tick.
	 * @private
	 * @param  {Number} time
	 * @return {Tone.TransportTimelineSignal}      this
	 */
	Tone.TransportTimelineSignal.prototype._onTick = function(time){
		var val = this.getValueAtTime(Tone.Transport.seconds);
		if (this._lastVal !== val){
			this._lastVal = val;
			//approximate ramp curves with linear ramps
			this._outputSig.linearRampToValueAtTime(val, time);
		}
	};

	/**
	 * Anchor the value at the start and stop of the Transport
	 * @param  {Number} time The time of the event
	 * @return {Tone.TransportTimelineSignal}      this
	 * @private
	 */
	Tone.TransportTimelineSignal.prototype._anchorValue = function(time){
		var val = this.getValueAtTime(Tone.Transport.seconds);
		this._lastVal = val;
		this._outputSig.cancelScheduledValues(time);
		this._outputSig.setValueAtTime(val, time);
		return this;
	};

	/**
	 *  Get the scheduled value at the given time. This will
	 *  return the unconverted (raw) value.
	 *  @param  {TransportTime}  time  The time in seconds.
	 *  @return  {Number}  The scheduled value at the given time.
	 */
	Tone.TransportTimelineSignal.prototype.getValueAtTime = function(time){
		time = Tone.TransportTime(time);
		return Tone.Signal.prototype.getValueAtTime.call(this, time);
	};

	/**
	 * Set the output of the signal at the given time
	 * @param  {Number} value The value to change to at the given time
	 * @param  {TransportTime} time  The time to change the signal
	 * @return {Tone.TransportTimelineSignal}       this
	 */
	Tone.TransportTimelineSignal.prototype.setValueAtTime = function(value, time){
		time = Tone.TransportTime(time);
		Tone.Signal.prototype.setValueAtTime.call(this, value, time);
		return this;
	};

	/**
	 * Linear ramp to the given value from the previous scheduled point to the given value
	 * @param  {Number} value The value to change to at the given time
	 * @param  {TransportTime} time  The time to change the signal
	 * @return {Tone.TransportTimelineSignal}       this
	 */
	Tone.TransportTimelineSignal.prototype.linearRampToValueAtTime = function(value, time){
		time = Tone.TransportTime(time);
		Tone.Signal.prototype.linearRampToValueAtTime.call(this, value, time);
		return this;
	};

	/**
	 * Exponential ramp to the given value from the previous scheduled point to the given value
	 * @param  {Number} value The value to change to at the given time
	 * @param  {TransportTime} time  The time to change the signal
	 * @return {Tone.TransportTimelineSignal}       this
	 */
	Tone.TransportTimelineSignal.prototype.exponentialRampToValueAtTime = function(value, time){
		time = Tone.TransportTime(time);
		Tone.Signal.prototype.exponentialRampToValueAtTime.call(this, value, time);
		return this;
	};

	/**
	 *  Start exponentially approaching the target value at the given time with
	 *  a rate having the given time constant.
	 *  @param {number} value
	 *  @param {TransportTime} startTime
	 *  @param {number} timeConstant
	 * @return {Tone.TransportTimelineSignal}       this
	 */
	Tone.TransportTimelineSignal.prototype.setTargetAtTime = function(value, startTime, timeConstant){
		startTime = Tone.TransportTime(startTime);
		Tone.Signal.prototype.setTargetAtTime.call(this, value, startTime, timeConstant);
		return this;
	};

	/**
	 *  Cancels all scheduled parameter changes with times greater than or
	 *  equal to startTime.
	 *  @param  {TransportTime} startTime
	 *  @returns {Tone.Param} this
	 */
	Tone.TransportTimelineSignal.prototype.cancelScheduledValues = function(startTime){
		startTime = Tone.TransportTime(startTime);
		Tone.Signal.prototype.cancelScheduledValues.call(this, startTime);
		return this;
	};

	/**
	 *  Set an array of arbitrary values starting at the given time for the given duration.
	 *  @param {Float32Array} values
	 *  @param {Time} startTime
	 *  @param {Time} duration
	 *  @param {NormalRange} [scaling=1] If the values in the curve should be scaled by some value
	 *  @returns {Tone.Signal} this
	 */
	Tone.TransportTimelineSignal.prototype.setValueCurveAtTime = function(values, startTime, duration, scaling){
		startTime = Tone.TransportTime(startTime);
		duration = Tone.TransportTime(duration);
		Tone.Signal.prototype.setValueCurveAtTime.call(this, values, startTime, duration, scaling);
		return this;
	};

	/**
	 *  This is similar to [cancelScheduledValues](#cancelScheduledValues) except
	 *  it holds the automated value at time until the next automated event.
	 *  @param  {Time} time
	 *  @returns {Tone.TransportTimelineSignal} this
	 */
	Tone.TransportTimelineSignal.prototype.cancelAndHoldAtTime = function(time){
		return Tone.Signal.prototype.cancelAndHoldAtTime.call(this, Tone.TransportTime(time));
	};

	/**
	 * Dispose and disconnect
	 * @return {Tone.TransportTimelineSignal} this
	 */
	Tone.TransportTimelineSignal.prototype.dispose = function(){
		Tone.Transport.clear(this._synced);
		Tone.Transport.off("start stop pause", this._syncedCallback);
		this._events.cancel(0);
		Tone.Signal.prototype.dispose.call(this);
		this._outputSig.dispose();
		this._outputSig = null;
	};

	return Tone.TransportTimelineSignal;
});
