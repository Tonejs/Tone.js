define(["Tone/core/Tone", "Tone/signal/Signal"], function (Tone) {

	/**
	 *  @class A signal which adds the method _getValueAtTime. 
	 *         Code and inspiration from https://github.com/jsantell/web-audio-automation-timeline
	 */
	Tone.SchedulableSignal = function(){

		/**
		 *  The scheduled automation events
		 *  @type  {Array}
		 *  @private
		 */
		this._timeline = [];

		//extend Tone.Signal
		Tone.Signal.apply(this, arguments);

		//prune unneeded events off the list occationally
		this._interval = setInterval(this._prune.bind(this), 1000);
	};

	Tone.extend(Tone.SchedulableSignal, Tone.Signal);

	/**
	 *  The event types of a schedulable signal.
	 *  @enum {String}
	 */
	Tone.SchedulableSignal.Type = {
		Linear : "linear",
		Exponential : "exponential",
		Target : "target",
		Set : "set"
	};

	Tone.SchedulableSignal.prototype.setValueAtTime = function (value, startTime) {
		value = this._fromUnits(value);
		startTime = this.toSeconds(startTime);
		this._insertEvent({
			"type" : Tone.SchedulableSignal.Type.Set,
			"value" : value,
			"time" : startTime
		});
		//invoke the original event
		Tone.Signal.prototype.setValueAtTime.apply(this, arguments);

	};

	Tone.SchedulableSignal.prototype.linearRampToValueAtTime = function (value, endTime) {
		value = this._fromUnits(value);
		endTime = this.toSeconds(endTime);
		this._insertEvent({
			"type" : Tone.SchedulableSignal.Type.Linear,
			"value" : value,
			"time" : endTime
		});
		Tone.Signal.prototype.linearRampToValueAtTime.apply(this, arguments);
	};

	Tone.SchedulableSignal.prototype.exponentialRampToValueAtTime = function (value, endTime) {
		value = this._fromUnits(value);
		value = Math.max(this._minOutput, value);
		endTime = this.toSeconds(endTime);
		this._insertEvent({
			"type" : Tone.SchedulableSignal.Type.Exponential,
			"value" : value,
			"time" : endTime
		});
		Tone.Signal.prototype.exponentialRampToValueAtTime.apply(this, arguments);
	};

	Tone.SchedulableSignal.prototype.setTargetAtTime = function (value, startTime, timeConstant) {
		value = this._fromUnits(value);
		value = Math.max(this._minOutput, value);
		startTime = this.toSeconds(startTime);
		this._insertEvent({
			"type" : Tone.SchedulableSignal.Type.Target,
			"value" : value,
			"time" : startTime,
			"constant" : timeConstant
		});
		Tone.Signal.prototype.setTargetAtTime.apply(this, arguments);
	};

	/**
	 *  Insert an event in the right position
	 *  @param  {Object}  event 
	 */
	Tone.SchedulableSignal.prototype._insertEvent = function(event){
		for (var i = 0, len = this._timeline.length; i<len; i++){
			var testEvnt = this._timeline[i];
			if (testEvnt.time > event.time){
				this._timeline.splice(i, 0, event);
				return;
			}
		}
		//otherwise add it to the end
		this._timeline.push(event);
	};

	/**
	 *  Cancel all 
	 *  @param {Time} time When to set the ramp point
	 */
	Tone.SchedulableSignal.prototype.cancelScheduledValues = function (after) {
		//get the index of the time
		after = this.toSeconds(after);
		var index = this._search(after);
		if (index >= 0){
			this._timeline = this._timeline.slice(0, index);
		}
	};

	/**
	 *  Sets the value at time.
	 *  @param {Time} time When to set the ramp point
	 */
	Tone.SchedulableSignal.prototype.setRampPoint = function (time) {
		time = this.toSeconds(time);
		//get the value at the given time
		var val = this._getValueAtTime(time);
		this.setValueAtTime(val, time);
	};

	/**
	 *  Sets the value at time.
	 *  @param {Time} time When to set the ramp point
	 */
	Tone.SchedulableSignal.prototype.linearRampToValueBetween = function (value, start, finish) {
		this.setRampPoint(start);
		this.linearRampToValueAtTime(value, finish);
	};

	/**
	 *  Sets the value at time.
	 *  @param {Time} time When to set the ramp point
	 */
	Tone.SchedulableSignal.prototype.exponentialRampToValueBetween = function (value, start, finish) {
		this.setRampPoint(start);
		this.exponentialRampToValueAtTime(value, finish);
	};

	/**
	 *  Does a binary serach on the timeline array and returns the 
	 *  event which is after or equal to the time.
	 *  @param  {Number}  time  
	 *  @return  {Number} the index in the timeline array 
	 */
	Tone.SchedulableSignal.prototype._search = function(time){
		var beginning = 0;
		var len = this._timeline.length;
		var end = len;
		// continue searching while [imin,imax] is not empty
		while (beginning <= end && beginning < len){
			// calculate the midpoint for roughly equal partition
			var midPoint = Math.floor(beginning + (end - beginning) / 2);
			var event = this._timeline[midPoint];
			if (event.time > time){
				//search lower
				end = midPoint - 1;
			} else if (event.time < time){
				//search upper
				beginning = midPoint + 1;
			} else {
				//found it, return the one before
				return midPoint;
			}
		}
		return beginning;
	};

	Tone.SchedulableSignal.prototype._searchBefore = function(time){
		var index = this._search(time);
		return this._timeline[index - 1];
	};

	Tone.SchedulableSignal.prototype._searchAfter = function(time){
		var index = this._search(time);
		return this._timeline[index];
	};

	/**
	 *  Occationally dispose unneeded timeline events.
	 */
	Tone.SchedulableSignal.prototype._prune = function(){
		if (this._timeline.length > 2){
			var now = this.now();
			var index = this._search(now);
			if (index > 2){
				this._timeline = this._timeline.slice(index - 2);
			}
		}
	};

	/**
	 *  Get the scheduled value at the given time.
	 *  @param  {Number}  time  The time in seconds.
	 *  @return  {Number}  The scheduled value at the given time.
	 *  @private
	 */
	Tone.SchedulableSignal.prototype._getValueAtTime = function(time){
		var after = this._searchAfter(time);
		var before = this._searchBefore(time);
		if (this.isUndef(before)){
			return this._value.value;
		} else if (before.type === Tone.SchedulableSignal.Type.Target){
			var previous = this._searchBefore(before.time);
			var previouVal;
			if (this.isUndef(previous)){
				previouVal = this._value.value;
			} else {
				previouVal = previous.value;
			}
			return this._exponentialApproach(before.time, previouVal, before.value, before.constant, time);
		} else if (this.isUndef(after)){
			return before.value;
		} else if (after.type === Tone.SchedulableSignal.Type.Linear){
			return this._linearInterpolate(before.time, before.value, after.time, after.value, time);
		} else if (after.type === Tone.SchedulableSignal.Type.Exponential){
			return this._exponentialInterpolate(before.time, before.value, after.time, after.value, time);
		} else if (after.type === Tone.SchedulableSignal.Type.Target){
			if (after.time <= time){
				console.log("here");
				return this._exponentialApproach(after.time, before.value, after.value, after.constant, time);
			} else {
				return before.value;
			}
		} else if (after.type === Tone.SchedulableSignal.Type.Set){
			if (after.time === time){
				return after.value;
			} else {
				return before.value;
			}
		} else {
			return 0;
		}
	};

	///////////////////////////////////////////////////////////////////////////
	//	AUTOMATION CURVE CALCULATIONS
	//	MIT License, copyright (c) 2014 Jordan Santell
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Calculates the the value along the curve produced by setTargetAtTime
	 *  @private
	 */
	Tone.SchedulableSignal.prototype._exponentialApproach = function (t0, v0, v1, timeConstant, t) {
		return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
	};

	/**
	 *  Calculates the the value along the curve produced by linearRampToValueAtTime
	 *  @private
	 */
	Tone.SchedulableSignal.prototype._linearInterpolate = function (t0, v0, t1, v1, t) {
		return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
	};

	/**
	 *  Calculates the the value along the curve produced by exponentialRampToValueAtTime
	 *  @private
	 */
	Tone.SchedulableSignal.prototype._exponentialInterpolate = function (t0, v0, t1, v1, t) {
		v0 = Math.max(this._minOutput, v0);
		return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
	};

	/**
	 *  Clean up.
	 *  @return {Tone.SchedulableSignal} this
	 */
	Tone.SchedulableSignal.prototype.dispose = function(){
		Tone.Signal.prototype.dispose.call(this);
		clearInterval(this._interval);
		this._timeline = null;
	};

	return Tone.SchedulableSignal;
});