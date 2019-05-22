import { isArray } from "./TypeCheck";

// return an interface which excludes certain keys
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 *  Make the property not writable using `defineProperty`. Internal use only.
 */
export function readOnly(target: object, property: string | string[]): void {
	if (isArray(property)) {
		property.forEach(str => readOnly(target, str));
	} else {
		Object.defineProperty(target, property, {
			enumerable: true,
			writable: false,
		});
	}
}

/**
 *  Make an attribute writeable. Internal use only.
 */
export function writable(target: object, property: string | string[]): void {
	if (isArray(property)) {
		property.forEach(str => writable(target, str));
	} else {
		Object.defineProperty(target, property, {
			writable: true,
		});
	}
}

export const noOp: (...args: any[]) => any = () => {
	// no op!
};
