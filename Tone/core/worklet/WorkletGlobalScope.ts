import { AudioWorkletProcessor } from "./AudioWorkletProcessor.worklet";

const workletContext: Set<string> = new Set();

/**
 * Add a class to the AudioWorkletGlobalScope
 */
export function addToWorklet(classOrFunction: typeof AudioWorkletProcessor | Function) {
	workletContext.add(classOrFunctionToString(classOrFunction));
}

/**
 * Converts a class or a function to a string so it can be used in the worklet context
 */
function classOrFunctionToString(classOrFunction: typeof AudioWorkletProcessor | Function): string {
	const regexp = new RegExp(/class.*extends.*\{/m);
	const matches = classOrFunction.toString().match(regexp);
	if (matches) {
		// if it extends another class, get that class name
		return classOrFunction.toString().replace(matches[0],
			`class ${classOrFunction.name} extends ${Object.getPrototypeOf(classOrFunction).name} {`);
	} else {
		// otherwise just return the class as a string
		return classOrFunction.toString();
	}
}

/**
 * Register a processor in the AudioWorkletGlobalScope with the given name
 */
export function registerProcessor(name: string, classDesc: typeof AudioWorkletProcessor) {
	const processor = /* javascript */`registerProcessor("${name}", ${classOrFunctionToString(classDesc)})`;
	workletContext.add(processor);
}

/**
 * Get all of the modules which have been registered to the AudioWorkletGlobalScope
 */
export function getWorkletGlobalScope(): string {
	return Array.from(workletContext).join("\n");
}
