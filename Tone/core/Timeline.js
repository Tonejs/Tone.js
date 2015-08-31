define(["Tone/core/Tone", "Tone/core/Types"], function (Tone) {

	/**
	 *  @class A Timeline class for scheduling and maintaining state
	 *         along a timeline. All events must have a "time" property. 
	 *         Internally, events are stored in time order for fast 
	 *         retrieval.
	 *  @extends {Tone}
	 */
	Tone.Timeline = function(){

		/**
		 *  The array of scheduled timeline events
		 *  @type  {Array}
		 *  @private
		 */
		this._timeline = [];
	};

	Tone.extend(Tone.Timeline);

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
	Tone.Timeline.prototype.addEvent = function(event){
		//the event needs to have a time attribute
		if (this.isUndef(event.time)){
			throw new Error("events must have a time attribute");
		}
		event.time = this.toSeconds(event.time);
		if (this._timeline.length){
			var index = this._search(event.time);
			this._timeline.splice(index + 1, 0, event);
		} else {
			this._timeline.push(event);			
		}
		return this;
	};

	/**
	 *  Remove an event from the timeline.
	 *  @param  {Object}  event  The event object to remove from the list.
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.removeEvent = function(event){
		this.forEachAtTime(event.time, function(testEvent, index){
			if (testEvent === event){
				this._timeline.splice(index, 1);
			}
		}.bind(this));
		return this;
	};

	/**
	 *  Get the event whose time is less than or equal to the given time.
	 *  @param  {Number}  time  The time to query.
	 *  @returns {Object} The event object set after that time.
	 */
	Tone.Timeline.prototype.getEvent = function(time){
		time = this.toSeconds(time);
		var index = this._search(time);
		if (index !== -1){
			return this._timeline[index];
		} else {
			return null;
		}
	};

	/**
	 *  Get the next event after the current event.
	 *  @param  {Number}  time  The time to query.
	 *  @returns {Object} The event object after the given time
	 */
	Tone.Timeline.prototype.getNextEvent = function(time){
		time = this.toSeconds(time);
		var index = this._search(time);
		if (index + 1 < this._timeline.length){
			return this._timeline[index + 1];
		} else {
			return null;
		}
	};

	/**
	 *  Cancel events after the given time
	 *  @param  {Time}  time  The time to query.
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.clear = function(after){
		if (this._timeline.length){
			after = this.toSeconds(after);
			var index = this._search(after);
			if (index >= 0){
				this._timeline = this._timeline.slice(0, index);
			} else {
				this._timeline = [];
			}
		}
		return this;
	};

	/**
	 *  Cancel events before or equal to the given time.
	 *  @param  {Time}  time  The time to clear before.
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.clearBefore = function(time){
		if (this._timeline.length){
			time = this.toSeconds(time);
			var index = this._search(time);
			if (index >= 0){
				this._timeline = this._timeline.slice(index + 1);
			}
		}
		return this;
	};

	/**
	 *  Does a binary serach on the timeline array and returns the 
	 *  event which is after or equal to the time.
	 *  @param  {Number}  time  
	 *  @return  {Number} the index in the timeline array 
	 *  @private
	 */
	Tone.Timeline.prototype._search = function(time){
		var beginning = 0;
		var len = this._timeline.length;
		var end = len;
		// continue searching while [imin,imax] is not empty
		while (beginning <= end && beginning < len){
			// calculate the midpoint for roughly equal partition
			var midPoint = Math.floor(beginning + (end - beginning) / 2);
			var event = this._timeline[midPoint];
			if (event.time === time){
				//choose the last one that has the same time
				for (var i = midPoint; i < this._timeline.length; i++){
					var testEvent = this._timeline[i];
					if (testEvent.time === time){
						midPoint = i;
					}
				}
				return midPoint;
			} else if (event.time > time){
				//search lower
				end = midPoint - 1;
			} else if (event.time < time){
				//search upper
				beginning = midPoint + 1;
			} 
		}
		return beginning - 1;
	};

	/**
	 *  Iterate over everything in the array
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.forEach = function(callback){
		//iterate over the items in reverse so that removing an item doesn't break things
		for (var i = this._timeline.length - 1; i >= 0; i--){
			callback(this._timeline[i], i);
		}
		return this;
	};

	/**
	 *  Iterate over everything in the array at or before the given time.
	 *  @param  {Time}  time The time to check if items are before
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.forEachBefore = function(time, callback){
		//iterate over the items in reverse so that removing an item doesn't break things
		time = this.toSeconds(time);
		var startIndex = this._search(time);
		if (startIndex !== -1){
			for (var i = startIndex; i >= 0; i--){
				callback(this._timeline[i], i);
			}
		}
		return this;
	};

	/**
	 *  Iterate over everything in the array at or before the given time.
	 *  @param  {Time}  time The time to check if items are before
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.forEachAfter = function(time, callback){
		//iterate over the items in reverse so that removing an item doesn't break things
		time = this.toSeconds(time);
		var endIndex = this._search(time);
		if (endIndex !== -1){
			for (var i = this._timeline.length - 1; i > endIndex; i--){
				callback(this._timeline[i], i);
			}
		}
		return this;
	};

	/**
	 *  Iterate over everything in the array at the given time
	 *  @param  {Time}  time The time to check if items are before
	 *  @param  {Function}  callback The callback to invoke with every item
	 *  @returns {Tone.Timeline} this
	 */
	Tone.Timeline.prototype.forEachAtTime = function(time, callback){
		//iterate over the items in reverse so that removing an item doesn't break things
		time = this.toSeconds(time);
		var index = this._search(time);
		if (index !== -1){
			for (var i = index; i >= 0; i--){
				var event = this._timeline[i];
				if (event.time === time){
					callback(event, i);
				} else {
					break;
				}
			}
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
	};

	return Tone.Timeline;
});