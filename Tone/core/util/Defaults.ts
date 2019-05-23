import { BaseToneOptions } from "../Tone";
import { isDefined, isObject } from "./TypeCheck";

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
				Object.assign(target, { [key]: source[key] as any });
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
