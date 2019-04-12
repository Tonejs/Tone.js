import { getContext } from "../core/Global";
import { Tone } from "../core/Tone";
import { getDefaultsFromInstance, isDefined, isUndef, optionsFromArguments } from "../core/Util";
import "../type/Units";

/**
 * A unit which process audio
 */
export interface AudioProcessorOptions {
	context: BaseAudioContext;
}

/**
 * The BaseAudioContext belonging to this node
 */
export abstract class AudioProcessor<Options extends AudioProcessorOptions> extends Tone {

	/**
	 * The context belonging to the node.
	 */
	readonly context: BaseAudioContext;

	readonly defaultContext?: BaseAudioContext;

	constructor(context?: BaseAudioContext | Partial<AudioProcessorOptions>) {
		const options = optionsFromArguments(AudioProcessor.getDefaults(), arguments, ["context"]);
		super();
		if (this.defaultContext) {
			this.context = this.defaultContext;
		} else {
			this.context = options.context;
		}
	}

	static getDefaults(): AudioProcessorOptions {
		return {
			context: getContext(),
		};
	}

	/**
	 * Return the current time of the BaseAudioContext clock plus the lookAhead.
	 */
	now(): Seconds {
		return this.context.currentTime;
	}

	/**
	 * Return the current time of the BaseAudioContext clock without any lookAhead.
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
		if (isUndef(time)) {
			return this.now();
		} else {
			return time as Seconds;
		}
	}

	/**
	 * Convert the input to a frequency number
	 */
	toFrequency(frequency: Frequency): Hertz {
		return frequency as Hertz;
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
				} else if (member instanceof AudioProcessor) {
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
	set(props: Partial<Options>): AudioProcessor<Options> {
		Object.keys(props).forEach(attribute => {
			if (Reflect.has(this, attribute)) {
				if (isDefined(this[attribute]) && isDefined(this[attribute].value)) {
					this[attribute].value = props[attribute];
				} else if (this[attribute] instanceof AudioProcessor) {
					this[attribute].set(props[attribute]);
				} else {
					this[attribute] = props[attribute];
				}
			}
		});
		return this;
	}
}
