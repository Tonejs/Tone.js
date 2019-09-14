import * as Classes from "./classes";
import { Transport } from "./core/clock/Transport";
import { Context } from "./core/context/Context";
import { Destination } from "./core/context/Destination";
import { FrequencyClass } from "./core/type/Frequency";
import { MidiClass } from "./core/type/Midi";
import { TicksClass } from "./core/type/Ticks";
import { TimeClass } from "./core/type/Time";
import { TransportTimeClass } from "./core/type/TransportTime";
import { isDefined, isFunction } from "./core/util/TypeCheck";

/**
 * The exported Tone object. Contains all of the classes that default
 * to the same context and contains a singleton Transport and Destination node.
 */
type Tone = {
	Transport: Transport;
	Destination: Destination;
	now: () => number;
} & typeof Classes;

/**
 * Bind the TimeBaseClass to the context
 */
function bindTypeClass(context: Context, type) {
	return (...args: any[]) => new type(context, ...args);
}

/**
 * Return an object with all of the classes bound to the passed in context
 * @param context The context to bind all of the nodes to
 */
export function fromContext(context: Context): Tone {
	const toneFromContext: any = {};
	Object.keys(Classes).forEach(key => {
		const cls = Classes[key];
		if (isDefined(cls) && isFunction(cls.getDefaults)) {
			toneFromContext[key] = class ToneFromContextNode extends cls {
				get defaultContext(): Context {
					return context;
				}
			};
		} else {
			// otherwise just copy it over
			toneFromContext[key] = Classes[key];
		}
	});
	toneFromContext.now = () => context.now();
	toneFromContext.Transport = context.transport;
	toneFromContext.Destination = context.destination;
	// add the type classes
	toneFromContext.Midi = bindTypeClass(context, MidiClass);
	toneFromContext.Time = bindTypeClass(context, TimeClass);
	toneFromContext.Frequency = bindTypeClass(context, FrequencyClass);
	toneFromContext.Ticks = bindTypeClass(context, TicksClass);
	toneFromContext.TransportTime = bindTypeClass(context, TransportTimeClass);
	// return the object
	return toneFromContext as Tone;
}
