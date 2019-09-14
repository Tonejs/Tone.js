/**
 * Assert that the statement is true, otherwise invoke an error with the given message.
 */
export function assert(statement: boolean, error: string): void {
	if (!statement) {
		throw new Error(error);
	}
}

export function log(...args: any[]): void {
	// eslint-disable-next-line no-console
	console.log(...args);
}
