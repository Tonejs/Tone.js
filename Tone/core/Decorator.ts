function optionsFromArguments<Options>(defaults: Options, args: any[], keys: string[]): Options {
	return defaults;
}

type ObjectConstructor = new (...args: any[]) => {};

export function useDefaultsAndArguments<DefaultOptions>(
	defaults: DefaultOptions,
	optionsOrder: string[],
) {
	return <T extends ObjectConstructor>(classDef: T) => {
		return class extends classDef {
			// assign the instance defaults
			defaults: DefaultOptions = defaults;
			constructor(...args: any[]) {
				super(optionsFromArguments(defaults, args, optionsOrder));
			}
		};
	};
}
