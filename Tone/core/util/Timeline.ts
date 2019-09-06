import { Tone } from "../Tone";
import { optionsFromArguments } from "./Defaults";

type TimelineSearchParam = "ticks" | "time";

/**
 * The options object for Timeline
 */
interface TimelineOptions {
	memory: number;
}

/**
 * An event must have a time number
 */
export interface TimelineEvent {
	time: number;
}

/**
 * A Timeline class for scheduling and maintaining state
 * along a timeline. All events must have a "time" property.
 * Internally, events are stored in time order for fast
 * retrieval.
 * @category Core
 */
export class Timeline<GenericEvent extends TimelineEvent> extends Tone {

	readonly name: string = "Timeline";

	/**
	 *  The memory of the timeline, i.e.
	 *  how many events in the past it will retain
	 */
	memory: number;

	/**
	 * The array of scheduled timeline events
	 */
	protected _timeline: GenericEvent[] = [];

	/**
	 * @param memory The number of previous events that are retained.
	 */
	constructor(memory?: number);
	// tslint:disable-next-line: unified-signatures
	constructor(options?: Partial<TimelineOptions>);
	constructor() {
		super();
		const options = optionsFromArguments(Timeline.getDefaults(), arguments, ["memory"]);

		this.memory = options.memory;
	}

	static getDefaults(): TimelineOptions {
		return {
			memory: Infinity,
		};
	}

	/**
	 *  The number of items in the timeline.
	 */
	get length(): number {
		return this._timeline.length;
	}

	/**
	 *  Insert an event object onto the timeline. Events must have a "time" attribute.
	 * @param event  The event object to insert into the timeline.
	 */
	add(event: GenericEvent): this {
		// the event needs to have a time attribute
		this.assert(Reflect.has(event, "time"), "Timeline: events must have a time attribute");
		event.time = event.time.valueOf();
		const index = this._search(event.time);
		this._timeline.splice(index + 1, 0, event);
		// if the length is more than the memory, remove the previous ones
		if (this.length > this.memory) {
			const diff = this.length - this.memory;
			this._timeline.splice(0, diff);
		}
		return this;
	}

	/**
	 *  Remove an event from the timeline.
	 * @param  {Object}  event  The event object to remove from the list.
	 * @returns {Timeline} this
	 */
	remove(event: GenericEvent): this {
		const index = this._timeline.indexOf(event);
		if (index !== -1) {
			this._timeline.splice(index, 1);
		}
		return this;
	}

	/**
	 *  Get the nearest event whose time is less than or equal to the given time.
	 * @param  time  The time to query.
	 */
	get(time: number, param: TimelineSearchParam = "time"): GenericEvent | null {
		const index = this._search(time, param);
		if (index !== -1) {
			return this._timeline[index];
		} else {
			return null;
		}
	}

	/**
	 *  Return the first event in the timeline without removing it
	 * @returns {Object} The first event object
	 */
	peek(): GenericEvent | undefined {
		return this._timeline[0];
	}

	/**
	 *  Return the first event in the timeline and remove it
	 */
	shift(): GenericEvent | undefined {
		return this._timeline.shift();
	}

	/**
	 *  Get the event which is scheduled after the given time.
	 * @param  time  The time to query.
	 */
	getAfter(time: number, param: TimelineSearchParam = "time"): GenericEvent | null {
		const index = this._search(time, param);
		if (index + 1 < this._timeline.length) {
			return this._timeline[index + 1];
		} else {
			return null;
		}
	}

	/**
	 *  Get the event before the event at the given time.
	 * @param  time  The time to query.
	 */
	getBefore(time: number): GenericEvent | null {
		const len = this._timeline.length;
		// if it's after the last item, return the last item
		if (len > 0 && this._timeline[len - 1].time < time) {
			return this._timeline[len - 1];
		}
		const index = this._search(time);
		if (index - 1 >= 0) {
			return this._timeline[index - 1];
		} else {
			return null;
		}
	}

	/**
	 *  Cancel events at and after the given time
	 * @param  time  The time to query.
	 */
	cancel(after: number): this {
		if (this._timeline.length > 1) {
			let index = this._search(after);
			if (index >= 0) {
				if (this._timeline[index].time === after) {
					// get the first item with that time
					for (let i = index; i >= 0; i--) {
						if (this._timeline[i].time === after) {
							index = i;
						} else {
							break;
						}
					}
					this._timeline = this._timeline.slice(0, index);
				} else {
					this._timeline = this._timeline.slice(0, index + 1);
				}
			} else {
				this._timeline = [];
			}
		} else if (this._timeline.length === 1) {
			// the first item's time
			if (this._timeline[0].time >= after) {
				this._timeline = [];
			}
		}
		return this;
	}

	/**
	 *  Cancel events before or equal to the given time.
	 * @param  time  The time to cancel before.
	 */
	cancelBefore(time: number): this {
		const index = this._search(time);
		if (index >= 0) {
			this._timeline = this._timeline.slice(index + 1);
		}
		return this;
	}

	/**
	 * Returns the previous event if there is one. null otherwise
	 * @param  event The event to find the previous one of
	 * @return The event right before the given event
	 */
	previousEvent(event: GenericEvent): GenericEvent | null {
		const index = this._timeline.indexOf(event);
		if (index > 0) {
			return this._timeline[index - 1];
		} else {
			return null;
		}
	}

	/**
	 *  Does a binary search on the timeline array and returns the
	 *  nearest event index whose time is after or equal to the given time.
	 *  If a time is searched before the first index in the timeline, -1 is returned.
	 *  If the time is after the end, the index of the last item is returned.
	 * @param  time
	 */
	protected _search(time: number, param: TimelineSearchParam = "time"): number {
		if (this._timeline.length === 0) {
			return -1;
		}
		let beginning = 0;
		const len = this._timeline.length;
		let end = len;
		if (len > 0 && this._timeline[len - 1][param] <= time) {
			return len - 1;
		}
		while (beginning < end) {
			// calculate the midpoint for roughly equal partition
			let midPoint = Math.floor(beginning + (end - beginning) / 2);
			const event = this._timeline[midPoint];
			const nextEvent = this._timeline[midPoint + 1];
			if (event[param] === time) {
				// choose the last one that has the same time
				for (let i = midPoint; i < this._timeline.length; i++) {
					const testEvent = this._timeline[i];
					if (testEvent[param] === time) {
						midPoint = i;
					}
				}
				return midPoint;
			} else if (event[param] < time && nextEvent[param] > time) {
				return midPoint;
			} else if (event[param] > time) {
				// search lower
				end = midPoint;
			} else {
				// search upper
				beginning = midPoint + 1;
			}
		}
		return -1;
	}

	/**
	 *  Internal iterator. Applies extra safety checks for
	 *  removing items from the array.
	 */
	private _iterate(
		callback: (event: GenericEvent) => void,
		lowerBound = 0, upperBound = this._timeline.length - 1,
	): void {
		this._timeline.slice(lowerBound, upperBound + 1).forEach(callback);
	}

	/**
	 *  Iterate over everything in the array
	 * @param  callback The callback to invoke with every item
	 */
	forEach(callback: (event: GenericEvent) => void): this {
		this._iterate(callback);
		return this;
	}

	/**
	 *  Iterate over everything in the array at or before the given time.
	 * @param  time The time to check if items are before
	 * @param  callback The callback to invoke with every item
	 */
	forEachBefore(time, callback: (event: GenericEvent) => void): this {
		// iterate over the items in reverse so that removing an item doesn't break things
		const upperBound = this._search(time);
		if (upperBound !== -1) {
			this._iterate(callback, 0, upperBound);
		}
		return this;
	}

	/**
	 *  Iterate over everything in the array after the given time.
	 * @param  time The time to check if items are before
	 * @param  callback The callback to invoke with every item
	 */
	forEachAfter(time, callback: (event: GenericEvent) => void): this {
		// iterate over the items in reverse so that removing an item doesn't break things
		const lowerBound = this._search(time);
		this._iterate(callback, lowerBound + 1);
		return this;
	}

	/**
	 *  Iterate over everything in the array between the startTime and endTime.
	 *  The timerange is inclusive of the startTime, but exclusive of the endTime.
	 *  range = [startTime, endTime).
	 * @param  startTime The time to check if items are before
	 * @param  endTime The end of the test interval.
	 * @param  callback The callback to invoke with every item
	 */
	forEachBetween(startTime: number, endTime: number, callback: (event: GenericEvent) => void): this {
		let lowerBound = this._search(startTime);
		let upperBound = this._search(endTime);
		if (lowerBound !== -1 && upperBound !== -1) {
			if (this._timeline[lowerBound].time !== startTime) {
				lowerBound += 1;
			}
			// exclusive of the end time
			if (this._timeline[upperBound].time === endTime) {
				upperBound -= 1;
			}
			this._iterate(callback, lowerBound, upperBound);
		} else if (lowerBound === -1) {
			this._iterate(callback, 0, upperBound);
		}
		return this;
	}

	/**
	 *  Iterate over everything in the array at or after the given time. Similar to
	 *  forEachAfter, but includes the item(s) at the given time.
	 * @param  time The time to check if items are before
	 * @param  callback The callback to invoke with every item
	 */
	forEachFrom(time: number, callback: (event: GenericEvent) => void): this {
		// iterate over the items in reverse so that removing an item doesn't break things
		let lowerBound = this._search(time);
		// work backwards until the event time is less than time
		while (lowerBound >= 0 && this._timeline[lowerBound].time >= time) {
			lowerBound--;
		}
		this._iterate(callback, lowerBound + 1);
		return this;
	}

	/**
	 *  Iterate over everything in the array at the given time
	 * @param  time The time to check if items are before
	 * @param  callback The callback to invoke with every item
	 */
	forEachAtTime(time: number, callback: (event: GenericEvent) => void): this {
		// iterate over the items in reverse so that removing an item doesn't break things
		const upperBound = this._search(time);
		if (upperBound !== -1) {
			this._iterate(event => {
				if (event.time === time) {
					callback(event);
				}
			}, 0, upperBound);
		}
		return this;
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._timeline = [];
		return this;
	}
}
