import { getContext } from "../Global";
import { Tone } from "../Tone";
import { FrequencyClass } from "../type/Frequency";
import { TimeClass } from "../type/Time";
import { TransportTimeClass } from "../type/TransportTime";
import "../type/Units";
import { getDefaultsFromInstance, optionsFromArguments } from "../util/Defaults";
import { isDefined } from "../util/TypeCheck";
import { Context } from "./Context";

/**
 * A unit which process audio
 */
export interface ToneWithContextOptions {
	context: Context;
}

/**
 * The Base class for all nodes that have an AudioContext.
 */
export abstract class ToneWithContext<Options extends ToneWithContextOptions> extends Tone {

	/**
	 * The context belonging to the node.
	 */
	readonly context: Context;

	/**
	 * The default context to use if no AudioContext is passed in to the constructor
	 */
	readonly defaultContext?: Context;

	constructor(context?: Context | Partial<ToneWithContextOptions>) {
		const options = optionsFromArguments(ToneWithContext.getDefaults(), arguments, ["context"]);
		super();
		if (this.defaultContext) {
			this.context = this.defaultContext;
		} else {
			this.context = options.context;
		}
	}

	static getDefaults(): ToneWithContextOptions {
		return {
			context: getContext(),
		};
	}

	/**
	 * Return the current time of the Context clock plus the lookAhead.
	 */
	now(): Seconds {
		return this.context.currentTime + this.context.lookAhead;
	}

	/**
	 * Return the current time of the Context clock without any lookAhead.
	 */
	immediate(): Seconds {
		return this.context.currentTime;
	}

	/**
	 * The duration in seconds of one sample.
	 */
	get sampleTime(): Seconds {
		return 1 / this.context.sampleRate;
	}

	/**
	 * The number of seconds of 1 processing block (128 samples)
	 */
	get blockTime(): Seconds {
		return 128 / this.context.sampleRate;
	}

	/**
	 * Convert the incoming time to seconds
	 */
	toSeconds(time: Time): Seconds {
		return new TimeClass(this.context, time).toSeconds();
	}

	/**
	 * Convert the input to a frequency number
	 */
	toFrequency(freq: Frequency): Hertz {
		return new FrequencyClass(this.context, freq).toFrequency();
	}

	/**
	 * Convert the input time into ticks
	 */
	toTicks(time: Time): Ticks {
		return new TransportTimeClass(this.context, time).toTicks();
	}

	///////////////////////////////////////////////////////////////////////////
	// 	GET/SET
	///////////////////////////////////////////////////////////////////////////

	/**
	 * Get the object's attributes. Given no arguments get
	 * will return all available object properties and their corresponding
	 * values. Pass in a single attribute to retrieve or an array
	 * of attributes. The attribute strings can also include a "."
	 * to access deeper properties.
	 * @param params the parameters to get, otherwise will return all available.
	 * @example
	 * osc.get();
	 * //returns {"type" : "sine", "frequency" : 440, ...etc}
	 * @example
	 * osc.get("type");
	 * //returns { "type" : "sine"}
	 * @example
	 * //use dot notation to access deep properties
	 * synth.get(["envelope.attack", "envelope.release"]);
	 * //returns {"envelope" : {"attack" : 0.2, "release" : 0.4}}
	 */
	get(): Options {
		const defaults = getDefaultsFromInstance(this) as Options;
		Object.keys(defaults).forEach(attribute => {
			if (Reflect.has(this, attribute)) {
				const member = this[attribute];
				if (isDefined(member) && isDefined(member.value)) {
					defaults[attribute] = member.value;
				} else if (member instanceof ToneWithContext) {
					defaults[attribute] = member.get();
				} else {
					defaults[attribute] = member;
				}
			}

		});
		return defaults;
	}

	/**
	 * Set the parameters at once. Either pass in an
	 * object mapping parameters to values, or to set a
	 * single parameter, by passing in a string and value.
	 * The last argument is an optional ramp time which
	 * will ramp any signal values to their destination value
	 * over the duration of the rampTime.
	 * @param  params
	 * @example
	 * //set values using an object
	 * filter.set({
	 * 	"frequency" : 300,
	 * 	"type" : "highpass"
	 * });
	 */
	set(props: Partial<Options>): this {
		Object.keys(props).forEach(attribute => {
			if (Reflect.has(this, attribute)) {
				if (isDefined(this[attribute]) && isDefined(this[attribute].value)) {
					this[attribute].value = props[attribute];
				} else if (this[attribute] instanceof ToneWithContext) {
					this[attribute].set(props[attribute]);
				} else {
					this[attribute] = props[attribute];
				}
			}
		});
		return this;
	}
}
