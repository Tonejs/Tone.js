export { getContext, setContext } from "./core/Global";
export * from "./core/index";
export * from "./source/index";
export * from "./instrument/index";

import { getContext } from "./core/Global";
/**
 *  The current audio context time
 */
export function now(): Seconds {
	return getContext().now();
}
