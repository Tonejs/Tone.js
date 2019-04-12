export function isDisposed(instance){
	for (let prop in instance) {
		const member = instance[prop];
		if (typeof member !== "function" &&
			typeof member !== "string" &&
			typeof member !== "number" &&
			typeof member !== "boolean" &&
			typeof member !== "undefined" &&
			prop !== "preset" &&
			!(member instanceof AudioContext) &&
			!instance.constructor.prototype[prop]) {
			if (member !== null) {
				throw Error("property was not completely disposed: " + prop);
			}
		}
	}
}