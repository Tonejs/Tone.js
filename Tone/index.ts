export { getContext, setContext } from "./core/Global";
export * from "./core/index";
export * from "./source/index";
export * from "./instrument/index";
export * from "./event/index";
export * from "./effect/index";
export * from "./component/index";

import { getContext } from "./core/Global";
/**
 *  The current audio context time
 */
export function now(): Seconds {
	return getContext().now();
}

// tslint:disable-next-line: variable-name
export const Transport = getContext().transport;
// tslint:disable-next-line: variable-name
export const Destination = getContext().destination;
