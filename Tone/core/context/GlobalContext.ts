import { hasAudioContext } from "./AudioContext.js";
import { BaseContext } from "./BaseContext.js";
import { Context } from "./Context.js";
import { DummyContext } from "./DummyContext.js";

/**
 * This dummy context is used to avoid throwing immediate errors when importing in Node.js
 */
export const dummyContext: BaseContext = new DummyContext();

/**
 * The global audio context which is getable and assignable through
 * getContext and setContext
 */
let globalContext: BaseContext = dummyContext;

/**
 * Returns the default system-wide {@link Context}.
 * Auto-initializes a real Context in browser environments.
 */
export function getContext(): BaseContext {
	if (globalContext === dummyContext && hasAudioContext) {
		globalContext = new Context();
	}
	return globalContext;
}

/**
 * Set the global context directly. Unlike the richer `setContext` in Global.ts,
 * this only accepts a {@link BaseContext} — no native AudioContext wrapping.
 */
export function setContext(context: BaseContext): void {
	globalContext = context;
}
