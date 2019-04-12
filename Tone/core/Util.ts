import { BaseToneOptions } from "./Tone";

// return an interface which excludes certain keys
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Recursively merge an object
 * @param target the object to merge into
 * @param sources the source objects to merge
 */
export function deepMerge<T>(target: T, ...sources: T[]): T {
	if (!sources.length) { return target; }
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) { Object.assign(target, { [key]: {} }); }
				deepMerge(target[key], source[key] as any);
			} else {
				Object.assign(target, { [key]:  source[key] as any });
			}
		}
	}

	return deepMerge(target, ...sources);
}

/**
 * Convert an args array into an object.
 */
export function optionsFromArguments<T>(defaults: T, argsArray: IArguments, keys: string[]): T {
	const opts: any = {};
	const args = Array.from(argsArray);
	if (args.length === 1 && isObject(args[0])) {
		deepMerge(opts, args[0]);
	} else {
		for (let i = 0; i < keys.length; i++) {
			if (isDefined(args[i])) {
				opts[keys[i]] = args[i];
			}
		}
	}
	return deepMerge(defaults, opts);
}

/**
 * Return this instances default values by calling Constructor.getDefaults()
 */
export function getDefaultsFromInstance<T>(instance: T): BaseToneOptions {
	type ToneClass = {
		constructor: ToneClass;
		getDefaults: () => BaseToneOptions;
	} & T;

	return (instance as ToneClass).constructor.getDefaults();
}

/**
 * Take an array of arguments and return a formatted options object.
 * @param args the arguments passed into the function
 * @param keys an array of keys
 * @param defaults the class's defaults
 */
// export function defaultArg<T>(given: T, fallback): T {

// }

/**
 *  Test if the arg is undefined
 */
export function isUndef(arg: any): arg is undefined {
	return typeof arg === "undefined";
}

/**
 *  Test if the arg is not undefined
 */
export function isDefined<T>(arg: T | undefined): arg is T {
	return !isUndef(arg);
}

/**
 *  Test if the arg is a function
 */
export function isFunction(arg: any): arg is (a: any) => any {
	return typeof arg === "function";
}

/**
 *  Test if the argument is a number.
 */
export function isNumber(arg: any): arg is number {
	return (typeof arg === "number");
}

/**
 *  Test if the given argument is an object literal (i.e. `{}`);
 */
export function isObject(arg: any): arg is object {
	return (Object.prototype.toString.call(arg) === "[object Object]" && arg.constructor === Object);
}

/**
 *  Test if the argument is a boolean.
 */
export function isBoolean(arg: any): arg is boolean {
	return (typeof arg === "boolean");
}

/**
 *  Test if the argument is an Array
 */
export function isArray(arg: any): arg is any[] {
	return (Array.isArray(arg));
}

/**
 *  Test if the argument is a string.
 */
export function isString(arg: any): arg is string {
	return (typeof arg === "string");
}

/**
 *  Test if the argument is in the form of a note in scientific pitch notation.
 *  e.g. "C4"
 */
export function isNote(arg: any): arg is Note {
	return isString(arg) && /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i.test(arg);
}

/**
 *  Make the property not writable using `defineProperty`. Internal use only.
 */
export function readOnly(target: object, property: string | string[]): void {
	if (isArray(property)) {
		property.forEach(str => readOnly(target, str));
	} else {
		Object.defineProperty(target, property, {
			enumerable : true,
			writable : false,
		});
	}
}

/**
 *  Make an attribute writeable. Internal use only.
 */
export function writable(target: object, property: string | string[]): void {
	if (isArray(property)) {
		property.forEach(str => this._writable(str));
	} else {
		Object.defineProperty(target, property, {
			writable : true,
		});
	}
}

/**
 * Apply a mixin to extend the derived constructor with the prototype of the baseConstructors
 */
export function applyMixins(derivedCtor: any, baseCtors: any[]): void {
	baseCtors.forEach(baseCtor => {
		Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
			derivedCtor.prototype[name] = baseCtor.prototype[name];
		});
	});
}
