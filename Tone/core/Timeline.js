define(["Tone/core/Tone"], function(Tone){

	"use strict";

	/**
	 *  @class A Timeline class for scheduling and maintaining state
	 *         along a timeline. All events must have a "time" property.
	 *         Internally, events are stored in time order for fast
	 *         retrieval.
	 *  @extends {Tone}
	 *  @param {Positive} [memory=Infinity] The number of previous events that are retained.
	 */
	Tone.Timeline = function(){

		var options = Tone.defaults(arguments, ["memory"], Tone.Timeline);
		Tone.call(this);

		/**
		 *  The array of scheduled timeline events
		 *  @type  {Array}
		 *  @private
		 */
		this._timeline = [];

		/**
		 *  The memory of the timeline, i.e.
		 *  how many events in the past it will retain
		 *  @type {Positive}
		 */
		this.memory = options.memory;
	};

	Tone.extend(Tone.Timeline);

	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 */
	Tone.Timeline.defaults = {
		"memory" : Infinity
	};

	/**
	 *  The number of items in the timeline.
	 *  @type {Number}
	 *  @memberOf Tone.Timeline#
	 *  @name length
	 *  @readOnly
	 */
	Object.defineProperty(Tone.Timeline.prototype, "length", {
		get : function(){
			return this._timeline.length;
		}
	});

	/**
	 *  Insert an event object onto the timeline. Events must have a "time" attribute.
	 *  @param  {Object}  event  The event object to insert into the
	 *                           timeline.
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.add = function(event){
		//the event needs to have a time attribute
		if (Tone.isUndef(event.time)){
			throw new Error("Tone.Timeline: events must have a time attribute");
		}
		event.time = event.time.valueOf();
		var index = this._search(event.time);
		this._timeline.splice(index + 1, 0, event);
		//if the length is more than the memory, remove the previous ones
		if (this.length > this.memory){
			var diff = this.length - this.memory;
			this._timeline.splice(0, diff);
		}
		return this;
	};

	/**
	 *  Remove an event from the timeline.
	 *  @param  {Object}  event  The event object to remove from the list.
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.remove = function(event){
		var index = this._timeline.indexOf(event);
		if (index !== -1){
			this._timeline.splice(index, 1);
		}
		return this;
	};

	/**
	 *  Get the nearest event whose time is less than or equal to the given time.
	 *  @param  {Number}  time  The time to query.
	 *  @param  {String}  comparator Which value in the object to compare
	 *  @returns {Object} The event object set after that time.
	 */
	Tone.Timeline.prototype.get = function(time, comparator){
		comparator = Tone.defaultArg(comparator, "time");
		var index = this._search(time, comparator);
		if (index !== -1){
			return this._timeline[index];
		} else {
			return null;
		}
	};

	/**
	 *  Return the first event in the timeline without removing it
	 *  @returns {Object} The first event object
	 */
	Tone.Timeline.prototype.peek = function(){
		return this._timeline[0];
	};

	/**
	 *  Return the first event in the timeline and remove it
	 *  @returns {Object} The first event object
	 */
	Tone.Timeline.prototype.shift = function(){
		return this._timeline.shift();
	};

	/**
	 *  Get the event which is scheduled after the given time.
	 *  @param  {Number}  time  The time to query.
	 *  @param  {String}  comparator Which value in the object to compare
	 *  @returns {Object} The event object after the given time
	 */
	Tone.Timeline.prototype.getAfter = function(time, comparator){
		comparator = Tone.defaultArg(comparator, "time");
		var index = this._search(time, comparator);
		if (index + 1 < this._timeline.length){
			return this._timeline[index + 1];
		} else {
			return null;
		}
	};

	/**
	 *  Get the event before the event at the given time.
	 *  @param  {Number}  time  The time to query.
	 *  @param  {String}  comparator Which value in the object to compare
	 *  @returns {Object} The event object before the given time
	 */
	Tone.Timeline.prototype.getBefore = function(time, comparator){
		comparator = Tone.defaultArg(comparator, "time");
		var len = this._timeline.length;
		//if it's after the last item, return the last item
		if (len > 0 && this._timeline[len - 1][comparator] < time){
			return this._timeline[len - 1];
		}
		var index = this._search(time, comparator);
		if (index - 1 >= 0){
			return this._timeline[index - 1];
		} else {
			return null;
		}
	};

	/**
	 *  Cancel events after the given time
	 *  @param  {Number}  time  The time to query.
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.cancel = function(after){
		if (this._timeline.length > 1){
			var index = this._search(after);
			if (index >= 0){
				if (this._timeline[index].time === after){
					//get the first item with that time
					for (var i = index; i >= 0; i--){
						if (this._timeline[i].time === after){
							index = i;
						} else {
							break;
						}
					}
					this._timeline = this._timeline.slice(0, index);
				} else {
					this._timeline = this._timeline.slice(0, index + 1);
				}
			} else {
				this._timeline = [];
			}
		} else if (this._timeline.length === 1){
			//the first item's time
			if (this._timeline[0].time >= after){
				this._timeline = [];
			}
		}
		return this;
	};

	/**
	 *  Cancel events before or equal to the given time.
	 *  @param  {Number}  time  The time to cancel before.
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.cancelBefore = function(time){
		var index = this._search(time);
		if (index >= 0){
			this._timeline = this._timeline.slice(index + 1);
		}
		return this;
	};

	/**
	 * Returns the previous event if there is one. null otherwise
	 * @param  {Object} event The event to find the previous one of
	 * @return {Object}       The event right before the given event
	 */
	Tone.Timeline.prototype.previousEvent = function(event){
		var index = this._timeline.indexOf(event);
		if (index > 0){
			return this._timeline[index-1];
		} else {
			return null;
		}
	};

	/**
	 *  Does a binary search on the timeline array and returns the
	 *  nearest event index whose time is after or equal to the given time.
	 *  If a time is searched before the first index in the timeline, -1 is returned.
	 *  If the time is after the end, the index of the last item is returned.
	 *  @param  {Number}  time
	 *  @param  {String}  comparator Which value in the object to compare
	 *  @return  {Number} the index in the timeline array
	 *  @private
	 */
	Tone.Timeline.prototype._search = function(time, comparator){
		if (this._timeline.length === 0){
			return -1;
		}
		comparator = Tone.defaultArg(comparator, "time");
		var beginning = 0;
		var len = this._timeline.length;
		var end = len;
		if (len > 0 && this._timeline[len - 1][comparator] <= time){
			return len - 1;
		}
		while (beginning < end){
			// calculate the midpoint for roughly equal partition
			var midPoint = Math.floor(beginning + (end - beginning) / 2);
			var event = this._timeline[midPoint];
			var nextEvent = this._timeline[midPoint + 1];
			if (event[comparator] === time){
				//choose the last one that has the same time
				for (var i = midPoint; i < this._timeline.length; i++){
					var testEvent = this._timeline[i];
					if (testEvent[comparator] === time){
						midPoint = i;
					}
				}
				return midPoint;
			} else if (event[comparator] < time && nextEvent[comparator] > time){
				return midPoint;
			} else if (event[comparator] > time){
				//search lower
				end = midPoint;
			} else {
				//search upper
				beginning = midPoint + 1;
			}
		}
		return -1;
	};

	/**
	 *  Internal iterator. Applies extra safety checks for
	 *  removing items from the array.
	 *  @param  {Function}  callback
	 *  @param  {Number=}    lowerBound
	 *  @param  {Number=}    upperBound
	 *  @private
	 */
	Tone.Timeline.prototype._iterate = function(callback, lowerBound, upperBound){
		lowerBound = Tone.defaultArg(lowerBound, 0);
		upperBound = Tone.defaultArg(upperBound, this._timeline.length-1);
		this._timeline.slice(lowerBound, upperBound+1).forEach(function(event){
			callback.call(this, event);
		}.bind(this));
	};

	/**
	 *  Iterate over everything in the array
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.forEach = function(callback){
		this._iterate(callback);
		return this;
	};

	/**
	 *  Iterate over everything in the array at or before the given time.
	 *  @param  {Number}  time The time to check if items are before
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.forEachBefore = function(time, callback){
		//iterate over the items in reverse so that removing an item doesn't break things
		var upperBound = this._search(time);
		if (upperBound !== -1){
			this._iterate(callback, 0, upperBound);
		}
		return this;
	};

	/**
	 *  Iterate over everything in the array after the given time.
	 *  @param  {Number}  time The time to check if items are before
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.forEachAfter = function(time, callback){
		//iterate over the items in reverse so that removing an item doesn't break things
		var lowerBound = this._search(time);
		this._iterate(callback, lowerBound + 1);
		return this;
	};

	/**
	 *  Iterate over everything in the array between the startTime and endTime. 
	 *  The timerange is inclusive of the startTime, but exclusive of the endTime. 
	 *  range = [startTime, endTime). 
	 *  @param  {Number}  startTime The time to check if items are before
	 *  @param  {Number}  endTime The end of the test interval. 
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.forEachBetween = function(startTime, endTime, callback){
		var lowerBound = this._search(startTime);
		var upperBound = this._search(endTime);
		if (lowerBound !== -1 && upperBound !== -1){
			if (this._timeline[lowerBound].time !== startTime){
				lowerBound += 1;
			}
			//exclusive of the end time
			if (this._timeline[upperBound].time === endTime){
				upperBound -= 1;
			}
			this._iterate(callback, lowerBound, upperBound);
		} else if (lowerBound === -1){
			this._iterate(callback, 0, upperBound);
		}
		return this;
	};

	/**
	 *  Iterate over everything in the array at or after the given time. Similar to
	 *  forEachAfter, but includes the item(s) at the given time.
	 *  @param  {Number}  time The time to check if items are before
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.forEachFrom = function(time, callback){
		//iterate over the items in reverse so that removing an item doesn't break things
		var lowerBound = this._search(time);
		//work backwards until the event time is less than time
		while (lowerBound >= 0 && this._timeline[lowerBound].time >= time){
			lowerBound--;
		}
		this._iterate(callback, lowerBound + 1);
		return this;
	};

	/**
	 *  Iterate over everything in the array at the given time
	 *  @param  {Number}  time The time to check if items are before
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.forEachAtTime = function(time, callback){
		//iterate over the items in reverse so that removing an item doesn't break things
		var upperBound = this._search(time);
		if (upperBound !== -1){
			this._iterate(function(event){
				if (event.time === time){
					callback.call(this, event);
				}
			}, 0, upperBound);
		}
		return this;
	};

	/**
	 *  Clean up.
	 *  @return  {Tone.Timeline}  this
	 */
	Tone.Timeline.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._timeline = null;
		return this;
	};

	return Tone.Timeline;
});
