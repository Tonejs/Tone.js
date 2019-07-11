///////////////////////////////////////////////////////////////////////////
// INITIALIZING NEW CONTEXT
///////////////////////////////////////////////////////////////////////////

type Context = import("./Context").Context;

/**
 * Array of callbacks to invoke when a new context is created
 */
const notifyNewContext: Array<(ctx: Context) => void> = [];

/**
 * Used internally to setup a new Context
 */
export function onContextInit(cb: (ctx: Context) => void): void {
	notifyNewContext.push(cb);
}

export function initializeContext(ctx: Context): void {
	// add any additional modules
	notifyNewContext.forEach(cb => cb(ctx));
}
