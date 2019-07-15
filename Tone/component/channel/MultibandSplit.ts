import { Gain } from "Tone/core/context/Gain";
import { optionsFromArguments } from "Tone/core/util/Defaults";
import { readOnly, writable } from "Tone/core/util/Interface";
import { Signal } from "Tone/signal/Signal";
import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { Filter } from "../filter/Filter";

interface MultibandSplitOptions extends ToneAudioNodeOptions {
	Q: Positive;
	lowFrequency: Frequency;
	highFrequency: Frequency;
}

/**
 *  Split the incoming signal into three bands (low, mid, high)
 *  with two crossover frequency controls.
 *
 *  @param lowFrequency the low/mid crossover frequency
 *  @param highFrequency the mid/high crossover frequency
 */
export class MultibandSplit extends ToneAudioNode<MultibandSplitOptions> {

	name = "MultibandSplit";

	/**
	 *  the input
	 */
	readonly input = new Gain({ context: this.context });

	/**
	 *  The low band. Alias for <code>output[0]</code>
	 */
	readonly low = new Filter({
		context: this.context,
		frequency: 0,
		type: "lowpass",
	});

	/**
	 *  the lower filter of the mid band
	 */
	private _lowMidFilter = new Filter({
		context: this.context,
		frequency: 0,
		type: "highpass",
	});

	/**
	 *  The mid band output. Alias for <code>output[1]</code>
	 */
	readonly mid = new Filter({
		context: this.context,
		frequency: 0,
		type: "lowpass",
	});

	/**
	 *  The high band output. Alias for <code>output[2]</code>
	 */
	readonly high = new Filter({
		context: this.context,
		frequency: 0,
		type: "highpass",
	});

	readonly output = [this.low, this.mid, this.high];

	/**
	 *  The low/mid crossover frequency.
	 */
	readonly lowFrequency: Signal<Frequency>;

	/**
	 *  The mid/high crossover frequency.
	 */
	readonly highFrequency: Signal<Frequency>;

	protected _internalChannels = [this.input, ...this.output];

	/**
	 *  The Q or Quality of the filter
	 */
	readonly Q: Signal<Positive>;

	constructor(lowFrequency?: Frequency, highFrequency?: Frequency);
	constructor(options?: Partial<MultibandSplitOptions>);
	constructor() {
		super(optionsFromArguments(MultibandSplit.getDefaults(), arguments, ["lowFrequency", "highFrequency"]));
		const options = optionsFromArguments(MultibandSplit.getDefaults(), arguments, ["lowFrequency", "highFrequency"]);

		this.lowFrequency = new Signal({
			context: this.context,
			units: "frequency",
			value: options.lowFrequency,
		});

		this.highFrequency = new Signal({
			context: this.context,
			units: "frequency",
			value: options.highFrequency,
		});

		this.Q = new Signal({
			context: this.context,
			units: "positive",
			value: options.Q,
		});

		this.input.fan(this.low, this.high);
		this.input.chain(this._lowMidFilter, this.mid);
		// the frequency control signal
		this.lowFrequency.fan(this.low.frequency, this._lowMidFilter.frequency);
		this.highFrequency.fan(this.mid.frequency, this.high.frequency);
		// the Q value
		this.Q.connect(this.low.Q);
		this.Q.connect(this._lowMidFilter.Q);
		this.Q.connect(this.mid.Q);
		this.Q.connect(this.high.Q);

		readOnly(this, ["high", "mid", "low", "highFrequency", "lowFrequency"]);
	}

	static getDefaults(): MultibandSplitOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			Q: 1,
			highFrequency: 2500,
			lowFrequency: 400,
		});
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		writable(this, ["high", "mid", "low", "highFrequency", "lowFrequency"]);
		this.low.dispose();
		this._lowMidFilter.dispose();
		this.mid.dispose();
		this.high.dispose();
		this.lowFrequency.dispose();
		this.highFrequency.dispose();
		this.Q.dispose();
		return this;
	}

}
