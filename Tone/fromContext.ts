import * as Classes from "./classes";
import { Transport } from "./core/clock/Transport";
import { Context } from "./core/context/Context";
import { Destination } from "./core/context/Destination";
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
	return toneFromContext as Tone;
}
