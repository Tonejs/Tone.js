define(["Tone/core/Tone"], function (Tone) {

	/**
	 *  @class Tone.EventEmitter gives classes which extend it
	 *         the ability to listen for and trigger events. 
	 *         
	 *  @extends {Tone}
	 */
	Tone.EventEmitter = function(){
		/**
		 *  The event container2
		 *  @private
		 *  @type  {Object}
		 */
		this._events = {};
	};

	Tone.extend(Tone.EventEmitter);

	Tone.EventEmitter.prototype.on = function(event, callback){
		//split the event
		var events = event.split(/\W+/);
		for (var i = 0; i < events.length; i++){
			var eventName = events[i];
			if (!this._events.hasOwnProperty(eventName)){
				this._events[eventName] = [];
			}
			this._events[eventName].push(callback);
		}
		return this;
	};

	Tone.EventEmitter.prototype.off = function(event, callback){
		if (this._events.hasOwnProperty(event)){
			var eventList = this._events[event];
			for (var i = 0; i < eventList.length; i++){
				if (eventList[i] === callback){
					eventList.splice(i, 1);
					break;					
				}
			}
		}
		return this;
	};

	Tone.EventEmitter.prototype.trigger = function(event){
		var args = Array.prototype.slice.call(arguments, 1);
		if (this._events.hasOwnProperty(event)){
			var eventList = this._events[event];
			for (var i = 0, len = eventList.length; i < len; i++){
				eventList[i].apply(this, args);
			}
		}
		return this;
	};

	Tone.EventEmitter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._events = null;
		return this;
	};

	return Tone.EventEmitter;
});