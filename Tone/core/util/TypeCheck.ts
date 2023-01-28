import { Note } from "../type/Units";

/**
 * Test if the arg is undefined
 */
export function isUndef(arg: unknown): arg is undefined {
	return typeof arg === "undefined";
}

/**
 * Test if the arg is not undefined
 */
export function isDefined<T>(arg: T | undefined): arg is T {
	return !isUndef(arg);
}

/**
 * Test if the arg is a function
 */
export function isFunction(arg: unknown): arg is (a: unknown) => unknown {
	return typeof arg === "function";
}

/**
 * Test if the argument is a number.
 */
export function isNumber(arg: unknown): arg is number {
	return (typeof arg === "number");
}

/**
 * Test if the given argument is an object literal (i.e. `{}`);
 */
export function isObject(arg: unknown): arg is object {
	return (Object.prototype.toString.call(arg) === "[object Object]" && (arg as object).constructor === Object);
}

/**
 * Test if the argument is a boolean.
 */
export function isBoolean(arg: unknown): arg is boolean {
	return (typeof arg === "boolean");
}

/**
 * Test if the argument is an Array
 */
export function isArray(arg: unknown): arg is unknown[] {
	return (Array.isArray(arg));
}

/**
 * Test if the argument is a string.
 */
export function isString(arg: unknown): arg is string {
	return (typeof arg === "string");
}

/**
 * Test if the argument is in the form of a note in scientific pitch notation.
 * e.g. "C4"
 */
export function isNote(arg: unknown): arg is Note {
	return isString(arg) && /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i.test(arg);
}
