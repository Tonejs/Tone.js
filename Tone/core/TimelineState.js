define(["Tone/core/Tone", "Tone/core/Timeline", "Tone/type/Type"], function (Tone) {

	"use strict";

	/**
	 *  @class  A Timeline State. Provides the methods: <code>setStateAtTime("state", time)</code>
	 *          and <code>getStateAtTime(time)</code>.
	 *
	 *  @extends {Tone.Timeline}
	 *  @param {String} initial The initial state of the TimelineState. 
	 *                          Defaults to <code>undefined</code>
	 */
	Tone.TimelineState = function(initial){

		Tone.Timeline.call(this);

		/**
		 *  The initial state
		 *  @private
		 *  @type {String}
		 */
		this._initial = initial;
	};

	Tone.extend(Tone.TimelineState, Tone.Timeline);

	/**
	 *  Returns the scheduled state scheduled before or at
	 *  the given time.
	 *  @param  {Number}  time  The time to query.
	 *  @return  {String}  The name of the state input in setStateAtTime.
	 */
	Tone.TimelineState.prototype.getStateAtTime = function(time){
		var event = this.getEvent(time);
		if (event !== null){
			return event.state;
		} else {
			return this._initial;
		}
	};

	/**
	 *  Returns the scheduled state scheduled before or at
	 *  the given time.
	 *  @param  {String}  state The name of the state to set.
	 *  @param  {Number}  time  The time to query.
	 */
	Tone.TimelineState.prototype.setStateAtTime = function(state, time){
		this.addEvent({
			"state" : state,
			"time" : time
		});
	};

	return Tone.TimelineState;
});