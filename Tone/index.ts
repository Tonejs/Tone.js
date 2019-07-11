export { getContext, setContext } from "./core/Global";
export * from "./core/index";
export * from "./source/index";

import { getContext } from "./core/Global";
/**
 *  The current audio context time
 */
export function now(): Seconds {
	return getContext().now();
}
