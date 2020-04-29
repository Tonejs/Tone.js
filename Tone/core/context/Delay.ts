import { Param } from "../context/Param";
import { Seconds, Time } from "../type/Units";
import { optionsFromArguments } from "../util/Defaults";
import { readOnly } from "../util/Interface";
import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";

export interface DelayOptions extends ToneAudioNodeOptions {
	delayTime: Time;
	maxDelay: Time;
}

/**
 * Wrapper around Web Audio's native [DelayNode](http://webaudio.github.io/web-audio-api/#the-delaynode-interface).
 * @category Core
 * @offline 0.5 1
 * @example
 * const delay = new Tone.Delay(0.1).toDestination();
 * // connect the signal to both the delay and the destination
 * const pulse = new Tone.PulseOscillator().fan(delay, Tone.Destination);
 * // start and stop the pulse
 * pulse.start(0).stop(0.01);
 */
export class Delay extends ToneAudioNode<DelayOptions> {

	readonly name: string = "Delay";

	/**
	 * Private holder of the max delay time
	 */
	private _maxDelay: Seconds;

	/**
	 * The amount of time the incoming signal is delayed.
	 * @example
	 * const delay = new Tone.Delay().toDestination();
	 * delay.delayTime.value = 0.5; 
	 * // play a short blip
	 * const pulse = new Tone.PulseOscillator().fan(delay, Tone.Destination).start().stop("+0.01");
	 */
	readonly delayTime: Param<"time">;

	/**
	 * Private reference to the internal DelayNode
	 */
	private _delayNode: DelayNode;
	readonly input: DelayNode;
	readonly output: DelayNode;

	/**
	 * @param delayTime The delay applied to the incoming signal.
	 * @param maxDelay The maximum delay time.
	 */
	constructor(delayTime?: Time, maxDelay?: Time);
	constructor(options?: Partial<DelayOptions>);
	constructor() {
		super(optionsFromArguments(Delay.getDefaults(), arguments, ["delayTime", "maxDelay"]));

		const options = optionsFromArguments(Delay.getDefaults(), arguments, ["delayTime", "maxDelay"]);

		const maxDelayInSeconds = this.toSeconds(options.maxDelay);
		this._maxDelay = Math.max(maxDelayInSeconds, this.toSeconds(options.delayTime));

		this._delayNode = this.input = this.output = this.context.createDelay(maxDelayInSeconds);

		this.delayTime = new Param({
			context: this.context,
			param: this._delayNode.delayTime,
			units: "time",
			value: options.delayTime,
			minValue: 0,
			maxValue: this.maxDelay,
		});

		readOnly(this, "delayTime");
	}

	static getDefaults(): DelayOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			delayTime: 0,
			maxDelay: 1,
		});
	}

	/**
	 * The maximum delay time. This cannot be changed after
	 * the value is passed into the constructor.
	 */
	get maxDelay(): Seconds {
		return this._maxDelay;
	}

	/**
	 * Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._delayNode.disconnect();
		this.delayTime.dispose();
		return this;
	}
}
