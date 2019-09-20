/**
 * Assert that the statement is true, otherwise invoke an error with the given message.
 */
export function assert(statement: boolean, error: string): void {
	if (!statement) {
		throw new Error(error);
	}
}

/**
 * A basic logging interface
 */
interface Logger {
	log: (args?: any[]) => void;
	warn: (args?: any[]) => void;
}

/**
 * The default logger is the console
 */
let defaultLogger: Logger = console;

/**
 * Set the logging interface
 */
export function setLogger(log: Logger): void {
	defaultLogger = log;
}

/**
 * Log anything
 */
export function log(...args: any[]): void {
	defaultLogger.log(...args);
}

/**
 * Warn anything
 */
export function warn(...args: any[]): void {
	defaultLogger.warn(...args);
}
