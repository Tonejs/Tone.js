import Tone from "../core/Tone";
import "../core/Timeline";
import "../type/Type";

/**
 *  @class  A Timeline State. Provides the methods: <code>setStateAtTime("state", time)</code>
 *          and <code>getValueAtTime(time)</code>.
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
Tone.TimelineState.prototype.getValueAtTime = function(time){
	var event = this.get(time);
	if (event !== null){
		return event.state;
	} else {
		return this._initial;
	}
};

/**
 *  Add a state to the timeline.
 *  @param  {String}  state The name of the state to set.
 *  @param  {Number}  time  The time to query.
 *  @returns {Tone.TimelineState} this
 */
Tone.TimelineState.prototype.setStateAtTime = function(state, time){
	//all state changes need to be >= the previous state time
	//TODO throw error if time < the previous event time
	this.add({
		"state" : state,
		"time" : time
	});
	return this;
};

/**
 *  Return the event before the time with the given state
 *  @param {Tone.State} state The state to look for
 *  @param  {Time}  time  When to check before			
 *  @return  {Object}  The event with the given state before the time
 */
Tone.TimelineState.prototype.getLastState = function(state, time){
	time = this.toSeconds(time);
	var index = this._search(time);
	for (var i = index; i >= 0; i--){
		var event = this._timeline[i];
		if (event.state === state){
			return event;
		}
	}
};

/**
 *  Return the event after the time with the given state
 *  @param {Tone.State} state The state to look for
 *  @param  {Time}  time  When to check from
 *  @return  {Object}  The event with the given state after the time
 */
Tone.TimelineState.prototype.getNextState = function(state, time){
	time = this.toSeconds(time);
	var index = this._search(time);
	if (index !== -1){
		for (var i = index; i < this._timeline.length; i++){
			var event = this._timeline[i];
			if (event.state === state){
				return event;
			}
		}
	}
};

export default Tone.TimelineState;

