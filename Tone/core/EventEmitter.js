define(["Tone/core/Tone"], function (Tone) {

	/**
	 *  @class Tone.EventEmitter gives classes which extend it
	 *         the ability to listen for and trigger events. 
	 *         Inspiration and reference from Jerome Etienne's [MicroEvent](https://github.com/jeromeetienne/microevent.js).
	 *         MIT (c) 2011 Jerome Etienne.
	 *         
	 *  @extends {Tone}
	 */
	Tone.EventEmitter = function(){
		/**
		 *  Contains all of the events.
		 *  @private
		 *  @type  {Object}
		 */
		this._events = {};
	};

	Tone.extend(Tone.EventEmitter);

	/**
	 *  Bind a callback to a specific event.
	 *  @param  {String}    event     The name of the event to listen for.
	 *  @param  {Function}  callback  The callback to invoke when the
	 *                                event is triggered
	 *  @return  {Tone.EventEmitter}    this
	 */
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

	/**
	 *  Remove the event listener.
	 *  @param  {String}    event     The event to stop listening to.
	 *  @param  {Function}  callback  The callback which was bound to 
	 *                                the event with Tone.EventEmitter.on.
	 *  @return  {Tone.EventEmitter}    this
	 */
	Tone.EventEmitter.prototype.off = function(event, callback){
		var events = event.split(/\W+/);
		for (var ev = 0; ev < events.length; ev++){
			event = events[ev];
			if (this._events.hasOwnProperty(event)){
				var eventList = this._events[event];
				for (var i = 0; i < eventList.length; i++){
					if (eventList[i] === callback){
						eventList.splice(i, 1);
						break;					
					}
				}
			}
		}
		return this;
	};

	/**
	 *  Invoke all of the callbacks bound to the event
	 *  with any arguments passed in. 
	 *  @param  {String}  event  The name of the event.
	 *  @param {*...} args The arguments to pass to the functions listening.
	 *  @return  {Tone.EventEmitter}  this
	 */
	Tone.EventEmitter.prototype.trigger = function(event){
		if (this._events){
			var args = Array.prototype.slice.call(arguments, 1);
			if (this._events.hasOwnProperty(event)){
				var eventList = this._events[event];
				for (var i = 0, len = eventList.length; i < len; i++){
					eventList[i].apply(this, args);
				}
			}
		}
		return this;
	};

	/**
	 *  Add EventEmitter functions (on/off/trigger) to the object
	 *  @param  {Object|Function}  object  The object or class to extend.
	 */
	Tone.EventEmitter.mixin = function(object){
		var functions = ["on", "off", "trigger"];
		object._events = {};
		for (var i = 0; i < functions.length; i++){
			var func = functions[i];
			var emitterFunc = Tone.EventEmitter.prototype[func];
			object[func] = emitterFunc;
		}
	};

	/**
	 *  Clean up
	 *  @return  {Tone.EventEmitter}  this
	 */
	Tone.EventEmitter.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._events = null;
		return this;
	};

	return Tone.EventEmitter;
});