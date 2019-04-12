import { Tone } from "./Tone";
import { isUndef } from "./Util";

interface EventObject {
	[event: string]: Array<(...args: any[]) => void>;
}

/**
 * Emitter gives classes which extend it
 * the ability to listen for and emit events.
 * Inspiration and reference from Jerome Etienne's [MicroEvent](https://github.com/jeromeetienne/microevent.js).
 * MIT (c) 2011 Jerome Etienne.
 */
export class Emitter extends Tone {

	name = "Emitter";

	/**
	 * Private container for the events
	 */
	private _events: EventObject = {};

	/**
	 *  Bind a callback to a specific event.
	 *  @param  event     The name of the event to listen for.
	 *  @param  callback  The callback to invoke when the event is emitted
	 */
	on(event: string, callback: (...args: any[]) => void): Emitter {
		// split the event
		const events = event.split(/\W+/);
		events.forEach(eventName => {
			if (!this._events.hasOwnProperty(eventName)) {
				this._events[eventName] = [];
			}
			this._events[eventName].push(callback);
		});
		return this;
	}

	/**
	 *  Bind a callback which is only invoked once
	 *  @param  event     The name of the event to listen for.
	 *  @param  callback  The callback to invoke when the event is emitted
	 */
	once(event: string, callback: (...args: any[]) => void): Emitter {
		const boundCallback = (...args: any[])  => {
			// invoke the callback
			callback(...args);
			// remove the event
			this.off(event, boundCallback);
		};
		this.on(event, boundCallback);
		return this;
	}

	/**
	 *  Remove the event listener.
	 *  @param  event     The event to stop listening to.
	 *  @param  callback  The callback which was bound to the event with Emitter.on.
	 *                    If no callback is given, all callbacks events are removed.
	 */
	off(event: string, callback?: (...args: any[]) => void): Emitter {
		const events = event.split(/\W+/);
		events.forEach(eventName => {
			if (this._events.hasOwnProperty(event)) {
				if (isUndef(callback)) {
					this._events[event] = [];
				} else {
					const eventList = this._events[event];
					for (let i = 0; i < eventList.length; i++) {
						if (eventList[i] === callback) {
							eventList.splice(i, 1);
						}
					}
				}
			}
		});
		return this;
	}

	/**
	 *  Invoke all of the callbacks bound to the event
	 *  with any arguments passed in.
	 *  @param  event  The name of the event.
	 *  @param args The arguments to pass to the functions listening.
	 */
	emit(event, ...args: any[]): Emitter {
		if (this._events) {
			if (this._events.hasOwnProperty(event)) {
				const eventList = this._events[event].slice(0);
				for (let i = 0, len = eventList.length; i < len; i++) {
					eventList[i].apply(this, args);
				}
			}
		}
		return this;
	}

	/**
	 *  Add Emitter functions (on/off/emit) to the object
	 */
	// static mixin(object) {
	// 	const functions = ["on", "once", "off", "emit"];
	// 	object._events = {};
	// 	functions.forEach(func => {
	// 		const emitterFunc = Emitter.prototype[func];
	// 		object[func] = emitterFunc;
	// 	});
	// 	return Emitter;
	// }

	/**
	 *  Clean up
	 */
	dispose(): Emitter {
		this._events = {};
		return this;
	}
}

