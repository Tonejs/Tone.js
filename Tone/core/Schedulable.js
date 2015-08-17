define(["Tone/core/Tone"], function (Tone) {

	/**
	 *  @class A Schedulable class has two private functions
	 *         for scheduling and maintaining state: _insertEvent
	 *         and _getEvent. A scheduled event is pushed onto
	 *         a private _timeline array. The event must be an 
	 *         Object with a 'time' attribute.
	 *  @extends {Tone}
	 */
	Tone.Schedulable = function(){

		Tone.apply(this, arguments);

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
	 *  @private
	 */
	Tone.Schedulable.prototype._insertEvent = function(event){
		//the event needs to have a time attribute
		if (this.isUndef(event.time)){
			throw new Error("events must have a time attribute");
		}
		if (this._timeline.length){
			var index = this._search(event.time);
			this._timeline.splice(index + 1, 0, event);
		} else {
			this._timeline.push(event);			
		}
		return this;
	};

	/**
	 *  Get the event at or after the given time
	 *  @param  {Number}  time  The time to query.
	 *  @returns {Object} The event object set after that time.
	 *  @private
	 */
	Tone.Schedulable.prototype._getEvent = function(time){
		var index = this._search(time);
		if (index !== -1){
			return this._timeline[index];
		} else {
			return null;
		}
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