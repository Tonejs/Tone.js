import { Frequency, Time } from "../core/type/Units.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { readOnly } from "../core/util/Interface.js";
import { Signal } from "../signal/Signal.js";
import { LFO } from "../source/oscillator/LFO.js";
import { ToneOscillatorType } from "../source/oscillator/OscillatorInterface.js";
import { StereoEffect, StereoEffectOptions } from "./StereoEffect.js";

export interface LFOStereoEffectOptions extends StereoEffectOptions {
	frequency: Frequency;
	autostart: boolean;
}

/**
 * Base class for stereo effects which modulate the incoming signal with an LFO.
 *
 * @category Effect
 */
export abstract class LFOStereoEffect<
	Options extends LFOStereoEffectOptions,
> extends StereoEffect<Options> {
	readonly name: string = "LFOStereoEffect";

	/**
	 * The LFO in the left channel
	 */
	protected _lfoL: LFO;

	/**
	 * The LFO in the right channel
	 */
	protected _lfoR: LFO;

	/**
	 * The frequency of the tremolo.
	 */
	readonly frequency: Signal<"frequency">;

	constructor(options?: Partial<LFOStereoEffectOptions>);
	constructor() {
		const options = optionsFromArguments(
			LFOStereoEffect.getDefaults(),
			arguments
		);
		super(options);

		this._lfoL = new LFO({
			context: this.context,
			min: 0,
			max: 1,
		});
		this._lfoR = new LFO({
			context: this.context,
			min: 0,
			max: 1,
		});

		// control the frequency with a single signal
		this.frequency = new Signal({
			context: this.context,
			value: options.frequency,
			units: "frequency",
		});
		this.frequency.fan(this._lfoL.frequency, this._lfoR.frequency);

		readOnly(this, ["frequency"]);

		if (options.autostart) {
			this._onContextRunning(() => this.start(this.immediate()));
		}
	}

	static getDefaults(): LFOStereoEffectOptions {
		return Object.assign(StereoEffect.getDefaults(), {
			frequency: 10,
			autostart: false,
		});
	}

	/**
	 * Start the tremolo.
	 */
	start(time?: Time): this {
		this._lfoL.start(time);
		this._lfoR.start(time);
		return this;
	}

	/**
	 * Stop the tremolo.
	 */
	stop(time?: Time): this {
		this._lfoL.stop(time);
		this._lfoR.stop(time);
		return this;
	}

	/**
	 * Sync the effect to the transport.
	 */
	sync(): this {
		this._lfoL.sync();
		this._lfoR.sync();
		this.context.transport.syncSignal(this.frequency);
		return this;
	}

	/**
	 * Unsync the filter from the transport
	 */
	unsync(): this {
		this._lfoL.unsync();
		this._lfoR.unsync();
		this.context.transport.unsyncSignal(this.frequency);
		return this;
	}

	/**
	 * The oscillator type.
	 */
	get type(): ToneOscillatorType {
		return this._lfoL.type;
	}
	set type(type) {
		this._lfoL.type = type;
		this._lfoR.type = type;
	}

	dispose(): this {
		super.dispose();
		this._lfoL.dispose();
		this._lfoR.dispose();
		this.frequency.dispose();
		return this;
	}
}
