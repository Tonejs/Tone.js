export { getContext, setContext } from "./core/Global";
export * from "./classes";
import { getContext } from "./core/Global";
export { start } from "./core/Global";

/**
 * The current audio context time
 * @Category Core
 */
export function now(): import("./core/type/Units").Seconds {
	return getContext().now();
}

/**
 * The Transport object belonging to the global Tone.js Context
 * @Category Core
 */
export const Transport = getContext().transport;

/**
 * The Destination (output) belonging to the global Tone.js Context
 * @Category Core
 */
export const Destination = getContext().destination;
