import { isArray } from "./TypeCheck.js";

// return an interface which excludes certain keys
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Make the property not writable using `defineProperty`. Internal use only.
 */
export function readOnly<T extends object>(
	target: T,
	property: keyof T | (keyof T)[]
): void {
	if (isArray(property)) {
		property.forEach((str) => readOnly(target, str));
	} else {
		Object.defineProperty(target, property, {
			enumerable: true,
			writable: false,
		});
	}
}

/**
 * Make an attribute writeable. Internal use only.
 */
export function writable<T extends object>(
	target: T,
	property: keyof T | (keyof T)[]
): void {
	if (isArray(property)) {
		property.forEach((str) => writable(target, str));
	} else {
		Object.defineProperty(target, property, {
			writable: true,
		});
	}
}

export const noOp: (...args: any[]) => any = () => {
	// no operation here!
};

/**
 * Recursive Partial taken from here: https://stackoverflow.com/a/51365037
 */
export type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends Array<infer U>
		? Array<RecursivePartial<U>>
		: T[P] extends object
			? RecursivePartial<T[P]>
			: T[P];
};
