import { BaseContext } from "./BaseContext.js";

/**
 * Invoked when the context is started. The callback is invoked immediately
 * if the context is already started or when the context is an OfflineContext.
 * Returns a function which can be called to remove the listener.
 * @internal Used to trigger certain events when the context has been started.
 */
export function onContextRunning(
	context: BaseContext,
	callback: () => void
): () => void {
	const listener = (state: AudioContextState) => {
		if (state === "running") {
			callback();
			context.off("statechange", listener);
		}
	};
	if (context.isOffline || context.state === "running") {
		callback();
		return () => {};
	}

	context.on("statechange", listener);
	return () => context.off("statechange", listener);
}
