export { getContext, setContext } from "./core/Global";
export * from "./core/index";
export * from "./source/index";
export * from "./instrument/index";
export * from "./event/index";

import { getContext } from "./core/Global";
/**
 *  The current audio context time
 */
export function now(): Seconds {
	return getContext().now();
}
