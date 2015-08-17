define(["Tone/core/Tone", "Tone/core/Schedulable", "Tone/core/Types"], function (Tone) {

	/**
	 *  @class  A Schedulable State. Provides the methods: <code>setStateAtTime("state", time)</code>
	 *          and <code>getStateAtTime(time)</code>.
	 *
	 *  @extends {Tone.Schedulable}
	 *  @param {String} initial The initial state of the SchedulableState. 
	 *                          Defaults to <code>undefined</code>
	 */
	Tone.SchedulableState = function(initial){

		Tone.Schedulable.call(this);

		/**
		 *  The initial state
		 *  @private
		 *  @type {String}
		 */
		this._initial = initial;
	};

	Tone.extend(Tone.SchedulableState, Tone.Schedulable);

	/**
	 *  Returns the scheduled state scheduled before or at
	 *  the given time.
	 *  @param  {Time}  time  The time to query.
	 *  @return  {String}  The name of the state input in setStateAtTime.
	 */
	Tone.SchedulableState.prototype.getStateAtTime = function(time){
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
	 *  @param  {Time}  time  The time to query.
	 */
	Tone.SchedulableState.prototype.setStateAtTime = function(state, time){
		this.addEvent({
			"state" : state,
			"time" : this.toSeconds(time)
		});
	};

	return Tone.SchedulableState;
});