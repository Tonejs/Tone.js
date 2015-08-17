define(["Tone/core/Tone"], function (Tone) {

	/**
	 *  @class A Schedulable class has two private functions
	 *         for scheduling and maintaining state: addEvent
	 *         and getEvent. A scheduled event is pushed onto
	 *         a private _timeline array. The event must be an 
	 *         Object with a 'time' attribute.
	 *  @extends {Tone}
	 */
	Tone.Schedulable = function(){

		/**
		 *  The array of scheduled timeline events
		 *  @type  {Array}
		 *  @private
		 */
		this._timeline = [];
	};

	Tone.extend(Tone.Schedulable);

	/**
	 *  Insert an event into the correct position in the timeline.
	 *  @param  {Object}  event  The event object to insert into the 
	 *                           timeline. Events must have a "time" attribute.
	 *  @returns {Tone.Schedulable} this
	 */
	Tone.Schedulable.prototype.addEvent = function(event){
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
	 *  Get the event whose time is less than or equal to the given time.
	 *  @param  {Number}  time  The time to query.
	 *  @returns {Object} The event object set after that time.
	 */
	Tone.Schedulable.prototype.getEvent = function(time){
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
	Tone.Schedulable.prototype.getNextEvent = function(time){
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
	 *  @returns {Tone.Schedulable} this
	 */
	Tone.Schedulable.prototype.clear = function(after){
		after = this.toSeconds(after);
		var index = this._search(after);
		if (index >= 0){
			this._timeline = this._timeline.slice(0, index);
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
	Tone.Schedulable.prototype._search = function(time){
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
	 *  Clean up.
	 *  @return  {Tone.Schedulable}  this
	 */
	Tone.Schedulable.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._timeline = null;
	};

	return Tone.Schedulable;
});