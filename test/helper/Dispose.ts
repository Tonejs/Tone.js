export function isDisposed(instance): void {
	for (const prop in instance) {
		if (instance.hasOwnProperty(prop)) {
			const member = instance[prop];
			if (
				typeof member !== "function" &&
				typeof member !== "string" &&
				typeof member !== "number" &&
				typeof member !== "boolean" &&
				typeof member !== "undefined" &&
				prop !== "preset" &&
				!(member instanceof AudioContext)
			) {
				if (member !== null) {
					throw Error(
						"property was not completely disposed: " + prop
					);
				}
			}
		}
	}
}
