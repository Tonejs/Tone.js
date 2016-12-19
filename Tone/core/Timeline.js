define(["Tone/core/Tone", "Tone/type/Type"], function (Tone) {

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

		var options = this.optionsObject(arguments, ["memory"], Tone.Timeline.defaults);

		/**
		 *  The array of scheduled timeline events
		 *  @type  {Array}
		 *  @private
		 */
		this._timeline = [];

		/**
		 *  An array of items to remove from the list. 
		 *  @type {Array}
		 *  @private
		 */
		this._toRemove = [];

		/**
		 *  Flag if the tieline is mid iteration
		 *  @private
		 *  @type {Boolean}
		 */
		this._iterating = false;

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
		if (this.isUndef(event.time)){
			throw new Error("Tone.Timeline: events must have a time attribute");
		}
		if (this._timeline.length){
			var index = this._search(event.time);
			this._timeline.splice(index + 1, 0, event);
		} else {
			this._timeline.push(event);			
		}
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
		if (this._iterating){
			this._toRemove.push(event);
		} else {
			var index = this._timeline.indexOf(event);
			if (index !== -1){
				this._timeline.splice(index, 1);
			}
		}
		return this;
	};

	/**
	 *  Get the nearest event whose time is less than or equal to the given time.
	 *  @param  {Number}  time  The time to query.
	 *  @returns {Object} The event object set after that time.
	 */
	Tone.Timeline.prototype.get = function(time){
		var index = this._search(time);
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
	 *  @returns {Object} The event object after the given time
	 */
	Tone.Timeline.prototype.getAfter = function(time){
		var index = this._search(time);
		if (index + 1 < this._timeline.length){
			return this._timeline[index + 1];
		} else {
			return null;
		}
	};

	/**
	 *  Get the event before the event at the given time.
	 *  @param  {Number}  time  The time to query.
	 *  @returns {Object} The event object before the given time
	 */
	Tone.Timeline.prototype.getBefore = function(time){
		var len = this._timeline.length;
		//if it's after the last item, return the last item
		if (len > 0 && this._timeline[len - 1].time < time){
			return this._timeline[len - 1];
		}
		var index = this._search(time);
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
		if (this._timeline.length){
			var index = this._search(time);
			if (index >= 0){
				this._timeline = this._timeline.slice(index + 1);
			}
		}
		return this;
	};

	/**
	 *  Does a binary serach on the timeline array and returns the 
	 *  nearest event index whose time is after or equal to the given time.
	 *  If a time is searched before the first index in the timeline, -1 is returned.
	 *  If the time is after the end, the index of the last item is returned.
	 *  @param  {Number}  time  
	 *  @return  {Number} the index in the timeline array 
	 *  @private
	 */
	Tone.Timeline.prototype._search = function(time){
		var beginning = 0;
		var len = this._timeline.length;
		var end = len;
		if (len > 0 && this._timeline[len - 1].time <= time){
			return len - 1;
		}
		while (beginning < end){
			// calculate the midpoint for roughly equal partition
			var midPoint = Math.floor(beginning + (end - beginning) / 2);
			var event = this._timeline[midPoint];
			var nextEvent = this._timeline[midPoint + 1];
			if (event.time === time){
				//choose the last one that has the same time
				for (var i = midPoint; i < this._timeline.length; i++){
					var testEvent = this._timeline[i];
					if (testEvent.time === time){
						midPoint = i;
					}
				}
				return midPoint;
			} else if (event.time < time && nextEvent.time > time){
				return midPoint;
			} else if (event.time > time){
				//search lower
				end = midPoint;
			} else if (event.time < time){
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
		this._iterating = true;
		lowerBound = this.defaultArg(lowerBound, 0);
		upperBound = this.defaultArg(upperBound, this._timeline.length - 1);
		for (var i = lowerBound; i <= upperBound; i++){
			callback(this._timeline[i]);
		}
		this._iterating = false;
		if (this._toRemove.length > 0){
			for (var j = 0; j < this._toRemove.length; j++){
				var index = this._timeline.indexOf(this._toRemove[j]);
				if (index !== -1){
					this._timeline.splice(index, 1);
				}
			}
			this._toRemove = [];
		}
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
					callback(event);
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
		this._toRemove = null;
	};

	return Tone.Timeline;
});