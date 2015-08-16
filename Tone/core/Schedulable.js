define(["Tone/core/Tone"], function (Tone) {

	/**
	 *  @class A Schedulable class has two private functions
	 *         for scheduling and maintaining state: _setStateAtTime
	 *         and _getStateAtTime.
	 *  @extends {Tone}
	 */
	Tone.Schedulable = function(){

		Tone.apply(this, arguments);

		this._timeline = [];
	};

	Tone.extend(Tone.Schedulable);

	/**
	 *  Set the state at the 
	 *  @param  {[type]}  type  [description]
	 *  @param  {[type]}  time  [description]
	 */
	Tone.Schedulable.prototype._setStateAtTime = function(type, time){
		var event = {
			"type" : type, 
			"time" : time
		};
		//put it in the right spot
		for (var i = 0, len = this._timeline.length; i<len; i++){
			var testEvnt = this._timeline[i];
			if (testEvnt.time > event.time){
				this._timeline.splice(i, 0, event);
				return this;
			}
		}
		//otherwise push it on the end
		this._timeline.push(event);
		return this;
	};

	Tone.Schedulable.prototype._getStateAtTime = function(time){
		if (this._timeline.length > 0){
			var currentState = this._timeline[0];
			for (var i = 1; i < this._timeline.length; i++){
				var event = this._timeline[i];
				if (event.time <= time){
					currentState = event;
				} else {
					return currentState.type;
				}
			}
			return currentState.type;
		}
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